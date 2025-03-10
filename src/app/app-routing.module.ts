import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

const routes: Routes = [
    {
        path: 'auth',
        component: AuthLayoutComponent,
        loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule),
    },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        children: [
            {
                path: 'dashboard',
                loadChildren: () => import('./modules/dashboard/dashboard.module').then((m) => m.DashboardModule),
                canActivate: [AuthGuard],
            },
            {
                path: 'households',
                loadChildren: () => import('./modules/households/households.module').then((m) => m.HouseholdsModule),
                canActivate: [AuthGuard],
            },
            {
                path: 'targeting',
                loadChildren: () => import('./modules/targeting/targeting.module').then((m) => m.TargetingModule),
                canActivate: [AuthGuard],
            },
            // {
            //     path: 'revamped-targeting',
            //     loadChildren: () => import('./modules/revamped-targeting/revamped-targeting.module').then((m) => m.RevampedTargetingModule),
            //     canActivate: [AuthGuard],
            // },
            {
                path: 'users',
                loadChildren: () => import('./modules/users/users.module').then((m) => m.UsersModule),
                canActivate: [AuthGuard],
            },
            {
                path: 'roles',
                loadChildren: () => import('./modules/roles/roles.module').then((m) => m.RolesModule),
                canActivate: [AuthGuard],
            },
            {
                path: 'permissions',
                loadChildren: () => import('./modules/permissions/permissions.module').then((m) => m.PermissionsModule),
                canActivate: [AuthGuard],
            },
            {
                path: 'questionnaires',
                loadChildren: () =>
                    import('./modules/questionnaires/questionnaires.module').then((m) => m.QuestionnairesModule),
                canActivate: [AuthGuard],
            },
            {
                path: 'profile',
                loadChildren: () => import('./modules/profile/profile.module').then((m) => m.ProfileModule),
                canActivate: [AuthGuard],
            },
            {
                path: 'appeals',
                loadChildren: () => import('./modules/appeals/appeals.module').then((m) => m.AppealsModule),
                canActivate: [AuthGuard],
            },
            {
                path: 'requests',
                loadChildren: () => import('./modules/requests/requests.module').then((m) => m.RequestsModule),
                canActivate: [AuthGuard],
            },
            {
                path: 'translations',
                loadChildren: () =>
                    import('./modules/translations/translations.module').then((m) => m.TranslationsModule),
                canActivate: [AuthGuard],
            },
            {
                path: 'institutions',
                loadChildren: () =>
                    import('./modules/institutions/institutions.module').then((m) => m.InstitutionsModule),
                canActivate: [AuthGuard],
            },
            {
                path: 'reports',
                loadChildren: () => import('./modules/reporting/reporting.module').then((m) => m.ReportingModule),
                canActivate: [AuthGuard],
            },
            {
                path: 'settings',
                loadChildren: () => import('./modules/settings/settings.module').then((m) => m.SettingsModule),
                canActivate: [AuthGuard],
            },
        ],
    },
    {
        path: '**',
        redirectTo: 'auth/login',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
