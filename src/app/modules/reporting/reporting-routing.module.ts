import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateReportComponent } from './create-report/create-report.component';
import { ReportsComponent } from './reports/reports.component';
import { ReportDataComponent } from './report-data/report-data.component';

const routes: Routes = [
    {
        path: '',
        component: ReportsComponent,
    },
    {
        path: 'new-report',
        component: CreateReportComponent,
    },
    {
        path: 'data/:reportId',
        component: ReportDataComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReportingRoutingModule {}
