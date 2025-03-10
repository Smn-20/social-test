import { Paginate } from '../../core/utils/reusable-functions';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { EPermission, EState } from '../../core/enums';
import { CreateRoleComponent } from './create-role/create-role.component';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { initPaginate } from '../../core/utils/reusable-functions';
import { EventService } from '../../core/services/event.service';
import { statuses } from '../../core/utils/reusable-arrays';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.css'],
})
export class RolesComponent implements OnInit {
    openNewRoleModal = false;
    openRoleDetails = false;
    openEditRoleForm = false;
    loading = false;
    filterTerm!: string;
    roles: any[] = [];
    totalRoles = 0;
    selectedRowIndex = -1;
    selectedRoleId = '';
    isSearching = false;
    queryFormGroup!: FormGroup;
    pagination: Paginate = initPaginate(1, 20);
    openFilters = false;
    isStatusDropdown = false;
    statuses!: any[];
    selectedStatusFilter = { name: null, value: null };
    public EPermission = EPermission;

    toggleNewRoleModal() {
        this.openNewRoleModal = !this.openNewRoleModal;
    }

    toggleRoleDetails(index: number) {
        this.selectedRowIndex = index;
        this.openRoleDetails = !this.openRoleDetails;
        this.selectedRoleId = this.roles[index].id;
    }

    toggleEditRoleForm() {
        this.openEditRoleForm = !this.openEditRoleForm;
    }

    openRoleDialog(): void {
        this.dialog.open(CreateRoleComponent, {
            width: '1024px',
            maxHeight: '95vh',
        });
    }

    constructor(
        private dataService: DataService,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private eventService: EventService,
        public translationService: TranslationService
    ) {
        this.initTranslatable();
        this.queryFormGroup = this.fb.group({
            query: ['', [Validators.required]],
        });
        this.statuses = statuses.filter((item) => item.value !== EState.CREATED && item.value !== EState.ARCHIVED);
    }

    get EState() {
        return EState;
    }

    ngOnInit(): void {
        this.loadRoles();
        this.onSearch();
        this.eventListening();
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.statuses = this.translationService.translateArray(statuses, res.statuses);
        });
    }

    loadRoles(): void {
        this.loading = true;
        if (this.selectedStatusFilter.value) {
            this.dataService.getRolesStatus(this.selectedStatusFilter.value, this.pagination).subscribe((res: any) => {
                this.processRes(res);
            });
        } else {
            this.dataService.getRoles(this.pagination).subscribe((res: any) => {
                this.processRes(res);
            });
        }
    }

    processRes(res: any): void {
        this.loading = false;
        this.roles = res.response.roles;
        this.totalRoles = res.response.totalElements;
        this.pagination.page = res.response.currentPage;
    }

    onPageChange(event: any): void {
        this.pagination.page = event.pageIndex + 1;
        this.loadRoles();
    }

    receiveRefresh(event: any) {
        if (event) {
            this.loadRoles();
            this.openRoleDetails = false;
            this.queryFormGroup.controls['query'].setValue('');
        }
    }

    onSearch(): void {
        this.queryFormGroup.get('query')?.valueChanges.pipe();

        this.queryFormGroup
            .get('query')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                if (val !== '' || val !== null) {
                    this.loading = true;

                    this.dataService.searchRole(val).subscribe((res) => {
                        this.loading = false;
                        this.roles = res.response.roles || [];
                        this.totalRoles = res.response.totalElements;
                        this.pagination.page = res.response.currentPage;
                    });
                }
            });
    }

    // todo: update get user func
    setStatusFilter({ value, name }: { value: any; name: any }): void {
        this.selectedStatusFilter = { value, name };
        this.initPaginationPage();
        this.loadRoles();
    }

    // todo: update get user func
    clearStatusFilter(): void {
        this.selectedStatusFilter = { value: null, name: null };
        this.initPaginationPage();
        this.loadRoles();
        this.hideDropdownFilters();
    }

    toggleFilters() {
        this.openFilters = !this.openFilters;
    }

    toggleStatusDropdown() {
        this.toggleFilters();
        this.isStatusDropdown = !this.isStatusDropdown;
    }

    hideDropdownFilters(): void {
        this.isStatusDropdown = false;
    }

    initPaginationPage(): void {
        this.pagination.page = 1;
    }

    eventListening(): void {
        this.eventService.stopAllLoaders.subscribe((st) => {
            if (st) {
                this.loading = false;
                this.isSearching = false;
            }
        });

        this.eventService.actionFinished.subscribe((st) => {
            if (st === 'roles') {
                this.selectedRowIndex = -1;
                this.openRoleDetails = false;
                this.selectedRoleId = '';
                this.pagination.page = 1;
                this.loadRoles();
            }
        });
    }
}
