import { USER } from 'src/app/constants';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { StateService } from 'src/app/core/services/state.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { EActionType } from '../../../core/enums/action.enum';
import { langulages } from 'src/app/core/utils/reusable-arrays';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
    @ViewChild('username') username!: ElementRef;
    @ViewChild('profileDropdown') profileDropdown!: ElementRef;
    @ViewChild('languageDropdown') languageDropdown!: ElementRef;
    sideBarOpen = false;
    sidebarOpenMobile = false;
    languageDropdownIsOpen = false;
    mobileUserMenu = false;
    languages: any[] = [];
    userNavigation = [
        {
            name: 'Your Profile',
            action: EActionType.PROFILE,
            route: '/admin/profile',
        },
        {
            name: 'Sign Out',
            action: EActionType.LOG_OUT,
        },
    ];
    constructor(
        public translationService: TranslationService,
        private stateService: StateService,
        private _sanitizer: DomSanitizer,
        private router: Router,
        private authService: AuthService,
        private renderer: Renderer2
    ) {
        this.initTranslatable();

        this.renderer.listen('window', 'click', (e: Event) => {
            this.authService.resetTimer();
            if (!this.profileDropdown?.nativeElement.contains(e.target) && this.mobileUserMenu) {
                this.mobileUserMenu = false;
            }

            if (!this.languageDropdown?.nativeElement.contains(e.target) && this.languageDropdownIsOpen) {
                this.languageDropdownIsOpen = false;
            }
        });
    }

    get user() {
        const user = JSON.parse(localStorage.getItem(USER) as string);
        return user;
    }

    get role() {
        const role = this.user?.roles[0];
        if (role) {
            return role.split('_').join(' ');
        }
    }

    get selectedLanguage(): string {
        return (
            this.languages?.find((el) => el.value === this.translationService?.getCurrentLanguage())?.name ||
            this.languages[0]?.name
        );
    }

    get getCurrentLanguage(): string | null {
        return this.translationService.getCurrentLanguage();
    }

    ngOnInit() {
        this.initGlobalState();
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.languages = this.translationService.translateArray(langulages, res.languages);
            this.userNavigation = this.translationService.translateArray(this.userNavigation, res.userNavigation);
        });
    }

    initGlobalState(): void {
        this.stateService.state$.subscribe((state) => {
            this.sideBarOpen = state.sideBarOpen;
            this.sidebarOpenMobile = state.sidebarOpenMobile;
        });
    }

    toggleSidebar(): void {
        this.stateService.setState('sidebarOpenMobile', !this.sidebarOpenMobile);
    }

    toggleLanguageDropdown(): void {
        this.languageDropdownIsOpen = !this.languageDropdownIsOpen;
    }

    toggleLanguage(value: 'en' | 'fr' | 'rw'): void {
        this.translationService.setSelectedLanguage(value);
        this.toggleLanguageDropdown();
        window.location.reload();
    }

    toggleUserMenu(): void {
        this.mobileUserMenu = !this.mobileUserMenu;
    }

    getImage(input: string): any {
        return this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + input);
    }

    handleAction(action: EActionType): void {
        switch (action) {
            case EActionType.PROFILE:
                this.router.navigateByUrl('/admin/profile');
                this.toggleUserMenu();
                break;
            case EActionType.LOG_OUT:
                this.logout();
                break;
        }
    }

    logout(): void {
        this.authService.logout();
    }
}
