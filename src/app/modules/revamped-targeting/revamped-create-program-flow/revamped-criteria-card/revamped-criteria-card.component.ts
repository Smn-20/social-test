import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IConditionValue, ICriteria } from 'src/app/core/types';
import {
    RevampedCriteriaConditionCreationModalComponent
} from '../revamped-criteria-condition-creation-modal/revamped-criteria-condition-creation-modal.component';

@Component({
    selector: 'app-revamped-criteria-card',
    templateUrl: './revamped-criteria-card.component.html',
    styleUrls: ['./revamped-criteria-card.component.css']
})
export class RevampedCriteriaCardComponent {
    @Input() criteria: ICriteria | undefined;
    @Output() saveCondition = new EventEmitter<any>();
    conditions: Array<IConditionValue> = []
    roughConditions: Array<any> = []

    constructor(
        public dialog: MatDialog,
    ) { }

    toggleAddConditionModal(data?: ICriteria | never): void {
        this.dialog.open(RevampedCriteriaConditionCreationModalComponent, {
            data: this.criteria,
            width: '672px',
        }).afterClosed().subscribe((response: IConditionValue) => {
            if (response) {
                console.warn(response)
                this.roughConditions.push(response)
                this.conditions.push(response)
                this.saveCondition.emit({
                    action: 'ADD',
                    condition: response,
                    criteria: this.criteria,
                })
            }
        });
    }

    removeCriteriaCondition(conditionId: string): void {
        const condition = this.roughConditions.find(cond => cond.condition_id === conditionId)
        if (condition) {
            const filteredConditions = this.roughConditions.filter(condition => (
                condition.condition_id !== conditionId
            ));
            this.conditions = this.roughConditions = filteredConditions;
            this.saveCondition.emit({
                action: 'REMOVE',
                condition: condition,
                criteria: this.criteria
            })
        }
    }

}
