import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { SharedModule } from '../shared/shared.module';
import { HouseholdsRoutingModule } from './households-routing.module';

@NgModule({
    declarations: [HouseholdsRoutingModule.components],
    imports: [
        CommonModule,
        HouseholdsRoutingModule,
        SharedModule,
        MatChipsModule,
        NgSelectModule,
        FeatherModule.pick(allIcons),
        MatDialogModule,
        ReactiveFormsModule,
        FormsModule,
        MatTooltipModule,
        MatPaginatorModule,
    ],
})
export class HouseholdsModule {}
