import { Response } from 'express';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { AppealService } from 'src/app/core/services/appeal.service';
import { EventService } from 'src/app/core/services/event.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { EInterviewee, EJurisdiction, EPermission } from 'src/app/core/enums';
import { ResponseObject } from '../../../core/utils/reusable-functions';
import { AnswersComponent } from '../../households/answers/answers.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-appeal-details',
    templateUrl: './appeal-details.component.html',
    styleUrls: ['./appeal-details.component.css'],
})
export class AppealDetailsComponent implements OnInit {
    @Input() shouldHaveActions = false;
    @Input() appeal: any;
    loading = false;
    rejecting = false;
    householdLoading = false;
    locationLoading = false;
    openConfirmModal = false;
    openCommentModal = false;
    commentForm: FormGroup;
    household!: any;
    location!: any;
    confirmAction = '';
    tabsHeaders: any[] = [];
    members: any[] = [];
    tabSelector = 0;
    memberAnswersLoading = -1;
    householdAnswersLoading = false;
    public EPermission = EPermission;

    constructor(
        private appealService: AppealService,
        private householdService: HouseholdService,
        private globalService: GlobalService,
        private _sanitizer: DomSanitizer,
        private eventService: EventService,
        private globaService: GlobalService,
        public dialog: MatDialog,
        private formBuilder: FormBuilder
    ) {
        this.commentForm = this.formBuilder.group({
            comment: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.getHousehold(this.appeal?.documentNumber);
        this.getHouseholdMembers(this.appeal.householdId);
        this.tabsHeaders = [
            {
                text: 'appealDetails',
            },
            {
                text: 'householdMebers',
                count: 0,
            },
        ];
    }

    getHouseholdMembers(householdId: string): void {
        this.householdService.getHouseholdMembers(householdId).subscribe((res: ResponseObject<any>) => {
            if (res?.status) {
                if (Array.isArray(res.response?.members)) {
                    this.members = res.response?.members;
                } else {
                    this.members = res.response?.members;
                }
            }
        });
    }

    approveAppeal(id: string) {
        this.loading = true;
        this.appealService.approveAppeal(id).subscribe((res) => {
            this.loading = false;
            if (res.status) {
                this.eventService.onActionFinished('appeals');
                this.globalService.openSuccessSnackBar('Appeal approved');
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    cancelAppeal(id: string) {
        this.rejecting = true;
        this.appealService.cancelAppeal(id).subscribe((res) => {
            this.rejecting = false;
            if (res.status) {
                this.eventService.onActionFinished('appeals');
                this.globalService.openSuccessSnackBar('Appeal cancelled');
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    getHousehold(documentNumber: string) {
        this.householdLoading = true;
        this.locationLoading = true;
        this.householdService.getHouseholdByDocumentNumber(documentNumber).subscribe((res) => {
            this.householdLoading = false;
            if (res.status) {
                this.household = res.response;
                this.getJuridictionLocation(this.household?.villageId);
            } else {
                this.locationLoading = false;
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    getJuridictionLocation(locationId: string): void {
        this.householdService
            .getJuridictionLocation(EJurisdiction.VILLAGE, locationId)
            .subscribe((res: ResponseObject<any>) => {
                this.locationLoading = false;
                if (res.status) {
                    const { province, district, sector, cell, villages } = res.response;
                    this.location = {
                        cellName: cell?.name,
                        districtName: district?.name,
                        provinceName: province?.name,
                        sectorName: sector?.name,
                        villageName: villages?.name,
                    };
                }
            });
    }

    getImage(input: string): any {
        return this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + input);
    }

    action(event: string): void {
        this.openConfirmModal = !this.openConfirmModal;
        this.confirmAction = event;
    }

    openComment(): void {
        this.openCommentModal = !this.openCommentModal;
    }

    close(): void {
        this.openConfirmModal = false;
        this.loading = false;
        this.rejecting = false;
    }

    closeComment(): void {
        this.openCommentModal = false;
        this.loading = false;
    }

    triggerAction() {
        if (this.confirmAction === 'approve') {
            this.approveAppeal(this.appeal.id);
        } else {
            this.cancelAppeal(this.appeal.id);
        }
    }

    fetchHouseholdMemberAnswers(id: string, index: number): void {
        this.memberAnswersLoading = index;
        this.householdService.getHouseholdAnswersByProfile(`${id}`).subscribe((res) => {
            this.memberAnswersLoading = -1;
            if (res?.status) {
                this.openAnswerDialog(res.response.data, EInterviewee.PERSON);
            } else {
                this.globaService.openFailureSnackBar('Survey answers not found');
            }
        });
    }

    fetchHouseholdAnswers(): void {
        this.householdAnswersLoading = true;
        this.householdService.getHouseholdAnswersByProfile(`${this.household?.householdHead?.id}`).subscribe((res) => {
            this.householdAnswersLoading = false;
            if (res?.status) {
                this.openAnswerDialog(res.response.data, EInterviewee.HOUSEHOLD);
            } else {
                this.globaService.openFailureSnackBar('Survey answers not found');
            }
        });
    }

    openAnswerDialog(data: any, type: EInterviewee): void {
        this.dialog.open(AnswersComponent, {
            data: {
                answers: data,
                type,
            },
            width: '700px',
        });
    }

    selectTab(i: number) {
        this.tabSelector = i;
    }

    addComment() {
        if (this.commentForm.invalid) {
            this.globalService.openFailureSnackBar('Write the comment');
            return;
        }
        this.loading = true;
        const comment = this.commentForm.get('comment')?.value;
        this.appealService.commentAppeal(this.appeal.id, comment).subscribe((res: any) => {
            this.loading = false;
            if (res.status) {
                setTimeout(() => {
                    this.globaService.openSuccessSnackBar('Comment sent successfully!');
                    this.eventService.onActionFinished('appeals');
                    this.closeComment();
                }, 1);
            } else {
                this.globaService.openSuccessSnackBar(res.message);
            }
        });
    }
}
