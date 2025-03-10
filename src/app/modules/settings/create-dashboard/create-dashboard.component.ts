import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EJurisdiction } from 'src/app/core/enums';
import { HouseholdService } from 'src/app/core/services/household.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { GlobalService } from '../../../core/services/global.service';

@Component({
    selector: 'app-create-dashboard',
    templateUrl: './create-dashboard.component.html',
    styleUrls: ['./create-dashboard.component.css'],
})
export class CreateDashboardComponent implements OnInit {
    selectedCategory = '';
    categoriesArray: any[] = [];
    categories: string[] = [];
    categoryObj: any;
    loading = false;
    dashboardFormGroup!: FormGroup;

    snackBarMessages: string[] = ['fillAllRequiredFields']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        public dialogRef: MatDialogRef<CreateDashboardComponent>,
        public fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private globalService: GlobalService,
        private dashboardService: HouseholdService,
        private translationService: TranslationService
    ) {
        this.dashboardFormGroup = this.fb.group({
            title: [this.data?.title ? this.data?.title : '', [Validators.required]],
            type: [this.data?.component?.type ? this.data?.component?.type : '', [Validators.required]],
            description: [this.data?.title ? this.data?.title : '', [Validators.required]],
            category: [this.data?.category ? this.data?.category.name : '', [Validators.required]],

            queryCodeNational: [
                this.data?.component?.queryCode?.length > 0
                    ? this.getQueryCodeByLocation(EJurisdiction.NATIONAL, this.data?.component?.queryCode)
                    : '',
                [Validators.required],
            ],
            queryCodeLocation: [
                this.data?.component?.queryCode?.length > 0
                    ? this.getQueryCodeByLocation('LOCATION', this.data?.component?.queryCode)
                    : '',
                [Validators.required],
            ],

            scriptNational: [
                this.data?.query?.length > 0 ? this.findQueryCode(this.data?.query, EJurisdiction.NATIONAL).script : '',
                [Validators.required],
            ],
            scriptLocation: [
                this.data?.query?.length > 0 ? this.findQueryCode(this.data?.query, 'LOCATION').script : '',
                [Validators.required],
            ],
        });
    }
    ngOnInit(): void {
        this.getCategories();
    }

    getCategories(): void {
        this.dashboardService.getDashboardCategories().subscribe((res: any) => {
            this.categoriesArray = res.response;
            this.categories = res.response.map((item: any) => item.name);
            this.selectedCategory = this.categories[0];
        });
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

    onCategoryChange(): void {
        const dashboardValues = this.dashboardFormGroup.value;
        this.categoryObj = this.categoriesArray.find((obj) => obj.name === dashboardValues.category);
    }

    findQueryCode(array: any, word: any): any {
        // Use the Array.prototype.find() method to search for the item
        return array.find((item: { code: string | any[] }) => item.code.includes(word));
    }

    createDashboard(): void {
        if (this.dashboardFormGroup.invalid) {
            this.dashboardFormGroup.markAllAsTouched();
            this.dashboardFormGroup.markAsDirty();
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                this.globalService.openFailureSnackBar(res);
            });
            return;
        } else {
            const dashboardValues = this.dashboardFormGroup.value;
            const dashboardPayload: any = {
                title: dashboardValues.title,
                filters: [
                    {
                        type: 'LOCATION',
                        queryArg: 'string',
                    },
                ],
                component: {
                    type: dashboardValues.type,
                    name: dashboardValues.title,
                    queryCode: [dashboardValues.queryCodeNational, dashboardValues.queryCodeLocation],
                    metric: 'string',
                    gridSize: 'string',
                    resultType: 'string',
                    format: {
                        additionalProp1: {},
                        additionalProp2: {},
                        additionalProp3: {},
                    },
                    showMetric: true,
                    colors: ['string'],
                    labels: [{}],
                    title: dashboardValues.title,
                },
                query: [
                    {
                        code: dashboardValues.queryCodeNational,
                        description: 'National Level Script',
                        script: dashboardValues.scriptNational,
                        params: 'locationId',
                        scriptType: 'MULTIPLE',
                        dashboardScript: {
                            state: 0,
                            status: 'ACTIVE',
                            code: dashboardValues.queryCodeNational,
                            description: 'National Level Script',
                            script: dashboardValues.scriptNational,
                            params: 'locationId',
                            scriptType: 'MULTIPLE',
                        },
                    },
                    {
                        code: dashboardValues.queryCodeLocation,
                        description: 'Location Level Script',
                        script: dashboardValues.scriptLocation,
                        params: 'locationId',
                        scriptType: 'MULTIPLE',
                        dashboardScript: {
                            state: 0,
                            status: 'ACTIVE',
                            code: dashboardValues.queryCodeLocation,
                            description: 'Location Level Script',
                            script: dashboardValues.scriptLocation,
                            params: 'locationId',
                            scriptType: 'MULTIPLE',
                        },
                    },
                ],
                category: this.categoryObj,
                dashboard: {
                    state: 0,
                    status: 'ACTIVE',
                    title: dashboardValues.title,
                    description: dashboardValues.description,
                    filters: [
                        {
                            type: 'LOCATION',
                            queryArg: 'string',
                        },
                    ],
                    component: {
                        type: dashboardValues.type,
                        name: dashboardValues.title,
                        queryCode: [dashboardValues.queryCodeNational, dashboardValues.queryCodeLocation],
                        metric: 'string',
                        gridSize: 'string',
                        resultType: 'string',
                        format: {
                            additionalProp1: {},
                            additionalProp2: {},
                            additionalProp3: {},
                        },
                        showMetric: true,
                        colors: ['string'],
                        labels: [{}],
                        title: dashboardValues.title,
                    },
                },
            };

            this.loading = true;
            if (this.data) {
                dashboardPayload.id = this.data.id;
                console.log(JSON.stringify(dashboardPayload));
                this.dashboardService.updateDashboard(dashboardPayload).subscribe((res: any) => {
                    this.loading = false;
                    if (res.status) {
                        this.dialogRef.close();
                        this.globalService.openSuccessSnackBar(res.message);
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } else {
                        this.dialogRef.close();
                        this.globalService.openFailureSnackBar(res.message);
                    }
                });
            } else {
                this.dashboardService.createDashboard(dashboardPayload).subscribe((res: any) => {
                    this.loading = false;
                    if (res.status) {
                        this.dialogRef.close();
                        this.globalService.openSuccessSnackBar(res.message);
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } else {
                        this.dialogRef.close();
                        this.globalService.openFailureSnackBar(res.message);
                    }
                });
            }
        }
    }
}
