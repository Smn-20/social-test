import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslationsRoutingModule } from './translations-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationsComponent } from './translations.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { TranslationUpdateComponent } from './translation-update/translation-update.component';
@NgModule({
  declarations: [
    TranslationsComponent,
    TranslationUpdateComponent
  ],
  imports: [
    CommonModule,
    TranslationsRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    MatDialogModule,
    MatPaginatorModule
  ]
})
export class TranslationsModule { }
