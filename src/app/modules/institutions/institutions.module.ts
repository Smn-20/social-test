import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { CreateInstitutionComponent } from './create-institution/create-institution.component';
import { InstitutionsRoutingModule } from './institutions-routing.module';
import { InstitutionsComponent } from './institutions.component';

@NgModule({
    declarations: [InstitutionsComponent, CreateInstitutionComponent],
    imports: [MatPaginatorModule, CommonModule, InstitutionsRoutingModule, SharedModule],
})
export class InstitutionsModule {}
