import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { USER } from '../../constants';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { GlobalService } from '../../core/services/global.service';
import { ValidationService } from '../../core/services/validation.service';
import { ResponseObject } from '../../core/utils/reusable-functions';
import { HouseholdService } from '../../core/services/household.service';
import { EJurisdiction } from '../../core/enums';
import { UserService } from '../../core/services/user.service';
import { TranslationService } from '../../core/services/translation.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
    user: any;
    updateForm: FormGroup;
    userLocation: any;
    noLocation = true;
    fetchedUser: any;
    profilePhoto: any;
    loading = false;
    openEditForm = false;
    updating = false;
    genders: Record<string, string> = {
        M: 'Male',
        F: 'Female',
    };
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    public EJurisdiction = EJurisdiction;

    snackBarMessages: string[] = [
        'passwordUpdatedSuccess',
        'fillAllRequiredFields',
        'emailUpdatedSuccess',
        'infoUpdatedSuccess',
    ]; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private globalService: GlobalService,
        private dataService: DataService,
        private _sanitizer: DomSanitizer,
        private householdService: HouseholdService,
        private userService: UserService,
        private translationService: TranslationService
    ) {

        this.updateForm = this.fb.group({
            email: ['', [Validators.required]],
            phoneNumber: ['', [Validators.required]],
        });
    }


    ngOnInit(): void {
        this.user = JSON.parse(localStorage.getItem(USER) as string);
        this.getUserLocation();
        this.getUserInfo();
    }

    getUserInfo() {
        if (this.user.nationalId) {
            this.dataService.getExternalRecord(this.loggedInUser.nationalId).subscribe((res: any) => {
                if (res.status) {
                    this.fetchedUser = res.response;
                    if (this.fetchedUser?.photo) {
                        this.profilePhoto = this._sanitizer.bypassSecurityTrustResourceUrl(
                            'data:image/jpg;base64,' + this.fetchedUser?.photo
                        );
                    }
                }
            });
        }

        this.userService.getUserById(this.loggedInUser.principalId).subscribe((res: any) => {
            if (res.status) {
                const user = res.response;
                this.user = user;
                this.updateForm.controls['email']?.setValue(this.user.email);
                this.updateForm.controls['phoneNumber']?.setValue(this.user.phoneNumber);
            }
        });
    }

    getUserLocation(): void {
        this.householdService
            .getJuridictionLocation(this.user.jurisdiction, this.user.locationId)
            .subscribe((res: ResponseObject<any>) => {
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

    logout(): void {
        this.authService.logout();
    }

    updateUser(): void {
        if (this.updateForm.invalid && this.user && this.fetchedUser) {
            this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
                this.globalService.openFailureSnackBar(res);
            });
            return;
        }

        this.updating = true;
        delete this.user.email;
        delete this.user.phoneNumber;
        const userData = {
            ...this.user,
            photo: this.user.picture || this.fetchedUser.photo,
            phoneNumber: this.updateForm.controls['phoneNumber'].value,
            email: this.updateForm.controls['email'].value,
        };

        this.userService.updateUser(userData).subscribe((res: any) => {
            this.updating = false;
            if (res?.status) {
                if (userData?.email !== this.loggedInUser.email) {
                    this.translationService.getInstantTranslations(this.snackBarMessages[2]).subscribe((res) => {
                        this.globalService.openSuccessSnackBar(res);
                    });
                    this.authService.logout();
                } else {
                    this.translationService.getInstantTranslations(this.snackBarMessages[3]).subscribe((res) => {
                        this.globalService.openSuccessSnackBar(res);
                    });
                    this.toggleEditForm();
                    this.getUserInfo();
                }
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    toggleEditForm(): void {
        this.openEditForm = !this.openEditForm;
    }

    getImage(input: string): any {
        return this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + input);
    }
}
