import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { EventService } from 'src/app/core/services/event.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { interviewees } from 'src/app/core/utils/reusable-arrays';
import { Paginate, compareByStatus, formatMessage, initPaginate } from 'src/app/core/utils/reusable-functions';
import { EAction, EPermission, EState } from 'src/app/core/enums';
import { CreateQuestionnaireComponent } from '../create-questionnaire/create-questionnaire.component';
import { ResponseObject } from '../../../core/utils/reusable-functions';
import { EInterviewee } from '../../../core/enums/interviewee-type.enum';

@Component({
    selector: 'app-library',
    templateUrl: './library.component.html',
    styleUrls: ['./library.component.css'],
})
export class LibraryComponent implements OnInit {
    questionnaires: any[] = [];
    pagination: Paginate = initPaginate(1, 20);
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    loading = false;
    loadingArray = new Array(6);
    jsonToUpload!: any;
    questionnaireTypes = interviewees;
    isSubmitting = false;
    isUpdatting = false;

    public EInterviewee = EInterviewee;
    public EState = EState;
    public EPermission = EPermission;

    constructor(
        public dialog: MatDialog,
        private householdService: HouseholdService,
        private eventService: EventService,
        private authService: AuthService,
        private globalService: GlobalService,
        private fb: FormBuilder,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.getActiveQuestionnaires();
    }

    getActiveQuestionnaires(): void {
        this.loading = true;
        this.householdService.getAllActiveQuestionnaires(this.pagination).subscribe((res: ResponseObject<any>) => {
            this.loading = false;
            if (res.status) {
                this.questionnaires = res.response?.content?.filter(
                    ({ respondentType }: { respondentType: EInterviewee }) => respondentType !== null
                );
                this.questionnaires.sort(compareByStatus);
            } else {
                this.questionnaires = [];
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    toBlob = (evt: any): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result as string);
            };
        });

    onActionEvent({ action, event }: { action: EAction; event: any }): void {
        switch (action) {
            case EAction.ENABLE:
                this.isUpdatting = true;
                this.householdService.enableQuestionnaire(event.id).subscribe((res) => {
                    this.resProcessing(res);
                });
                break;

            case EAction.ARCHIVE:
                this.isUpdatting = true;
                this.householdService.archiveQuestionnaire(event.id).subscribe((res) => {
                    this.resProcessing(res);
                });
                break;

            case EAction.EDIT:
                this.router.navigate(['/admin/questionnaires/update/json/' + event.id]);
                break;
        }
    }

    toggleNewQuestionnaireModal(): void {
        this.dialog.open(CreateQuestionnaireComponent, {
            data: {},
            width: '576px',
        });
    }

    resProcessing(res: any): void {
        this.isUpdatting = false;
        if (res.status) {
            this.globalService.openSuccessSnackBar(res?.message);
            this.getActiveQuestionnaires();
        } else {
            this.globalService.openFailureSnackBar(res?.message);
        }
    }
}
