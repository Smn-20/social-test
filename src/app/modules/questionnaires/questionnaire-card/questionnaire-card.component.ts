import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { EAction, EInterviewee, EPermission, EState } from 'src/app/core/enums';

@Component({
    selector: 'app-questionnaire-card',
    templateUrl: './questionnaire-card.component.html',
    styleUrls: ['./questionnaire-card.component.css'],
})
export class QuestionnaireCardComponent {
    @Input() q!: any;
    @Input() showTriggerScoreOnActive = false;
    @Input() isTriggering = false;
    @Input() editable = false;
    @Output() selectedQuestionnaire = new EventEmitter();
    @Output() actionEvent = new EventEmitter();
    public EInterviewee = EInterviewee;
    public EState = EState;
    public EAction = EAction;
    public EPermission = EPermission;
    constructor(private router: Router) {}

    downloadJsonFile(json: any): void {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json));
        const dlAnchorElem = document.getElementById('downloadAnchorElem');
        dlAnchorElem?.setAttribute('href', dataStr);
        dlAnchorElem?.setAttribute('download', 'questionnaire.json');
        dlAnchorElem?.click();
    }

    getTQs(q: any): { pages: number; questions: number } {
        const pages = q?.jsonObject ? JSON.parse(q.jsonObject)?.pages : null;
        return {
            pages: pages?.length || 0,
            questions: pages?.reduce((a: any, b: any) => a + b.elements?.length, 0) || 0,
        };
    }

    onSelected(evt: any): void {
        this.selectedQuestionnaire.emit(evt);
    }

    onActionEvent(action: EAction | 'trigger-score', event: any): void {
        if (action === EAction.EDIT) {
            window.localStorage.setItem(
                event.id,
                JSON.stringify({
                    jsonObject: event.jsonObject,
                    title: event.description,
                    respondentType: event.respondentType,
                })
            );
        }
        this.actionEvent.emit({ action, event });
    }
}
