import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EChartsOption } from 'echarts';
import html2canvas from 'html2canvas';
import { EJurisdiction, EPermission } from '../../core/enums';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { HouseholdService } from '../../core/services/household.service';
import { TranslationService } from '../../core/services/translation.service';
import { dashboardCategories } from '../../core/utils/reusable-arrays';
import { getRandomColor } from '../../core/utils/reusable-functions';
import { JurisdictionFilterComponent } from '../households/jurisdiction-filter/jurisdiction-filter.component';
import { ResponseObject } from '../../core/utils/reusable-functions';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
    @ViewChild('downloadDiv', { static: false }) downloadDiv!: ElementRef;
    @ViewChild('downloadDiv2', { static: false }) downloadDiv2!: ElementRef;
    selectedCategory = '';
    categories: any[] = [];

    public EPermission = EPermission;
    householdsOption: EChartsOption = {
        tooltip: {
            trigger: 'item',
        },
        legend: {
            bottom: 0,
            type: 'scroll',
            orient: 'horizontal',
        },
        grid: {
            containLabel: true,
            bottom: 80, // Adjust this value to increase/decrease the distance
            right: 80,
            left: 80,
        },
        series: [],
        color: [],
    };

    programsOption: EChartsOption = {
        tooltip: {
            trigger: 'item',
        },
        legend: {
            bottom: 0,
            type: 'scroll',
            orient: 'horizontal',
        },
        grid: {
            containLabel: true,
            bottom: 80, // Adjust this value to increase/decrease the distance
        },
        series: [],
        color: [],
    };
    selectedFilter = { type: null, code: null, id: null, name: null };
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    dashboards: any[] = [];
    report1Loading = false;
    report2Loading = false;
    report3Loading = false;
    report4Loading = false;
    report5Loading = false;
    report6Loading = false;
    report7Loading = false;
    selectedDashboardFilter = '';
    programsCount = 0;
    cuttoffCount = 0;
    vulnerableHousehouldsPercentage = 0;
    totalHouseholds = 0;
    householdsUnderCutoff = 0;
    householdsUnderVupPrograms = 0;
    householdsReports = [];
    programsReports = [];
    scoringStatus!: {
        pending: number;
        completed: number;
        percentage: any;
    };

    selectedJurisdictionLocation!: any;
    loadingArray = new Array(4);
    public EJurisdiction = EJurisdiction;

    constructor(
        private householdService: HouseholdService,
        private authService: AuthService,
        public dialog: MatDialog,
        private eventService: EventService,
        private translationService: TranslationService
    ) {
        this.initTranslatable();
    }

    get dashboardLoading() {
        return (
            !this.report1Loading &&
            !this.report2Loading &&
            !this.report3Loading &&
            !this.report4Loading &&
            !this.report6Loading &&
            !this.report7Loading
        );
    }

    get isHouseholdsDashboardSelected() {
        return this.selectedDashboardFilter === 'households';
    }

    get isAdmin() {
        return this.loggedInUser.roles.some((r: string) => ['MINALOC_SUPER_ADMIN']?.includes(r));
    }

    getCategories(): void {
        this.householdService.getDashboardCategories().subscribe((res: any) => {
            this.categories = res.response.map((item: { name: any }) => item.name);
            this.categories = [...this.categories, 'Map'];
            this.selectedCategory = this.categories[0];
            this.loadDashboardData();
        });
        this.initTranslatable();
    }
    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.categories = this.translationService.translateArray(dashboardCategories, res.dashboardCategories);
        });
    }

    ngOnInit(): void {
        this.getTotalHouseholdsUnderCutoff();
        this.getCategories();
        this.getHouseholdReports();
        // this.getProgramsCount();
        // this.getTotalHouseholdsUnderVupPrograms();
        this.getJuridictionLocation();
        this.listenToEvent();
        this.getHouseholdScoring();
        this.loadDashboardData();
    }

    listenToEvent(): void {
        this.eventService.selectFilter.subscribe((evt) => {
            if (evt) {
                this.selectedDashboardFilter = evt;
            }
        });
        this.eventService.locationFilterEvent.subscribe((evt) => {
            this.vulnerableHousehouldsPercentage = 0;
            this.totalHouseholds = 0;
            this.householdsUnderCutoff = 0;
            if (evt) {
                if (this.selectedFilter.id === evt.id) {
                    return;
                }
                this.selectedFilter = evt;
                this.getHouseholdReports();
                this.getTotalHouseholdsUnderCutoff();
                // this.getTotalHouseholdsUnderVupPrograms();
            }
        });
    }

    getDownloadDiv(category: string): any {
        switch (category) {
            case 'General':
                return this.downloadDiv.nativeElement;
            case 'Dynamic':
                return this.downloadDiv2.nativeElement;
            default:
                break;
        }
    }

    downloadImage() {
        const divElement = this.getDownloadDiv(this.selectedCategory);

        html2canvas(divElement).then((canvas: any) => {
            // Convert the canvas to a data URL
            const dataUrl = canvas.toDataURL('image/png');

            // Create a link element
            const link = document.createElement('a');
            link.href = dataUrl;

            // Set the download attribute with a filename
            link.download = 'dashboards.png';

            // Append the link to the document
            document.body.appendChild(link);

            // Trigger a click event on the link to initiate the download
            link.click();

            // Remove the link from the document
            document.body.removeChild(link);
        });
    }

    loadDashboardData() {
        this.householdService.getDashboardsByCategoryName(this.selectedCategory).subscribe(
            (response) => {
                if (response.status) {
                    this.dashboards = response.response;
                } else {
                    console.error('API request returned unsuccessful response.');
                }
            },
            (error) => {
                console.error('Error loading dashboard data:', error);
            }
        );
    }

    getHouseholdReports(): void {
        if (this.selectedDashboardFilter === '' || this.selectedDashboardFilter === 'households') {
            this.report1Loading = true;
        }
        if (this.authService.checkAccess([EPermission.VIEW_HOUSE_HOLD])) {
            this.householdService
                .getJuridictionDashboard(
                    this.selectedFilter.type || this.loggedInUser?.jurisdiction,
                    this.selectedFilter.id || this.loggedInUser?.locationId
                )
                .subscribe((res) => {
                    this.totalHouseholds = res.response[0].total;
                    const reports = res.response.slice(1);
                    this.householdsReports = reports;
                    if (this.householdsUnderCutoff > 0) {
                        this.vulnerableHousehouldsPercentage = Math.round(
                            (this.householdsUnderCutoff / this.totalHouseholds) * 100
                        );
                    }

                    const values = this.householdsReports.map((el: any) => {
                        return { value: el.total, name: el.title + ' (' + el.percentage + '%)' };
                    });

                    const colors = this.householdsReports.map(() => {
                        return getRandomColor();
                    });

                    this.householdsOption.series = {
                        // name: 'Power per',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 0,
                            borderColor: '#fff',
                            borderWidth: 2,
                        },
                        label: {
                            show: false,
                            position: 'center',
                        },
                        emphasis: {
                            label: {
                                show: false,
                            },
                        },
                        labelLine: {
                            show: false,
                        },
                        data: values,
                    };
                    this.householdsOption.color = colors;
                    setTimeout(() => {
                        this.report1Loading = false;
                    }, 500);
                });
        }
    }

    getHouseholdPerProgramsReports(total: number): void {
        if (this.authService.checkAccess([EPermission.VIEW_TARGETING])) {
            this.report4Loading = true;
            this.householdService
                .getJuridictionDashboardPrograms(
                    this.selectedFilter.type || this.loggedInUser?.jurisdiction,
                    this.selectedFilter.id || this.loggedInUser?.locationId,
                    total
                )
                .subscribe((res) => {
                    const reports = res.response.slice(1);
                    this.programsReports = reports;

                    const values = this.programsReports.map((el: any) => {
                        return { value: el.total, name: el.title + ' (' + el.percentage + '%)' };
                    });
                    const colors = this.programsReports.map(() => {
                        return getRandomColor();
                    });

                    this.programsOption.series = {
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 0,
                            borderColor: '#fff',
                            borderWidth: 2,
                        },
                        label: {
                            show: false,
                            position: 'center',
                        },
                        emphasis: {
                            label: {
                                show: false,
                            },
                        },
                        labelLine: {
                            show: false,
                        },
                        data: values,
                    };
                    this.programsOption.color = colors;

                    setTimeout(() => {
                        this.report4Loading = false;
                    }, 500);
                });
        }
    }

    getProgramsCount(): void {
        this.report2Loading = true;
        if (this.authService.checkAccess([EPermission.VIEW_TARGETING])) {
            this.householdService.getActiveProgramsCount().subscribe((res) => {
                this.programsCount = res.response.toLocaleString();
                this.report2Loading = false;
            });
        }
    }

    getHouseholdScoring(): void {
        this.report5Loading = true;
        if (this.authService.checkAccess([EPermission.VIEW_SCORING])) {
            this.householdService.getScoringStatus().subscribe((res) => {
                const { pending, completed } = res.response;
                const perc = (completed / (completed + pending)) * 100;

                this.scoringStatus = {
                    pending,
                    completed,
                    percentage: perc + 1 > 100 ? (perc - 0.1).toFixed(1) : perc.toFixed(1),
                };

                this.report5Loading = false;
            });
        }
    }

    getCutoffCount(): void {
        this.report3Loading = true;
        if (this.authService.checkAccess([EPermission.VIEW_TARGETING])) {
            this.householdService.getActiveCutoffCount().subscribe((res) => {
                this.cuttoffCount = res.response;
                this.report3Loading = false;
            });
        }
    }

    openJurisdictionFilterDialog(): void {
        this.dialog.open(JurisdictionFilterComponent, {
            data: {
                selectedJurisdictionLocation: this.selectedJurisdictionLocation,
                disableLimit: this.loggedInUser?.jurisdiction as EJurisdiction,
            },
            width: '576px',
        });
    }

    getJuridictionLocation(): void {
        if (this.authService.checkAccess([EPermission.VIEW_HOUSE_HOLD])) {
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
    }

    getTotalHouseholdsUnderCutoff(): void {
        this.report6Loading = true;
        let body;
        if (this.selectedFilter?.type || this.loggedInUser.jurisdiction !== EJurisdiction.NATIONAL) {
            body = {
                queryCode: 'GET_TOTAL_HOUSEHOLDS_UNDER_CUTOFF_CARD_LOCATION',
                args: { locationId: this.selectedFilter?.id || this.loggedInUser.locationId },
                jurisdiction: this.selectedFilter?.type || this.loggedInUser.jurisdiction,
            };
        } else {
            body = {
                queryCode: 'GET_TOTAL_HOUSEHOLDS_UNDER_CUTOFF_CARD',
                args: {},
                jurisdiction: 'NATIONAL',
            };
        }

        this.householdService.getDashboardData(body).subscribe((response) => {
            this.report6Loading = false;
            if (response.status) {
                this.householdsUnderCutoff = response.response.result[0];
                if (this.totalHouseholds > 0) {
                    this.vulnerableHousehouldsPercentage = Math.round(
                        (this.householdsUnderCutoff / this.totalHouseholds) * 100
                    );
                }
            } else {
                console.error('API request returned unsuccessful response.');
            }
        });
    }

    getTotalHouseholdsUnderVupPrograms(hhNumber: number): void {
        this.householdsUnderVupPrograms = hhNumber;
    }

    clearFilter(): void {
        this.selectedFilter = { type: null, code: null, id: null, name: null };
        this.eventService.onLocationFilterEvent(this.selectedFilter);
        this.getHouseholdReports();
        this.getTotalHouseholdsUnderCutoff();
        // this.getTotalHouseholdsUnderVupPrograms();
    }

    onCategoryChange() {
        // Handle the category change event here
        this.clearFilter();
        this.dashboards = [];
        this.loadDashboardData();
    }
}
