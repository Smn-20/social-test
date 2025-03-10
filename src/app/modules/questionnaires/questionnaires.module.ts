import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { QuestionnairesRoutingModule } from './questionnaires-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SurveyModule } from 'survey-angular-ui';
import { SurveyCreatorModule } from 'survey-creator-angular';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    declarations: [QuestionnairesRoutingModule.components],
    imports: [
        CommonModule,
        QuestionnairesRoutingModule,
        SharedModule,
        NgSelectModule,
        FeatherModule.pick(allIcons),
        MatDialogModule,
        ReactiveFormsModule,
        FormsModule,
        MatPaginatorModule,
        SurveyModule,
        SurveyCreatorModule,
        MatTooltipModule,
    ],
})
export class QuestionnairesModule {}
