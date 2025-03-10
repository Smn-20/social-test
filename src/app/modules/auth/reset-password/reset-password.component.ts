import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TOKEN_NAME, USER } from 'src/app/constants';
import { AuthService } from 'src/app/core/services/auth.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { formatMessage } from 'src/app/core/utils/reusable-functions';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
    resetForm: FormGroup;
    username!: string | null;
    otp!: string | null;
    _d: any = {
        pwd: false,
        confirmPwd: false,
    };
    loading = false;

    pwdValidation = [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(30),
        Validators.pattern(
            /^(?=.{12,30})(?=.*[a-z].*[a-z])(?=.*[A-Z].*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9].*[^A-Za-z0-9]).*$/
        ),
    ];

    userText1 = '';
    userText2 = '';
    wholeText = '';

    snackBarMessages: string[] = ['goBackToLoginComponentText1', 'goBackToLoginComponentText2']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private globalService: GlobalService,
        private validationService: ValidationService,
        private translationService: TranslationService
    ) {
        this.resetForm = this.fb.group(
            {
                password: ['', this.pwdValidation],
                confirmPassword: ['', this.pwdValidation],
            },
            {
                validators: this.validationService.passwordMatch('password', 'confirmPassword'),
            }
        );
    }

    get formControls() {
        return this.resetForm.controls;
    }

    ngOnInit(): void {
        this.username = this.route.snapshot.paramMap.get('username');
        this.otp = this.route.snapshot.paramMap.get('otp');

        this.route.queryParams.subscribe((params: any) => {
            if (!params || Object.keys(params).length === 0) {
                this.router.navigate(['/login']);
            }

            this.username = params.username;
            this.otp = params.otp;
        });
        localStorage.removeItem(TOKEN_NAME);
        localStorage.removeItem(USER);

        this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
            this.userText1 = res;
        });
        this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
            this.userText2 = res;
        });
        this.wholeText = this.userText1 + ' ' + this.userText2;
    }

    togglePassword(key: string): void {
        this._d[key] = !this._d[key];
    }

    resetPassword(): void {
        if (!this.username && !this.otp) {
            return;
        }

        this.loading = true;
        const payload = {
            username: this.username,
            newPassword: this.formControls['password'].value,
            retypeNewPassword: this.formControls['confirmPassword'].value,
        };

        this.authService.resetPassword(this.username as string, this.otp as string, payload).subscribe((res: any) => {
            this.loading = false;
            if (res.status) {
                this.router.navigate(['/auth/go-back-to-login', { page: 'reset' }]);
                setTimeout(() => {
                    this.globalService.openSuccessSnackBar(this.wholeText);
                }, 2000);
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }
}
