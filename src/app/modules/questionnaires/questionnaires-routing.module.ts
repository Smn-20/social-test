import { QuestionnaireCardComponent } from './questionnaire-card/questionnaire-card.component';
import { QuestionnairesComponent } from './questionnaires.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LibraryComponent } from './library/library.component';
import { SelectedQuestionnaireComponent } from './selected-questionnaire/selected-questionnaire.component';
import { SurveysComponent } from './surveys/surveys.component';
import { QuestionnaireRendererComponent } from './questionnaire-renderer/questionnaire-renderer.component';
import { GenerateJsonComponent } from './generate-json/generate-json.component';
import { CreateQuestionnaireComponent } from './create-questionnaire/create-questionnaire.component';

const routes: Routes = [
    {
        path: 'qs',
        component: LibraryComponent,
    },
    {
        path: 'surveys',
        component: SurveysComponent,
    },
    {
        path: 'qs/:id',
        component: SelectedQuestionnaireComponent,
    },
    {
        path: 'renderer/:type',
        component: QuestionnaireRendererComponent,
    },
    {
        path: 'edit/:type/:memberId',
        component: QuestionnaireRendererComponent,
    },
    {
        path: 'basic-edit/:type/:memberId',
        component: QuestionnaireRendererComponent,
    },
    {
        path: 'renderer/:type/:id',
        component: GenerateJsonComponent,
    },
    {
        path: 'generate/json',
        component: GenerateJsonComponent,
    },
    {
        path: 'update/json/:id',
        component: GenerateJsonComponent,
    },
    {
        path: '**',
        redirectTo: 'qs',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class QuestionnairesRoutingModule {
    static components = [
        QuestionnairesComponent,
        SelectedQuestionnaireComponent,
        LibraryComponent,
        SurveysComponent,
        QuestionnaireCardComponent,
        QuestionnaireRendererComponent,
        GenerateJsonComponent,
        CreateQuestionnaireComponent,
    ];
}
