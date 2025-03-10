import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { EOperations } from 'src/app/core/enums';
import { HouseholdService } from 'src/app/core/services/household.service';

@Component({
    selector: 'app-report-criteria',
    templateUrl: './report-criteria.component.html',
    styleUrls: ['./report-criteria.component.css'],
})
export class ReportCriteriaComponent implements OnInit, OnChanges {
    @ViewChild(MatExpansionPanel) expansionPanel!: MatExpansionPanel;
    @Input() criteria: any;
    @Input() respondentType!: string;
    @Input() section!: any;
    @Input() expanded = true;
    @Input() disabled = false;
    @Input() filterInput!: string;
    @Output() criteriaEvent = new EventEmitter<any>();
    criteriaFormGroup!: FormGroup;

    openEditingMode = false;
    loading = false;
    questions: any[] = [];
    filteredQuestions: any[] = [];
    checked: { [key: number]: boolean } = {};
    criterias: { [key: string]: any } = {};
    textValue: any;

    public EOperations = EOperations;

    constructor(public fb: FormBuilder, private householdService: HouseholdService) {}

    ngOnChanges(changes: SimpleChanges): void {
        const input = changes['filterInput']?.currentValue;
        if (input !== null && input !== '' && input !== undefined) {
            if (this.questions?.length > 0) {
                this.filterQuestions(input);
            } else {
                this.onOpened(input);
            }
        }
    }

    filterQuestions(input: string): void {
        const questions = [...this.questions];
        if (input !== null && input !== '' && input !== undefined) {
            this.filteredQuestions = questions.filter((el) => el?.description?.toLowerCase().indexOf(input) > -1);
        } else {
            this.filteredQuestions = questions;
        }
        if (this.filteredQuestions?.length > 0) {
            this.expansionPanel.open();
        } else {
            this.expansionPanel.close();
        }
    }

    ngOnInit() {
        this.criteriaFormGroup = this.fb.group({
            respondentType: [this.respondentType],
            section: [this.section],
            operation: [EOperations.EQUAL],
            textValue: [null],
        });
        this.initUpdate();
    }

    get criteriasLenght(): number {
        return this.mormalizedCriteria()?.length;
    }

    mormalizedCriteria(): any[] {
        return Object.values(this.criterias)?.filter((el) => el !== undefined && (el?.value || el?.values));
    }

    emitCriterias(): void {
        setTimeout(() => {
            this.criteriaEvent.emit(this.mormalizedCriteria());
        });
    }

    initUpdate(): void {
        if (this.criteria?.criteria) {
            const { respondentType, question, operation } = this.criteria;
            this.criteriaFormGroup.controls['respondentType'].setValue(respondentType);
            this.criteriaFormGroup.controls['question'].setValue(question);
            this.criteriaFormGroup.controls['operation'].setValue(operation);
        }
    }

    getQuestionsByRespondentSection(section: any): void {
        this.loading = true;
        this.householdService.getAllQuestionsBySection(section.value).subscribe((res: any) => {
            this.loading = false;
            if (res.status) {
                this.questions = res.response.map((el: any, i: number) => {
                    return { ...el, index: i };
                });
                this.filterQuestions(this.filterInput);
            }
        });
    }

    onChecked(questionIndex: number, renderedIndex: number): void {
        this.checked[renderedIndex] = !this.checked[renderedIndex];
        if (this.checked[renderedIndex]) {
            const question = { ...this.questions[questionIndex] };
            delete question.answers;
            this.criterias[questionIndex] = {
                ...question,
                ...this.criteriaObject,
                ...(question.inputType === 'RANGE' && { values: [null, null] }),
            };
        } else {
            this.criterias[questionIndex] = undefined as any;
            this.emitCriterias();
        }
    }

    onTextSelection(): void {
        this.emitCriterias();
    }

    onselectionChange(index: number, evt: any): void {
        const value = evt.answer;
        if (this.criterias[index]) {
            const c_ = { ...this.criterias[index] };
            c_.question = this.questions[index].criteriaName;
            c_.criteria = this.questions[index].criteriaName;
            this.criterias[index] = { ...c_, value: value };
            this.emitCriterias();
        }
    }

    onOpened(input = ''): void {
        if ((this.questions?.length > 0 && !this.filteredQuestions) || this.filteredQuestions?.length === 0) {
            this.filterInput = input;
            this.filteredQuestions = this.questions;
        }
        if (!this.questions || this.questions?.length === 0) {
            this.getQuestionsByRespondentSection(this.section);
        }
    }

    get criteriaObject(): any {
        return {
            section: this.section.value,
            operation: EOperations.EQUAL,
            values: null,
        };
    }

    getArray() {
        return new Array(6);
    }
}
