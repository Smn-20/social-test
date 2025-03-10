import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RevampedProgramsComponent } from './revamped-programs/revamped-programs.component';
import { RevampedCreateProgramFlowComponent } from './revamped-create-program-flow/revamped-create-program-flow.component';
import { RevampedCreateProgramComponent } from './revamped-create-program/revamped-create-program.component';
import { RevampedProgramCriteriaCategoriesComponent } from './revamped-create-program-flow/revamped-program-criteria-categories/revamped-program-criteria-categories.component';
import { RevampedCriteriaCreationModalComponent } from './revamped-create-program-flow/revamped-criteria-creation-modal/revamped-criteria-creation-modal.component';
import { RevampedCriteriaConditionCreationModalComponent } from './revamped-create-program-flow/revamped-criteria-condition-creation-modal/revamped-criteria-condition-creation-modal.component';
import { RevampedCriteriaCardComponent } from './revamped-create-program-flow/revamped-criteria-card/revamped-criteria-card.component';
import { RevampedConditionComponent } from './revamped-create-program-flow/revamped-condition/revamped-condition.component';
import { RevampedProgramComponentsComponent } from './revamped-programs/revamped-program-components/revamped-program-components.component';
import { RevampedProgramCreationModalComponent } from './revamped-programs/revamped-program-creation-modal/revamped-program-creation-modal.component';
import { ProgramComponentDetailsComponent } from './revamped-programs/program-component-details/program-component-details.component';

import { PartnerDistributionsComponent } from './partner-distributions/partner-distributions.component';
import { DistributionCreationModalComponent } from './partner-distributions/distribution-creation-modal/distribution-creation-modal.component';
import { BeneficiariesTableComponent } from './partner-distributions/beneficiaries-table/beneficiaries-table.component';

const routes: Routes = [ 
    {
        path: '',
        component: RevampedProgramsComponent,
    },
    {
        path: 'revamped-programs',
        component: RevampedProgramsComponent,
    },
    {
        path: 'revamped-programs/program-components/:masterProgramId',
        component: RevampedProgramComponentsComponent,
    },
    {
        path: 'revamped-programs/new-program-component',
        component: RevampedCreateProgramFlowComponent,
    },
    {
        path: 'revamped-programs/update-program-component/:programId',
        component: RevampedCreateProgramFlowComponent,
    },
    {
        path: 'revamped-program/:programComponentId/location/:type/:locationId',
        component: RevampedCreateProgramFlowComponent,
    },


    {
        path: 'partner-distributions',
        component: PartnerDistributionsComponent,
    },
    {
        path: 'beneficiaries',
        component: BeneficiariesTableComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RevampedTargetingRoutingModule {
    static components = [
        RevampedProgramsComponent,
        RevampedCreateProgramFlowComponent,
        RevampedCreateProgramComponent,
        RevampedProgramCriteriaCategoriesComponent,
        RevampedCriteriaCreationModalComponent,
        RevampedCriteriaConditionCreationModalComponent,
        RevampedCriteriaCardComponent,
        RevampedConditionComponent,
        RevampedProgramComponentsComponent,
        RevampedProgramCreationModalComponent,
        PartnerDistributionsComponent,
        DistributionCreationModalComponent,
        BeneficiariesTableComponent,
        ProgramComponentDetailsComponent
    ];
}
