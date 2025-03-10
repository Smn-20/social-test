import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { EventService } from 'src/app/core/services/event.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { Paginate, initPaginate } from 'src/app/core/utils/reusable-functions';
import { EPermission, EState, ETargetingStatus } from 'src/app/core/enums';
import { ResponseObject } from 'src/app/core/utils/reusable-functions';

@Component({
	selector: 'app-revamped-program-components',
	templateUrl: './revamped-program-components.component.html',
	styleUrls: ['./revamped-program-components.component.css']
})
export class RevampedProgramComponentsComponent implements OnInit {
	masterProgram: any;
	loadingMasterProgram = false;
	openNewProgramModal = false;
	openEditingMode = true;
	programs = Array(5);
	openNewCutoffModal = false;
	queryFormGroup!: FormGroup;
	programmes: any[] = [];
	openFilters = false;
	selectedRowIndex = -1;
	pagination: Paginate = initPaginate(1, 10);
	total = 0;
	loggedInUser = JSON.parse(this.authService.getItem('user'));
	location: any;
	loading = false;
	querying = false;
	openProgramsDetails = false;
	openConfirmModal = false;
	actionLoading = false;
	confirmAction!: string;
	selectedJurisdictionLocation: any;
	selectedProgramId: any;
	criteriaRenameLoading = false;
	programDataLoading = false;
	selectedTargetGroups: any[] = [];
	loadingRun: { [key: number]: string | undefined } = {};
	public EState = EState;
	public EPermission = EPermission;
	public ETargetingStatus = ETargetingStatus;

	constructor(
		public dialog: MatDialog,
		private householdService: HouseholdService,
		private eventService: EventService,
		private router: Router,
		private authService: AuthService,
		private globalService: GlobalService,
		private fb: FormBuilder,
		private route: ActivatedRoute
	) {
		this.queryFormGroup = this.fb.group({
			query: ['', [Validators.required]],
		});
	}

	ngOnInit(): void {
		this.getAllProgrammeComponents();
		this.eventListening();
		this.programmeAutoSearch();
		this.getMasterProgram();
	}

	toggleFilters() {
		this.openFilters = !this.openFilters;
	}

	programmeAutoSearch(): void {
		this.queryFormGroup.get('query')?.valueChanges.pipe();

		this.queryFormGroup
			.get('query')
			?.valueChanges.pipe(debounceTime(1000))
			.subscribe((val) => {
				if (val !== '' || val !== null) {
					this.querying = true;
					this.pagination.page = 1;
					this.getAllProgrammeComponents();
				}
			});
	}

	toggleprogrammeDetails(index: number, data: any) {
		this.selectedRowIndex = index;
	}

	getAllProgrammeComponents(): void {
		this.loading = true;
		this.route.params.subscribe((params: any) => {
			this.householdService
				.getAllRevampedProgramComponents(params.masterProgramId, this.queryFormGroup.controls['query']?.value || '', this.pagination)
				.subscribe((res: ResponseObject<any>) => {
					this.loading = false;
					this.querying = false;
					if (res.status) {
						this.programmes = res.response?.content;
						this.total = res.response.totalElements;
						this.pagination.page = res.response.number;
					} else {
						this.programmes = [];
						this.globalService.openFailureSnackBar(res.message);
					}
				});
		})
	}

	getMasterProgram() {
        this.route.params.subscribe((params: any) => {
            const { masterProgramId } = params;
			if (masterProgramId) {
				this.loadingMasterProgram = true;
				this.householdService
					.getRevampedMasterProgramDetails(params.masterProgramId)
						.subscribe((res: ResponseObject<any>) => {
							this.loadingMasterProgram = false;
							if (res.status) {
								this.masterProgram = res.response;
							} else {
								this.masterProgram = null;
								this.globalService.openFailureSnackBar(res.message);
							}
						});
			}
        });
    }
		
	toggleMasterProgramDetails() {
		console.warn('Program Information')
	}

	onPageChange(event: any): void {
		this.pagination.page = event.pageIndex + 1;
		this.getAllProgrammeComponents();
	}

	eventListening(): void {
		this.eventService.actionFinished.subscribe((res) => {
			if (res === 'programs') {
				this.initPaginationPage();
				this.getAllProgrammeComponents();
				this.selectedRowIndex = -1;
				this.openProgramsDetails = false;
				this.close();
			}
		});
	}

	receiveRefresh(event: any): void {
		window.location.reload();
	}

	navigateToCreateProgramPage(): void {
		this.router.navigate(['/admin/revamped-targeting/revamped-programs/new-program-component']);
	}

	toggleProgramsDetails(index: number, _id: string): void {
		this.openProgramsDetails = !this.openProgramsDetails;
		this.selectedRowIndex = index;
	}

	action(event: string): void {
		this.openConfirmModal = !this.openConfirmModal;
		this.confirmAction = event;
	}

	close(): void {
		this.confirmAction = '';
		this.openConfirmModal = false;
		this.actionLoading = false;
	}

	triggerAction(id: string): void {
		this.actionLoading = true;
		this.householdService.actionProgram(`${id}`, this.confirmAction).subscribe((res) => {
			this.actionLoading = false;
			if (res.status) {
				this.close();
				this.eventService.onActionFinished('programs');
				this.globalService.openSuccessSnackBar(res.message);
			} else {
				this.globalService.openFailureSnackBar(res.message);
			}
		});
	}

	openJurisdictionFilterDialog(id: string): void {
		this.selectedProgramId = id;
		this.router.navigate([
			'/admin/households/program/' +
			this.selectedProgramId +
			'/location/' +
			this.loggedInUser?.jurisdiction +
			'/' +
			this.loggedInUser?.locationId,
		]);
	}

	initPaginationPage(): void {
		this.pagination.page = 1;
	}
}

