import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginModule } from './modules/login/login.module';
import { SharedModule } from './modules/shared/shared.module';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AllowNumberDirective } from './core/directives/allow-number.directive';
import { AuthService } from './core/services/auth.service';
import { InstitutionService } from './core/services/institution.service';

import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [AppComponent, AdminLayoutComponent, AuthLayoutComponent, AllowNumberDirective],
    imports: [
        BrowserModule,
        AppRoutingModule,
        LoginModule,
        SharedModule,
        CoreModule,
        MatSnackBarModule,
        MatDialogModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
    ],
    providers: [
        AuthService,
        {
            provide: MatDialogRef,
            useValue: {},
        },
        InstitutionService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
