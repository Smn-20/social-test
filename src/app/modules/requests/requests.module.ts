import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestsRoutingModule } from './requests-routing.module';
import { TransfersComponent } from './transfers/transfers.component';
import { ArchivesComponent } from './archives/archives.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
    declarations: [TransfersComponent, ArchivesComponent],
    imports: [
        CommonModule,
        RequestsRoutingModule,
        MatPaginatorModule,
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
    ],
})
export class RequestsModule {}
