import { Response } from 'express';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { USER } from 'src/app/constants';
import { DataService } from 'src/app/core/services/data.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { UserService } from 'src/app/core/services/user.service';
import { EJurisdiction, EPermission, EState } from 'src/app/core/enums';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-view-user-details',
    templateUrl: './view-user-details.component.html',
    styleUrls: ['./view-user-details.component.css'],
})
export class ViewUserDetailsComponent implements OnInit {
    openEditForm = false;
    isDisabling = false;
    isDeleting = false;
    unlocking = false;
    openDisableConfirmModal = false;
    openDeleteConfirmModal = false;
    openUnlockConfirmModal = false;
    isFetchingUser = false;
    fetchedUser: any;
    fetchedStatus: any;
    userLocation: any;
    userLocationLoading = false;
    public EJurisdiction = EJurisdiction;
    public EPermission = EPermission;

    snackBarMessages: string[] = ['userDisabledSuccess', 'userEnabledSuccess', 'userDeletedSuccess']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    @Input() user: any;
    @Output() shouldRefresh = new EventEmitter<any>(false);

    constructor(
        private userService: UserService,
        private dataService: DataService,
        private globalService: GlobalService,
        private translateService: TranslationService
    ) {}

    get EState() {
        return EState;
    }

    get loggedInUserEmail(): string {
        const user = JSON.parse(localStorage.getItem(USER) as string);
        return user ? user.username : '';
    }

    ngOnInit(): void {
        this.getUserInfo();
        this.getUser();
        this.getUserLocation();
    }

    toggleEditForm() {
        this.openEditForm = !this.openEditForm;
    }

    toggleDisableConfirmModal() {
        this.openDisableConfirmModal = !this.openDisableConfirmModal;
    }

    toggleDeleteConfirmModal() {
        this.openDeleteConfirmModal = !this.openDeleteConfirmModal;
    }

    toggleUnlockConfirmModal() {
        this.openUnlockConfirmModal = !this.openUnlockConfirmModal;
    }

    getUser() {
        this.isFetchingUser = true;
        this.userService.getUserById(this.user.id).subscribe((res) => {
            this.isFetchingUser = false;
            this.user = res.response;
            this.getUserLocation();
        });
    }

    getUserInfo() {
        this.isFetchingUser = true;
        this.dataService.getExternalRecord(this.user.nationalId).subscribe((res: any) => {
            this.isFetchingUser = false;
            this.fetchedUser = {};
            this.fetchedStatus = res.status;
            if (res.response !== null) {
                this.fetchedUser = res.response;
            }
        });
    }

    getUserLocation() {
        this.isFetchingUser = true;
        this.dataService.getParentLocation(this.user.locationId, this.user.jurisdiction).subscribe((res: any) => {
            this.isFetchingUser = false;
            if (res.status) {
                const { province, district, sector, cell, villages } = res.response;
                this.userLocation = {
                    cellName: cell?.name,
                    districtName: district?.name,
                    provinceName: province?.name,
                    sectorName: sector?.name,
                    villageName: villages?.name,
                };
            }
        });
    }
    unlockUser() {
        this.unlocking = true;
        this.userService.unlockUser(this.user.id).subscribe((res) => {
            this.unlocking = false;
            if (res.status) {
                this.globalService.openSuccessSnackBar(res.message);
                this.toggleUnlockConfirmModal();
                this.getUser();
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    disableUser() {
        this.isDisabling = true;
        this.userService.deactivateUser(this.user.id).subscribe((res) => {
            if (res.status) {
                this.isDisabling = false;
                this.translateService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                    this.globalService.openSuccessSnackBar(res);
                });
                this.openDisableConfirmModal = false;
                this.getUser();
            } else {
                this.isDisabling = false;
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    enableUser() {
        this.isDisabling = true;
        this.userService.activateUser(this.user.id).subscribe((res) => {
            if (res.status) {
                this.isDisabling = false;
                this.translateService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
                    this.globalService.openSuccessSnackBar(res);
                });
                this.getUser();
            } else {
                this.isDisabling = false;
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    deleteUser() {
        this.isDeleting = true;
        this.userService.deleteUser(this.user.id).subscribe((res) => {
            if (res.status) {
                this.isDeleting = false;
                this.translateService.getInstantTranslations(this.snackBarMessages[2]).subscribe((res) => {
                    this.globalService.openSuccessSnackBar(res);
                });
                this.openDeleteConfirmModal = false;
                this.getUser();
            } else {
                this.isDeleting = false;
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    receiveRefresh(event: any) {
        if (event) {
            this.getUser();
            this.openEditForm = false;
        }
    }
}
