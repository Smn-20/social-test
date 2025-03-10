import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { ProfileRoutingModule } from './profile-routing.module';

@NgModule({
    declarations: [ProfileRoutingModule.components],
    imports: [CommonModule, ProfileRoutingModule, ReactiveFormsModule, SharedModule],
})
export class ProfileModule {}
