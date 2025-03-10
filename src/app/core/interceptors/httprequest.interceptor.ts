import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { EventService } from '../services/event.service';
import { TranslationService } from '../services/translation.service';

@Injectable()
export class HttprequestInterceptor implements HttpInterceptor {

    snackBarMessages: string [] = ['sessionExpiredLoggedOut', 'somethingWentWrongSeekAdmin']   // snackbar messages to be translated --> PLEASE do NOT modify the array values 

    constructor(
        private globalService: GlobalService,
        private authService: AuthService,
        private eventService: EventService,
        private translationService: TranslationService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((err) => {
                switch (err.status) {
                    case 401:
                    case 403:
                        console.error('401|403', err);
                        this.authService.logout();
                        this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe(res => {
                            this.globalService.openFailureSnackBar(res)
                        });
                        break;
                    default:
                        this.globalService.openFailureSnackBar(err?.message || err?.error?.message);
                        break;
                    case 0:
                    case 500:
                    case 501:
                    case 502:
                        this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe(res => {
                            this.globalService.openFailureSnackBar(res)
                        });
                        this.eventService.triggerStopLoaders(true);
                        break;
                }
                return throwError(() => new Error(err.error));
            })
        );
    }
}
