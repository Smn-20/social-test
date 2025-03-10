import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/core/services/global.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { operationsType } from 'src/app/core/utils/reusable-arrays';
import { EOperations } from 'src/app/core/enums';

@Component({
    selector: 'app-create-target-group',
    templateUrl: './create-target-group.component.html',
    styleUrls: ['./create-target-group.component.css'],
})
export class CreateTargetGroupComponent implements OnInit {
    @Output() targetGroupEvent = new EventEmitter<any>();
    @Output() targetGroupUpdateEvent = new EventEmitter<any>();
    @Output() cancelEvent = new EventEmitter<any>();
    @Input() targetGroup: any;
    @Input() criteria: any;
    @Input() hideCancel = false;
    targetGroupFormGroup!: FormGroup;
    openEditingMode = false;
    operations: any[] = [];
    public EOperations = EOperations;

    snackBarMessages: string [] = ['fillAllRequiredFields']   // snackbar messages to be translated --> PLEASE do NOT modify the array values 

    constructor(
        public fb: FormBuilder,
        private golabService: GlobalService,
        public translationService: TranslationService
    ) {
        this.initTranslatable();

        this.targetGroupFormGroup = this.fb.group({
            name: [null, Validators.required],
            members: [null, Validators.required],
            operation: [null, Validators.required],
        });
    }
    ngOnInit(): void {
        if (this.targetGroup?.name) {
            this.targetGroupFormGroup.controls['name'].setValue(this.targetGroup.name);
            this.targetGroupFormGroup.controls['members'].setValue(this.targetGroup.numberOfMembers);
            this.targetGroupFormGroup.controls['operation'].setValue(this.targetGroup.operation);
        }
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.operations = this.translationService.translateArray(operationsType, res.operations);
        });
    }

    get formControls() {
        return this.targetGroupFormGroup.controls;
    }

    addTargetProgram(): void {
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
            numberOfMembers: this.formControls['members']?.value,
            operation: this.formControls['operation']?.value,
            matchAllCategories: false,
        };
        if (this.targetGroup?.name) {
            this.targetGroupUpdateEvent.emit({ ...this.targetGroup, ...obj });
        } else {
            this.targetGroupEvent.emit(obj);
        }

        this.targetGroupFormGroup.controls['name'].reset();
        this.targetGroupFormGroup.controls['members'].reset();
        this.targetGroupFormGroup.controls['operation'].reset();
    }

    close(): void {
        this.cancelEvent.emit();
    }
}
