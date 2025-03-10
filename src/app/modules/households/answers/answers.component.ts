import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EInterviewee, EPermission } from 'src/app/core/enums';

@Component({
    selector: 'app-answers',
    templateUrl: './answers.component.html',
    styleUrls: ['./answers.component.css'],
})
export class AnswersComponent implements OnInit {
    public EInterviewee = EInterviewee;
    public searchFormGroup!: FormGroup;
    public EPermission = EPermission;
    grouping: any[] = [];
    filteredAnswers: any[] = [];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<AnswersComponent>,
        private fb: FormBuilder
    ) {
        this.filteredAnswers = this.formatAnswers(data.answers);

        this.searchFormGroup = this.fb.group({
            query: [''],
            grouping: [null],
        });
    }

    ngOnInit(): void {
        this.householdAutoSearch();
    }

    formatAnswers(data: any): any[] {
        return Object.keys(data).map((el, i) => {
            return { no: i + 1, question: el, answer: data[el] };
        });
    }

    filterAnswersByQuery(input: string): void {
        if (input !== null && input !== '') {
            this.filteredAnswers = this.filteredAnswers.filter(
                ({ answer, question }: { answer: string; question: string }) =>
                    (answer || '').toString().toLowerCase().indexOf(input) > -1 ||
                    (question || '').toString().toLowerCase().indexOf(input) > -1
            );
        } else {
            this.filteredAnswers = this.formatAnswers(this.data.answers);
        }
    }

    filterAnswersByGroup(group: any): void {
        this.filteredAnswers = this.data.answers;
        if (group?.name !== 'All') {
            this.filteredAnswers = this.filteredAnswers.filter(
                (item) => item.grouping.toLowerCase() === group.name.toLowerCase()
            );
        } else {
            this.filteredAnswers = this.data.answers;
        }
    }

    householdAutoSearch(): void {
        this.searchFormGroup.get('query')?.valueChanges.pipe();

        this.searchFormGroup
            .get('query')
            ?.valueChanges.pipe()
            .subscribe((val) => {
                if (val !== '' || val !== null) {
                    this.filterAnswersByQuery(val);
                }
            });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
