import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/core/services/global.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { operationsType } from 'src/app/core/utils/reusable-arrays';
import { EOperations } from 'src/app/core/enums';

@Component({
    selector: 'app-create-target-group-category',
    templateUrl: './create-target-group-category.component.html',
    styleUrls: ['./create-target-group-category.component.css'],
})
export class CreateTargetGroupCategoryComponent implements OnInit {
    @Output() targetGroupCategoryEvent = new EventEmitter<any>();
    @Output() targetGroupCategoryUpdateEvent = new EventEmitter<any>();
    @Output() cancelEvent = new EventEmitter<any>();
    @Input() targetGroupCategory: any;
    @Input() hideCancel = false;
    targetGroupFormGroup!: FormGroup;
    openEditingMode = false;
    operations: any[] = [];
    public EOperations = EOperations;

    snackBarMessages: string [] = ['fillAllRequiredFields']   // snackbar messages to be translated --> PLEASE do NOT modify the array values 

    constructor(
        public fb: FormBuilder,
        private golabService: GlobalService,
        private translationService: TranslationService
    ) {
        this.targetGroupFormGroup = this.fb.group({
            name: [null, Validators.required],
            members: [null],
            operation: [null],
            matchAllMembers: [false],
        });
    }
    ngOnInit(): void {
        this.initTranslatable();
        if (this.targetGroupCategory?.name) {
            this.targetGroupFormGroup.controls['name'].setValue(this.targetGroupCategory.name);
            this.targetGroupFormGroup.controls['members']?.setValue(this.targetGroupCategory.numberOfMembers),
                this.targetGroupFormGroup.controls['operation']?.setValue(this.targetGroupCategory.operation),
                this.targetGroupFormGroup.controls['matchAllMembers']?.setValue(
                    this.targetGroupCategory.matchAllMembers
                );
        }
    }

    get formControls() {
        return this.targetGroupFormGroup.controls;
    }

    addTargetGroupCategory(): void {
        if (this.targetGroupFormGroup.invalid) {
            this.targetGroupFormGroup.markAsDirty();
            this.targetGroupFormGroup.markAllAsTouched();
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe(res => {
                this.golabService.openFailureSnackBar(res)
            });
            return;
        }

        const obj = {
            name: this.formControls['name']?.value,
            ...(!this.formControls['matchAllMembers']?.value && {
                numberOfMembers: this.formControls['members']?.value,
                operation: this.formControls['operation']?.value,
            }),
            matchAllCategories: false,
            matchAllMembers: this.formControls['matchAllMembers']?.value,
        };
        if (this.targetGroupCategory?.name) {
            this.targetGroupCategoryUpdateEvent.emit({ ...this.targetGroupCategory, ...obj });
        } else {
            this.targetGroupCategoryEvent.emit(obj);
        }
        // this.cancelEvent.emit();
        this.targetGroupFormGroup.controls['name'].reset();
        this.targetGroupFormGroup.controls['members'].reset();
        this.targetGroupFormGroup.controls['operation'].reset();
        this.targetGroupFormGroup.controls['matchAllMembers'].reset();
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.operations = this.translationService.translateArray(operationsType, res.operations);
        });
    }

    close(): void {
        this.cancelEvent.emit();
    }
}
