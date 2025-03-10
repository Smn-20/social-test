import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { DashboardLayoutComponent } from '../../layouts/dashboard-layout/dashboard-layout.component';
import { SharedModule } from '../shared/shared.module';
import { CreateCategoryComponent } from './create-category/create-category.component';
import { CreateDashboardTypeComponent } from './create-dashboard-type/create-dashboard-type.component';
import { CreateDashboardComponent } from './create-dashboard/create-dashboard.component';
import { CreateReportModalComponent } from './create-report-modal/create-report-modal.component';
import { CreateReportTypeComponent } from './create-report-type/create-report-type.component';
import { DashboardCategoriesComponent } from './dashboard-categories/dashboard-categories.component';
import { DashboardSelectorComponent } from './dashboard-selector/dashboard-selector.component';
import { ReportTypesComponent } from './report-types/report-types.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    imports: [
        CommonModule,
        SettingsRoutingModule,
        SharedModule,
        NgSelectModule,
        FeatherModule.pick(allIcons),
        MatDialogModule,
        ReactiveFormsModule,
        FormsModule,
        MatPaginatorModule,
        MatTooltipModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
            isolate: false,
        }),
    ],
    declarations: [
        SettingsComponent,
        ReportTypesComponent,
        CreateReportTypeComponent,
        CreateDashboardTypeComponent,
        CreateReportModalComponent,
        DashboardSelectorComponent,
        CreateDashboardComponent,
        DashboardCategoriesComponent,
        CreateCategoryComponent,
        DashboardLayoutComponent,
    ],
})
export class SettingsModule {}
