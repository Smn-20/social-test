import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
import { ApexDataLabels, ApexTitleSubtitle } from 'ng-apexcharts/lib/model/apex-types';
import { EJurisdiction, EPermission } from 'src/app/core/enums';
import { TranslationService } from 'src/app/core/services/translation.service';
import { AuthService } from '../../../core/services/auth.service';
import { HouseholdService } from '../../../core/services/household.service';
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
    selector: 'app-initial-dashboard',
    templateUrl: './initial-dashboard.component.html',
    styleUrls: ['./initial-dashboard.component.css'],
})
export class InitialDashboardComponent implements OnInit {
    language: any;
    @ViewChild('chart') chart!: ChartComponent;
    @Input() dashboards: any;
    @Output() hhByProgramsEvent = new EventEmitter<number>();
    @Input() selectedFilter: any;
    loggedInUser = JSON.parse(this.authService.getItem('user')) || null;
    public chartOptions!: Partial<ChartOptions> | any;
    public chartOptions2!: Partial<ChartOptions> | any;
    public chartOptions3!: Partial<ChartOptions> | any;
    public chartOptions4!: Partial<ChartOptions> | any;
    public chartOptions5!: Partial<ChartOptions> | any;
    public chartOptions6!: Partial<ChartOptions> | any;
    selectedCategory = '';
    categories: string[] = [];
    labels: any;
    dashboardLoading1 = true;
    dashboardLoading2 = true;
    dashboardLoading3 = true;
    dashboardLoading4 = true;
    dashboardLoading5 = true;
    dashboardLoading6 = true;
    data: any;
    total: any;
    dashboardData: any;
    disabilityLabels: string[] = [];
    dashboardTranslations: string[] = [];
    public EPermission = EPermission;
    constructor(
        private householdService: HouseholdService,
        private authService: AuthService,
        public dialog: MatDialog,
        private translationService: TranslationService
    ) {
        this.language = localStorage.getItem('i18n');

        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
          this.dashboardTranslations = res.dashboardLabels;

          this.chartOptions = {
            title: {
                // text: ""
                text: this.setTitleDash1(this.language),
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '12px', // Adjust the font size as needed
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
            ],
            chart: {
                height: 340,
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
                    columnWidth: '50%',
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
                show: false,
                type: 'text',
                // labels: {
                //   rotate: 0 // Set to 0 degrees to prevent rotation
                // },
            },
            yaxis: {
                title: {
                    text: this.setYaxisTitle(this.language),
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
                text: this.setTitleDash2(this.language),
                margin: 20,
            },
            dataLabels: {
                enabled: false,
            },
            legend: {
                fontFamily: 'Helvetica, Arial',
                position: 'bottom',
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
            colors: ['#fff', '#fff'],
            chart: {
                height: 300,
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
            labels: setDashaboardLabels(['Female', 'Male'], this.dashboardTranslations),

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

        this.chartOptions3 = {
            title: {
                // text: ""
                text: this.setTitleDash3(this.language),
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '12px', // Adjust the font size as needed
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
                    name: 'Population',
                    type: 'column',
                    data: [],
                },
            ],
            chart: {
                height: 300,
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
                    columnWidth: '50%',
                },
            },

            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'light',
                    type: 'horizontal',
                    shadeIntensity: 0.25,
                    gradientToColors: ['#007200'],
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
                show: false,
                type: 'text',
                // labels: {
                //   rotate: 0 // Set to 0 degrees to prevent rotation
                // },
            },
            yaxis: {
                title: {
                    text: this.setYaxisTitle2(this.language),
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
            colors: ['#006400'],
        };

        this.chartOptions4 = {
            title: {
                text: this.setTitleDash4(this.language),
                margin: 20,
            },
            dataLabels: {
                enabled: false,
            },
            legend: {
                offsetY: 40,
                fontFamily: 'Helvetica, Arial',
                width: 150,
                position: 'right',
                fontSize: '12px', // Set the desired font size
            },
            series: [44, 88],
            plotOptions: {
                pie: {
                    offsetY: 25,
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
                            value: {
                                show: true,
                                fontSize: '18px',
                                offsetY: -5,
                            },
                        },
                    },
                },
            },
            colors: ['#fff', '#fff'],
            chart: {
                height: 300,
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
            labels: setDashaboardLabels(['Female', 'Male'], this.dashboardTranslations),

            fill: {
                type: 'gradient',
            },

            responsive: [
                {
                    breakpoint: 1290,
                    options: {
                        chart: {
                            height: 300,
                        },
                        legend: {
                            offsetY: 0,
                            position: 'bottom',
                            width: '100%',
                            formatter: function (seriesName: any, opts: any) {
                                return `<div> ${seriesName}</div>`;
                            },
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

        this.chartOptions5 = {
            title: {
                text: this.setTitleDash5(this.language),
            },
            dataLabels: {
                enabled: false,
            },
            legend: {
                fontFamily: 'Helvetica, Arial',
                markers: { width: 0, height: 0 },
                fontSize: '12px', // Set the desired font size
                formatter: function (seriesName: any, opts: any) {
                    const total = opts.w.globals.seriesTotals.reduce((a: any, b: any) => {
                        return a + b;
                    }, 0);
                    const color = opts.w.globals.colors[opts.seriesIndex];
                    const value = opts.w.config.series[opts.seriesIndex];
                    return `<div style="width:140px;background:${
                        seriesName.toLowerCase().includes('female') ? '#FFEBF0' : '#D4EDE5'
                    };padding:8px;color:black;border-radius:10px"> <span style="font-size:16px;font-weight:bold;margin-right:10px;color:${color}">${(
                        (value * 100) /
                        total
                    ).toFixed(2)}%</span> ${seriesName}</div>`;
                },
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
                            value: {
                                show: true,
                                fontSize: '16px',
                                offsetY: -5,
                            },
                        },
                    },
                },
            },
            colors: ['#fff', '#fff'],
            chart: {
                height: 170,
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
            labels: setDashaboardLabels(['Female', 'Male'], this.dashboardTranslations),

            fill: {
                type: 'gradient',
            },

            responsive: [
                {
                    breakpoint: 1290,
                    options: {
                        chart: {
                            height: 230,
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

        this.chartOptions6 = {
            title: {
                text: this.setTitleDash6(this.language),
            },
            dataLabels: {
                enabled: false,
            },
            legend: {
                fontFamily: 'Helvetica, Arial',
                markers: { width: 0, height: 0 },
                fontSize: '12px', // Set the desired font size
                formatter: function (seriesName: any, opts: any) {
                    const total = opts.w.globals.seriesTotals.reduce((a: any, b: any) => {
                        return a + b;
                    }, 0);
                    const color = opts.w.globals.colors[opts.seriesIndex];
                    const value = opts.w.config.series[opts.seriesIndex];
                    return `<div style="width:140px;background:${
                        seriesName.toLowerCase().includes('female') ? '#FFEFD6' : '#ECDDF8'
                    };padding:8px;color:black;border-radius:10px"> <span style="font-size:16px;font-weight:bold;margin-right:10px;color:${color}">${(
                        (value * 100) /
                        total
                    ).toFixed(2)}%</span> ${seriesName}</div>`;
                },
            },
            series: [],
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
                            value: {
                                show: true,
                                fontSize: '16px',
                                offsetY: -5,
                            },
                        },
                    },
                },
            },
            colors: ['#ff9e00', '#5a189a'],
            chart: {
                height: 170,
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
            labels: setDashaboardLabels(['Female', 'Male'], this.dashboardTranslations),

            fill: {
                type: 'gradient',
            },

            responsive: [
                {
                    breakpoint: 1290,
                    options: {
                        chart: {
                            height: 230,
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
        this.getDashboardData(this.dashboards[0], 0);
        this.getDashboardData(this.dashboards[1], 1);
        this.getDashboardData(this.dashboards[2], 2);
        this.getDashboardData(this.dashboards[3], 3);
        this.getDashboardData(this.dashboards[4], 4);
        this.getPopulationWithDisabilities();
        this.getLanguage();
    }

    getLanguage(): void {
        this.language = this.translationService.getCurrentLanguage();
    }

    getPopulationWithDisabilities(): void {
        this.householdService.getPopulationWithDisabilities().subscribe(
            (response) => {
                if (response.status) {
                    this.dashboardLoading6 = false;
                    this.chartOptions6.series = [
                        308, //response?.response?.Female,
                        292 // response?.response?.Male
                    ];
                } else {
                    console.error('API request returned unsuccessful response.');
                }
            },
            (error) => {
                console.error('Error loading population with disabilities:', error);
            }
        );
    }

    setTitleDash1(currentLanguage: string, number: any = 0) {
        if (currentLanguage === 'rw') {
            return `Ingo zitishoboye ugendeye ku hantu: ${number}`;
        }
        if (currentLanguage === 'fr') {
            return `Foyers vulnérables par location: ${number}`;
        }

        return `Vulnerable Households per location: ${number}`;
    }

    setTitleDash2(currentLanguage: string) {
        if (currentLanguage === 'rw') {
            return "Abayobozi b'ingo ugendeye Ku gitsina";
        }
        if (currentLanguage === 'fr') {
            return 'Chefs de foyer par sexe';
        }

        return 'Household Heads By Gender';
    }

    setTitleDash3(currentLanguage: string, number: any = 0) {
        if (currentLanguage === 'rw') {
            return `Abaturage : ${number}`;
        }
        if (currentLanguage === 'fr') {
            return `Toute la population : ${number} personnes`;
        }

        return `Total Population : ${number} people`;
    }

    setTitleDash4(currentLanguage: string) {
        if (currentLanguage === 'rw') {
            return 'Ingo ugendeye kuri gahunda';
        }
        if (currentLanguage === 'fr') {
            return 'Foyers par programme';
        }

        return 'Hoseholds by program';
    }

    setTitleDash5(currentLanguage: string) {
        if (currentLanguage === 'rw') {
            return 'Abaturage ugendeye ku gitsina';
        }
        if (currentLanguage === 'fr') {
            return 'Population par Sexe';
        }

        return 'Population By Gender';
    }

    setTitleDash6(currentLanguage: string) {
        if (currentLanguage === 'rw') {
            return "Ababana n'ubumuga";
        }
        if (currentLanguage === 'fr') {
            return 'Personnes handicapées';
        }

        return 'People with disabilities';
    }

    setYaxisTitle(currentLanguage: string) {
        if (currentLanguage === 'rw') {
            return 'Ingo';
        }
        if (currentLanguage === 'fr') {
            return 'Foyers';
        }

        return 'Households';
    }

    setYaxisTitle2(currentLanguage: string) {
        if (currentLanguage === 'rw') {
            return 'Abaturage';
        }
        if (currentLanguage === 'fr') {
            return 'Population';
        }

        return 'Population';
    }

    getDashboardData(dashboard_: any, index: number): void {
        let code;
        let args;
        let jurisdiction;
        if (
            this.selectedFilter?.type ||
            (!this.selectedFilter?.type && this.loggedInUser?.jurisdiction !== EJurisdiction.NATIONAL)
        ) {
            code = this.getQueryCodeByLocation('LOCATION', dashboard_.component.queryCode);
            args = { locationId: this.selectedFilter?.id || this.loggedInUser?.locationId };
            jurisdiction = this.selectedFilter?.type || this.loggedInUser?.jurisdiction;
        } else if (this.loggedInUser?.jurisdiction === EJurisdiction.NATIONAL) {
            code = this.getQueryCodeByLocation(this.loggedInUser?.jurisdiction, dashboard_.component.queryCode);
            args = { locationId: this.loggedInUser?.locationId };
            jurisdiction = this.loggedInUser?.jurisdiction;
        }
        const body = {
            queryCode: code,
            args: args,
            jurisdiction: jurisdiction,
        };
        this.householdService.getDashboardData(body).subscribe(
            (response) => {
                let values;
                if (response.status) {
                    if (typeof response.response.result[0] == 'number' && response.response.result.length === 1) {

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
                        const labels= response.response.result.map((el: any) => {
                            return el.name;
                        });

                        this.labels = setDashaboardLabels(labels, this.dashboardTranslations);

                        this.data = response.response.result.map((el: any) => {
                            return el.value;
                        });
                    }
                    this.total = values.reduce((sum: any, item: any) => sum + item.value, 0);
                    this.dashboardData = values;

                    const colors = response.response.result.map(() => {
                        return getRandomColor();
                    });

                    if (index === 0) {
                        this.dashboardLoading5 = false;
                        this.chartOptions5.series = this.data;
                        this.chartOptions5.labels = this.labels;
                        this.chartOptions5.colors = ['#fb6f92', '#0A9396'];
                    } else if (index === 1) {
                        this.dashboardLoading3 = false;
                        // this.chartOptions.title.text = dashboard_.title
                        this.chartOptions3.series = [
                            {
                                name: 'Population',
                                type: 'column',
                                data: this.data,
                            },
                        ];

                        this.chartOptions3.title.text = this.setTitleDash3(
                            this.language,
                            this.data.reduce((sum: any, item: any) => sum + item, 0).toLocaleString()
                        );
                        this.chartOptions3.labels = this.labels;
                    } else if (index === 2) {
                        this.dashboardLoading1 = false;
                        // this.chartOptions.title.text = dashboard_.title
                        this.chartOptions.series = [
                            {
                                name: 'Households',
                                type: 'column',
                                data: this.data,
                            },
                        ];

                        this.chartOptions.title.text = this.setTitleDash1(
                            this.language,
                            this.data.reduce((sum: any, item: any) => sum + item, 0).toLocaleString()
                        );
                        this.chartOptions.labels = this.labels;
                    } else if (index === 3) {
                        this.dashboardLoading4 = false;
                        this.chartOptions4.series = this.data;
                        this.chartOptions4.labels = this.labels;
                        this.chartOptions4.colors = colors;

                        this.hhByProgramsEvent.emit(this.data.reduce((sum: any, item: any) => sum + item, 0));
                    } else if (index === 4) {
                        this.dashboardLoading2 = false;
                        this.chartOptions2.series = this.data;
                        this.chartOptions2.labels = this.labels;
                        this.chartOptions2.colors = colors;
                    }
                } else {
                    console.error('API request returned unsuccessful response.');
                }
            },
            (error) => {
                this.dashboardLoading1 = false;
                this.dashboardLoading2 = false;
                this.dashboardLoading3 = false;
            }
        );
    }

    getQueryCodeByLocation(locationType: string, queryCodes: any[]): string {
        const matchingQueryCodes = [];

        for (const str of queryCodes) {
            if (str.includes(locationType)) {
                matchingQueryCodes.push(str);
            }
        }

        return matchingQueryCodes[0];
    }
}
