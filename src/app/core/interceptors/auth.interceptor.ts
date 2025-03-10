import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TOKEN_NAME } from 'src/app/constants';
import { TranslationService } from '../services/translation.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private translationService: TranslationService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem(TOKEN_NAME);
        if (token) {
            request = request.clone({
                setHeaders: {
                    'Content-Type': 'application/json; charset=utf-8',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                    'accept-Language': this.translationService.getCurrentLanguage() || 'rw',
                },
            });
        }

        return next.handle(request);
    }
}
