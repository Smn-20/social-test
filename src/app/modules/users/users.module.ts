import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { SharedModule } from '../shared/shared.module';

import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CreateUserComponent } from './create-user/create-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { UsersRoutingModule } from './users-routing.module';
import { ViewUserDetailsComponent } from './view-user-details/view-user-details.component';
import { RemoveUnderscorePipe } from '../../core/pipes/remove-underscore.pipe';

@NgModule({
    declarations: [UsersRoutingModule.components, CreateUserComponent, ViewUserDetailsComponent, EditUserComponent],
    imports: [
        CommonModule,
        UsersRoutingModule,
        SharedModule,
        MatDialogModule,
        MatChipsModule,
        MatPaginatorModule,
        ReactiveFormsModule,
    ],
    providers: [RemoveUnderscorePipe],
})
export class UsersModule {}
