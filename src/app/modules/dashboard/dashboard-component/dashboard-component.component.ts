import { TranslationService } from './../../../core/services/translation.service';
import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexFill,
    ApexLegend,
    ApexMarkers,
    ApexPlotOptions,
    ApexTooltip,
    ApexXAxis,
    ApexYAxis,
    ChartComponent,
} from 'ng-apexcharts';
import { EJurisdiction, EState, EFilterAction, EPermission } from 'src/app/core/enums';
import { AuthService } from 'src/app/core/services/auth.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { JurisdictionFilterComponent } from 'src/app/modules/households/jurisdiction-filter/jurisdiction-filter.component';
import { ApexDataLabels, ApexTitleSubtitle } from 'ng-apexcharts/lib/model/apex-types';
import { CreateDashboardComponent } from '../../settings/create-dashboard/create-dashboard.component';
import { EventService } from '../../../core/services/event.service';
import { getRandomColor, setDashaboardLabels } from '../../../core/utils/reusable-functions';

export type ChartOptions = {
    title: ApexTitleSubtitle;
    dataLabels: ApexDataLabels;
    legend: ApexLegend;
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis | ApexYAxis[];
    labels: string[];
    stroke: any; // ApexStroke;
    markers: ApexMarkers;
    plotOptions: ApexPlotOptions;
    fill: ApexFill;
    tooltip: ApexTooltip;
};
@Component({
    selector: 'app-dashboard-component',
    templateUrl: './dashboard-component.component.html',
    styleUrls: ['./dashboard-component.component.css'],
})
export class DashboardComponentComponent implements OnInit, OnDestroy {
    @ViewChild('chart') chart!: ChartComponent;
    @Input() queryCode: any;
    @Input() title: any;
    @Input() type: any;
    @Input() dashboardInfo: any;
    selectedFilter = { type: null, code: null, id: null, name: null };
    selectedStatusFilter = { name: null, value: null };
    labels: any[] = [];
    data: any[] = [];
    selectedDashboardFilter = '';
    dashboardOptions: any;
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    selectedJurisdictionLocation!: any;
    public chartOptions!: Partial<ChartOptions> | any;
    public chartOptions2!: Partial<ChartOptions> | any;
    public EPermission = EPermission;
    public EFilterAction = EFilterAction;

    dashboardData: any[] | null = null;
    dashboardLoading = false;
    total = null;
    dashboardTranslations: string[] = [];

    get isDashboardSelected() {
        return this.title === this.selectedDashboardFilter;
    }

    constructor(
        private authService: AuthService,
        private dialog: MatDialog,
        private eventService: EventService,
        private householdService: HouseholdService,
        private translationService: TranslationService
    ) {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
          this.dashboardTranslations = res.dashboardLabels;

           this.chartOptions = {
            title: {
                text: '',
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '14px', // Adjust the font size as needed
                },
                enabledOnSeries: [0],
                formatter: function (val: any) {
                    // You can format the data label value here
                    return val.toLocaleString(); // Format with commas, for example
                },
            },
            legend: { show: false },
            series: [
                {
                    name: 'Households',
                    type: 'column',
                    data: [],
                },
                {
                    name: 'Households',
                    type: 'area',
                    data: [],
                    dataLabels: {
                        enabled: false, // Enable data labels for this series
                    },
                },
            ],
            chart: {
                height: 350,
                type: 'line',
                stacked: false,
                animations: {
                    enabled: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            stroke: {
                width: [0, 2, 5],
                curve: 'smooth',
            },
            plotOptions: {
                bar: {
                    borderRadius: 10,
                    columnWidth: '40%',
                },
            },

            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'light',
                    type: 'horizontal',
                    shadeIntensity: 0.25,
                    gradientToColors: undefined,
                    inverseColors: true,
                    opacityFrom: 0.85,
                    opacityTo: 0.85,
                    stops: [50, 0, 100],
                },
            },
            labels: [],
            markers: {
                size: 0,
            },
            xaxis: {
                type: 'text',
            },
            yaxis: {
                title: {
                    text: 'members',
                },
                labels: {
                    formatter: function (val: any) {
                        // Customize the formatting of Y-axis labels
                        return parseInt(val)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Format with commas for thousands
                    },
                },
                min: 0,
            },

            tooltip: {
                shared: false,
                intersect: true,
                y: {
                    formatter: function (y: any) {
                        if (typeof y !== 'undefined') {
                            return y.toLocaleString();
                        }
                        return y;
                    },
                },
            },
            colors: ['red'],
           };
           this.chartOptions2 = {
            title: {
                text: '',
            },
            dataLabels: {
                enabled: false,
                value: {
                    show: false, // Set to false to hide the percentage labels
                },
            },
            legend: {
                fontFamily: 'Helvetica, Arial',
                fontSize: '12px', // Set the desired font size
            },
            series: [44, 88],
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                            show: true,
                            total: {
                                showAlways: true,
                                label: this.dashboardTranslations[7],
                                show: true,
                                formatter: function (w: any) {
                                    return w.globals.seriesTotals
                                        .reduce((a: any, b: any) => {
                                            return a + b;
                                        }, 0)
                                        .toLocaleString();
                                },
                            },
                        },
                    },
                },
            },
            colors: ['#f05bb9', '#f5b325'],
            chart: {
                height: 350,
                type: 'donut',
                toolbar: {
                    show: true,
                    offsetX: 0,
                    offsetY: 0,
                    tools: {
                        download: true,
                        customIcons: [],
                    },
                },
            },
            labels: ['Female', 'Male'],

            fill: {
                type: 'gradient',
            },

            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200,
                        },
                        legend: {
                            position: 'bottom',
                        },
                    },
                },
            ],
            tooltip: {
                y: {
                    formatter: function (val: any) {
                        // Format the y-axis tooltip label here (e.g., display the value)
                        return val.toLocaleString();
                    },
                },
            },
           };
        });
    }

    ngOnInit(): void {
        this.getDashboardData();
        this.listenToEvent();
    }

    listenToEvent(): void {
        this.eventService.selectFilter.subscribe((evt) => {
            if (evt) {
                this.selectedDashboardFilter = evt;
            }
        });

        this.eventService.getDataEvent.subscribe((evt) => {
            if (evt) {
                if (this.isDashboardSelected) {
                    this.selectedFilter = evt;
                    this.getDashboardData();
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.selectedFilter = { type: null, code: null, id: null, name: null };
        this.selectedStatusFilter = { name: null, value: null };
        this.removePersistedLocationFilter();
    }

    openCreateDashboardDialog(): void {
        this.dialog.open(CreateDashboardComponent, {
            data: this.dashboardInfo,
            width: '932px',
            maxHeight: '95vh',
        });
    }

    onSetFilterEvent(evt: any): void {
        if (this.isDashboardSelected) {
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
            this.getDashboardData();
        }
    }

    removePersistedLocationFilter(): void {
        localStorage.removeItem('selectedFilter');
    }

    getDashboardData() {
        if (this.title === this.selectedDashboardFilter) {
            this.dashboardLoading = true;
        }
        let code;
        let args;
        let jurisdiction;
        if (this.selectedFilter?.type && this.title === this.selectedDashboardFilter) {
            code = this.getQueryCodeByLocation('LOCATION', this.queryCode);
            args = { locationId: this.selectedFilter.id || this.loggedInUser?.locationId };
            jurisdiction = this.selectedFilter.type || this.loggedInUser?.jurisdiction;
        } else {
            code =
                this.getQueryCodeByLocation(this.loggedInUser?.jurisdiction, this.queryCode) ||
                this.getQueryCodeByLocation('LOCATION', this.queryCode);
            args = { locationId: this.loggedInUser?.locationId };
            jurisdiction = this.loggedInUser?.jurisdiction;
        }
        const body = {
            queryCode: code,
            args: args,
            jurisdiction: jurisdiction,
        };
        this.householdService.getDashboardData(body).subscribe((response) => {
            this.dashboardLoading = false;
            let values;
            if (response.status && typeof response.response !== 'string') {
                if (typeof response.response.result[0] === 'number' && response.response.result.length === 1) {
                    values = response.response.result.map((el: any) => {
                        return { value: el, name: 'total' };
                    });

                    this.labels = response.response.result.map((el: any) => {
                        return 'total';
                    });

                    this.data = response.response.result.map((el: any) => {
                        return el;
                    });
                } else {
                    values = response.response.result;
                    this.total = values.reduce((sum: any, item: any) => sum + item.value, 0);
                    const labels = response.response.result.map((el: any) => {
                        return el.name.includes('%') && el.name.split('(').length > 1
                            ? (`${el.name.split('(')[0].trimEnd()} (${el.value}) (${
                                el.name.split('(')[1].trimEnd()
                            }`)
                            : `${el?.name} (${el.value}) (${((el.value * 100) / (this.total || 1)).toFixed(3)}%)`;
                    });
                    
                    this.labels = setDashaboardLabels(labels, this.dashboardTranslations);

                    this.data = response.response.result.map((el: any) => {
                        return el.value;
                    });
                }
                this.dashboardData = values;

                const colors = response.response.result.map(() => {
                    return getRandomColor();
                });
                if (this.type === 'HISTOGRAM') {
                    this.chartOptions.series = [
                        {
                            name: 'Households',
                            type: 'column',
                            data: this.data,
                        },
                        {
                            name: 'Households',
                            type: 'area',
                            data: this.data,
                        },
                    ];
                    this.chartOptions.labels = this.labels;
                    this.chartOptions.colors = ['#386641', '#CEE1A3'];
                    this.dashboardOptions = this.chartOptions;
                } else {
                    this.chartOptions2.series = this.data;
                    this.chartOptions2.labels = this.labels;
                    this.chartOptions2.colors = colors;
                    this.dashboardOptions = this.chartOptions2;
                }
            } else {
                console.error('API request returned unsuccessful response.');
            }
        });
    }

    // openJurisdictionFilterDialog(): void {
    //     this.selectedFilter = { type: null, code: null, id: null, name: null };
    //     this.eventService.onSelectFilter(this.title);
    //     this.dialog.open(JurisdictionFilterComponent, {
    //         data: {
    //             selectedJurisdictionLocation: this.selectedJurisdictionLocation,
    //             disableLimit: this.loggedInUser?.jurisdiction as EJurisdiction,
    //         },
    //         width: '576px',
    //     });
    // }

    getQueryCodeByLocation(locationType: string, queryCodes: any[]): string {
        const matchingQueryCodes = [];

        for (const str of queryCodes) {
            if (str.includes(locationType)) {
                matchingQueryCodes.push(str);
            }
        }

        return matchingQueryCodes[0];
    }

    clearFilter(): void {
        this.selectedFilter = { type: null, code: null, id: null, name: null };
        this.selectedDashboardFilter = '';
        this.getDashboardData();
    }
}
