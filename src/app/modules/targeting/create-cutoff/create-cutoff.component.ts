import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventService } from 'src/app/core/services/event.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { scoreTypes } from 'src/app/core/utils/reusable-arrays';
import { EScoreType } from 'src/app/core/enums';

import { dataTypes } from '../../../core/utils/reusable-arrays';
import { EDataType } from '../../../core/enums/operations.enum';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-create-cutoff',
    templateUrl: './create-cutoff.component.html',
    styleUrls: ['./create-cutoff.component.css'],
})
export class CreateCutoffComponent implements OnInit {
    cutoffFormGroup!: FormGroup;
    loading = false;
    scoreTypes: any[] = [];
    dataTypes: any[] = [];
    surveys!: any[];
    selectedScoreType!: EScoreType;
    selectedDataType!: EDataType;
    public EDataType = EDataType;
    public EScoreType = EScoreType;

    snackBarMessages: string[] = ['fillAllRequiredFields']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<CreateCutoffComponent>,
        public fb: FormBuilder,
        private golabService: GlobalService,
        private householdService: HouseholdService,
        private eventService: EventService,
        public translationService: TranslationService
    ) {
        this.initTranslatable();
        this.cutoffFormGroup = this.fb.group({
            cutoffName: [null, Validators.required],
            scoreType: [null, Validators.required],
            dataType: [null, Validators.required],
        });
    }

    get formControls() {
        return this.cutoffFormGroup.controls;
    }

    ngOnInit(): void {
        if (this.data?.id) {
            this.cutoffFormGroup.controls['cutoffName'].setValue(this.data.cutoffName);
            this.cutoffFormGroup.controls['scoreType'].setValue(this.data.scoreType);
            this.cutoffFormGroup.controls['dataType'].setValue(this.data.dataType);
            this.onScoreChange({ value: this.data.scoreType });
            this.onDataTypes({ value: this.data.dataType });
            setTimeout(() => {
                this.cutoffFormGroup.controls['max']?.setValue(this.data.maxScore);
                this.cutoffFormGroup.controls['min']?.setValue(this.data.minScore);
                this.cutoffFormGroup.controls['number']?.setValue(this.data.maxScore);
            }, 100);
        }
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.scoreTypes = this.translationService.translateArray(scoreTypes, res.scoreTypes);
            this.dataTypes = this.translationService.translateArray(dataTypes, res.dataTypes);
        });
    }

    close(): void {
        this.dialogRef.close();
    }

    createCutOff(): void {
        if (this.cutoffFormGroup?.invalid) {
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                this.golabService.openFailureSnackBar(res);
            });
            return;
        }
        this.loading = true;
        const selectedDataType = this.formControls['dataType'].value;
        const selectedScoreType = this.formControls['scoreType'].value;
        const request = {
            cutoffName: this.formControls['cutoffName'].value,
            scoreType: this.formControls['scoreType'].value,
            dataType: this.formControls['dataType'].value,
            min:
                selectedScoreType === EScoreType.PERCENTAGE &&
                (selectedDataType === EDataType.LESS || selectedDataType === EDataType.LESS_OR_EQUAL)
                    ? 0
                    : parseInt(this.formControls['min']?.value) || parseInt(this.formControls['number']?.value) || 0,
            max:
                selectedScoreType === EScoreType.PERCENTAGE &&
                (selectedDataType === EDataType.GREATER || selectedDataType === EDataType.GREATER_OR_EQUAL)
                    ? 100
                    : parseInt(this.formControls['max']?.value) || parseInt(this.formControls['number']?.value) || 0,
            minValueInclusive: selectedDataType === EDataType.LESS,
            maxValueInclusive: selectedDataType === EDataType.GREATER,
        };

        if (this.data?.id) {
            this.householdService.updateCutOff(this.data.id, request).subscribe((res) => {
                this.processResponse(res);
            });
        } else {
            this.householdService.createCutOff(request).subscribe((res) => {
                this.processResponse(res);
            });
        }
    }

    processResponse(res: any): void {
        this.loading = false;
        if (res) {
            this.golabService.openSuccessSnackBar(res.message);
            this.cutoffFormGroup.reset();
            this.eventService.onActionFinished('cutoffs');
            this.dialogRef.close();
        }
    }

    onScoreChange(evt: any): void {
        this.selectedScoreType = evt.value;
        if (evt.value === EScoreType.PERCENTAGE) {
            this.selectedDataType = EDataType.RANGE;
            this.cutoffFormGroup.controls['dataType'].setValue(EDataType.RANGE);
            this.cutoffFormGroup.addControl('min', new FormControl(null, [Validators.required]));
            this.cutoffFormGroup.addControl('max', new FormControl(null, [Validators.required]));
            setTimeout(() => {
                this.cutoffFormGroup.controls['min'].setValue(0);
                this.cutoffFormGroup.controls['max'].setValue(100);
            }, 0);
        } else {
            this.selectedDataType = undefined as unknown as EDataType;
            this.cutoffFormGroup.controls['dataType'].reset();
            this.cutoffFormGroup.removeControl('min');
            this.cutoffFormGroup.removeControl('max');
        }
    }

    onDataTypes(evt: any): void {
        this.selectedDataType = evt.value;
        if (evt?.value === EDataType.RANGE) {
            this.cutoffFormGroup.addControl('min', new FormControl(null, [Validators.required]));
            this.cutoffFormGroup.addControl('max', new FormControl(null, [Validators.required]));
            this.cutoffFormGroup.removeControl('number');
            if (this.selectedScoreType === EScoreType.PERCENTAGE) {
                this.cutoffFormGroup.controls['min'].setValue(0);
                this.cutoffFormGroup.controls['max'].setValue(100);
            }
        } else {
            this.cutoffFormGroup.addControl('number', new FormControl(null, [Validators.required]));
            this.cutoffFormGroup.removeControl('min');
            this.cutoffFormGroup.removeControl('min');
        }
    }
}
