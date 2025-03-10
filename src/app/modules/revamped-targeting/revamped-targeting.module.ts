import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { SharedModule } from '../shared/shared.module';
import { RevampedTargetingRoutingModule } from './revamped-targeting-routing.module';

@NgModule({
    declarations: [RevampedTargetingRoutingModule.components],
    imports: [
        CommonModule,
        RevampedTargetingRoutingModule,
        SharedModule,
        NgSelectModule,
        FeatherModule.pick(allIcons),
        MatDialogModule,
        ReactiveFormsModule,
        FormsModule,
        MatPaginatorModule,
        MatSliderModule,
        MatTooltipModule,
    ]
})
export class RevampedTargetingModule { }
