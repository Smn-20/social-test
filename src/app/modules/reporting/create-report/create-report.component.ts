import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { EFileType, EInterviewee, EPermission } from 'src/app/core/enums';
import { calculateAge } from 'src/app/core/utils/reusable-functions';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-create-report',
    templateUrl: './create-report.component.html',
    styleUrls: ['./create-report.component.css'],
    providers: [DatePipe],
})
export class CreateReportComponent implements OnInit {
    @ViewChild('accordion1') accordion1!: MatAccordion;
    @ViewChild('accordion2') accordion2!: MatAccordion;
    criterias1: { [key: string]: any[] } = {};
    criterias2: { [key: string]: any[] } = {};
    public EPermission = EPermission;
    sections1 = [];
    sections2 = [];
    loading1 = false;
    loading2 = false;
    allExpaned1 = false;
    allExpaned2 = false;
    disabled1 = false;
    disabled2 = true;
    checked1 = true;
    checked2 = false;
    filterInput1!: string;
    filterInput2!: string;
    selectedFilter = { type: null, code: null, id: null, name: null };
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    isSubmitting = false;
    fileName = '';
    currentDate = new Date();
    openConfirmModal = false;
    queryFormGroup!: FormGroup;
    selectedFileType = EFileType.XLSX;
    public EFileType = EFileType;
    public EEInterviewee = EInterviewee;

    snackBarMessages: string [] = ['headHouseholdCriteriasEmpty', 'memberHouseholdCriteriasEmpty', 'filenameInvalid']   // snackbar messages to be translated --> PLEASE do NOT modify the array values 

    constructor(
        private householdService: HouseholdService,
        private globalService: GlobalService,
        private authService: AuthService,
        private datepipe: DatePipe,
        private router: Router,
        private fb: FormBuilder,
        private translationService: TranslationService
    ) {
        this.fileName = 'Targeting report ' + this.datepipe.transform(new Date(), 'medium');
        this.queryFormGroup = this.fb.group({
            query1: [null],
            query2: [null],
        });
        this.queryFormGroup.controls['query2'].disable();
    }

    ngOnInit() {
        this.getAllsections1();
        this.getAllsections2();
        this.queryAutoSearch();
    }

    mormalizedCriteria(obj: any): any[] {
        return Object.values(obj)?.filter((el: any) => el !== undefined && (el?.value || el?.values));
    }

    flattenArray(arr: any[]): any[] {
        return arr.reduce((flatArray, subArray) => {
            return flatArray.concat(subArray);
        }, []);
    }

    onCheckboxChange1(): void {
        this.checked1 = !this.checked1;
        this.disabled1 = !this.disabled1;
        if (this.disabled1) {
            this.queryFormGroup.controls['query1'].disable();
        } else {
            this.queryFormGroup.controls['query1'].enable();
        }
        this.queryFormGroup.updateValueAndValidity();
    }

    onCheckboxChange2(): void {
        this.checked2 = !this.checked2;
        this.disabled2 = !this.disabled2;
        if (this.disabled2) {
            this.queryFormGroup.controls['query2'].disable();
        } else {
            this.queryFormGroup.controls['query2'].enable();
        }
        this.queryFormGroup.updateValueAndValidity();
    }

    getAllsections1(): void {
        this.loading1 = true;
        this.householdService.getAllRespondentQuestions(EInterviewee.HOUSEHOLD).subscribe((res: any) => {
            this.loading1 = false;
            if (res.status) {
                this.sections1 = res.response;
            }
        });
    }

    getAllsections2(): void {
        this.loading2 = true;
        this.householdService.getAllRespondentQuestions(EInterviewee.PERSON).subscribe((res: any) => {
            this.loading2 = false;
            if (res.status) {
                this.sections2 = res.response;
            }
        });
    }

    onHeadCriteriasEvent(index: number, event: any): void {
        this.criterias1[index] = event;
    }

    onMemberCriteriasEvent(index: number, event: any): void {
        this.criterias2[index] = event;
    }

    expandCollapse1(): void {
        if (!this.allExpaned1) {
            this.accordion1.openAll();
            this.allExpaned1 = true;
        } else {
            this.accordion1.closeAll();
            this.allExpaned1 = false;
        }
    }

    expandCollapse2(): void {
        if (!this.allExpaned2) {
            this.accordion2.openAll();
            this.allExpaned2 = true;
        } else {
            this.accordion2.closeAll();
            this.allExpaned2 = false;
        }
    }

    onSetFilterEvent(evt: any): void {
        this.selectedFilter = evt.event;
    }

    onFileChange(evt: EFileType): void {
        this.selectedFileType = evt;
    }

    toggleConfirmModal(): void {
        const criterias1 = this.mormalizedCriteria(this.criterias1);
        const criterias2 = this.mormalizedCriteria(this.criterias2);
        if (this.checked1 && criterias1?.length < 1) {
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe(res => {
                this.globalService.openFailureSnackBar(res)
            });
            return;
        }
        if (this.checked2 && criterias2?.length < 1) {
            this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe(res => {
                this.globalService.openFailureSnackBar(res)
            });
            return;
        }
        this.openConfirmModal = !this.openConfirmModal;
    }

    close(): void {
        this.openConfirmModal = false;
    }

    submit(): void {
        const criterias1 = this.mormalizedCriteria(this.criterias1);
        const criterias2 = this.mormalizedCriteria(this.criterias2);
        if (!this.fileName) {
            this.translationService.getInstantTranslations(this.snackBarMessages[2]).subscribe(res => {
                this.globalService.openFailureSnackBar(res)
            });
            return;
        }
        const req = {
            fileType: this.selectedFileType,
            reportType: 'TARGETING REPORT',
            reportName: this.fileName,
            jurisdictionLevel: this.selectedFilter.type || this.loggedInUser.jurisdiction,
            locationId: this.selectedFilter.id || this.loggedInUser.locationId,
            criteria: [...this.flattenArray(criterias1), ...this.flattenArray(criterias2)].map((el, i) => {
                return {
                    ...el,
                    value: el.inputType === 'DATE' || el.inputType === 'DATE_TIME' ? calculateAge(el.value) : el.value,
                };
            }),
        };
        this.isSubmitting = true;
        this.householdService.createTargetingReport(req).subscribe((res) => {
            this.isSubmitting = false;
            if (res.status) {
                this.globalService.openSuccessSnackBar(res.message);
                this.router.navigate(['/admin/reports']);
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    queryAutoSearch(): void {
        this.queryFormGroup.get('query1')?.valueChanges.subscribe((val) => {
            this.filterInput1 = val;
            if (val === '') {
                this.accordion1.closeAll();
                this.allExpaned1 = false;
            }
        });

        this.queryFormGroup.get('query2')?.valueChanges.subscribe((val) => {
            this.filterInput2 = val;
            if (val === '') {
                this.accordion2.closeAll();
                this.allExpaned2 = false;
            }
        });
    }
}
