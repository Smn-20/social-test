import { calculateAge } from '../../../core/utils/reusable-functions';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EOperations } from 'src/app/core/enums';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { interviewees2, operationsType } from 'src/app/core/utils/reusable-arrays';

@Component({
    selector: 'app-create-criteria',
    templateUrl: './create-criteria.component.html',
    styleUrls: ['./create-criteria.component.css'],
})
export class CreateCriteriaComponent implements OnInit {
    @Output() criteriaEvent = new EventEmitter<any>();
    @Output() criteriaRemoveEvent = new EventEmitter<any>();
    @Output() cancelEvent = new EventEmitter<any>();
    @Input() criteria: any;
    @Input() hideCancel = false;
    criteriaFormGroup!: FormGroup;
    openEditingMode = false;
    questionnaires!: any[];
    questionnairesLoading = false;
    questionLoading = false;
    sectionLoading = false;
    questions!: any[];
    sections!: any[];
    operations = operationsType;
    selectedAnswers: any;
    selectedOperationType!: EOperations;
    questionnaireTypes = interviewees2;
    selectedRespondentType!: string;
    selectedInputType!: string;
    public EOperations = EOperations;

    constructor(
        public fb: FormBuilder,
        private golabService: GlobalService,
        private householdService: HouseholdService,
        public translationService: TranslationService
    ) {
        this.initTranslatable();
        this.criteriaFormGroup = this.fb.group({
            respondentType: [null, Validators.required],
            section: [null, Validators.required],
            question: [null, Validators.required],
            criteria: [null],
            operation: [null, Validators.required],
            value: [null, Validators.required],
        });
    }

    ngOnInit(): void {
        this.getAllsections();
        this.criteriaFormGroup.controls['criteria'].disable();
        if (this.criteria?.criteria) {
            const { respondentType, section, question, criteria, operation, value } = this.criteria;
            this.criteriaFormGroup.controls['respondentType'].setValue(respondentType);
            this.criteriaFormGroup.controls['question'].setValue(question);
            this.criteriaFormGroup.controls['section'].setValue(section);
            this.criteriaFormGroup.controls['criteria'].setValue(criteria);
            this.criteriaFormGroup.controls['operation'].setValue(operation);
            this.criteriaFormGroup.controls['value'].setValue(value);
            this.getQuestionsByRespondentSection({ value: section }, true);
        }
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.operations = this.translationService.translateArray(operationsType, res.operations);
            this.questionnaireTypes = this.translationService.translateArray(interviewees2, res.interviewees2);
        });
    }

    get formControls() {
        return this.criteriaFormGroup.controls;
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

    getQuestionsByRespondentSection(evt: any, onEdit = false): void {
        this.questionLoading = true;
        this.householdService.getAllQuestionsBySection(evt.value).subscribe((res: any) => {
            this.questionLoading = false;
            if (res.status) {
                this.questions = res.response;
                if (!onEdit) {
                    this.criteriaFormGroup.controls['question'].reset();
                } else {
                    setTimeout(() => {
                        this.getOnUpdateSelectedAnswers(this.criteriaFormGroup.controls['question']?.value);
                    }, 0);
                }
            }
        });
    }

    getOnUpdateSelectedAnswers(question: string): void {
        const question_ = this.questions.find((el) => el.description === question);
        this.selectedAnswers = question_?.answers;
    }

    toggleEditingMode(): void {
        this.openEditingMode = !this.openEditingMode;
    }

    onQuestionChange(evt: any): void {
        this.criteriaFormGroup.controls['criteria'].setValue(evt.criteriaName);
        this.selectedInputType = evt.inputType;
        this.selectedAnswers = evt.answers;
        if (evt.inputType === 'RANGE') {
            this.addRangeCtrls();
        } else {
            this.removeRangeCtrls();
            this.criteriaFormGroup.controls['operation'].setValue(null);
            this.criteriaFormGroup.controls['operation'].enable();
        }
    }

    addRangeCtrls(): void {
        this.criteriaFormGroup.addControl('min', new FormControl(null, [Validators.required]));
        this.criteriaFormGroup.addControl('max', new FormControl(null, [Validators.required]));
        this.criteriaFormGroup.removeControl('value');
        this.criteriaFormGroup.removeControl('operation');
    }

    removeRangeCtrls(): void {
        this.criteriaFormGroup.addControl('value', new FormControl(null, [Validators.required]));
        this.criteriaFormGroup.addControl('operation', new FormControl(null, [Validators.required]));
        this.criteriaFormGroup.removeControl('min');
        this.criteriaFormGroup.removeControl('max');
    }

    onOperation(evt: any): void {
        this.selectedOperationType = evt.value;
        if (this.selectedInputType === 'RANGE') {
            this.criteriaFormGroup.controls['min'].reset();
            this.criteriaFormGroup.controls['max'].reset();
        } else {
            this.criteriaFormGroup.controls['value'].reset();
        }
    }

    addCriteria(): void {
        if (this.criteriaFormGroup.invalid) {
            this.criteriaFormGroup.markAsDirty();
            this.criteriaFormGroup.markAllAsTouched();
            this.golabService.openFailureSnackBar('Some fields are missing');
            return;
        }
        const INPUT_TYPE = this.formControls['question']?.value?.inputType;
        const obj = {
            ...(this.criteria?.id && { ...this.criteria }),
            section: this.formControls['section']?.value,
            respondentType: this.formControls['respondentType']?.value,
            question: this.formControls['question']?.value?.description,
            criteria: this.formControls['criteria']?.value,
            criteriaId: this.criteria?.id ? this.criteria.id : null,
            inputType: INPUT_TYPE,
            operation: this.formControls['operation']?.value,
        };
        if (this.selectedInputType !== 'RANGE') {
            const criteria = {
                ...obj,
                ...(typeof this.formControls['value']?.value === 'string' && {
                    value:
                        INPUT_TYPE === 'DATE' || INPUT_TYPE === 'DATE_TIME'
                            ? calculateAge(this.formControls['value']?.value)
                            : this.formControls['value']?.value,
                    values: [],
                }),
                ...(typeof this.formControls['value']?.value !== 'string' && {
                    values: this.formControls['value']?.value,
                    value: '',
                }),
            };
            this.criteriaEvent.emit(criteria);
        } else {
            const criteria1 = {
                ...obj,
                operation: EOperations.LESS_THAN_OR_EQUAL,
                value: this.formControls['min']?.value,
                values: [],
            };
            const criteria2 = {
                ...obj,
                operation: EOperations.GREATER_THAN_OR_EQUAL,
                value: this.formControls['max']?.value,
                values: [],
            };

            this.criteriaEvent.emit(criteria1);
            this.criteriaEvent.emit(criteria2);
        }

        this.criteriaFormGroup.controls['question'].reset();
        this.criteriaFormGroup.controls['criteria'].reset();
        this.criteriaFormGroup.controls['section'].reset();

        if (this.selectedInputType === 'RANGE') {
            this.criteriaFormGroup.controls['min'].reset();
            this.criteriaFormGroup.controls['max'].reset();
        } else {
            this.criteriaFormGroup.controls['operation'].reset();
            this.criteriaFormGroup.controls['value'].reset();
        }

        setTimeout(() => {
            this.cancel();
        }, 1);
    }

    removeCriteria(): void {
        this.criteriaRemoveEvent.emit();
    }

    cancel(): void {
        this.cancelEvent.emit();
    }
}
