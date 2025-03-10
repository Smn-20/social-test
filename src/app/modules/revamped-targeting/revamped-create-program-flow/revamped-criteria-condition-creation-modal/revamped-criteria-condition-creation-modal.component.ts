import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  EValueOperations,
  ECriteriaApplicationGroup
} from 'src/app/core/enums';
import { HouseholdService } from 'src/app/core/services/household.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { IConditionCategory, ICriteria } from 'src/app/core/types';
import {
  conditionQuantifierCategories,
  revampedOperationsType
} from 'src/app/core/utils/reusable-arrays';
import { generateRandomUniqueId } from 'src/app/core/utils/reusable-functions';

@Component({
  selector: 'app-revamped-criteria-condition-creation-modal',
  templateUrl: './revamped-criteria-condition-creation-modal.component.html',
  styleUrls: ['./revamped-criteria-condition-creation-modal.component.css']
})
export class RevampedCriteriaConditionCreationModalComponent implements OnInit {
  criteria: ICriteria | undefined
  conditionFormGroup!: FormGroup;
  conditionToEdit?: any 

  questionLoading = false;
  questions!: any[];
  sectionLoading = false;
  sections!: any[];
  quantifiers: Array<{
    name: string, value: string
  }> = conditionQuantifierCategories;
  operations: Array<{
    name: string, value: string
  }> = [...revampedOperationsType].filter(operation => {
    return operation.value !== 'ALL'
  });
  limitOperations: Array<{
    name: string, value: string
  }> = [...revampedOperationsType].filter(operation => {
    return !['IN', 'NOT_IN'].includes(operation.value)
  });
  subConditionOperations: Array<{
    name: string, value: string
  }> = [...revampedOperationsType].filter(operation => {
    return operation.value !== 'ALL'
  });
  selectedAnswers!: any[];
  selectedQuestion!: any;
  question_category?: IConditionCategory;
  selectedConditionValueOperation?: EValueOperations
  selectedLimitValueOperation?: EValueOperations

  subConditionSelectedAnswers!: any[];
  subConditionSelectedQuestion!: any;
  subConditionQuestion_category?: IConditionCategory;
  subConditionSelectedConditionValueOperation?: EValueOperations

  isMainFormCompact = false
  subConditionQuestionLoading = false;
  subConditionQuestions!: any[];
  leftMembersConditions: Array<any> = []
  ECriteriaApplicationGroup = ECriteriaApplicationGroup

  // question_category: string,
  // question: string,
  // condition_value: ITwoSidedConditionValue | IOneSidedConditionValue,
  // condition_category: EConditionCategory,
  // value: ITwoSidedConditionValue | IOneSidedConditionValue | 'ALL'

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<RevampedCriteriaConditionCreationModalComponent>,
    public fb: FormBuilder,
    private householdService: HouseholdService,
    public translationService: TranslationService
  ) {
    this.conditionFormGroup = this.fb.group({
      questionCategory: [null, Validators.required],
      question: [null, Validators.required],
      conditionValue: [null, Validators.required],
      conditionCategory: [null, Validators.required],
      value: [null, Validators.required],
    });
    this.criteria = this.data;
  }

  get formControls() {
    return this.conditionFormGroup.controls;
  }

  close(isCancelled: boolean): void {
    if (!isCancelled) {
      if (this.conditionFormGroup.invalid) {
        this.conditionFormGroup.markAsDirty();
        this.conditionFormGroup.markAllAsTouched();
        return;
      }
    }
    this.dialogRef.close(!isCancelled ? {
      condition_id: generateRandomUniqueId(12),
      question_category: this.formControls['questionCategory']?.value,
      question: this.formControls['question']?.value,
      condition_category: this.formControls['conditionCategory']?.value,
      condition_value: this.formControls['conditionValue']?.value,
      value: this.formControls['value']?.value,
    } : null);
  }

  ngOnInit(): void {
    this.getAllsections();
  }

  getQuestionsByRespondentSection(evt: any, onEdit = false): void {
    this.questionLoading = true;
    this.conditionFormGroup.controls['questionCategory'].setValue(evt.value)
    this.householdService.getAllQuestionsBySection(evt.value).subscribe((res: any) => {
      this.questionLoading = false;
      if (res.status) {
        this.questions = res.response;
        if (!onEdit) {
          this.conditionFormGroup.controls['question'].reset();
        } else {
          this.getOnUpdateSelectedAnswers(this.conditionFormGroup.controls['question']?.value);
        }
      }
    });
  }

  getOnUpdateSelectedAnswers(question: string): void {
    const question_ = this.questions.find((el) => el.description === question);
    this.selectedAnswers = question_?.answers;
  }

  initTranslatable(): void {
    this.translationService.loadLanguage();
    this.translationService.getInstantTranslations('component').subscribe((res) => {
      this.operations = this.translationService.translateArray(revampedOperationsType, res.operations);
    });
  }

  getAllsections(): void {
    this.sectionLoading = true;
    this.householdService.getAllSections().subscribe((res: any) => {
      this.sectionLoading = false;
      if (res.status) {
        this.sections = res.response;
        this.initTranslatable();
      }
    });
  }

  onQuestionChange(evt: any): void {
    this.question_category = {
      inputType: evt.inputType,
      questionType: evt.questionType,
      respondentType: evt.respondentType
    }
    this.selectedAnswers = evt.answers.filter((
      ans: { status: string; }
    ) => ans.status === 'ACTIVE')
    this.conditionFormGroup.controls['conditionCategory'].setValue(this.question_category)
    this.conditionFormGroup.controls['question'].setValue(evt);
    this.selectedQuestion = evt;
    this.operations = [...revampedOperationsType].filter(operation => {
      return operation.value !== 'ALL'
    });

    if (this.selectedAnswers.length > 0) {
      this.operations = this.operations.filter(operation => {
        if (evt.questionType === 'BOOLEAN' || evt.questionType === 'RADIO_BUTTON') {
          return ['EQUAL', 'NOT_EQUAL', 'IN', 'NOT_IN'].includes(operation.value);
        }
        return ![
          'GREATER_THAN_OR_EQUAL',
          'LESS_THAN_OR_EQUAL',
          'IN_RANGE', 'NOT_IN_RANGE'
        ].includes(operation.value);
      });
    } else if (
      this.selectedAnswers.length <= 0 &&
      evt.questionType === 'TEXT' &&
      evt.inputType === 'TEXT'
    ) {
      this.operations = this.operations.filter(operation => {
        return ['EQUAL', 'NOT_EQUAL'].includes(operation.value);
      });
    } else {
      this.operations = this.operations.filter(operation => {
        return !['IN', 'NOT_IN'].includes(operation.value);
      });
    }

    this.conditionFormGroup.controls['conditionValue'].reset();
    this.selectedConditionValueOperation = undefined;
  }

  isMultipleValueOperation(operation: string): boolean {
    return ['IN', 'NOT_IN'].includes(operation);
  }
  
  isSingleSelectOperation(operation: string, question_category?: IConditionCategory): boolean {
    return !this.requiresRangeSelect(operation) &&
      ['BOOLEAN', 'RADIO_GROUP', 'DROPDOWN', 'CHECKBOX'].includes(question_category?.questionType ?? '') &&
        !['IN', 'NOT_IN'].includes(this.selectedConditionValueOperation ?? '');
  }

  // Operations that require a range (e.g., GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL)
  requiresRangeInput(operation: string): boolean {
    return [
      'GREATER_THAN_OR_EQUAL',
      'LESS_THAN_OR_EQUAL',
      'IN_RANGE',
      'NOT_IN_RANGE'
    ].includes(operation);
  }

  // Checks if a range input requires select dropdowns instead of input fields
  requiresRangeSelect(operation: string): boolean {
    return this.requiresRangeInput(operation);
  }
  
  // Input type depends on the question category
  getInputType(question_category?: IConditionCategory): string {
    switch (question_category?.inputType) {
      case 'TEXT': return 'text';
      case 'NUMBER': return 'number';
      default: return 'text';
    }
  }
  
  // Whether to render a text input field (for free text or numbers)
  requiresTextInput(operation: string, question_category?: IConditionCategory): boolean {
    return (
      ['EQUAL', 'NOT_EQUAL', 'GREATER_THAN', 'LESS_THAN'].includes(operation) &&
      question_category?.questionType === 'TEXT' && 
      this.selectedAnswers.length <= 0
    );
  }  

  onConditionValueOperation(evt: any): void {
    this.selectedConditionValueOperation = evt.value
    this.conditionFormGroup.controls['conditionValue'].reset()
  }

  onLimitValueOperation(evt: any): void {
    this.selectedLimitValueOperation = evt.value
    if (evt.value === 'ALL') {
      return this.conditionFormGroup.controls['value'].setValue(EValueOperations.ALL);
    }
    this.conditionFormGroup.controls['value'].reset();
  }

  onConditionValue(evt: any, isDoubleValue: boolean, valuePostion?: number): void {
    let value_payload: any = null
    if (isDoubleValue && valuePostion) {
      value_payload = {
        operation: this.selectedConditionValueOperation,
        number_value_one: valuePostion === 1 ? evt : (this.formControls['conditionValue']?.value?.number_value_one ?? null),
        number_value_two: valuePostion === 2 ? evt : (this.formControls['conditionValue']?.value?.number_value_two ?? null)
      }
      this.conditionFormGroup.controls['conditionValue'].setValue(value_payload)
    } else if (!isDoubleValue) {
      value_payload = {
        operation: this.selectedConditionValueOperation,
        value: evt ?? (this.formControls['conditionValue']?.value?.value ?? null),
      }
    }
    this.conditionFormGroup.controls['conditionValue'].setValue(value_payload)
  }

  onLimitValue(evt: any, isDoubleValue: boolean, valuePostion?: number): void {
    let value_payload: any = null
    if (isDoubleValue && valuePostion) {
      value_payload = {
        operation: this.selectedLimitValueOperation,
        number_value_one: valuePostion === 1 ? evt : (this.formControls['value']?.value?.number_value_one ?? null),
        number_value_two: valuePostion === 2 ? evt : (this.formControls['value']?.value?.number_value_two ?? null)
      }
      this.conditionFormGroup.controls['value'].setValue(value_payload)
    } else if (!isDoubleValue) {
      value_payload = {
        operation: this.selectedLimitValueOperation,
        value: evt ?? (this.formControls['value']?.value?.value ?? null),
      }
    }
    this.conditionFormGroup.controls['value'].setValue(value_payload)
  }

  onConditionRequiredByTheRest() {
    console.warn('okay')
  }

  toggleAddSubCondition() {
    const newSubCondition = {
      sub_condition_id: generateRandomUniqueId(12),
      question: null,
      question_category: null
    };
    this.leftMembersConditions.push(newSubCondition);
  }

  removeSubCondition(subConditionId: string) {
    const newSubConditions = this.leftMembersConditions.filter(condition => condition.sub_condition_id !== subConditionId);
    this.leftMembersConditions = newSubConditions;
  }

  getSubConditionQuestionsByRespondentSection(evt: any, subConditionId: string): void {
    this.subConditionQuestionLoading = true;
    const subCondition = this.leftMembersConditions.find(
      condition => condition.sub_condition_id === subConditionId);
    const index = this.leftMembersConditions.indexOf(subCondition);
    if (index < 0) return;
    // this.leftMembersConditions[index] = evt.value;
    this.householdService.getAllQuestionsBySection(evt.value).subscribe((res: any) => {
      console.warn(this.leftMembersConditions[index])
      this.subConditionQuestionLoading = false;
      if (res.status) {
        this.subConditionQuestions = res.response;
      }
    });
  }

  onSubConditionQuestionChange(evt: any): void {
    this.question_category = {
      inputType: evt.inputType,
      questionType: evt.questionType,
      respondentType: evt.respondentType
    }
    this.subConditionSelectedAnswers = evt.answers.filter((
      ans: { status: string; }
    ) => ans.status === 'ACTIVE')
    this.subConditionSelectedQuestion = evt;
    this.subConditionOperations = [...revampedOperationsType].filter(operation => {
      return operation.value !== 'ALL'
    });

    if (this.subConditionSelectedAnswers.length > 0) {
      this.subConditionOperations = this.subConditionOperations.filter(operation => {
        if (evt.questionType === 'BOOLEAN' || evt.questionType === 'RADIO_BUTTON') {
          return ['EQUAL', 'NOT_EQUAL', 'IN', 'NOT_IN'].includes(operation.value);
        }
        return ![
          'GREATER_THAN_OR_EQUAL',
          'LESS_THAN_OR_EQUAL',
          'IN_RANGE', 'NOT_IN_RANGE'
        ].includes(operation.value);
      });
    } else if (
      this.subConditionSelectedAnswers.length <= 0 &&
      evt.questionType === 'TEXT' &&
      evt.inputType === 'TEXT'
    ) {
      this.subConditionOperations = this.subConditionOperations.filter(operation => {
        return ['EQUAL', 'NOT_EQUAL'].includes(operation.value);
      });
    } else {
      this.subConditionOperations = this.subConditionOperations.filter(operation => {
        return !['IN', 'NOT_IN'].includes(operation.value);
      });
    }
    this.subConditionSelectedConditionValueOperation = undefined;
  }

  onSubConditionValueOperation(evt: any): void {
    this.subConditionSelectedConditionValueOperation = evt.value
    // this.sub
  }

  // onSubConditionValue(evt: any, isDoubleValue: boolean, valuePostion?: number): void {
  //   let value_payload: any = null
  //   if (isDoubleValue && valuePostion) {
  //     value_payload = {
  //       operation: this.selectedConditionValueOperation,
  //       number_value_one: valuePostion === 1 ? evt : (this.formControls['conditionValue']?.value?.number_value_one ?? null),
  //       number_value_two: valuePostion === 2 ? evt : (this.formControls['conditionValue']?.value?.number_value_two ?? null)
  //     }
  //     this.conditionFormGroup.controls['conditionValue'].setValue(value_payload)
  //   } else if (!isDoubleValue) {
  //     value_payload = {
  //       operation: this.selectedConditionValueOperation,
  //       value: evt ?? (this.formControls['conditionValue']?.value?.value ?? null),
  //     }
  //   }
  //   this.conditionFormGroup.controls['conditionValue'].setValue(value_payload)
  // }
}
