import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { debounceTime } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { EventService } from 'src/app/core/services/event.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { EAction, EJurisdiction, EMembershipType, EMovementEvent, EPermission, EState } from 'src/app/core/enums';
import { JurisdictionFilterComponent } from 'src/app/modules/households/jurisdiction-filter/jurisdiction-filter.component';
import { HouseholdMovment } from 'src/app/modules/shared/interfaces/household';
import { HouseholdService } from '../../../core/services/household.service';
import { statusesTransfers } from '../../../core/utils/reusable-arrays';
import { Paginate, ResponseObject, initPaginate } from '../../../core/utils/reusable-functions';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
    selector: 'app-transfers',
    templateUrl: './transfers.component.html',
    styleUrls: ['./transfers.component.css'],
})
export class TransfersComponent implements OnInit {
    openTransferDetails = false;
    selectedRowIndex = -1;
    transfers: any[] = [];
    pagination: Paginate = initPaginate(1, 20);
    total = 0;
    loading = false;
    selectedHead: any;
    selectedHousehold: any;
    fromLocation: any;
    toLocation: any;
    imageLoading = false;
    headphoto: any;
    confirmAction = '';
    openConfirmModal = false;
    actionLoading = false;
    reasonForCancelation!: string;
    householdMovementId!: string;
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    queryFormGroup!: FormGroup;
    querying = false;
    public EAction = EAction;
    public EPermission = EPermission;
    public EJurisdiction = EJurisdiction;

    selectedJurisdictionFilter = { type: null, code: null, id: null, name: null };
    selectedStatusFilter = { name: null, value: null };
    statuses: any = [];
    openFilters = false;
    selectedJurisdictionLocation: any;
    isRoleDropdown = false;
    isStatusDropdown = false;
    public EState = EState;

    constructor(
        private householdService: HouseholdService,
        private _sanitizer: DomSanitizer,
        private globaService: GlobalService,
        private eventService: EventService,
        private translationService: TranslationService,
        private authService: AuthService,
        public dialog: MatDialog,
        private fb: FormBuilder
    ) {
        this.initTranslatable();
        this.queryFormGroup = this.fb.group({
            query: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.getRequests();
        this.autoSearch();
        this.eventListening();
    }

    toggleTransferDetails(index: number, data: any) {
        this.resetSelectables();
        this.selectedRowIndex = index;
        this.openTransferDetails = !this.openTransferDetails;
        this.householdMovementId = data.id;
        this.selectedHead = data.household.head;
        this.selectedHousehold = data.household;
        this.fetchImage(this.selectedHead.documentNumber, EMembershipType.HEAD);
    }

    // fetch requests
    getRequests(): void {
        this.loading = true;
        this.householdService
            .getTransferRequests(
                this.selectedJurisdictionFilter?.type || this.loggedInUser?.jurisdiction,
                this.selectedJurisdictionFilter?.id || this.loggedInUser?.locationId,
                this.queryFormGroup.controls['query']?.value || '',
                this.selectedStatusFilter?.value || '',
                this.pagination
            )
            .subscribe((res: ResponseObject<any>) => {
                this.loading = false;
                this.querying = false;
                if (res.status) {
                    this.transfers = res.response.list;
                    this.total = res.response.totalElements;
                    this.pagination.page = res.response.currentPage;
                } else {
                    this.transfers = [];
                    this.total = 0;
                }
            });
    }

    autoSearch(): void {
        this.queryFormGroup.get('query')?.valueChanges.pipe();

        this.queryFormGroup
            .get('query')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                if (val !== '' || val !== null) {
                    this.querying = true;
                    this.pagination.page = 1;
                    this.getRequests();
                }
            });
    }

    // todo: re-use
    fetchImage(documentNumber: string, membershipType: EMembershipType): void {
        this.imageLoading = true;
        this.householdService.getUserPhoto(documentNumber, membershipType).subscribe((res) => {
            this.imageLoading = false;
            if (res?.status) {
                this.headphoto = this.getImage(res.response);
            }
        });
    }

    initTranslatable(): void {
      this.translationService.loadLanguage();
      this.translationService.getInstantTranslations('component').subscribe((res) => {
          this.statuses = this.translationService.translateArray(statusesTransfers, res.navAppeals);
          console.log(res.navAppeals,statusesTransfers, this.statuses)
      });
    }

    triggerAction(): void {
        this.actionLoading = true;
        const isApprove = this.confirmAction === 'approve';
        const request: Partial<HouseholdMovment> = {
            householdId: this.selectedHousehold.id,
            event: isApprove ? EMovementEvent.APPROVE : EMovementEvent.DENY,
            reason: !isApprove ? this.reasonForCancelation : '',
            householdMovementId: this.householdMovementId,
        };
        this.householdService.createHouseholdTransferRequest(request).subscribe((res) => {
            if (res.status) {
                this.close();
                this.resetSelectables();
                this.selectedRowIndex = -1;
                this.globaService.openSuccessSnackBar(res.message);
                this.initPaginationPage();
                this.getRequests();
            } else {
                this.globaService.openFailureSnackBar(res.message);
            }
        });
    }

    getImage(input: string): any {
        return this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + input);
    }

    resetSelectables(): void {
        this.selectedHead = null;
        this.selectedHousehold = null;
        this.fromLocation = null;
        this.toLocation = null;
        this.reasonForCancelation = '';
    }

    onPageChange(event: any): void {
        this.pagination.page = event.pageIndex + 1;
        this.getRequests();
    }

    action(event: string): void {
        this.openConfirmModal = !this.openConfirmModal;
        this.confirmAction = event;
    }

    close(): void {
        this.confirmAction = '';
        this.openConfirmModal = false;
        this.actionLoading = false;
    }

    toggleFilters() {
        this.openFilters = !this.openFilters;
    }

    toggleStatusDropdown() {
        this.toggleFilters();
        this.isStatusDropdown = !this.isStatusDropdown;
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

    setStatusFilter({ value, name }: { value: any; name: any }): void {
        this.selectedStatusFilter = { value, name };
        this.initPaginationPage();
        this.getRequests();
    }

    clearJurisdictionFilter(): void {
        this.selectedJurisdictionFilter = { type: null, code: null, id: null, name: null };
        this.initPaginationPage();
        this.getRequests();
    }

    initPaginationPage(): void {
        this.pagination.page = 1;
    }

    clearStatusFilter(): void {
        this.selectedStatusFilter = { value: null, name: null };
        this.isStatusDropdown = false;
        this.initPaginationPage();
        this.getRequests();
    }

    eventListening(): void {
        this.eventService.locationFilterEvent.subscribe((evt) => {
            this.selectedJurisdictionFilter = evt;
            this.initPaginationPage();
            this.getRequests();
        });

        this.eventService.stopAllLoaders.subscribe((st) => {
            if (st) {
                this.loading = false;
                this.actionLoading = false;
                this.imageLoading = false;
            }
        });
    }

    receiveRefresh(event: any): void {
        window.location.reload();
    }
}
