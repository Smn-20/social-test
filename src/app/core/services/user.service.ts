import { initPaginate } from './../utils/reusable-functions';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { EJurisdiction } from 'src/app/core/enums';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    baseUrl = environment.baseurl + '/users';

    constructor(private http: HttpClient) {}

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof Error) {
            const errMessage = error.error.message;
            return throwError(() => errMessage);
            // return Observable.throw(err.text() || 'backend server error');
        }
        return throwError(() => error || 'Server error');
    }

    getUsers(page: number, size: number): Observable<any> {
        const url = this.baseUrl;
        let params = new HttpParams();

        params = params.append('page', page);
        params = params.append('size', size);
        return this.http.get(url, { params }).pipe(catchError(this.handleError));
    }

    searchUser(query: string, page = 1, size = 10): Observable<any> {
        const url = this.baseUrl + '/search-user';
        let params = new HttpParams();

        params = params.append('page', page);
        params = params.append('size', size);

        let headers = new HttpHeaders();
        headers = headers.append('query', query);

        const options = { params, headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    createUser(user: any): Observable<any> {
        const url = this.baseUrl + '/save-user';
        return this.http.post(url, user).pipe(catchError(this.handleError));
    }

    getUserById(id: string): Observable<any> {
        const url = this.baseUrl + '/user/by-id';
        return this.http
            .get(url, {
                headers: new HttpHeaders({ id }),
            })
            .pipe(catchError(this.handleError));
    }

    updateUser(user: any): Observable<any> {
        const url = this.baseUrl + '/user';
        return this.http.put(url, user).pipe(catchError(this.handleError));
    }

    transferUser(user: any): Observable<any> {
        const url = this.baseUrl + '/transfer';
        return this.http.put(url, user).pipe(catchError(this.handleError));
    }

    activateUser(id: string): Observable<any> {
        const url = this.baseUrl + '/user/enable';
        return this.http
            .put(
                url,
                {},
                {
                    headers: new HttpHeaders({ id }),
                }
            )
            .pipe(catchError(this.handleError));
    }

    deactivateUser(id: string): Observable<any> {
        const url = this.baseUrl + '/user/disable';
        return this.http
            .put(
                url,
                {},
                {
                    headers: new HttpHeaders({ id }),
                }
            )
            .pipe(catchError(this.handleError));
    }

    deleteUser(id: string): Observable<any> {
        const url = this.baseUrl + '/user/delete';
        return this.http
            .put(
                url,
                {},
                {
                    headers: new HttpHeaders({ id }),
                }
            )
            .pipe(catchError(this.handleError));
    }

    filterUser(
        jurisdiction: EJurisdiction,
        locationId: string,
        role: string,
        status: string,
        query: string,
        pagination = initPaginate()
    ): Observable<any> {
        const url = this.baseUrl + '/filter-user';

        let params = new HttpParams();
        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        let headers = new HttpHeaders();
        headers = headers.append('jurisdiction', jurisdiction);
        headers = headers.append('locationId', locationId);
        headers = headers.append('roleId', role);
        headers = headers.append('status', status);
        headers = headers.append('query', query);

        return this.http.get(url, { params, headers }).pipe(catchError(this.handleError));
    }

    unlockUser(userId: any): Observable<any> {
        const url = this.baseUrl + '/user/unlock';

        let headers = new HttpHeaders();
        headers = headers.append('id', userId);
        return this.http.put(url, {}, { headers }).pipe(catchError(this.handleError));
    }
}
