import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from 'src/app/core/services/event.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { removeIndex } from 'src/app/core/utils/reusable-functions';
import { EPermission } from 'src/app/core/enums';

@Component({
    selector: 'app-create-report-type',
    templateUrl: './create-report-type.component.html',
    styleUrls: ['./create-report-type.component.css'],
})
export class CreateReportTypeComponent implements OnInit {
    @Input() reportModel: any;
    @Input() showForm = true;
    @Input() editable = false;
    @Output() closeEvent = new EventEmitter();
    @Output() editingEvent = new EventEmitter();
    reportModelForm!: FormGroup;
    headers: string[] = [];
    editingForm = 0;
    loading = false;
    public EPermission = EPermission

    snackBarMessages: string [] = ['fillAllRequiredFields']   // snackbar messages to be translated --> PLEASE do NOT modify the array values 


    constructor(
        private fb: FormBuilder,
        private householdService: HouseholdService,
        private globalService: GlobalService,
        private eventService: EventService,
        private translationService: TranslationService
    ) {
        this.reportModelForm = this.fb.group({
            reportType: [null, [Validators.required]],
            description: [null, [Validators.required]],
            query: [null],
            queryWithFilters: [null],
        });
    }

    get formControls() {
        return this.reportModelForm.controls;
    }

    trackByFn(index: number, item: any) {
        return index;
    }

    ngOnInit() {
        this.initUpdate();
    }

    initUpdate(): void {
        if (this.reportModel?.reportType) {
            this.reportModelForm.controls['reportType'].setValue(this.reportModel.reportType);
            this.reportModelForm.controls['description'].setValue(this.reportModel.description);
            this.reportModelForm.controls['query'].setValue(this.reportModel.query);
            this.reportModelForm.controls['queryWithFilters'].setValue(this.reportModel.queryWithFilters);

            const headers = this.reportModel.headers.split(',');

            if (headers.length > 0) {
                headers.forEach((el: string) => {
                    this.headers.push(el);
                });
            }
        } else {
            if (this.showForm) {
                this.toggleShowNewHeaderForm();
            }
        }
    }

    toggleShowForm(): void {
        if (!this.editable) {
            return;
        }
        this.showForm = !this.showForm;
        this.editEvent();
    }

    toggleShowNewHeaderForm(): void {
        this.headers.push('');
        this.formIsEditing(this.headers.length + 1);
    }

    formIsEditing(index: number): void {
        this.editingForm = index;
    }

    remove(index: number): void {
        this.headers = removeIndex(this.headers, index);
    }

    close(): void {
        this.closeEvent.emit();
    }

    editEvent(): void {
        this.editingEvent.emit(this.showForm);
    }

    submit(): void {
        if (this.reportModelForm?.invalid) {
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe(res => {
                this.globalService.openFailureSnackBar(res)
            });
            this.reportModelForm.markAllAsTouched();
            return;
        }
        this.loading = true;
        const req = {
            ...(this.reportModel?.id && this.reportModel),
            reportType: this.reportModelForm.controls['reportType'].value,
            description: this.reportModelForm.controls['description'].value,
            query: this.reportModelForm.controls['query'].value,
            queryWithFilters: this.reportModelForm.controls['queryWithFilters'].value,
            headers: this.formatStringArray(this.headers),
        };

        if (this.reportModel?.id) {
            this.householdService.updateTargetingReportModel(this.reportModel?.id, req).subscribe((res) => {
                this.processRes(res);
            });
        } else {
            this.householdService.createTargetingReportModel(req).subscribe((res) => {
                this.processRes(res);
            });
        }
    }

    processRes(res: any): void {
        this.loading = false;
        if (res?.status) {
            this.globalService.openSuccessSnackBar(res?.message);
            this.eventService.onActionFinished('report-models');
            this.close();
        } else {
            this.globalService.openFailureSnackBar(res?.message);
        }
    }

    formatStringArray(arr: string[]): string {
        const formattedString = arr.join(', ');

        // Remove the last comma if it exists
        if (formattedString.endsWith(', ')) {
            return formattedString.slice(0, -2);
        } else {
            return formattedString;
        }
    }
}
