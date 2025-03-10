import { AuthService } from '../../../core/services/auth.service';
import { interviewees } from '../../../core/utils/reusable-arrays';
import { EventService } from 'src/app/core/services/event.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { GlobalService } from '../../../core/services/global.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { initPaginate } from 'src/app/core/utils/reusable-functions';
import { Router } from '@angular/router';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-create-questionnaire',
    templateUrl: './create-questionnaire.component.html',
    styleUrls: ['./create-questionnaire.component.css'],
})
export class CreateQuestionnaireComponent implements OnInit {
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    loading = false;
    loadingArray = new Array(6);
    questionnaireForm!: FormGroup;
    jsonToUpload!: any;
    questionnaireTypes: any[] = [];
    surveys: any[] = [];
    isSubmitting = false;

    snackBarMessages: string[] = ['fillAllRequiredFields', 'uploadQuestionnaireJSONfile']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<CreateQuestionnaireComponent>,
        public fb: FormBuilder,
        private globalService: GlobalService,
        private householdService: HouseholdService,
        private authService: AuthService,
        private eventService: EventService,
        public dialog: MatDialog,
        private router: Router,
        private translationService: TranslationService
    ) {
        this.initTranslatable();
        this.questionnaireForm = this.fb.group({
            survey: [null, Validators.required],
            intervieweeType: [null, Validators.required],
        });
    }

    get formControls() {
        return this.questionnaireForm.controls;
    }

    ngOnInit(): void {
        if (Object.keys(this.data)?.length > 0) {
            this.jsonToUpload = this.data;
        }
        this.getSurveys();
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.questionnaireTypes = this.translationService.translateArray(interviewees, res.interviewees);
        });
    }

    getSurveys(): void {
        this.householdService.getAllSurveys(initPaginate(1, 10000)).subscribe((res: any) => {
            if (res.status) {
                this.surveys = res.response.content;
            }
        });
    }

    createQuestionnaire(): void {
        if (this.questionnaireForm.invalid) {
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                this.globalService.openFailureSnackBar(res);
            });
            return;
        }
        if (!this.jsonToUpload) {
            this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
                this.globalService.openFailureSnackBar(res);
            });
            return;
        }

        this.isSubmitting = true;
        this.householdService
            .createQuestionnaire(
                this.formControls['intervieweeType'].value,
                this.formControls['survey'].value,
                this.jsonToUpload
            )
            .subscribe((res) => {
                this.isSubmitting = false;
                if (res.status) {
                    this.close();
                    this.jsonToUpload = undefined;
                    this.globalService.openSuccessSnackBar(res?.message);
                    this.router.navigate(['/admin/questionnaires/qs']);
                } else {
                    this.globalService.openFailureSnackBar(res?.message);
                }
            });
    }

    uploadJSON(evt: any): void {
        const file = evt.target.files[0];
        if (file) {
            const fileReader = new FileReader();
            fileReader?.readAsText(evt.target.files[0]);
            fileReader.onload = async (e: any) => {
                this.jsonToUpload = JSON.parse(e.target.result);
            };
        }
    }

    toggleNewQuestionnaireModal(): void {
        this.dialog.open(CreateQuestionnaireComponent, {
            data: {},
            width: '576px',
        });
    }

    close(): void {
        this.dialogRef.close();
    }
}
