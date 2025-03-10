import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EnsureModuleLoadedOnceGuard } from './ensure-module-loaded-once.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';
import { DataService } from './services/data.service';
import { LoadingService } from './services/loading.service';
import { UserService } from './services/user.service';
import { GlobalService } from './services/global.service';
import { ValidationService } from './services/validation.service';
import { HttprequestInterceptor } from './interceptors/httprequest.interceptor';
import { TranslateModule } from '@ngx-translate/core';

const modules = [RouterModule, HttpClientModule, TranslateModule];

@NgModule({
    declarations: [],
    imports: [CommonModule, modules],
    exports: [modules],
    providers: [
        AuthService,
        LoadingService,
        DataService,
        UserService,
        GlobalService,
        ValidationService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttprequestInterceptor,
            multi: true,
        },
    ],
})
export class CoreModule extends EnsureModuleLoadedOnceGuard {
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        super(parentModule);
    }
}
