import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EJurisdiction, EPermission, EState, ETargetingStatus } from 'src/app/core/enums';
import { AuthService } from 'src/app/core/services/auth.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { ResponseObject } from 'src/app/core/utils/reusable-functions';

@Component({
	selector: 'app-program-component-details',
	templateUrl: './program-component-details.component.html',
	styleUrls: ['./program-component-details.component.css']
})
export class ProgramComponentDetailsComponent implements OnInit {
	@Input() programComponent: any;
	loggedInUser = JSON.parse(this.authService.getItem('user'));

	tabSelector = 0;
    tabsHeaders: any[] = [];
	
    public EState = EState;
    public EPermission = EPermission;
    public EJurisdiction = EJurisdiction;
    public ETargetingStatus = ETargetingStatus;
	
	loading = false;
	batches: Array<any> = [];
	distributionNotYetStartedError = 'No Beneficiaries Available';
	anotherBatchInThisProgramProgressing = 'Another Batch Actively Populating Beneficiaries'
	successMessage = 'Successful'

	openConfirmModal = false;
	actionLoading = false;

	constructor(
		private authService: AuthService,
		private router: Router,
		private global: GlobalService,
		private translationService: TranslationService,
		private householdService: HouseholdService
	) {
		this.tabsHeaders = [
			{
				text: 'programComponentBatches',
                count: this.batches.length,
            },
			{
				text: 'programComponentDetails',
			},
        ];

		this.translationService.getInstantTranslations("distributionNotYetStartedError").subscribe(res => {
			this.distributionNotYetStartedError = res;
		})
		this.translationService.getInstantTranslations("success").subscribe(res => {
			this.successMessage = res;
		})
		this.translationService.getInstantTranslations("anotherBatchInThisProgramProgressing").subscribe(res => {
			this.anotherBatchInThisProgramProgressing = res;
		})
	}

	ngOnInit(): void {
		this.fetchProgramComponentBatches();
	}

	fetchProgramComponentBatches() {
		this.loading = true;
		this.householdService
			.getAllRevampedProgramComponentBatches(this.programComponent.id)
			.subscribe((res: ResponseObject<any>) => {
				this.loading = false;
				if (res.status) {
					this.batches = res.response;
				}
			});
	}

	selectTab(i: number) {
        this.tabSelector = i;
    }

	onClickEvent(evt: 'create-batch'): void {
		const runningBatches = this.batches.filter(b => [
			ETargetingStatus.RUNNING,
			ETargetingStatus.NOT_STARTED
		].includes(b.progressStatus))
		if (runningBatches.length > 0) {
			return this.global.openFailureSnackBar(this.anotherBatchInThisProgramProgressing);
		}
        if (evt === 'create-batch') this.openConfirmModal = true;
    }

	openJurisdictionViewBeneficiaries(batch: any) {
		if (
			batch.progressPercentage === 0.0 ||
			batch.progressStatus === ETargetingStatus.NOT_STARTED
		) {
			return this.global.openFailureSnackBar(this.distributionNotYetStartedError);
		}
		const jsonData = { batch, isPartnerDistribution: false };
		this.router.navigate(['/admin/revamped-targeting/beneficiaries'], { state: { data: jsonData } });
	}

	close() {
		this.openConfirmModal = false;
	}

	runBatchBeneficiaryPopulation() {
		this.actionLoading = true;
		this.householdService
			.createAndRunNewProgramComponentBatch(this.programComponent.id)
			.subscribe((res: ResponseObject<any>) => {
				this.actionLoading = false;
				if (res.status) {
					this.global.openSuccessSnackBar(this.successMessage + ': ' + res.response);
					this.fetchProgramComponentBatches();
					this.openConfirmModal = false;
				} else {
					this.global.openFailureSnackBar(res?.message ?? 'Something went wrong')
				}
			});
	}
}
