import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { jurOptions } from '../../constants';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { EventService } from '../../core/services/event.service';
import { GlobalService } from '../../core/services/global.service';
import { HouseholdService } from '../../core/services/household.service';
import { UserService } from '../../core/services/user.service';
import { Paginate, initPaginate } from '../../core/utils/reusable-functions';
import { EJurisdiction, EPermission, EState } from '../../core/enums';
import { JurisdictionFilterComponent } from '../households/jurisdiction-filter/jurisdiction-filter.component';
import { statuses } from '../../core/utils/reusable-arrays';
import { ResponseObject } from '../../core/utils/reusable-functions';
import { CreateUserComponent } from './create-user/create-user.component';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
    openNewUserModal = false;
    openUserDetails = false;
    openEditForm = false;
    selectedRowIndex = -1;
    users: any[] = [];
    totalUsers = 0;
    loading = false;
    isSearching = false;
    queryFormGroup!: FormGroup;
    openFilters = false;
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    selectedJurisdictionLocation: any;
    public EJurisdiction = EJurisdiction;
    filterLocation: any;
    isRoleDropdown = false;
    isStatusDropdown = false;
    jurOptions = jurOptions;
    filterJurisdiction!: EJurisdiction;

    selectedJurisdictionFilter = { type: null, code: null, id: null, name: null };
    selectedRoleFilter = { roleName: null, id: null };
    selectedStatusFilter = { name: null, value: null };
    pagination: Paginate = initPaginate(1, 20);
    roles: any = [];
    statuses!: any[];
    public EState = EState;
    public EPermission = EPermission;

    @ViewChild('filters') filters!: ElementRef;
    @ViewChild('filtersToggle') filtersToggle!: ElementRef;

    constructor(
        public dialog: MatDialog,
        private userService: UserService,
        private fb: FormBuilder,
        private authService: AuthService,
        private eventService: EventService,
        private globalService: GlobalService,
        private dataService: DataService,
        private householdService: HouseholdService,
        private renderer: Renderer2,
        private translationService: TranslationService
    ) {
        this.queryFormGroup = this.fb.group({
            query: ['', [Validators.required]],
        });

        this.renderer.listen('window', 'click', (e: Event) => {
            if (
                e.target !== this.filtersToggle?.nativeElement &&
                e.target !== this.filters?.nativeElement &&
                this.openFilters
            ) {
                this.openFilters = false;
            }
        });

        this.statuses = [...statuses.filter((el) => el.value !== EState.ARCHIVED), { name: 'Locked', value: 'LOCKED' }];
        this.initTranslatable();
    }

    ngOnInit(): void {
        this.getJurisdictionUsers();
        this.onSearch();
        this.eventListening();
        this.loadRoles();
        // todo: implement this on the dialog component
        this.getJuridictionLocation();
    }

    async initTranslatable(): Promise<void> {
        this.translationService.loadLanguage();
        await Promise.all(
            this.statuses.map((value: { name: string, value: string }, index: number) => {
                const key = `status${value?.value?.charAt(0).toUpperCase() + value?.value?.slice(1)?.toLowerCase()}`;
                this.translationService.getInstantTranslations(key).subscribe((res) => {
                    this.statuses[index] = ({ ...value, name: res ?? value.name })
                });
            })
        )
    }

    toggleFilters() {
        this.openFilters = !this.openFilters;
    }

    toggleRoleDropdown() {
        this.toggleFilters();
        this.isRoleDropdown = !this.isRoleDropdown;
    }

    toggleStatusDropdown() {
        this.toggleFilters();
        this.isStatusDropdown = !this.isStatusDropdown;
    }

    loadRoles(): void {
        this.dataService.getRoles(initPaginate(1, 1000)).subscribe((res: any) => {
            this.roles = res.response.roles;
        });
    }

    openJurisdictionFilterDialog(): void {
        this.toggleFilters();
        this.dialog.open(JurisdictionFilterComponent, {
            data: {
                selectedJurisdictionLocation: this.selectedJurisdictionLocation,
                disableLimit: this.loggedInUser?.jurisdiction as EJurisdiction,
            },
            width: '576px',
        });
    }

    getJurisdictionUsers(): void {
        this.loading = true;
        const jurisdiction =
            this.loggedInUser?.jurisdiction === EJurisdiction.NATIONAL ? '' : this.loggedInUser?.jurisdiction;
        const locationId =
            this.loggedInUser?.jurisdiction === EJurisdiction.NATIONAL ? '' : this.loggedInUser?.locationId;
        this.userService
            .filterUser(
                this.selectedJurisdictionFilter?.type || jurisdiction,
                this.selectedJurisdictionFilter?.id || locationId,
                this.selectedRoleFilter?.id || '',
                this.selectedStatusFilter?.value || '',
                this.queryFormGroup.controls['query']?.value || '',
                this.pagination
            )
            .subscribe((res: ResponseObject<any>) => {
                this.loading = false;
                this.isSearching = false;
                this.hideDropdownFilters();
                if (res.status) {
                    this.users = res?.response.users;
                    this.totalUsers = res.response.totalElements;
                    this.pagination.page = res.response.currentPage;
                } else {
                    this.users = [];
                    this.totalUsers = 0;
                    this.globalService.openFailureSnackBar(res.message);
                }
            });
    }

    eventListening(): void {
        this.eventService.locationFilterEvent.subscribe((evt) => {
            if (evt) {
                if (this.selectedJurisdictionFilter.id === evt.id) {
                    return;
                }
                this.selectedJurisdictionFilter = evt;
                this.initPaginationPage();
                this.getJurisdictionUsers();
                this.selectedRowIndex = -1;
            }
        });

        this.eventService.stopAllLoaders.subscribe((st) => {
            if (st) {
                this.loading = false;
                this.isSearching = false;
            }
        });
    }

    initPaginationPage(): void {
        this.pagination.page = 1;
    }

    openUserDialog(): void {
        this.dialog.open(CreateUserComponent, {
            width: '1024px',
        });
    }

    toggleNewUserModal() {
        this.openNewUserModal = !this.openNewUserModal;
    }

    toggleUserDetails(index: number) {
        if (!this.openUserDetails) {
            this.selectedRowIndex = index;
            this.openUserDetails = true;
        } else if (this.openUserDetails && this.selectedRowIndex !== index) {
            this.selectedRowIndex = index;
        } else {
            this.openUserDetails = false;
        }
    }

    toggleEditForm() {
        this.openEditForm = !this.openEditForm;
    }

    onPageChange(event: any): void {
        this.pagination.page = event.pageIndex + 1;
        this.getJurisdictionUsers();
    }

    onSearch(): void {
        this.queryFormGroup.get('query')?.valueChanges.pipe();

        this.queryFormGroup
            .get('query')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                if (val !== '' || val !== null) {
                    this.isSearching = true;
                    this.pagination.page = 1;
                    this.getJurisdictionUsers();
                }
            });
    }

    getJuridictionLocation(): void {
        this.householdService
            .getJuridictionLocation(this.loggedInUser?.jurisdiction, this.loggedInUser?.locationId)
            .subscribe((res: ResponseObject<any>) => {
                if (res.status) {
                    const { province, district, sector, cell, villages } = res.response;
                    this.selectedJurisdictionLocation = {
                        selectedProvince: province?.id,
                        selectedDistrict: district?.id,
                        selectedSector: sector?.id,
                        selectedCell: cell?.id,
                        selectedVillage: villages?.id,
                    };
                }
            });
    }

    receiveRefresh(event: any): void {
        window.location.reload();
    }

    // todo: update get user func
    setRoleFilter({ id, roleName }: { id: any; roleName: any }): void {
        this.selectedRoleFilter = { id, roleName };
        this.initPaginationPage();
        this.getJurisdictionUsers();
    }

    // todo: update get user func
    setStatusFilter({ value, name }: { value: any; name: any }): void {
        this.selectedStatusFilter = { value, name };
        this.initPaginationPage();
        this.getJurisdictionUsers();
    }

    // todo: update get user func
    clearJurisdictionFilter(): void {
        this.selectedJurisdictionFilter = { type: null, code: null, id: null, name: null };
        this.initPaginationPage();
        this.getJurisdictionUsers();
    }

    // todo: update get user func
    clearRoleFilter(): void {
        this.selectedRoleFilter = { id: null, roleName: null };
        this.initPaginationPage();
        this.getJurisdictionUsers();
    }

    // todo: update get user func
    clearStatusFilter(): void {
        this.selectedStatusFilter = { value: null, name: null };
        this.initPaginationPage();
        this.getJurisdictionUsers();
    }

    hideDropdownFilters(): void {
        this.isRoleDropdown = false;
        this.isStatusDropdown = false;
    }
}
