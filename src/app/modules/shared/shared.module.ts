import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { AccessControlDirective } from '../../core/directives/access-control.directive';
import { EllipsisPipe } from '../../core/pipes/ellipsis.pipe';
import { RowEllipsisPipe } from '../../core/pipes/row-ellipsis.pipe';
import { RemoveUnderscorePipe } from '../../core/pipes/remove-underscore.pipe';
import { CreateCriteriaComponent } from '../targeting/create-criteria/create-criteria.component';
import { CreateTargetGroupComponent } from '../targeting/create-target-group/create-target-group.component';
import { CriteriaComponent } from '../targeting/criteria/criteria.component';
import { TargetGroupComponent } from '../targeting/target-group/target-group.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { LocationComponent } from './location/location.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { TableShimmerComponent } from './table-shimmer/table-shimmer.component';
import { UserDetailsComponent } from './user-details/user-details.component';

import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HoverMenuDirective } from '../../core/directives/hover.directive';
import { ObjectLengthPipe } from '../../core/pipes/ObjectLength.pipe';
import { HighlightPipe } from '../../core/pipes/highlight.pipe';
import { HumanReadablePipe } from '../../core/pipes/respondent-type.pipe';
import { SplitByPipe } from '../../core/pipes/splitBy.pipe';
import { CreateTargetGroupCategoryComponent } from '../targeting/create-target-group-category/create-target-group-category.component';
import { ProgramDetailsComponent } from '../targeting/program-details/program-details.component';
import { TargetGroupCategoryComponent } from '../targeting/target-group-category/target-group-category.component';
import { FilterComponent } from './filter/filter.component';
import { HeaderComponent } from './header/header.component';
import { JurisdictionComponent } from './jurisdiction/jurisdiction.component';
import { LoaderComponent } from './loader/loader.component';
import { PaginationComponent } from './pagination/pagination.component';
import { StatusComponent } from './status/status.component';
import { TrackByComponent } from './track-by/track-by.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const components = [
    JurisdictionComponent,
    FilterComponent,
    LocationComponent,
    UserDetailsComponent,
    SpinnerComponent,
    ErrorMessageComponent,
    TableShimmerComponent,
    NotFoundComponent,
    CriteriaComponent,
    TargetGroupComponent,
    CreateCriteriaComponent,
    CreateTargetGroupComponent,
    TargetGroupCategoryComponent,
    ProgramDetailsComponent,
    CreateTargetGroupCategoryComponent,
    PaginationComponent,
    TrackByComponent,
    UserInfoComponent,
    LoaderComponent,
    StatusComponent,
    HeaderComponent,
    SidenavComponent,
    BreadcrumbComponent,
    TableShimmerComponent,
    NotFoundComponent,
    ChangePasswordComponent
];
const directives = [AccessControlDirective, HoverMenuDirective];
const pipes = [RemoveUnderscorePipe, EllipsisPipe, RowEllipsisPipe,  HumanReadablePipe, SplitByPipe, ObjectLengthPipe, HighlightPipe];

const modules = [
    CommonModule,
    RouterModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatChipsModule,
    FeatherModule.pick(allIcons),
    MatTooltipModule,
    TranslateModule.forChild({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient],
        },
        isolate: false,
    }),
];

@NgModule({
    declarations: [components, pipes, directives],
    imports: [modules],
    exports: [components, modules, pipes, directives],
})
export class SharedModule {}
