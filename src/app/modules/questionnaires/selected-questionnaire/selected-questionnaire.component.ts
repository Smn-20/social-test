import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from 'src/app/core/services/event.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { Paginate, initPaginate } from '../../../core/utils/reusable-functions';
import { EInterviewee } from 'src/app/core/enums';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-selected-questionnaire',
    templateUrl: './selected-questionnaire.component.html',
    styleUrls: ['./selected-questionnaire.component.css'],
})
export class SelectedQuestionnaireComponent implements OnInit {
    openQuestionDetails = false;
    selectedRowIndex = -1;
    questions: any = [];
    selectedQuestionnaire!: any;
    totalQuestions = 0;
    loading = false;
    questionnaireLoading = false;
    pagination: Paginate = initPaginate(1, 10);
    questionnaireId = '';
    editableAnswers: { key: string; edit: boolean; index: number; value: string }[] = [];
    updatting = false;
    triggering = false;
    cashedQuestionnaire!: any;
    sections!: any[];
    selectedRespondentType!: EInterviewee;
    selectedSection!: string;
    questionsLoading = false;
    isDiplayValueEditing = false;
    updatedCriteriaValue = '';

    snackBarMessages: string[] = ['questionCoeffUpdateSuccess', 'questionCoeffUpdateFailure']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        public householdService: HouseholdService,
        private eventService: EventService,
        private route: ActivatedRoute,
        private globalService: GlobalService,
        private translationService: TranslationService
    ) {
        // this.initTranslatable()
    }

    ngOnInit() {
        this.route.params.subscribe((params: any) => {
            this.questionnaireId = params?.id;
            this.getQuestionnaireByID();
        });
        this.eventListening();
    }

    get openEditQuestionnaireForm(): boolean {
        return this.editableAnswers.some((el) => el.edit);
    }

    toggleQuestionDetails(index: number, data: any) {
        this.editableAnswers = [];
        if (!this.openQuestionDetails) {
            this.selectedRowIndex = index;
            this.openQuestionDetails = true;
        } else if (this.openQuestionDetails && this.selectedRowIndex !== index) {
            this.selectedRowIndex = index;
        } else {
            this.openQuestionDetails = false;
        }

        if (data.answers?.length > 0 && this.editableAnswers?.length === 0) {
            data.answers?.forEach((el: any) => {
                this.editableAnswers.push({ key: el?.id, edit: false, index, value: el?.coefficient });
            });
        } else {
            this.editableAnswers = [];
        }
    }

    getQuestionsByRespondent(evt: string): void {
        this.householdService.getAllRespondentQuestions(evt).subscribe((res: any) => {
            if (res.status) {
                this.sections = res.response
                    .filter((e: any) => e !== null)
                    .map((el: any) => {
                        return { name: el.value, value: el.key };
                    });
            }
        });
    }

    getQuestionsByRespondentSection(evt: any): void {
        this.loading = true;
        this.selectedSection = evt;
        this.householdService
            .getAllRespondentQuestionsBySection(this.selectedRespondentType, evt.value)
            .subscribe((res: any) => {
                this.loading = false;
                if (res.status) {
                    this.questions = res.response;
                }
            });
    }

    getQuestionnaireByID(): void {
        this.questionnaireLoading = true;
        this.householdService.getQuestionnaireByID(this.questionnaireId).subscribe((res: any) => {
            this.questionnaireLoading = false;
            if (res.status) {
                this.selectedQuestionnaire = res.response;
                this.selectedRespondentType = this.selectedQuestionnaire?.respondentType;
                this.getQuestionsByRespondent(this.selectedQuestionnaire?.respondentType);
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    receiveRefresh(event: any): void {
        window.location.reload();
        this.getQuestionsByRespondentSection(this.selectedSection);
    }

    eventListening(): void {
        this.eventService.actionFinished.subscribe((evt) => {
            if (evt) {
                this.selectedRowIndex = -1;
                this.getQuestionsByRespondentSection(this.selectedSection);
            }
        });
    }

    toggleEditQuestionnaireForm(index: number, data?: any) {
        this.editableAnswers[index].edit = !this.editableAnswers[index]?.edit;
        if (!this.editableAnswers[index]?.edit) {
            this.editableAnswers[index].value = data.coefficient;
        }
    }

    updateCoefficient(question?: any): void {
        this.updatting = true;
        const request = this.editableAnswers.map((el: any) => {
            return {
                answerId: el.key,
                score: parseFloat(el.value),
                multiplyCoefficient: true,
            };
        });

        if (this.updatedCriteriaValue) {
            this.householdService
                .updateQuestionDisplayValues(question.id, this.updatedCriteriaValue)
                .subscribe((res) => {
                    this.processRes(res);
                });
        }
        if (request?.length > 0) {
            this.householdService.coefficientBulkQuestionnaireAnswerUPdate(request).subscribe((res) => {
                this.processRes(res);
            });
        }
    }

    processRes(res: any): void {
        this.updatting = false;
        if (res) {
            if (this.updatedCriteriaValue) {
                this.globalService.openSuccessSnackBar(res.message);
                this.updatedCriteriaValue = '';
            } else {
                this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                    this.globalService.openSuccessSnackBar(res);
                });
                this.editableAnswers = [];
            }

            this.getQuestionsByRespondentSection(this.selectedSection);
            this.openQuestionDetails = false;
            this.selectedRowIndex = -1;
        } else {
            if (this.updatedCriteriaValue) {
                this.globalService.openFailureSnackBar(res.message);
            } else {
                this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
                    this.globalService.openFailureSnackBar(res);
                });
            }
        }
    }

    triggerScore(): void {
        this.triggering = true;
        this.householdService.triggerScoring().subscribe((res) => {
            this.triggering = false;
            if (res?.status) {
                this.globalService.openSuccessSnackBar(res.message);
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    onValueChange(evt: any, index: number): void {
        this.editableAnswers[index].value = evt.target.value;
    }

    receiveAction(evt: any): void {
        if (evt?.action === 'trigger-score') {
            this.triggerScore();
        }
    }

    saveActiveQuestionnaire(type: string, data: any): void {
        localStorage.setItem(type, data);
    }

    toggleIsDiplayValueEditing(): void {
        this.isDiplayValueEditing = !this.isDiplayValueEditing;
    }

    onDisplayValueChange(evt: string): void {
        this.updatedCriteriaValue = evt;
    }
}
