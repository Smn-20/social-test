import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { generateRandomUniqueId } from 'src/app/core/utils/reusable-functions';

@Component({
  selector: 'app-revamped-criteria-creation-modal',
  templateUrl: './revamped-criteria-creation-modal.component.html',
  styleUrls: ['./revamped-criteria-creation-modal.component.css']
})
export class RevampedCriteriaCreationModalComponent {
  criteriaFormGroup!: FormGroup;
  appliesCategories = [
    { value: 'HOUSEHOLDS', label: 'HOUSEHOLDS' },
    { value: 'HOUSEHOLD_HEADS', label: 'HOUSEHOLD_HEADS' },
    { value: 'HOUSEHOLDS_MEMBERS', label: 'HOUSEHOLDS_MEMBERS' },
  ];
  mustMeetCategories = [
    { value: 'ALL', label: 'ALL' },
    { value: 'AT_LEAST_ONE', label: 'AT_LEAST_ONE' },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<RevampedCriteriaCreationModalComponent>,
    public fb: FormBuilder,
  ) {
    this.criteriaFormGroup = this.fb.group({
      criteriaStatement: [null, Validators.required],
      appliesTo: [null, Validators.required],
      mustMeet: [null, Validators.required],
    });
  }

  get formControls() {
    return this.criteriaFormGroup.controls;
  }

  close(isCancelled: boolean): void {
    if (!isCancelled) {
      if (this.criteriaFormGroup.invalid) {
        this.criteriaFormGroup.markAsDirty();
        this.criteriaFormGroup.markAllAsTouched();
        return;
      }
    }
    this.dialogRef.close(!isCancelled ? {
      criteria_id: generateRandomUniqueId(12),
      criteria_statement: this.formControls['criteriaStatement']?.value,
      applies_to: this.formControls['appliesTo']?.value,
      must_meet: this.formControls['mustMeet']?.value,
      conditions: []
    } : null);
  }
}
