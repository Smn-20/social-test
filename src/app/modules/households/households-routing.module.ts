import { HouseholdsComponent } from './households.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateHouseholdComponent } from './create-household/create-household.component';
import { JurisdictionFilterComponent } from './jurisdiction-filter/jurisdiction-filter.component';
import { TransferComponent } from './transfer/transfer.component';
import { CreateMemberComponent } from './create-member/create-member.component';
import { HouseholdDetailsComponent } from './household-details/household-details.component';
import { AnswersComponent } from './answers/answers.component';
import { IspmisComponent } from './ispmis/ispmis.component';
import { MigrationComponent } from './migration/migration.component';
import { MigrationCompareComponent } from './migration-compare/migration-compare.component';
import { SelfRegisteredHouseholdsComponent } from './self-registered-households/self-registered-households.component';

const routes: Routes = [
	{
		path: '',
		component: HouseholdsComponent,
	},
	{
		path: 'migration',
		component: MigrationComponent,
	},
	{
		path: 'migration/:nationalId',
		component: MigrationCompareComponent,
	},
	{
		path: 'self-registered',
		component: SelfRegisteredHouseholdsComponent,
	},
	{
		path: 'ispmis-programs',
		component: IspmisComponent,
	},
	{
		path: 'cutoff/:cutoffId/location/:type/:locationId',
		component: HouseholdsComponent,
	},
	{
		path: 'program/:programId/location/:type/:locationId',
		component: HouseholdsComponent,
	},
	{
		path: 'details/:headDocumentNumber',
		component: HouseholdsComponent,
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class HouseholdsRoutingModule {
	static components = [
		HouseholdsComponent,
		CreateHouseholdComponent,
		JurisdictionFilterComponent,
		TransferComponent,
		CreateMemberComponent,
		HouseholdDetailsComponent,
		AnswersComponent,
		IspmisComponent,
		MigrationComponent,
		MigrationCompareComponent,
		SelfRegisteredHouseholdsComponent
	];
}
