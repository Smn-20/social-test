import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EJurisdiction, EPermission, ETargetingStatus } from 'src/app/core/enums';
import { AuthService } from 'src/app/core/services/auth.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { initPaginate, Paginate, ResponseObject } from 'src/app/core/utils/reusable-functions';

@Component({
	selector: 'app-beneficiaries-table',
	templateUrl: './beneficiaries-table.component.html',
	styleUrls: ['./beneficiaries-table.component.css']
})
export class BeneficiariesTableComponent implements OnInit {
	distribution: any;
	batch: any;
	isPartnerDistribution = false;

	public EJurisdiction = EJurisdiction;
	public EPermission = EPermission;
	public ETargetingStatus = ETargetingStatus;
	loggedInUser = JSON.parse(this.authService.getItem('user'));

	loading = false;
	beneficiaries: Array<any> = [];
	totalBeneficiaries = 0;

	totalApprovedByVillage = 0;
	totalSystemicallyAdded = 0;
	totalAddedByVillage = 0;

	pagination: Paginate = initPaginate(1, 10);

	constructor(
        public dialog: MatDialog,
		private authService: AuthService,
		private householdService: HouseholdService,
		private router: Router
	) { }

	ngOnInit(): void {
		if (history.state?.data?.isPartnerDistribution) {
			this.distribution = history.state?.data?.distribution;
			this.isPartnerDistribution = true;
			this.fetchPartnerBeneficiaries();
		} else {
			this.batch = history.state?.data?.batch;
			this.fetchProgramComponentBeneficiaries();
		}
	}

	fetchPartnerBeneficiaries() {
		this.loading = true;
		this.householdService
            .getAllBeneficiariesInPartnerDistribution(
				this.distribution.id,
				this.distribution.externalPartnerId,
				'',
				this.pagination
			)
            .subscribe((res: ResponseObject<any>) => {
                this.loading = false;
                if (res.status) {
                    this.beneficiaries = res.response?.content;
					this.totalBeneficiaries = res.response?.totalElements;

					this.totalSystemicallyAdded = res.response?.content.filter(
						(b: { beneficiarySystemicallyAdded: boolean; }
					) => b?.beneficiarySystemicallyAdded).length;
					this.totalAddedByVillage = res.response?.content.filter(
						(b: { beneficiarySystemicallyAdded: boolean; }
					) => !b?.beneficiarySystemicallyAdded).length
					this.totalApprovedByVillage = res.response?.content.filter(
						(b: { beneficiaryApprovedByVillage: boolean; }
					) => b?.beneficiaryApprovedByVillage).length;
                }
            });
	}

	fetchProgramComponentBeneficiaries() {
		this.loading = true;
		this.householdService
            .getAllBeneficiariesInProgramComponentBatch(
				this.batch.id,
				'',
				this.pagination
			)
            .subscribe((res: ResponseObject<any>) => {
                this.loading = false;
                if (res.status) {
                    this.beneficiaries = res.response?.content;
					this.totalBeneficiaries = res.response?.totalElements;

					// CURRENT STATS ARE BASED ON ACTIVE PAGE
					this.totalSystemicallyAdded = res.response?.content.filter(
						(b: { beneficiarySystemicallyAdded: boolean; }
					) => b?.beneficiarySystemicallyAdded).length;
					this.totalAddedByVillage = res.response?.content.filter(
						(b: { beneficiarySystemicallyAdded: boolean; }
					) => !b?.beneficiarySystemicallyAdded).length
					this.totalApprovedByVillage = res.response?.content.filter(
						(b: { beneficiaryApprovedByVillage: boolean; }
					) => b?.beneficiaryApprovedByVillage).length;
                }
            });
	}

	receiveRefresh(_: any) {
		window.location.reload();
	}

	onPageChange(event: any): void {
        this.pagination.page = event.pageIndex + 1;
		if (this.isPartnerDistribution) {
			this.fetchPartnerBeneficiaries();
		} else {
			this.fetchProgramComponentBeneficiaries();
		}
    }
}
