import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-revamped-program-creation-modal',
    templateUrl: './revamped-program-creation-modal.component.html',
    styleUrls: ['./revamped-program-creation-modal.component.css']
})
export class RevampedProgramCreationModalComponent {
    masterProgramFormGroup!: FormGroup;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<RevampedProgramCreationModalComponent>,
        public fb: FormBuilder,
    ) {
        this.masterProgramFormGroup = this.fb.group({
            programName: [null, Validators.required],
            programDescription: [null, Validators.required],
        });
    }

    get formControls() {
        return this.masterProgramFormGroup.controls;
      }
    
    close(isCancelled: boolean): void {
        if (!isCancelled) {
            if (this.masterProgramFormGroup.invalid) {
                this.masterProgramFormGroup.markAsDirty();
                this.masterProgramFormGroup.markAllAsTouched();
                return;
            }
        }
        this.dialogRef.close(!isCancelled ? {
            programName: this.formControls['programName'],
            programDescription: this.formControls['programDescription']
        } : null);
    }
}
