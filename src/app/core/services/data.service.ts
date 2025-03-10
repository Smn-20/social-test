import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { EJurisdiction } from 'src/app/core/enums';
import { Paginate, initPaginate } from '../utils/reusable-functions';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    commonUrl = environment.baseurl
    private locUrl = environment.hshUrl + '/households/locations';
    baseUrl = environment.baseurl + '/users/roles-permissions';
    private reportUrl = environment.baseurl + '/reporting/';
    // translationUrl = environment.baseurl + '/households/translation/all/pending'

    constructor(private http: HttpClient) {}

    getProvinces(): Observable<any> {
        const url = this.locUrl + '/provinces';
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getDistrictsByProvinceId(id: string): Observable<any> {
        const url = this.locUrl + `/districts/province/${id}`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getSectorsByDistrictId(id: string): Observable<any> {
        const url = this.locUrl + `/sectors/district/${id}`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getCellsBySectorId(id: string): Observable<any> {
        const url = this.locUrl + `/cells/sector/${id}`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getVillagesByCellId(id: string): Observable<any> {
        const url = this.locUrl + `/villages/cell/${id}`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getParentLocation(locationId: string, jurisdiction: EJurisdiction): Observable<any> {
        const url = this.locUrl + '/jurisdiction/location/' + locationId + '/jurisdiction/' + jurisdiction;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getExternalRecord(identificationNumber: string): Observable<any> {
        const url = environment.nidaUrl;
        return this.http
            .get(url, {
                headers: new HttpHeaders({ identificationNumber }),
            })
            .pipe(catchError(this.handleError));
    }

    getPermissions(pagination: Paginate = initPaginate()): Observable<any> {
        const url = this.baseUrl + '/permissions';
        let params = new HttpParams();

        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        return this.http.get(url, { params }).pipe(catchError(this.handleError));
    }

    getTranslations(query: string, pagination: Paginate = initPaginate()): Observable<any> {
        const url = environment.baseurl + '/households/translation/search';
        let headers = new HttpHeaders();
        let params = new HttpParams();

        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        headers = headers.append('query', query);
        headers = headers.append('pageNumber', `${pagination.page}`);
        headers = headers.append('pageSize', `${pagination.size}`);
        // headers = headers.append('status', status);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    getPendingTranslationStatus(status: any, pagination: Paginate = initPaginate()): Observable<any> {
        const url = this.commonUrl + '/households/translation/all/pending';

        let headers = new HttpHeaders();
        // headers = headers.append('status', status);
        headers = headers.append('pageNumber', `${pagination.page}`);
        headers = headers.append('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    getFinishedTranslationStatus( pagination: Paginate = initPaginate()): Observable<any> {
        const url = this.commonUrl + '/households/translation/all';

        let params = new HttpParams();

        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        let headers = new HttpHeaders();
        // headers = headers.append('status', status);
        headers = headers.append('pageNumber', `${pagination.page}`);
        headers = headers.append('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    getInstitutions(query: string, pagination: Paginate = initPaginate()): Observable<any> {
        const url = environment.baseurl + '/households/institutions/search';
        let headers = new HttpHeaders();

        headers = headers.append('query', query);
        headers = headers.append('pageNumber', `${pagination.page}`);
        headers = headers.append('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    getAllInstitutions(query: string, pagination: Paginate = initPaginate()): Observable<any> {
        const url = environment.baseurl + '/households/institutions/search';
        let headers = new HttpHeaders();

        headers = headers.append('query', query);
        headers = headers.append('pageNumber', `${pagination.page}`);
        headers = headers.append('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    getRoles(pagination: Paginate = initPaginate()): Observable<any> {
        const url = this.baseUrl + '/roles-active';
        let params = new HttpParams();

        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        return this.http.get(url, { params }).pipe(catchError(this.handleError));
    }

    getRolesStatus(status: string, pagination: Paginate = initPaginate()): Observable<any> {
        const url = this.baseUrl + '/roles-status';
        let params = new HttpParams();

        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        let headers = new HttpHeaders();
        headers = headers.append('status', status);

        return this.http.get(url, { params, headers }).pipe(catchError(this.handleError));
    }

    createRole(role: any): Observable<any> {
        const url = this.baseUrl + '/role';
        return this.http.post(url, role).pipe(catchError(this.handleError));
    }

    getRoleById(id: string): Observable<any> {
        const url = this.baseUrl + '/role/by-id';
        return this.http
            .get(url, {
                headers: new HttpHeaders({ id }),
            })
            .pipe(catchError(this.handleError));
    }

    updateRole(role: any): Observable<any> {
        const url = this.baseUrl + '/role';
        return this.http.put(url, role).pipe(catchError(this.handleError));
    }

    updateTranslation(translation: any): Observable<any> {
        const url = environment.baseurl + '/households/translation/update';
        return this.http.put(url, translation).pipe(catchError(this.handleError));
    }

    activateRole(id: string): Observable<any> {
        const url = this.baseUrl + '/role/enable';
        const options = { headers: new HttpHeaders({ id }) };
        return this.http.put(url, {}, options).pipe(catchError(this.handleError));
    }

    deactivateRole(id: string): Observable<any> {
        const url = this.baseUrl + '/role/disable';
        const options = { headers: new HttpHeaders({ id }) };
        return this.http.put(url, {}, options).pipe(catchError(this.handleError));
    }

    deleteRole(id: string): Observable<any> {
        const url = this.baseUrl + '/role/delete';
        const options = { headers: new HttpHeaders({ id }) };
        return this.http.put(url, {}, options).pipe(catchError(this.handleError));
    }

    searchRole(query: string, page = 1, size = 10): Observable<any> {
        const url = this.baseUrl + '/search-role';
        let params = new HttpParams();

        params = params.append('page', page);
        params = params.append('size', size);

        let headers = new HttpHeaders();
        headers = headers.append('query', query);

        const options = { params, headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    searchPermission(query: string, page = 1, size = 10): Observable<any> {
        const url = this.baseUrl + '/search-permission';
        let params = new HttpParams();

        params = params.append('page', page);
        params = params.append('size', size);

        let headers = new HttpHeaders();
        headers = headers.append('query', query);

        const options = { params, headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof Error) {
            const errMessage = error.error.message;
            return throwError(() => errMessage);
            // return Observable.throw(err.text() || 'backend server error');
        }
        return throwError(() => error || 'Server error');
    }

    downloadHouseholdsWithFullAnswers(jurisdiction: string, locationId: string): Observable<any> {
        const url = this.reportUrl + `download/${jurisdiction}/${locationId}`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    downloadTargeting(jurisdiction: string, locationId: string, programId: string): Observable<any> {
        const url =
            this.reportUrl + `download/program/${programId}/jurisdiction/${jurisdiction}/location/${locationId}`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    downloadHouseholdsInCutoff(jurisdiction: string, locationId: string, cutOffId: string): Observable<any> {
        const url = this.reportUrl + `download/cutoff/households/${cutOffId}/${jurisdiction}/${locationId}`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }
}
