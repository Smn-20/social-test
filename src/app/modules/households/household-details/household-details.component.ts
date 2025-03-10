import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { EInterviewee, EMembershipType, EPermission, EState } from 'src/app/core/enums';
import { AuthService } from 'src/app/core/services/auth.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { EJurisdiction } from '../../../core/enums/jurisdiction.enum';
import { EventService } from '../../../core/services/event.service';
import { GlobalService } from '../../../core/services/global.service';
import { HouseholdService } from '../../../core/services/household.service';
import { AnswersComponent } from '../answers/answers.component';
import { CreateMemberComponent } from '../create-member/create-member.component';
import { HeadObject, HouseholdObject } from './../../shared/interfaces/household.d';
import { Router } from '@angular/router';

@Component({
    selector: 'app-household-details',
    templateUrl: './household-details.component.html',
    styleUrls: ['./household-details.component.css'],
})
export class HouseholdDetailsComponent implements OnInit {
    @Input() members: any[] = [];
    @Input() head!: HeadObject | null;
    @Input() appeals: any[] = [];
    @Input() household!: HouseholdObject;
    @Input() transfers: any[] = [];
    @Input() transferLoading = false;
    @Input() pagination: any;
    @Output() clickEvent = new EventEmitter<any>();
    householdAnswersLoading = false;
    memberAnswersLoading = -1;

    headphoto: any = null;

    tabSelector = 0;
    tabsHeaders: any[] = [];
    confirmAction = '';
    openQuesitionnaire = false;
    openConfirmModal = false;
    actionLoading = false;
    imageLoading = false;
    selectedLocation!: any;

    loggedInUser = JSON.parse(this.authService.getItem('user'));

    public EState = EState;
    public EPermission = EPermission;
    public EJurisdiction = EJurisdiction;
    public EInterviewee = EInterviewee;

    snackBarMessages: string[] = ['success', 'surveyAnswerNotFound', '']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        public dialog: MatDialog,
        private householdService: HouseholdService,
        private eventService: EventService,
        private globaService: GlobalService,
        private _sanitizer: DomSanitizer,
        private translationService: TranslationService,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        const { head } = this.household;
        if (head?.documentNumber) {
            this.fetchImage(head.documentNumber, EMembershipType.HEAD);
        }
        this.tabsHeaders = [
            {
                text: 'headMember', //this text is translated... do not touch it
                // text: 'Head member and household details',
            },
            {
                text: 'otherMembers', //this text is translated... do not touch it
                // text: 'Other members details',
                count: this.members.length,
            },
            {
                text: 'appeals', //this text is translated... do not touch it
                // text: 'Appeal requests',
                count: this.appeals.length,
            },
        ];
    }

    selectTab(i: number) {
        this.tabSelector = i;
    }

    toggleQuestionnaire() {
        this.openQuesitionnaire = !this.openQuesitionnaire;
    }

    action(event: string): void {
        this.openConfirmModal = !this.openConfirmModal;
        this.confirmAction = event;
    }

    triggerAction(): void {
        const { id } = this.household;
        this.actionLoading = true;
        this.householdService.householdAction(`${id}`, this.confirmAction).subscribe((res) => {
            if (res.status) {
                this.close();
                this.eventService.onActionFinished({ name: 'households' });
                this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                    this.globaService.openSuccessSnackBar(res);
                });
            } else {
                this.globaService.openSuccessSnackBar(res.message);
            }
        });
    }

    fetchHouseholdAnswers(): void {
        const {
            head: { id },
        } = this.household;
        this.householdAnswersLoading = true;
        this.householdService.getHouseholdAnswersByProfile(`${id}`).subscribe((res) => {
            this.householdAnswersLoading = false;
            if (res?.status) {
                this.openAnswerDialog(res.response.data, EInterviewee.HOUSEHOLD, id);
            } else {
                this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
                    this.globaService.openFailureSnackBar(res);
                });
                this.openAnswerDialog([], EInterviewee.HOUSEHOLD, id);
            }
        });
    }

    fetchHouseholdMemberAnswers(id: string, index: number): void {
        this.memberAnswersLoading = index;
        this.householdService.getHouseholdAnswersByProfile(`${id}`).subscribe((res) => {
            this.memberAnswersLoading = -1;
            if (res?.status) {
                this.openAnswerDialog(res.response.data, EInterviewee.PERSON, id);
            } else {
                this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
                    this.globaService.openFailureSnackBar(res);
                });
                this.openAnswerDialog([], EInterviewee.PERSON, id);
            }
        });
    }

    fetchImage(documentNumber: string, membershipType: EMembershipType): void {
        this.imageLoading = true;
        this.householdService.getUserPhoto(documentNumber, membershipType).subscribe((res) => {
            this.imageLoading = false;
            if (res?.status) {
                this.headphoto = this.getImage(res.response);
            }
        });
    }

    getImage(input: string): any {
        return this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + input);
    }

    close(): void {
        this.confirmAction = '';
        this.openConfirmModal = false;
        this.actionLoading = false;
    }

    openCreateMemberDialog(member: any, action: string): void {
        if (this.pagination) {
            this.dialog.open(CreateMemberComponent, {
                data: {
                    ...this.household,
                    ...{ member },
                    ...{ action },
                    ...{ pagination: { page: this.pagination.page + 1, size: this.pagination.size } },
                },
                width: '1024px',
            });
        }
    }

    openAnswerDialog(data: any, type: EInterviewee, id: string): void {
        this.dialog.open(AnswersComponent, {
            data: {
                id,
                type,
                answers: data,
            },
            width: '700px',
        });
    }

    onClickEvent(evt: 'create-member' | 'transfer-household'): void {
        this.clickEvent.emit(evt);
    }

    setLocation(evt: any): void {
        this.selectedLocation = evt;
    }

    emitUpdateDemographics(user: any): void {
        this.householdService.householdPayload.data = user;
        this.router.navigate(['/admin/questionnaires/basic-edit/' + EInterviewee.PERSON + '/' + user?.id]);
    }
}
