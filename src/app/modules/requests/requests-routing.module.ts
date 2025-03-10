import { TransfersComponent } from './transfers/transfers.component';
import { ArchivesComponent } from './archives/archives.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'transfers',
        component: TransfersComponent,
    },
    {
        path: 'archives',
        component: ArchivesComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RequestsRoutingModule {
    static components = [TransfersComponent, ArchivesComponent];
}
