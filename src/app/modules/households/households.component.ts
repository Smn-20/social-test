import { DataService } from './../../core/services/data.service';
import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { EFileType, EFilterAction, EPermission } from 'src/app/core/enums';
import { GlobalService } from 'src/app/core/services/global.service';

import { EJurisdiction, EState } from '../../core/enums';
import { AuthService } from '../../core/services/auth.service';
import { HouseholdService } from '../../core/services/household.service';
import { TranslationService } from '../../core/services/translation.service';
import { statuses } from '../../core/utils/reusable-arrays';
import { Paginate, initPaginate } from '../../core/utils/reusable-functions';
import { HeadObject, HouseholdObject, LocationObject } from '../shared/interfaces/household';
import { EventService } from '../../core/services/event.service';
import { searchBy } from '../../core/utils/reusable-arrays';
import { ResponseObject } from '../../core/utils/reusable-functions';
import { CreateHouseholdComponent } from './create-household/create-household.component';
import { CreateMemberComponent } from './create-member/create-member.component';
import { TransferComponent } from './transfer/transfer.component';

@Component({
    selector: 'app-households',
    templateUrl: './households.component.html',
    styleUrls: ['./households.component.css'],
    providers: [DatePipe],
})
export class HouseholdsComponent implements OnInit, OnDestroy {
    queryFormGroup!: FormGroup;
    households: HouseholdObject[] = [];
    selectedFilter = { type: null, code: null, id: null, name: null };
    selectedStatusFilter = { name: null, value: null };
    nationalLocationId = 'c3e60701-2227-4568-b899-e38b8a43413f';

    openHouseholdDetails = false;
    selectedRowIndex = -1;
    pagination: Paginate = initPaginate(1, 10);
    total = 0;

    selectedHead!: HeadObject | null;
    selectedAppeals: any[] = [];
    selectedLocation!: LocationObject | null;
    selectedHousehold!: HouseholdObject;
    selectedMembers: any[] = [];
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    location: any;
    householdQuerying = false;
    loading = false;
    historyLoading = false;
    cuttoffLoading = false;
    programLoading = false;
    history!: any[];
    previousState: any;
    activeCutOff!: any;
    activeProgram!: any;
    cutoffInfo: any;
    programInfo: any;
    reportLoading = false;
    statuses: any;
    shouldExpand = false;
    programDataLoading = false;
    shoudExpandId = '';
    searchBy: any[] = [];
    selectedTargetGroups: any[] = [];
    showProgramDetails = false;

    fileName = '';
    currentDate = new Date();
    selectedFileType = EFileType.XLSX;
    openConfirmModal = false;
    cellVillages = [];

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
        private locationService: Location,
        private route: ActivatedRoute,
        private router: Router,
        private datepipe: DatePipe,
        private translationService: TranslationService
    ) {
        this.queryFormGroup = this.fb.group({
            searchBy: [searchBy[0]?.value, [Validators.required]],
            query: ['', [Validators.required]],
        });

        this.previousState = this.locationService.getState();
        this.statuses = statuses.filter((item) => item.value !== EState.CREATED && item.value !== EState.ARCHIVED);
        this.initTranslatable();
    }

    ngOnDestroy(): void {
        this.loading = false;
        this.reportLoading = false;
        this.householdQuerying = false;
        this.historyLoading = false;
        this.cuttoffLoading = false;
        this.programLoading = false;
        this.selectedFilter = { type: null, code: null, id: null, name: null };
        this.selectedStatusFilter = { name: null, value: null };
        this.removePersistedLocationFilter();
    }

    get isParasocial() {
        return this.loggedInUser.roles.length == 1 && this.loggedInUser.roles[0] === 'Parasocial';
    }

    get isAdmin() {
      return this.loggedInUser.roles.some((r: string) => ['MINALOC_SUPER_ADMIN']?.includes(r));
  }

    ngOnInit(): void {
        this.getDynamicHouseholds();
        this.eventListening();
        this.householdAutoSearch();
        this.householdService.previousPagination = this.pagination;
    }

    async initTranslatable(): Promise<void> {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.searchBy = this.translationService.translateArray(searchBy, res.searchBys);
        });
        await Promise.all(
            this.statuses.map((value: { name: string, value: string }, index: number) => {
                const key = `status${value?.value?.charAt(0).toUpperCase() + value?.value?.slice(1)?.toLowerCase()}`;
                this.translationService.getInstantTranslations(key).subscribe((res) => {
                    this.statuses[index] = ({ ...value, name: res ?? value.name })
                });
            })
        )
    }

    getDynamicHouseholds(searchingHouseholds = false) {
        this.route.params.subscribe((params: any) => {
            const { cutoffId, type, locationId, programId, headDocumentNumber } = params;
            if (cutoffId && type && locationId) {
                this.activeCutOff = params;
                this.getAllTargetingsByLocation(cutoffId, type, locationId);
                this.getCutoffInfo(cutoffId);
            } else if (programId && type && locationId) {
                this.activeProgram = params;
                this.getAllProgramsHouseholds(programId, type, locationId);
                this.getProgramInfo(programId);
            } else if (headDocumentNumber) {
               this.queryFormGroup.controls['searchBy'].setValue('HEAD');
               this.queryFormGroup.controls['query'].setValue(headDocumentNumber);
               this.getHouseholds(true);
            } else {
                this.fileName = 'Household report ' + this.datepipe.transform(new Date(), 'medium');
                if (!this.isParasocial) {
                    const filter = JSON.parse(localStorage.getItem('selectedFilter') as any);
                    if (filter?.type && filter?.id) {
                        this.selectedFilter = filter;
                    }
                    this.getHouseholds(searchingHouseholds);
                } else {
                    this.getParasocialHouseholdsIds(this.loggedInUser.id);
                }
            }
        });
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

    householdAutoSearch(): void {
        this.queryFormGroup.get('query')?.valueChanges.pipe();

        this.queryFormGroup
            .get('query')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                if (val !== '' || val !== null) {
                    this.householdQuerying = true;
                    this.pagination.page = 1;
                    this.getDynamicHouseholds(true);
                }
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

    getHouseholds(searchingHouseholds: boolean): void {
        this.loading = true;
        this.openHouseholdDetails = false;
        this.householdService
            .getHouseholds(
                searchingHouseholds ? EJurisdiction.NATIONAL  : (this.selectedFilter.type? this.selectedFilter.type : this.loggedInUser?.jurisdiction),
                searchingHouseholds ? this.nationalLocationId : (this.selectedFilter.id? this.selectedFilter.id : this.loggedInUser?.locationId),
                this.pagination,
                this.queryFormGroup.controls['query']?.value,
                this.selectedStatusFilter?.value || '',
                this.queryFormGroup.controls['searchBy']?.value || ''
            )
            .subscribe((res: ResponseObject<any>) => {
                this.loading = false;
                this.householdQuerying = false;
                if (res.status) {
                    this.households = res.response?.households;
                    this.total = res.response.totalElements;
                    this.pagination.page = res.response.currentPage;
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

    getAllTargetingsByLocation(cuttOffId: string, locationType: EJurisdiction, id: string): void {
        this.loading = true;
        this.householdService
            .getAlterAllCuttOffs(
                this.selectedFilter.type || locationType,
                cuttOffId,
                this.selectedFilter.id || id,
                this.queryFormGroup.controls['query']?.value || '',
                this.selectedStatusFilter?.value || '',
                this.queryFormGroup.controls['searchBy']?.value || '',
                this.pagination
            )
            .subscribe((res: ResponseObject<any>) => {
                this.loading = false;
                this.householdQuerying = false;
                if (res.status) {
                    this.households = res.response?.households;
                    this.total = res.response.totalElements;
                    this.pagination.page = res.response.currentPage;
                } else {
                    this.households = [];
                    this.globalService.openFailureSnackBar(res.message);
                }
            });
    }

    getAllProgramsHouseholds(programId: string, locationType: EJurisdiction, id: string): void {
        this.loading = true;
        this.householdService
            .getAllProgramsHouseholds(
                this.selectedFilter.type || locationType,
                programId,
                this.selectedFilter.id || id,
                this.queryFormGroup.controls['query']?.value || '',
                this.selectedStatusFilter?.value || '',
                this.queryFormGroup.controls['searchBy']?.value || '',
                this.pagination
            )
            .subscribe((res: ResponseObject<any>) => {
                this.loading = false;
                this.householdQuerying = false;
                if (res.status) {
                    this.households = res.response?.content;
                    this.total = res.response.totalElements;
                    this.pagination.page = res.response.number;
                } else {
                    this.households = [];
                    this.globalService.openFailureSnackBar(res.message);
                }
            });
    }

    getParasocialHouseholdsIds(userId: string): void {
        this.householdService.getParasocialHouseholdsIds(userId).subscribe((res: ResponseObject<any>) => {
            if (res.status) {
                this.getParasocialHouseholds({ ids: res.response });
            } else {
                this.households = [];
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    getParasocialHouseholds(ids: { [key: string]: any[] }): void {
        this.householdService.getParasocialHouseholds(ids, this.pagination).subscribe((res: ResponseObject<any>) => {
            if (res.status) {
                this.households = res.response.content;
                this.total = res.response.totalElements;
                this.pagination.page = res.response.currentPage;
            } else {
                this.households = [];
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    getCutoffInfo(id: string): void {
        this.cuttoffLoading = true;
        this.householdService.getCutoffById(id).subscribe((res: ResponseObject<any>) => {
            this.cuttoffLoading = false;
            if (res.status) {
                this.cutoffInfo = res.response;
                this.fileName =
                    'Cutoff report - ' +
                    this.cutoffInfo.cutoffName +
                    ' ' +
                    this.datepipe.transform(new Date(), 'medium');
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    getProgramInfo(id: string): void {
        this.programLoading = true;
        this.programDataLoading = true;
        this.householdService.getProgramId(id).subscribe((res: ResponseObject<any>) => {
            this.programLoading = false;
            if (res.status) {
                this.programInfo = res.response;
                this.fileName =
                    'Program report - ' +
                    this.programInfo.programName +
                    ' ' +
                    this.datepipe.transform(new Date(), 'medium');
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });

        this.householdService.getProgramTargetGroup(id).subscribe((res) => {
            this.programDataLoading = false;
            if (res?.status) {
                this.selectedTargetGroups = res.response;
            } else {
                this.globalService.openFailureSnackBar(res.message);
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

    downloadReports(): void {
        let req = {
            reportType: 'HOUSEHOLDS REPORT',
            reportName: this.fileName,
            fileType: this.selectedFileType,
            jurisdictionLevel: this.selectedFilter.type || this.loggedInUser?.jurisdiction,
            locationId: this.selectedFilter.id || this.loggedInUser?.locationId,
            queryFilters: {},
        };

        if (this.activeCutOff) {
            req = {
                ...req,
                reportType: 'CUTOFF REPORT',
                queryFilters: {
                    cutoffId: this.cutoffInfo.id,
                },
            };
        } else if (this.activeProgram) {
            req = {
                ...req,
                reportType: 'PROGRAMS REPORT',
                queryFilters: {
                    programId: this.programInfo.id,
                },
            };
        }
        this.reportLoading = true;
        this.householdService.createTargetingReport(req).subscribe((res) => {
            this.reportLoading = false;
            if (res.status) {
                this.globalService.openSuccessSnackBar(res.message);
                this.router.navigate(['/admin/reports']);
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    processReport(res: any): void {
        if (res.status) {
            this.globalService.openSuccessSnackBar(res.message);
            this.router.navigate(['/admin/reports']);
        } else {
            this.globalService.openFailureSnackBar(res.message);
        }
    }

    onPageChange(event: any): void {
        this.openHouseholdDetails = false;
        this.pagination.page = event.pageIndex + 1;
        this.resetSelectables();
        this.getDynamicHouseholds();
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
                    this.getDynamicHouseholds();
                }, 1);
            }
        });

        this.eventService.stopAllLoaders.subscribe((st) => {
            if (st) {
                this.loading = false;
                this.reportLoading = false;
                this.householdQuerying = false;
                this.historyLoading = false;
                this.cuttoffLoading = false;
                this.programLoading = false;
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

    toggleProgramDetails(): void {
        this.showProgramDetails = !this.showProgramDetails;
    }

    onSetFilterEvent(evt: any): void {
        const { action, event } = evt;
        switch (action) {
            case EFilterAction.LOCATION:
                this.removePersistedLocationFilter();
                this.selectedFilter = event;
                break;
            case EFilterAction.STATUS:
                this.selectedStatusFilter = event;
                break;
        }
        this.initPaginationPage();
        this.getDynamicHouseholds();
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
