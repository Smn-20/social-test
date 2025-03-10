import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardCategoriesComponent } from './dashboard-categories/dashboard-categories.component';
import { DashboardSelectorComponent } from './dashboard-selector/dashboard-selector.component';
import { ReportTypesComponent } from './report-types/report-types.component';

const routes: Routes = [
    {
        path: 'report-types',
        component: ReportTypesComponent,
    },
    {
        path: 'dashboard-types',
        component: DashboardSelectorComponent,
    },
    {
        path: 'dashboard-categories',
        component: DashboardCategoriesComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SettingsRoutingModule {}
