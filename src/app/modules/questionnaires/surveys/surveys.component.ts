import { GlobalService } from 'src/app/core/services/global.service';
import { debounceTime } from 'rxjs';
import { HouseholdService } from 'src/app/core/services/household.service';
import { Paginate, formatMessage, initPaginate } from '../../../core/utils/reusable-functions';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EPermission, EState } from 'src/app/core/enums';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-surveys',
    templateUrl: './surveys.component.html',
    styleUrls: ['./surveys.component.css'],
})
export class SurveysComponent implements OnInit {
    surveys: any = [];
    totalsurveys = 0;
    loading = false;
    pagination: Paginate = initPaginate(1, 20);
    queryFormGroup!: FormGroup;
    surveyFormGroup!: FormGroup;
    isSearching = false;
    isSurveyDialogOpen = false;
    isSubmitting = false;
    selectedSurvey!: any;
    loadingAction!: string;
    public EState = EState;
    public EPermission = EPermission;

    snackBarMessages: string[] = ['fillAllRequiredFields']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        private householdService: HouseholdService,
        private fb: FormBuilder,
        private globalService: GlobalService,
        private translationService: TranslationService
    ) {
        this.queryFormGroup = this.fb.group({
            query: ['', [Validators.required]],
        });
        this.surveyFormGroup = this.fb.group({
            name: ['', [Validators.required]],
        });
    }

    ngOnInit() {
        this.getSurveys();
    }

    get formControls() {
        return this.surveyFormGroup.controls;
    }

    onSearch(): void {
        this.queryFormGroup.get('query')?.valueChanges.pipe();

        this.queryFormGroup
            .get('query')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                if (val !== '' || val !== null) {
                    this.isSearching = true;
                    this.getSurveys();
                }
            });
    }

    getSurveys(): void {
        this.loading = true;

        this.householdService.getAllSurveys(this.pagination).subscribe((res: any) => {
            this.loading = false;
            if (res.status) {
                this.totalsurveys = res.response.totalElements;
                this.pagination.page = res.response.number;
                this.surveys = res.response.content;
            }
        });
    }

    createSurvey(): void {
        if (this.surveyFormGroup.invalid) {
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                this.globalService.openFailureSnackBar(res);
            });
            return;
        }
        this.isSubmitting = true;
        if (this.selectedSurvey?.id) {
            this.householdService
                .updateSurvey(this.formControls['name'].value, this.selectedSurvey?.id)
                .subscribe((res) => {
                    this.processResponse(res);
                });
        } else {
            this.householdService.createSurvey(this.formControls['name'].value).subscribe((res) => {
                this.processResponse(res);
            });
        }
    }

    processResponse(res: any): void {
        this.isSubmitting = false;
        if (res.status) {
            this.getSurveys();
            this.isSurveyDialogOpen = false;
            this.globalService.openSuccessSnackBar(res.message);
            this.surveyFormGroup.controls['name'].setValue('');
            this.selectedSurvey = null;
        } else {
            this.globalService.openFailureSnackBar(res.message);
        }
    }

    onPageChange(event: any): void {
        this.pagination.page = event.pageIndex + 1;
        this.getSurveys();
    }

    receiveRefresh(event: any): void {
        window.location.reload();
    }

    openNewSurveyDialog(): void {
        this.isSurveyDialogOpen = !this.isSurveyDialogOpen;
    }

    toggleUpdateSurvey(evt: any): void {
        this.selectedSurvey = evt;
        this.surveyFormGroup.controls['name'].setValue(evt.name);
        this.openNewSurveyDialog();
    }

    toggleAction(action: string, evt: any): void {
        this.loadingAction = evt.id;
        this.householdService.actionSurvey(action, this.loadingAction).subscribe((res) => {
            this.loadingAction = '';
            if (res.status) {
                this.getSurveys();
                this.isSurveyDialogOpen = false;
                this.globalService.openSuccessSnackBar(res.message);
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }
}
