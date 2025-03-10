import { GlobalService } from 'src/app/core/services/global.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TOKEN_NAME, USER } from 'src/app/constants';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-confirm-account',
    templateUrl: './confirm-account.component.html',
    styleUrls: ['./confirm-account.component.css'],
})
export class ConfirmAccountComponent implements OnInit {
    loading = false;
    accountActivated = false;

    snackBarMessages: string[] = ['accountActivationSuccessful']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        private authService: AuthService,
        private globalService: GlobalService,
        private route: ActivatedRoute,
        private router: Router,
        private translationService: TranslationService
    ) {}

    ngOnInit(): void {
        localStorage.removeItem(TOKEN_NAME);
        localStorage.removeItem(USER);
        this.route.queryParams.subscribe((params: any) => {
            if (!params?.id) {
                this.router.navigate(['/login']);
            } else {
                this.confirmAccount(params.id);
            }
        });
    }

    confirmAccount(id: string): void {
        this.loading = true;
        this.authService.confirmAccount(id).subscribe((res: any) => {
            this.loading = false;
            this.accountActivated = true;
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                this.globalService.openSuccessSnackBar(res);
            });
        });
    }
}
