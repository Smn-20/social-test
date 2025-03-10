import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxEchartsModule } from 'ngx-echarts';
import { SharedModule } from '../shared/shared.module';
import { DashboardComponentComponent } from './dashboard-component/dashboard-component.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { InitialDashboardComponent } from './initial-dashboard/initial-dashboard.component';
import { MapComponent } from './map/map.component';

@NgModule({
    declarations: [
        DashboardRoutingModule.components,
        DashboardComponentComponent,
        InitialDashboardComponent,
        MapComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        DashboardRoutingModule,
        MatChipsModule,
        FormsModule,
        ReactiveFormsModule,
        NgApexchartsModule,
        MatDialogModule,
        MatPaginatorModule,
        NgxEchartsModule.forRoot({
            echarts: () => import('echarts'),
        }),
    ],
})
export class DashboardModule {}
