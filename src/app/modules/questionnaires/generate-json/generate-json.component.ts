import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyCreatorModel } from 'survey-creator-core';
import { CreateQuestionnaireComponent } from '../create-questionnaire/create-questionnaire.component';
import { MatDialog } from '@angular/material/dialog';
import { EInterviewee } from 'src/app/core/enums';
import { HouseholdService } from 'src/app/core/services/household.service';
import { GlobalService } from 'src/app/core/services/global.service';

const creatorOptions = {
    showLogicTab: true,
    isAutoSave: true,
    haveCommercialLicense: true,
};

const defaultJson = {
    pages: [],
};

@Component({
    selector: 'app-generate-json',
    templateUrl: './generate-json.component.html',
    styleUrls: ['./generate-json.component.css'],
})
export class GenerateJsonComponent implements OnInit {
    surveyCreatorModel!: SurveyCreatorModel;
    openConfirmModal = false;
    selectedJSON!: any;
    isUpdate!: string;
    title!: string;
    respondentType!: EInterviewee;
    loading = false;

    constructor(
        private router: Router,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private householdService: HouseholdService,
        private globalService: GlobalService
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params: any) => {
            const ID: string = params.id;
            if (ID) {
                this.isUpdate = params.id;
                const creator = new SurveyCreatorModel(creatorOptions);
                const creator_ = localStorage.getItem(ID);
                const payload_ = JSON.parse(creator_ as string);

                creator.text = payload_.jsonObject;
                this.title = payload_.title;
                this.respondentType = payload_.respondentType;

                this.selectedJSON = creator.JSON;
                creator.saveSurveyFunc = (saveNo: number, callback: any) => {
                    window.localStorage.setItem('survey-json', creator.text);
                    this.saveSurveyJson(creator.JSON);
                };
                this.surveyCreatorModel = creator;
            } else {
                const creator = new SurveyCreatorModel(creatorOptions);
                creator.text = window.localStorage.getItem('survey-json') || JSON.stringify(defaultJson);
                this.selectedJSON = creator.JSON;
                creator.saveSurveyFunc = (saveNo: number, callback: any) => {
                    window.localStorage.setItem('survey-json', creator.text);
                    this.saveSurveyJson(creator.JSON);
                };
                this.surveyCreatorModel = creator;
            }
        });
    }

    saveSurveyJson(json: any): void {
        this.selectedJSON = json;
    }

    generateJSON(): void {
        this.openConfirmModal = !this.openConfirmModal;
    }

    cancel(): void {
        this.close();
        this.router.navigate(['/admin/questionnaires/qs']);
    }

    saveJSON(): void {
        const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.selectedJSON, null, 2));
        const downloader = document.createElement('a');

        downloader.setAttribute('href', data);
        downloader.setAttribute('download', `survey_${new Date().toISOString()}.json`);
        downloader.click();
    }

    toggleNewQuestionnaireModal(): void {
        this.dialog.open(CreateQuestionnaireComponent, {
            data: this.selectedJSON,
            width: '576px',
        });
        this.close();
    }

    updateQuestionnaire(): void {
        this.loading = true;
        this.householdService
            .updateQuestionnaire(this.respondentType, this.isUpdate, this.selectedJSON)
            .subscribe((res) => {
                if (res.status) {
                    this.globalService.openSuccessSnackBar(res?.message);
                    this.router.navigate(['/admin/questionnaires/qs']);
                } else {
                    this.globalService.openFailureSnackBar(res?.message);
                }
            });
    }

    close(): void {
        this.openConfirmModal = false;
    }
}
