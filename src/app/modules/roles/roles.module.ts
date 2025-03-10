import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { EditRoleComponent } from './edit-role/edit-role.component';
import { RolesRoutingModule } from './roles-routing.module';
import { RoleDetailComponent } from './role-detail/role-detail.component';
import { CreateRoleComponent } from './create-role/create-role.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [RolesRoutingModule.components, EditRoleComponent, RoleDetailComponent, CreateRoleComponent],
    imports: [CommonModule, RolesRoutingModule, MatPaginatorModule, ReactiveFormsModule, MatDialogModule, SharedModule],
})
export class RolesModule {}
