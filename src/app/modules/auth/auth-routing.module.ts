import { ConfirmAccountComponent } from './confirm-account/confirm-account.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoggedinGuard } from '../../core/guards/loggedin.guard';
import { ConfirmLoginComponent } from './confirm-login/confirm-login.component';
import { ForgotPasswordEmailSentComponent } from './forgot-password-email-sent/forgot-password-email-sent.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { GoBackToLoginComponent } from './go-back-to-login/go-back-to-login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChangePwdComponent } from './change-pwd/change-pwd.component';

const routes: Routes = [
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        canActivate: [LoggedinGuard],
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent,
        canActivate: [LoggedinGuard],
    },
    {
        path: 'activate-account',
        component: ResetPasswordComponent,
        canActivate: [LoggedinGuard],
    },
    {
        path: 'confirm-login',
        component: ConfirmLoginComponent,
        canActivate: [LoggedinGuard],
    },
    {
        path: 'forgot-password-email-sent',
        component: ForgotPasswordEmailSentComponent,
        canActivate: [LoggedinGuard],
    },
    {
        path: 'go-back-to-login',
        component: GoBackToLoginComponent,
        canActivate: [LoggedinGuard],
    },
    {
        path: 'confirm-account',
        component: ConfirmAccountComponent,
        canActivate: [LoggedinGuard],
    },
    {
      path: 'change-password',
      component: ChangePwdComponent,
      canActivate: [LoggedinGuard],
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AuthRoutingModule {
    static components = [
        ForgotPasswordComponent,
        ResetPasswordComponent,
        ConfirmLoginComponent,
        ForgotPasswordEmailSentComponent,
        GoBackToLoginComponent,
        ConfirmAccountComponent,
        ChangePwdComponent
    ];
}
