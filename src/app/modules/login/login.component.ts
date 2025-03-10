import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { langulages } from 'src/app/core/utils/reusable-arrays';
import { USER } from '../../constants';
import { AuthService, TOKEN_NAME } from '../../core/services/auth.service';
import { GlobalService } from '../../core/services/global.service';
import { TranslationService } from '../../core/services/translation.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
    @ViewChild('languageDropdown') languageDropdown!: ElementRef;
    loginForm: UntypedFormGroup = {} as UntypedFormGroup;
    showPassword = false;
    loading = false;
    languages: any[] = [];
    languageDropdownIsOpen = false;
    currentYear: any;
    countryLanguage = '';

    constructor(
        private fb: UntypedFormBuilder,
        private router: Router,
        public authService: AuthService,
        private globalService: GlobalService,
        public translationService: TranslationService,
        private renderer: Renderer2
    ) {
        this.initTranslatable();
        this.loginForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });

        this.renderer.listen('window', 'click', (e: Event) => {
            if (!this.languageDropdown?.nativeElement.contains(e.target) && this.languageDropdownIsOpen) {
                this.languageDropdownIsOpen = false;
            }
        });
    }

    ngOnInit(): void {
        localStorage.removeItem(TOKEN_NAME);
        localStorage.removeItem(USER);
        this.currentYear = new Date().getFullYear();
        this.switchFlags();
    }

    get formControls() {
        return this.loginForm.controls;
    }

    get getCurrentLanguage(): string | null {
        return this.translationService.getCurrentLanguage();
    }

    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    login({ value }: { value: IUserLogin }): void {
        this.loading = true;
        this.authService.login(value).subscribe((res: any) => {
            this.loading = false;
            if (res.status) {
                const state = { value, ...res?.response };
                if (state?.expired) {
                  this.router.navigate(['/auth/change-password'], { state });
                } else {
                  this.router.navigate(['/auth/confirm-login'], { state });
                }
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            // const { navTargeting, navAccessControl, navQuestionnaires, navAppeals, navRequests } = res;
            this.languages = this.translationService.translateArray(langulages, res.languages);
        });
    }

    toggleLanguage(value: 'en' | 'fr' | 'rw'): void {
        this.translationService.setSelectedLanguage(value);
        this.toggleLanguageDropdown();
        window.location.reload();
    }

    get selectedLanguage(): string {
        return (
            this.languages?.find((el) => el.value === this.translationService?.getCurrentLanguage())?.name ||
            this.languages[0]?.name
        );
    }

    toggleLanguageDropdown(): void {
        this.languageDropdownIsOpen = !this.languageDropdownIsOpen;
    }

    switchFlags() {
        const currentFlag = localStorage.getItem('i18n') as string;
        this.countryLanguage = currentFlag;
    }
}

interface IUserLogin {
    username: string;
    password: string;
}
