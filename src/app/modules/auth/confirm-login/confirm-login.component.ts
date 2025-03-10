import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TOKEN_NAME, USER } from 'src/app/constants';
import { AuthService } from 'src/app/core/services/auth.service';
import { DataService } from 'src/app/core/services/data.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { navigation } from 'src/app/core/utils/reusable-arrays';
import { EJurisdiction, EPermission } from 'src/app/core/enums';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-confirm-login',
    templateUrl: './confirm-login.component.html',
    styleUrls: ['./confirm-login.component.css'],
})
export class ConfirmLoginComponent implements OnInit {
    otpForm: UntypedFormGroup = {} as UntypedFormGroup;
    previousState: any;
    loading = false;
    loginTextFailure = '';
    loginTextSuccess = '';
    qrCodeImage: string | null = null;

    snackBarMessages: string[] = ['invalidOTP', 'validOTP']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        private fb: UntypedFormBuilder,
        private location: Location,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar,
        private global: GlobalService,
        private dataService: DataService,
        private translationService: TranslationService
    ) {
        this.previousState = this.location.getState();

        this.otpForm = this.fb.group({
            otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
        });
    }

    ngOnInit(): void {
        localStorage.removeItem(TOKEN_NAME);
        localStorage.removeItem(USER);
        this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
            this.loginTextFailure = res;
        });
        this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
            this.loginTextSuccess = res;
        });
        this.getQrCodeImageURL();
    }

    getQrCodeImageURL() {
        if (this.previousState?.qrCodeUrl)
            this.qrCodeImage = 'data:image/png;base64,' + this.previousState?.qrCodeUrl;
    }

    openLink(url: string) {
        window.open(url, '_blank');
    }

    loginOtp({ value }: { value: any }): void {
        this.loading = true;

        const payload = {
            ...this.previousState.value,
            otp: value.otp,
        };

        this.authService.loginOTP(payload).subscribe((res: any) => {
            this.loading = false;
            if (res.status) {
                this.openSuccessSnackBar();
                this.authService.setItem(TOKEN_NAME, res?.response.token);

                const user: Partial<IResponse> = {
                    id: res?.response.id,
                    email: res?.response.email,
                    jurisdiction: res?.response.jurisdiction,
                    locationId: res?.response.locationId,
                    roles: res?.response.roles,
                    username: res?.response.username,
                    permissions: res?.response?.permissions,
                    principalId: res?.response?.id,
                    nationalId: res?.response?.nationalId,
                    firstName: res?.response?.firstName,
                    lastName: res?.response?.lastName,
                    picture: res?.response?.picture,
                };

                this.authService.setItem(USER, JSON.stringify(user));
                this.authService.resetTimer();
                const perms = this.authService.getUserPermissions() as any[];

                for (let i = 0; i < navigation.length; i++) {
                    const foundPermissions = perms.filter((permission) =>
                        navigation[i].permissions?.includes(permission)
                    );
                    if (foundPermissions.length > 0) {
                        const firstUrl = navigation.find((nav) => nav.permissions?.includes(foundPermissions[0]));
                        if (firstUrl) {
                            this.router.navigateByUrl(firstUrl?.link ? firstUrl?.link : firstUrl?.children[0].link);
                            if (!user?.picture) {
                                this.getUserInfo(user);
                            }
                            break;
                        }
                    }
                }
            } else {
                // this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                //     this.global.openFailureSnackBar(res);
                // });
                this.global.openFailureSnackBar(res.message);
            }
        });
    }

    getUserInfo(user: any) {
        if (user?.nationalId) {
            this.dataService.getExternalRecord(user?.nationalId).subscribe((res: any) => {
                if (res.status) {
                    if (res.response?.photo) {
                        user.picture = res.response?.photo;
                        this.authService.setItem(USER, JSON.stringify(user));
                    }
                }
            });
        }
    }

    openSuccessSnackBar() {
        this.snackBar.open(this.loginTextSuccess, 'OK', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 3000,
            panelClass: ['green-snackbar', 'login-snackbar'],
        });
    }

    openFailureSnackBar() {
        this.snackBar.open(this.loginTextFailure, 'Try again!', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 3000,
            panelClass: ['red-snackbar', 'login-snackbar'],
        });
    }
}

interface IResponse {
    email: string;
    id: string;
    jurisdiction: EJurisdiction;
    locationId: string;
    roles: string[];
    token: string;
    type: string;
    username: string;
    permissions: EPermission[];
    principalId: string;
    nationalId: string;
    firstName: string;
    lastName: string;
    picture: string;
}
