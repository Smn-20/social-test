import { ispmisPrograms } from '../../../core/utils/reusable-arrays';
import { DatePipe } from '@angular/common';
import { TranslationService } from 'src/app/core/services/translation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { GlobalService } from 'src/app/core/services/global.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { EventService } from 'src/app/core/services/event.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { initPaginate, Paginate, ResponseObject } from '../../../core/utils/reusable-functions';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HeadObject, HouseholdObject, LocationObject } from '../../shared/interfaces/household';
import { EFileType, EFilterAction, EJurisdiction, EPermission, EState } from '../../../core/enums';
import { MatDialog } from '@angular/material/dialog';
import { CreateMemberComponent } from '../create-member/create-member.component';
import { TransferComponent } from '../transfer/transfer.component';
import { CreateHouseholdComponent } from '../create-household/create-household.component';

@Component({
  selector: 'app-ispmis',
  templateUrl: './ispmis.component.html',
  styleUrls: ['./ispmis.component.css'],
  providers: [DatePipe],
})
export class IspmisComponent implements OnInit, OnDestroy {
    households: any[] = [];
    nationalLocationId = 'c3e60701-2227-4568-b899-e38b8a43413f';
    openHouseholdDetails = false;
    selectedRowIndex = -1;
    pagination: Paginate = initPaginate(1, 10);
    total = 0;

    selectedHead!: HeadObject | null;
    selectedAppeals: any[] = [];
    selectedHousehold!: any;
    selectedLocation!: LocationObject | null;
    selectedMembers: any[] = [];
    history!: any[];
    loggedInUser = JSON.parse(this.authService.getItem('user'));

    householdQuerying = false;
    loading = false;
    historyLoading = false;
    shouldExpand = false;
    shoudExpandId = '';


    fileName = '';
    currentDate = new Date();
    selectedFileType = EFileType.XLSX;
    openConfirmModal = false;

    programs = ispmisPrograms;
    program!: string;
    startDate!: string;
    endDate!: string;

    public EJurisdiction = EJurisdiction;
    public EState = EState;
    public EPermission = EPermission;

    public EFilterAction = EFilterAction;
    public EFileType = EFileType;

    @ViewChild('tableRef') tableRef!: ElementRef<HTMLTableElement>;
    @ViewChild('queryingText', { static: false }) queryingText!: ElementRef;

    constructor(
        public dialog: MatDialog,
        private householdService: HouseholdService,
        private eventService: EventService,
        private authService: AuthService,
        private globalService: GlobalService,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private datepipe: DatePipe,
        private translationService: TranslationService
    ) {
        this.initTranslatable();
    }

    ngOnDestroy(): void {
        this.loading = false;
        this.householdQuerying = false;
    }

    get isParasocial() {
        return this.loggedInUser.roles.length == 1 && this.loggedInUser.roles[0] === 'Parasocial';
    }

    ngOnInit(): void {
        this.eventListening();
        this.householdService.previousPagination = this.pagination;
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
    }


    openCreateHouseholdDialog(): void {
        this.dialog.open(CreateHouseholdComponent, {
            width: '1024px',
            maxHeight: '80vh',
        });
    }

    openTransferDialog(item: any): void {
        this.dialog.open(TransferComponent, {
            data: item,
            width: '672px',
            maxHeight: '95vh',
        });
    }

    openCreateMemberDialog(item: any): void {
        this.dialog.open(CreateMemberComponent, {
            data: {
                ...item,
                ...{
                    pagination: {
                        page: this.pagination.page ? this.pagination.page + 1 : 1,
                        size: this.pagination.size,
                    },
                },
            },
            width: '1024px',
            maxHeight: '80vh',
        });
    }

    toggleHouseholdDetails(index: number, data: HouseholdObject) {
        this.selectedRowIndex = index;
        this.openHouseholdDetails = !this.openHouseholdDetails;
        this.resetSelectables();
        if (data?.id) {
            this.selectedHousehold = data;
            this.selectedHead = data.head;
            this.getHouseholdMembers(data.id);
            this.getHouseholdAppeals(data.id);
            this.getTransferHistory(data.id);
        }
    }

    getHouseholds(): void {
        this.loading = true;
        this.openHouseholdDetails = false;
        this.householdService
            .getISPMISHouseholds(
                this.program,
                this.startDate,
                this.endDate,
                this.pagination,
            )
            .subscribe((res: ResponseObject<any>) => {
                this.loading = false;
                this.householdQuerying = false;
                if (res.status) {
                    this.households = res.response;
                    // this.total = res.response.totalElements;
                    // this.pagination.page = res.response.currentPage;
                    this.householdService.previousPagination = this.pagination;
                    if (this.householdService.selectedHid) {
                        res.response?.households.forEach((element: any, index: number) => {
                            if (element?.id === this.householdService.selectedHid) {
                                this.toggleHouseholdDetails(index, element);
                                this.scrollToElement(index);
                            }
                        });
                    }
                } else {
                    this.households = [];
                    this.globalService.openFailureSnackBar(res.message);
                }
            });
    }

    getHouseholdMembers(householdId: string): void {
        this.householdService.getHouseholdMembers(householdId).subscribe((res: ResponseObject<any>) => {
            if (res?.status) {
                if (Array.isArray(res.response?.members)) {
                    this.selectedMembers = res.response?.members;
                    this.selectedLocation = res.response?.location;
                } else {
                    this.selectedMembers = res.response?.members;
                    this.selectedLocation = res.response?.location;
                }
                this.selectedLocation = res.response?.location;
            }
        });
    }

    getTransferHistory(householdId: string): void {
        this.historyLoading = true;
        this.householdService.getHouseholdTransfers(householdId).subscribe((res: ResponseObject<any>) => {
            this.historyLoading = false;
            if (res?.status) {
                this.history = res.response;
            } else {
                this.history = [];
            }
        });
    }

    getHouseholdAppeals(householdId: string, pagination = initPaginate(1, 10)): void {
        this.householdService.getAppealsByHousehold(householdId, pagination).subscribe((res: ResponseObject<any>) => {
            if (res?.status) {
                this.selectedAppeals = res.response.appeals;
            } else {
                this.selectedAppeals = [];
            }
        });
    }

    onPageChange(event: any): void {
        this.openHouseholdDetails = false;
        this.pagination.page = event.pageIndex + 1;
        this.resetSelectables();
        this.getHouseholds();
    }

    resetSelectables(): void {
        this.selectedHead = null;
        this.selectedAppeals = [];
        this.selectedMembers = [];
        this.selectedLocation = null;
        this.selectedHousehold = {} as HouseholdObject;
    }

    eventListening(): void {
        this.eventService.actionFinished.subscribe((res) => {
            if (res?.name === 'households') {
                this.openHouseholdDetails = false;
                this.resetSelectables();

                if (this.householdService.previousPagination.page) {
                    this.pagination = res.pagination;
                } else {
                    this.initPaginationPage();
                }
                setTimeout(() => {
                    this.getHouseholds();
                }, 1);
            }
        });

        this.eventService.stopAllLoaders.subscribe((st) => {
            if (st) {
                this.loading = false;
                this.householdQuerying = false;
                this.historyLoading = false;
            }
        });
    }

    triggerActionEvent(evt: 'create-member' | 'transfer-household'): void {
        if (evt === 'create-member') {
            this.openCreateMemberDialog(this.selectedHousehold);
        } else {
            this.openTransferDialog(this.selectedHousehold);
        }
    }

    receiveRefresh(event: any): void {
        window.location.reload();
    }

    initPaginationPage(): void {
        this.pagination.page = 1;
    }

    scrollToElement(index: number): void {
        setTimeout(() => {
            const table: HTMLTableElement = this.tableRef?.nativeElement;
            const row: HTMLTableRowElement | null = table?.rows[index];

            if (row) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }, 1000);
    }

    setQueryingFocus(): void {
        setTimeout(() => {
            this.queryingText.nativeElement.focus();
        }, 0);
    }

    toggleReportDialdog(): void {
        this.openConfirmModal = !this.openConfirmModal;
    }

    onFileChange(evt: EFileType): void {
        this.selectedFileType = evt;
    }

    removePersistedLocationFilter(): void {
        localStorage.removeItem('selectedFilter');
    }
}
