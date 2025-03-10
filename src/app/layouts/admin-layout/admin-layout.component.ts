import { Component, OnInit } from '@angular/core';
import { EPermission } from 'src/app/core/enums';
import { AuthService } from 'src/app/core/services/auth.service';
import { EventService } from 'src/app/core/services/event.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { StateService } from 'src/app/core/services/state.service';
import { ResponseObject } from 'src/app/core/utils/reusable-functions';

@Component({
    selector: 'app-admin-layout',
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent implements OnInit {
    sideBarOpen = false;
    sidebarOpenMobile = false;
    loggedInUser = JSON?.parse(this.authService.getItem('user')) || null;

    constructor(
        private stateService: StateService,
        private authService: AuthService,
        private householdService: HouseholdService,
        private eventService: EventService
    ) {}

    ngOnInit(): void {
        this.initGlobalState();
        this.getRequestCounts();
        this.getTranslationCounts();
        this.eventService.actionFinished.subscribe((res) => {
            if (res) {
                this.getRequestCounts();
                this.getTranslationCounts();
            }
        });
    }

    initGlobalState(): void {
        this.stateService.state$.subscribe((state) => {
            this.sideBarOpen = state.sideBarOpen;
            this.sidebarOpenMobile = state.sidebarOpenMobile;
        });
    }

    getTranslationCounts(): void {
        if (this.authService.checkAccess([EPermission.CREATE_QUESTIONNAIRE])) {
            this.householdService
                .getPendingTranslations(this.loggedInUser?.jurisdiction, this.loggedInUser?.locationId)
                .subscribe((res: ResponseObject<any>) => {
                    if (res.status) {
                        this.stateService.setState('translationCounts', res.response);
                    }
                });
        }
    }

    getRequestCounts(): void {
        if (this.authService.checkAccess([EPermission.TRANSFER_HOUSE_HOLD])) {
            this.householdService
                .getPendingTransfers(this.loggedInUser?.jurisdiction, this.loggedInUser?.locationId)
                .subscribe((res: ResponseObject<any>) => {
                    if (res.status) {
                        this.stateService.setState('transferCounts', res.response);
                    }
                });
        }

        if (this.authService.checkAccess([EPermission.DISABLE_HOUSE_HOLD])) {
            this.householdService
                .getPendingArchives(this.loggedInUser?.jurisdiction, this.loggedInUser?.locationId)
                .subscribe((res: ResponseObject<any>) => {
                    if (res.status) {
                        this.stateService.setState('archiveCounts', res.response);
                    }
                });
        }

        if (this.authService.checkAccess([EPermission.VIEW_APPEAL, EPermission.UPDATE_APPEAL])) {
            this.householdService
                .getAppealsCountByStatus('SUBMITTED', this.loggedInUser?.jurisdiction, this.loggedInUser?.locationId)
                .subscribe((res: ResponseObject<any>) => {
                    if (res.status) {
                        this.stateService.setState('appealsCounts', res.response);
                    }
                });
        }
    }
}
