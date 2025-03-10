import { EPermission } from '../enums/permission.enum';
import { environment } from './../../../environments/environment';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { USER } from 'src/app/constants';

export const TOKEN_NAME = 'access_token';

@Injectable()
export class AuthService {
    baseUrl = environment.baseurl + '/users/auth';
    private lastActivityTime!: number;
    private inactivityTimerId: any;
    public inactivityMessage = '';
    private readonly INACTIVITY_TIMEOUT = 900000; // 15 minutes in milliseconds

    constructor(private http: HttpClient, private router: Router) {
    }

    login(user: IUserLogin): Observable<any> {
        const url = this.baseUrl + '/login';
        return this.http.post(url, user).pipe(catchError(this.handleError));
    }

    loginOTP(req: IUserLogin): Observable<any> {
        const url = this.baseUrl + '/login-otp';
        return this.http.post(url, req).pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof Error) {
            const errMessage = error.error.message;
            return throwError(() => errMessage);
            // return Observable.throw(err.text() || 'backend server error');
        }
        return throwError(() => error || 'Server error');
    }

    isLoggedIn(): boolean {
        const token = this.getItem(TOKEN_NAME);
        return token ? true : false;
    }

    getItem(key: string): string {
        const value = localStorage.getItem(key);
        if (value !== null) {
            return value;
        }

        return '';
    }

    setItem(key: string, value: any): void {
        localStorage.setItem(key, value);
    }

    logout(): void {
        localStorage.removeItem(TOKEN_NAME);
        localStorage.removeItem(USER);
        this.router.navigate(['/auth/login']);
    }

    changePassword(payload: any): Observable<any> {
        const url = this.baseUrl + '/change-password';
        return this.http.post(url, payload);
    }

    forgotPassword(username: string): Observable<any> {
        const url = this.baseUrl + '/request-reset-password';
        return this.http.post(url, null, {
            headers: new HttpHeaders({ username }),
        });
    }

    resetPassword(username: string, otp: string, payload: any): Observable<any> {
        const url = this.baseUrl + '/reset-password';
        let params = new HttpParams();

        params = params.append('username', username);
        params = params.append('otp', otp);

        return this.http.post(url, payload, { params });
    }

    confirmAccount(id: string): Observable<any> {
        const url = this.baseUrl + '/confirm-account';
        let params = new HttpParams();

        params = params.append('id', id);

        return this.http.put(url, {}, { params });
    }

    getUserPermissions(): EPermission[] {
        const user = JSON.parse(localStorage.getItem(USER) as string);
        return user?.permissions;
    }

    checkAccess(permissions: any[]): boolean {
        const perms = this.getUserPermissions();
        return permissions.some((p) => perms?.includes(p));
    }

    resetTimer() {
      if (this.inactivityTimerId) {
          clearInterval(this.inactivityTimerId); // Clear the previous interval
      }
      this.inactivityMessage = '';
      this.lastActivityTime = Date.now();
      this.checkInactivity(); // Restart the inactivity check
  }

  checkInactivity() {
      this.inactivityTimerId = setInterval(() => {
          const currentTime = Date.now();
          const elapsedTime = currentTime - this.lastActivityTime;
          if (elapsedTime > this.INACTIVITY_TIMEOUT) {
              this.logout();
              clearInterval(this.inactivityTimerId); // Clear the timer once logged out
              this.inactivityMessage = 'inactivityMessage';
          }
      }, 10000); // Check every 10 seconds
  }

}

interface IUserLogin {
    username: string;
    password: string;
}
