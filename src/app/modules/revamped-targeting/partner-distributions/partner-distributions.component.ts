import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EJurisdiction, EPermission, ETargetingStatus } from 'src/app/core/enums';
import { AuthService } from 'src/app/core/services/auth.service';
import { DistributionCreationModalComponent } from './distribution-creation-modal/distribution-creation-modal.component';
import { initPaginate, Paginate, ResponseObject } from 'src/app/core/utils/reusable-functions';
import { HouseholdService } from 'src/app/core/services/household.service';
import { Router } from '@angular/router';
import { TranslationService } from 'src/app/core/services/translation.service';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
	selector: 'app-partner-distributions',
	templateUrl: './partner-distributions.component.html',
	styleUrls: ['./partner-distributions.component.css']
})
export class PartnerDistributionsComponent implements OnInit {
	public EJurisdiction = EJurisdiction;
	public EPermission = EPermission;
	public ETargetingStatus = ETargetingStatus;
	loggedInUser = JSON.parse(this.authService.getItem('user'));

	loading = false;
	distributions: Array<any> = [];
	totalDistributions = 0;

	pagination: Paginate = initPaginate(1, 20);
	distributionNotYetStartedError = 'No Beneficiaries Available';
	successMessage = 'Successful';

	constructor(
		private router: Router,
        public dialog: MatDialog,
		private authService: AuthService,
		private householdService: HouseholdService,
        private translationService: TranslationService,
		private global: GlobalService
	) { }

	ngOnInit(): void {
		this.fetchPartnerDistributions();
		this.translationService.getInstantTranslations("distributionNotYetStartedError").subscribe(res => {
			this.distributionNotYetStartedError = res;
		})
		this.translationService.getInstantTranslations("success").subscribe(res => {
			this.successMessage = res;
		})
	}

	get isAdmin() {
		return this.loggedInUser.roles.some((r: string) => ['MINALOC_SUPER_ADMIN']?.includes(r));
	}

	openCreateDistributionDialog() {
		this.dialog.open(DistributionCreationModalComponent, {
            width: '1024px',
            maxHeight: '80vh',
        }).afterClosed().subscribe((refresh: boolean) => {
			if (refresh) {
				this.fetchPartnerDistributions();
			}
		});
	}

	onPageChange(event: any): void {
        this.pagination.page = event.pageIndex + 1;
        this.fetchPartnerDistributions();
    }

	fetchPartnerDistributions() {
		this.loading = true;
        this.householdService
            .getAllExternalPartnerDistributions('', this.pagination)
            .subscribe((res: ResponseObject<any>) => {
                this.loading = false;
                if (res.status) {
                    this.distributions = res.response?.content;
					this.totalDistributions = res.response?.totalElements;
                }
            });
	}

	receiveRefresh(_: any) {
		window.location.reload();
	}

	openJurisdictionViewBeneficiaries(distribution: any) {
		if (
			distribution.progressPercentage === 0.0 ||
			distribution.progressStatus === ETargetingStatus.NOT_STARTED
		) {
			return this.global.openFailureSnackBar(this.distributionNotYetStartedError);
		}
		const jsonData = { distribution, isPartnerDistribution: true };
		this.router.navigate(['/admin/revamped-targeting/beneficiaries'], { state: { data: jsonData } });
	}

	runPartnerBeneficiaryPopulation(distribution: any) {
		if (!distribution?.id || distribution?.progressStatus  === ETargetingStatus.RUNNING) {
			return this.global.openFailureSnackBar(this.distributionNotYetStartedError);
		}

		this.householdService
			.runPartnerDistributionAndPopulateBeneficiaries(distribution.id)
			.subscribe((res: ResponseObject<any>) => {
				if (res.status) {
					this.global.openSuccessSnackBar(this.successMessage + ': ' + res.response);
					this.loading = true;
					const refreshTimeout = setTimeout(() => {
						this.fetchPartnerDistributions();
						clearTimeout(refreshTimeout);
					}, 1500)
				} else {
					this.global.openFailureSnackBar(res?.message ?? 'Something went wrong')
				}
			});
	}
}
