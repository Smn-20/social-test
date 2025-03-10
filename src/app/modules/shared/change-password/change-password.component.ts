import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './../../../core/services/auth.service';
import { GlobalService } from './../../../core/services/global.service';
import { TranslationService } from './../../../core/services/translation.service';
import { ValidationService } from './../../../core/services/validation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent  {
  @Input() username!: string;
  @Input() isLoggedin = false;
  loading = false;
  changePwdForm: FormGroup;
  pwdValidation = [
      Validators.required,
      Validators.minLength(12),
      Validators.maxLength(30),
      Validators.pattern(
          /^(?=.{12,30})(?=.*[a-z].*[a-z])(?=.*[A-Z].*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9].*[^A-Za-z0-9]).*$/
      ),
  ];
  showPassword = false;
  _d: any = {
      oldPwd: false,
      pwd: false,
      confirmPwd: false,
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private validationService: ValidationService,
    private globalService: GlobalService,
    private translationService: TranslationService
    ) {
    this.changePwdForm = this.fb.group(
      {
          oldPassword: ['', [Validators.required]],
          newPassword: [
              '',
              [
                  Validators.required,
                  Validators.minLength(12),
                  Validators.maxLength(30),
                  Validators.pattern(
                      /^(?=.{12,30})(?=.*[a-z].*[a-z])(?=.*[A-Z].*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9].*[^A-Za-z0-9]).*$/
                  ),
              ],
          ],
          retypeNewPassword: [
              '',
              [
                  Validators.required,
                  Validators.minLength(12),
                  Validators.maxLength(30),
                  Validators.pattern(
                      /^(?=.{12,30})(?=.*[a-z].*[a-z])(?=.*[A-Z].*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9].*[^A-Za-z0-9]).*$/
                  ),
              ],
          ],
      },
      { validators: this.validationService.passwordMatch('newPassword', 'retypeNewPassword') }
  );
  }

  get formControls() {
    return this.changePwdForm.controls;
  }


  togglePassword(key: string): void {
    this._d[key] = !this._d[key];
  }

  changePassword(): void {
      this.loading = true;

      const payload = {
          username: this.username,
          ...this.changePwdForm.value,
      };

      this.authService.changePassword(payload).subscribe((res: any) => {
          if (res.status) {
              this.translationService.getInstantTranslations('passwordUpdatedSuccess').subscribe((res) => {
                  this.globalService.openSuccessSnackBar(res);
              });
              if (this.isLoggedin) {
                 this.authService.logout();
              } else {
                this.router.navigate(['/auth/go-back-to-login']);
              }
          } else {
              this.globalService.openFailureSnackBar(res.message);
          }
      });
  }

}
