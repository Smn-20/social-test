import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AppealDetailsComponent } from './appeal-details/appeal-details.component';
import { AppealsRoutingModule } from './appeals-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [AppealsRoutingModule.components, AppealDetailsComponent],
    imports: [
        CommonModule,
        AppealsRoutingModule,
        FeatherModule.pick(allIcons),
        MatPaginatorModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
    ],
})
export class AppealsModule {}
