import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategorySectionComponent } from './category-section/category-section.component';
import { CreateCutoffComponent } from './create-cutoff/create-cutoff.component';
import { CreateProgramFullComponent } from './create-program-full/create-program-full.component';
import { CreateProgramModalComponent } from './create-program-modal/create-program-modal.component';
import { CreateProgramComponent } from './create-program/create-program.component';
import { ProgramsComponent } from './programs/programs.component';
import { TargetingComponent } from './targeting.component';

const routes: Routes = [
    {
        path: 'cut-offs',
        component: TargetingComponent,
    },
    {
        path: 'programs',
        component: ProgramsComponent,
    },
    {
        path: 'criterias',
        component: TargetingComponent,
    },
    {
        path: 'programs/new-program',
        component: CreateProgramFullComponent,
    },
    {
        path: 'programs/update-program/:id',
        component: CreateProgramFullComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TargetingRoutingModule {
    static components = [
        TargetingComponent,
        ProgramsComponent,
        CreateProgramComponent,
        CreateCutoffComponent,
        CreateProgramFullComponent, // full page to create program with categories with target-group [former but category now]
        CategorySectionComponent, // section page to be rendered in the full page
        CreateProgramModalComponent
    ];
}
