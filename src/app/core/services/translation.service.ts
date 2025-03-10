import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TranslationService {
    constructor(private translate: TranslateService) {}

    getCurrentLanguage(): string | null {
        return localStorage.getItem(I18N);
    }

    setSelectedLanguage(value: 'en' | 'fr' | 'rw'): void {
        localStorage.setItem(I18N, value);
        this.translate.use(value);
    }

    loadLanguage(): void {
        this.translate.setDefaultLang(this.getCurrentLanguage() || 'rw');
        this.translate.use(this.getCurrentLanguage() || 'rw');
    }

    // ? get instant translations
    getInstantTranslations(key: string): Observable<any> {
        return this.translate.get(key);
    }

    //? get translated arrays
    translateArray(arr: any[], array: string[]): any[] {
        return arr.map((obj: any, i: number) => {
            return { ...obj, name: array[i] };
        });
    }

    //? get translated arrays
    translateDashaboardArray(arr: any[], array: string[]): any[] {
      console.log('translateDashaboardArray', arr, array)
      return arr.map((obj: any, i: number) => {
        if (obj.split('(')?.length > 1) {
          const found = obj.split('(')[0].slice(0, -1).toLowerCase();
          console.log('found', found);
          return array.find(el => el.toLowerCase() === found);
        } else {
          return array[i]
        }
      });
    }
}

export const I18N = 'i18n';
export const EN = 'en';
export const FR = 'fr';
export const RW = 'rw';
