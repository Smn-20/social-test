import { Component, Inject, OnInit } from '@angular/core';
import { PartnerDistributionsComponent } from '../partner-distributions.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HouseholdService } from 'src/app/core/services/household.service';
import { ResponseObject } from 'src/app/core/utils/reusable-functions';
import { EState, ETargetingStatus } from 'src/app/core/enums';
import { TranslationService } from 'src/app/core/services/translation.service';
import { beneficiaryHelpStatus } from 'src/app/constants';
import { InstitutionService } from 'src/app/core/services/institution.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-distribution-creation-modal',
	templateUrl: './distribution-creation-modal.component.html',
	styleUrls: ['./distribution-creation-modal.component.css'],
	providers: [DatePipe]
})
export class DistributionCreationModalComponent implements OnInit {
	distributionFormGroup!: FormGroup;
	loading?: 'MASTER_PROGRAM' | 'PROGRAM_COMPONENTS' | 'COMPONENT_BATCHES' | 'SAVING_DISTRIBUTION';
	institutionsLoading = false;

	institutions = []
	masterPrograms = []
	programComponents = []
	programComponentBatches = []

	beneficiaryHelpStatus: Array<{
		value: string,
		name: string
	}> = []
	batchOrder = 'Batch Order'

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<PartnerDistributionsComponent>,
		public fb: FormBuilder,
		private householdService: HouseholdService,
		private translationService: TranslationService,
        private institutionService: InstitutionService,
		private globaService: GlobalService,
		private datepipe: DatePipe
	) {
		this.initTranslatable();
		this.distributionFormGroup = this.fb.group({
			batchId: [null, Validators.required],
			masterProgramId: [null, Validators.required],
			programComponentId: [null, Validators.required],
			externalPartnerId: [null, Validators.required],
			distributionType: [null, Validators.required],
			numberOfBeneficiaries: [null, Validators.required]
		});
	}

	get formControls() {
		return this.distributionFormGroup.controls;
	}

	ngOnInit() {
		this.fetchMasterPrograms()
		this.fetchAllInstitutions()
	}

	initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.beneficiaryHelpStatus = this.translationService.translateArray(beneficiaryHelpStatus, res.beneficiaryHelpStatus);
        });
        this.translationService.getInstantTranslations('batchOrder').subscribe((res) => {
            this.batchOrder = res;
        });
    }

	fetchAllInstitutions() {
        this.institutionsLoading = true;
        this.institutionService.filterInstittutions().subscribe((res: any) => {
            this.institutionsLoading = false;
            if (res?.status) {
                this.institutions = res.response.filter((item: any) => item.status === 'ACTIVE');
            }
        });
    }

	fetchMasterPrograms() {
		this.loading = 'MASTER_PROGRAM';
        this.householdService
            .getAllRevampedPrograms('')
            .subscribe((res: ResponseObject<any>) => {
                this.loading = undefined;
                if (res.status) {
                    this.masterPrograms = res.response?.content;
					this.programComponents = []
                }
            });
	}

	fetchProgramComponents(master: any) {
		const masterId = master?.id

		if (masterId) {
			this.loading = 'PROGRAM_COMPONENTS';
			this.householdService
				.getAllRevampedProgramComponents(masterId, '')
				.subscribe((res: ResponseObject<any>) => {
					this.loading = undefined;
					if (res.status) {
						this.programComponents = res.response?.content;
					}
				});
		}
	}

	fetchProgramComponentBatches(programComponent: any) {
		const programComponentId = programComponent?.id

		if (programComponentId) {
			this.loading = 'COMPONENT_BATCHES';
			this.householdService
				.getAllRevampedProgramComponentBatches(programComponentId)
				.subscribe((res: ResponseObject<any>) => {
					this.loading = undefined;
					if (res.status) {
						this.programComponentBatches = res.response?.filter(
							(batch: {
								progressStatus: ETargetingStatus
							}) => batch?.progressStatus === ETargetingStatus.FINISHED
						).map((b: { batchOrder: number; createdAt: string | number | Date; }) => ({
							...b,
							label: `${this.batchOrder} ${ b?.batchOrder } - ${ this.datepipe.transform(b?.createdAt, 'medium') }`
						}));
					}
				});
		}
	}

	handleCreateDistributionSubmit() {
		if (this.distributionFormGroup.invalid) {
			this.distributionFormGroup.markAsDirty();
			this.distributionFormGroup.markAllAsTouched();
			return;
		}

		this.loading = 'SAVING_DISTRIBUTION';
		const request = {
			distributionStatus: EState.INACTIVE,
			batchId: this.formControls['batchId'].value,
			programComponentId: this.formControls['programComponentId'].value,
			externalPartnerId: this.formControls['externalPartnerId'].value,
			numberOfBeneficiaries: this.formControls['numberOfBeneficiaries'].value,
			distributionType: this.formControls['distributionType'].value,
		}

        this.householdService
            .createPartnerBeneficiaryDistribution(request)
            .subscribe((res: any) => {
                this.loading = undefined;
                if (res.status) {
					this.translationService.getInstantTranslations("partnerDistributionCreatedSuccess").subscribe((res) => {
						this.globaService.openSuccessSnackBar(res);
					});
					this.close(true);
				} else {
					this.globaService.openFailureSnackBar(res.message);
				}
            });
	}

	close(refresh: boolean): void {
		this.dialogRef.close(refresh);
	}
}
