import { Component, OnInit } from '@angular/core';
import { StateService } from 'src/app/core/services/state.service';
import { INav } from 'src/app/core/utils/reusable-arrays';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.css'],
})
export class BreadcrumbComponent implements OnInit {
    breadcrumb!: INav;
    constructor(private stateService: StateService) {}

    ngOnInit(): void {
        this.initGlobalState();
    }

    get currentChildren(): INav {
        return this.breadcrumb?.children?.find((el: any) => el.current) || null;
    }

    initGlobalState(): void {
        this.stateService.state$.subscribe((state) => {
            this.breadcrumb = state.breadcrumb;
        });
    }
}
