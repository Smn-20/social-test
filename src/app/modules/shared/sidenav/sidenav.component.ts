import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { StateService } from 'src/app/core/services/state.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { INav, navigation } from 'src/app/core/utils/reusable-arrays';
import { IMenuItem } from '../interfaces/menu-item';

@Component({
    selector: 'app-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent implements OnInit, OnDestroy {
    navigation: INav[] = [];
    sideBarOpen = false;
    sidebarOpenMobile = false;
    appealsCounts = 0;
    archiveCounts = 0;
    transferCounts = 0;
    translationCounts = 0;
    dynamicValue = '';
    private destroyed$ = new Subject<boolean>();
    menu: IMenuItem[] = [];
    activeItem = '';
    constructor(
        private router: Router,
        public translationService: TranslationService,
        private stateService: StateService
    ) {
        this.initTranslatable();

        this.router.events
            .pipe(
                filter((e): e is NavigationEnd => e instanceof NavigationEnd),
                takeUntil(this.destroyed$)
            )
            .subscribe((e: NavigationEnd) => {
                const routes: string[] = e.url.split('/');
                this.activeItem = routes[routes.length - 1];
            });
    }

    ngOnInit() {
        this.initGlobalState();
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.unsubscribe();
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            const { navTargeting, navAccessControl, navQuestionnaires, navAppeals, navRequests, navSettings, navHousehold } = res;
            const nav = this.translationService.translateArray(navigation, res.navigation);

            nav[1].children = nav[1].children.map((obj: any, i: number) => {
                return { ...obj, name: navHousehold[i] };
            });
            nav[2].children = nav[2].children.map((obj: any, i: number) => {
                return { ...obj, name: navTargeting[i] };
            });
            nav[4].children = nav[4].children.map((obj: any, i: number) => {
                return { ...obj, name: navAccessControl[i] };
            });
            nav[5].children = nav[5].children.map((obj: any, i: number) => {
                return { ...obj, name: navQuestionnaires[i] };
            });
            nav[6].children = nav[6].children.map((obj: any, i: number) => {
                return { ...obj, name: navAppeals[i] };
            });
            nav[7].children = nav[7].children.map((obj: any, i: number) => {
                return { ...obj, name: navRequests[i] };
            });
            nav[10].children = nav[10].children.map((obj: any, i: number) => {
                return { ...obj, name: navSettings[i] };
            });
            this.navigation = nav;
        });
    }

    initGlobalState(): void {
        this.stateService.state$.subscribe((state) => {
            this.sideBarOpen = state.sideBarOpen;
            this.sidebarOpenMobile = state.sidebarOpenMobile;
            this.appealsCounts = state.appealsCounts;
            this.archiveCounts = state.archiveCounts;
            this.transferCounts = state.transferCounts;
            this.translationCounts = state.translationCounts;
        });
    }

    getActiveRoute(): void {
        setTimeout(() => {
            const routeName = this.router.url.replace('/admin/', '');
            navigation.forEach((el, i) => {
                if (el.name?.toLocaleLowerCase() === routeName) {
                    this.toggleDropdown(i, true, false, -1);
                }
            });
        }, 1000);
    }

    toggleSideBarOpen(): void {
        this.stateService.setState('sideBarOpen', !this.sideBarOpen);
    }

    onSidebarSizeEvent(event: string): void {
        this.dynamicValue = event;
    }

    hideMenu(index: number, bool: boolean, isChildren: boolean, childrenIndex = -1): void {
        this.sidebarOpenMobile = false;
        this.toggleDropdown(index, bool, isChildren, childrenIndex);
    }

    toggleDropdown(index: number, bool: boolean, isChildren: boolean, childrenIndex: number): void {
        this.navigation.forEach((item, i) => {
            this.navigation[i].current = false;
            if (this.navigation[i]?.children > 0) {
                this.navigation[i]?.children.forEach((el: any, j: number) => {
                    this.navigation[i].children[j].current = false;
                });
            }
        });
        this.navigation[index].current = bool;
        if (childrenIndex > -1) {
            this.navigation[index].children[childrenIndex].current = bool;
            this.navigation[index].children.forEach((el: any, j: number) => {
                if (j !== childrenIndex) {
                    this.navigation[index].children[j].current = false;
                }
            });
        }

        if (isChildren) {
            const defaultChildren = this.navigation[index]?.children?.find((nav: any) => nav.default);
            if (defaultChildren) {
                this.router.navigateByUrl(defaultChildren.link);
            }
        }
        this.stateService.setState('breadcrumb', this.navigation[index]);
    }
}
