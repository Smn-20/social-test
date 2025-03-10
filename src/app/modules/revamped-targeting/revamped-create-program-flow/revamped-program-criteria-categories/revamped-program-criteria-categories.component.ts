import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IConditionValue, ICriteria } from 'src/app/core/types';
import {
  RevampedCriteriaCreationModalComponent
} from '../revamped-criteria-creation-modal/revamped-criteria-creation-modal.component';
import { TranslationService } from 'src/app/core/services/translation.service';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-revamped-program-criteria-categories',
  templateUrl: './revamped-program-criteria-categories.component.html',
  styleUrls: ['./revamped-program-criteria-categories.component.css']
})
export class RevampedProgramCriteriaCategoriesComponent {
  @Output() receiveDataEvent = new EventEmitter();

  criterias: Array<ICriteria> = []

  snackBarMessages: Array<string> = ["conditionCriteriaNotFound"]

  constructor(
    public dialog: MatDialog,
    private translationService: TranslationService,
    private globalService: GlobalService
  ) {}

  toggleCreateCriteriaModal(data?: never): void {
    this.dialog.open(RevampedCriteriaCreationModalComponent, {
      data: data,
      width: '672px',
    }).afterClosed().subscribe((response: ICriteria) => {
      if (response) {
        this.criterias.unshift(response);
        this.receiveDataEvent.emit(this.criterias)
      }
    });
  }

  receiveCriteriaCondition(data: {
    action: 'ADD' | 'REMOVE',
    condition: IConditionValue,
    criteria: ICriteria
  }): void {
    const foundCriteria = this.criterias.find(
      (crit) => crit.criteria_id === data.criteria.criteria_id
    );
    if (foundCriteria) {
      if (data.action === 'ADD') {
        foundCriteria.conditions.push(data.condition);
      }
      if (data.action === 'REMOVE') {
        const filterConditions = foundCriteria.conditions.filter(condition => (
          condition.condition_id !== condition.condition_id
        ));
        foundCriteria.conditions = filterConditions;
      }
    } else {
      this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe(res => {
        this.globalService.openFailureSnackBar(res)
      });
    }
  }
}
