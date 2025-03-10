import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthLayoutComponent } from '../../layouts/auth-layout/auth-layout.component';

const routes: Routes = [
    {
        path: 'auth/login',
        component: AuthLayoutComponent,
        children: [
            {
                path: '',
                component: LoginComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LoginRoutingModule {
    static components = [LoginComponent];
}
