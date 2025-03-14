import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-questionnaires',
    templateUrl: './questionnaires.component.html',
    styleUrls: ['./questionnaires.component.css'],
})
export class QuestionnairesComponent implements OnInit {
    openNewQuestionnaire = false;

    toggleNewQuestionnaireModal() {
        this.openNewQuestionnaire = !this.openNewQuestionnaire;
    }
    constructor() {}

    ngOnInit(): void {}
}
