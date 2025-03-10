import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubmittedAppealsComponent } from './submitted-appeals/submitted-appeals.component';
import { ApprovedAppealsComponent } from './approved-appeals/approved-appeals.component';
import { CancelledAppealsComponent } from './cancelled-appeals/cancelled-appeals.component';

const routes: Routes = [
    { path: 'submitted', component: SubmittedAppealsComponent },
    { path: 'approved', component: ApprovedAppealsComponent },
    { path: 'cancelled', component: CancelledAppealsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AppealsRoutingModule {
    static components = [SubmittedAppealsComponent, ApprovedAppealsComponent, CancelledAppealsComponent];
}
