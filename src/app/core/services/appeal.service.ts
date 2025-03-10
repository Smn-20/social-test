import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root',
})
export class AppealService {
    baseUrl = environment.baseurl + '/households/appeals';
    secondUrl = environment.baseurl + '/households/appeals';

    constructor(private http: HttpClient) {}

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof Error) {
            const errMessage = error.error.message;
            return throwError(() => errMessage);
            // return Observable.throw(err.text() || 'backend server error');
        }
        return throwError(() => error || 'Server error');
    }

    getAppeals(
        appealStatus: 'SUBMITTED' | 'APPROVED' | 'CANCELLED',
        search: string,
        page = 1,
        size = 10
    ): Observable<any> {
        const url = `${this.baseUrl}/search/all`;

        let headers = new HttpHeaders();
        headers = headers.set('appealStatus', `${appealStatus}`);
        headers = headers.set('search', `${search}`);

        let params = new HttpParams();

        params = params.append('page', page);
        params = params.append('size', size);

        const options = { params, headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    approveAppeal(appealId: string): Observable<any> {
        const url = `${this.secondUrl}/approve/${appealId}`;
        return this.http.put(url, {}).pipe(catchError(this.handleError));
    }

    cancelAppeal(appealId: string): Observable<any> {
        const url = `${this.secondUrl}/cancel/${appealId}`;

        return this.http.put(url, {}).pipe(catchError(this.handleError));
    }

    commentAppeal(appealId: string, comment: string): Observable<any> {
        const url = `${this.secondUrl}/comment/`;

        let headers = new HttpHeaders();

        headers = headers.set('appealId', appealId);
        headers = headers.set('comment', comment);

        return this.http.post(url, {}, { headers }).pipe(catchError(this.handleError));
    }
}
