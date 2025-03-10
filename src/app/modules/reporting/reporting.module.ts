import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { SharedModule } from '../shared/shared.module';
import { CreateReportComponent } from './create-report/create-report.component';
import { ReportCriteriaComponent } from './report-criteria/report-criteria.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReportingRoutingModule } from './reporting-routing.module';
import { ReportsComponent } from './reports/reports.component';
import { ReportDataComponent } from './report-data/report-data.component';

@NgModule({
    imports: [
        CommonModule,
        ReportingRoutingModule,
        SharedModule,
        NgSelectModule,
        FeatherModule.pick(allIcons),
        MatDialogModule,
        ReactiveFormsModule,
        FormsModule,
        MatPaginatorModule,
        MatSliderModule,
        MatTooltipModule,
        MatExpansionModule,
    ],
    declarations: [
        ReportsComponent,
        ReportDataComponent,
        CreateReportComponent,
        ReportCriteriaComponent,
        CreateReportComponent,
    ],
})
export class ReportingModule {}
