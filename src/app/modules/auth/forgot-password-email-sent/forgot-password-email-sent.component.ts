import { Component, OnInit } from '@angular/core';
import { TOKEN_NAME, USER } from 'src/app/constants';

@Component({
    selector: 'app-forgot-password-email-sent',
    templateUrl: './forgot-password-email-sent.component.html',
    styleUrls: ['./forgot-password-email-sent.component.css'],
})
export class ForgotPasswordEmailSentComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {
        localStorage.removeItem(TOKEN_NAME);
        localStorage.removeItem(USER);
    }
}
