import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
// import { RemoveUnderscorePipe } from '../pipes/remove-underscore.pipe';
import { SharedModule } from '../shared/shared.module';

import { PermissionsRoutingModule } from './permissions-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [PermissionsRoutingModule.components],
    imports: [CommonModule, PermissionsRoutingModule, MatPaginatorModule, SharedModule, ReactiveFormsModule],
})
export class PermissionsModule {}
