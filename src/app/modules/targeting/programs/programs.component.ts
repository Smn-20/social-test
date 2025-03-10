import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { EventService } from 'src/app/core/services/event.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { Paginate, initPaginate } from 'src/app/core/utils/reusable-functions';
import { EPermission, EState, ETargetingStatus } from 'src/app/core/enums';
import { ResponseObject } from '../../../core/utils/reusable-functions';
import { CreateProgramModalComponent } from '../create-program-modal/create-program-modal.component';

@Component({
    selector: 'app-programs',
    templateUrl: './programs.component.html',
    styleUrls: ['./programs.component.css'],
})
export class ProgramsComponent implements OnInit {
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
        private fb: FormBuilder
    ) {
        this.queryFormGroup = this.fb.group({
            query: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.getAllprogrammes();
        this.eventListening();
        this.programmeAutoSearch();
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
                    this.getAllprogrammes();
                }
            });
    }

    toggleprogrammeDetails(index: number, data: any) {
        this.selectedRowIndex = index;
    }

    getAllprogrammes(): void {
        this.loading = true;
        this.householdService
            .getAllPrograms(this.queryFormGroup.controls['query']?.value || '', this.pagination)
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
    }

    onPageChange(event: any): void {
        this.pagination.page = event.pageIndex + 1;
        this.getAllprogrammes();
    }

    eventListening(): void {
        this.eventService.actionFinished.subscribe((res) => {
            if (res === 'programs') {
                this.initPaginationPage();
                this.getAllprogrammes();
                this.selectedRowIndex = -1;
                this.openProgramsDetails = false;
                this.close();
            }
        });
    }

    receiveRefresh(event: any): void {
        window.location.reload();
    }

    toggleNewprogrammModal(item?: any): void {
        this.dialog.open(CreateProgramModalComponent, {
            data: item,
            width: '672px',
        });
    }

    toggleProgramsDetails(index: number, id: string): void {
        this.selectedRowIndex = index;
        this.openProgramsDetails = !this.openProgramsDetails;
        this.selectedTargetGroups = [];
        this.getProgramsData(id);
    }

    getProgramsData(id: string): void {
        this.programDataLoading = true;
        this.householdService.getProgramTargetGroup(id).subscribe((res) => {
            this.programDataLoading = false;
            if (res?.status) {
                this.selectedTargetGroups = res.response;
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    runProgram(id: string, index: number): void {
        this.loadingRun[index] = id;
        this.householdService.reRunTargetingProgram(id).subscribe((res) => {
            this.loadingRun[index] = undefined;
            if (res?.status) {
                this.globalService.openSuccessSnackBar(res.message);
                this.initPaginationPage();
                this.getAllprogrammes();
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    toFixed(n: any): number {
        return n.toFixed(1);
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

    onCriteriaActionEvent(evt: any): void {
        if (evt.action === 'rename') {
            this.criteriaRenameLoading = true;
            evt.event.criteriaId = evt.event.id;
            delete evt.event.id;
            this.householdService.updateCriteriaName(evt.event).subscribe((res) => {
                if (res?.status) {
                    this.criteriaRenameLoading = false;
                    this.globalService.openSuccessSnackBar(res.message);
                    this.eventService.onActionFinished('programs');
                }
            });
        } else {
            this.triggerActionCriteria(evt.event.id, evt.action);
        }
    }

    triggerActionCriteria(id: string, action: string): void {
        this.householdService.actionProgramCriteria(`${id}`, action).subscribe((res) => {
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
