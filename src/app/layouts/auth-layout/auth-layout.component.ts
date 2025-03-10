import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { TranslationService } from 'src/app/core/services/translation.service';
import { langulages } from 'src/app/core/utils/reusable-arrays';

@Component({
    selector: 'app-auth-layout',
    templateUrl: './auth-layout.component.html',
    styleUrls: ['./auth-layout.component.css'],
})
export class AuthLayoutComponent implements OnInit {
    @ViewChild('languageDropdown') languageDropdown!: ElementRef;
    languages: any[] = [];
    languageDropdownIsOpen = false;
    currentYear: any;
    countryLanguage = '';
    languageFlag: any
    constructor(private renderer: Renderer2, public translationService: TranslationService) {
        this.initTranslatable();
        this.renderer.listen('window', 'click', (e: Event) => {
            if (!this.languageDropdown?.nativeElement.contains(e.target) && this.languageDropdownIsOpen) {
                this.languageDropdownIsOpen = false;
            }
        });
    }
    ngOnInit(): void {
        this.currentYear = new Date().getFullYear();
        this.languageFlag = this.translationService.getCurrentLanguage();
    }

    get getCurrentLanguage(): string | null {
        return this.translationService.getCurrentLanguage();
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
}
