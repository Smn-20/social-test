import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, throwError, catchError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Paginate, initPaginate } from '../utils/reusable-functions';

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {

  baseUrl = environment.baseurl
  allInstitutionsUrl = this.baseUrl + '/households/institutions'

  constructor(private http: HttpClient, private dialog: MatDialog) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof Error) {
        const errMessage = error.error.message;
        return throwError(() => errMessage);
    }
    return throwError(() => error || 'Server error');
}

filterInstittutions() {
    return this.http.get(this.allInstitutionsUrl)
  }

  getInstitutions(query: string, pagination = initPaginate(1, 20)): Observable<any> {
    const url = this.allInstitutionsUrl + '/all';

    let headers = new HttpHeaders();
    headers = headers.set('pageNumber', `${pagination.page}`);
    headers = headers.set('pageSize', `${pagination.size}`);
    headers = headers.set('query', `${query}`);

    return this.http.get(url, { headers }).pipe(catchError(this.handleError));
}

  createInstitution(institutionData: any):Observable<any> {
    const data = institutionData
    return this.http.post(this.allInstitutionsUrl+'/create', data)
  }

  updateInstitution(id:string , updatedData: any) {
    return this.http.put(`${this.allInstitutionsUrl}/${id}`, updatedData)
  }

  disableInstitution(id:string): Observable<any> {
    const url = `${this.allInstitutionsUrl}/${id}/disable`;
    return this.http.put(url, {})
}

enableInstitution(id:string): Observable<any> {
  const url = `${this.allInstitutionsUrl}/${id}/enable`;
  return this.http.put(url, {})
}



}
