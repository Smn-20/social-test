import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { EJurisdiction, EPermission, EState } from '../../core/enums';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { GlobalService } from '../../core/services/global.service';
import { HouseholdService } from '../../core/services/household.service';
import { Paginate, initPaginate } from '../../core/utils/reusable-functions';
import { ResponseObject } from '../../core/utils/reusable-functions';
import { CreateCutoffComponent } from './create-cutoff/create-cutoff.component';

@Component({
    selector: 'app-targeting',
    templateUrl: './targeting.component.html',
    styleUrls: ['./targeting.component.css'],
})
export class TargetingComponent implements OnInit {
    openNewCutoffModal = false;
    queryFormGroup!: FormGroup;
    targetings: any[] = [];
    openFilters = false;
    selectedFilter = { type: null, code: null, id: '', name: null };
    selectedRowIndex = -1;
    pagination: Paginate = initPaginate(1, 10);
    total = 0;
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    location: any;
    loading = false;
    querying = false;
    public EJurisdiction = EJurisdiction;
    selectedJurisdictionLocation: any;
    public EState = EState;
    selectedCutoffId!: string;
    public EPermission = EPermission;

    constructor(
        public dialog: MatDialog,
        private householdService: HouseholdService,
        private eventService: EventService,
        private router: Router,
        private authService: AuthService,
        private globalService: GlobalService,
        private fb: FormBuilder
    ) {
        this.queryFormGroup = this.fb.group({
            query: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.getAllTargetings();
        this.eventListening();
        this.targetingAutoSearch();
    }

    openJurisdictionFilterDialog(id: string): void {
        this.selectedCutoffId = id;
        this.router.navigate([
            '/admin/households/cutoff/' +
                this.selectedCutoffId +
                '/location/' +
                this.loggedInUser?.jurisdiction +
                '/' +
                this.loggedInUser?.locationId,
        ]);
    }

    toggleFilters() {
        this.openFilters = !this.openFilters;
    }

    targetingAutoSearch(): void {
        this.queryFormGroup.get('query')?.valueChanges.pipe();

        this.queryFormGroup
            .get('query')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                if (val !== '' || val !== null) {
                    this.querying = true;
                    this.pagination.page = 1;
                    this.searchAllTargetings();
                }
                if (val === '') {
                    this.getAllTargetings();
                }
            });
    }

    toggletargetingDetails(index: number, data: any) {
        this.selectedRowIndex = index;
    }

    getAllTargetings(): void {
        this.loading = true;
        this.householdService.getAllCuttoffs(this.pagination).subscribe((res: ResponseObject<any>) => {
            this.loading = false;
            this.querying = false;
            if (res.status) {
                this.targetings = res.response.content;
                this.total = res.response.totalElements;
                this.pagination.page = res.response.number;
            } else {
                this.targetings = [];
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    searchAllTargetings(): void {
        this.querying = true;
        this.householdService
            .searchCutoff(this.queryFormGroup.controls['query'].value)
            .subscribe((res: ResponseObject<any>) => {
                this.querying = false;
                if (res.status) {
                    this.targetings = res.response;
                } else {
                    this.targetings = [];
                    this.globalService.openFailureSnackBar(res.message);
                }
            });
    }

    onPageChange(event: any): void {
        this.pagination.page = event.pageIndex + 1;
        this.getAllTargetings();
    }

    eventListening(): void {
        this.eventService.actionFinished.subscribe((res) => {
            if (res === 'cutoffs') {
                this.initPaginationPage();
                this.getAllTargetings();
            }
        });

        this.eventService.stopAllLoaders.subscribe((st) => {
            if (st) {
                this.loading = false;
                this.querying = false;
            }
        });
    }

    receiveRefresh(event: any): void {
        window.location.reload();
    }

    toggleNewCutoffModal(item?: any): void {
        this.dialog.open(CreateCutoffComponent, {
            data: item,
            width: '672px',
        });
    }

    initPaginationPage(): void {
        this.pagination.page = 1;
    }
}
