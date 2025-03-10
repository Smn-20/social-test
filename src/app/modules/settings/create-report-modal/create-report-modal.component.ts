import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-create-report-modal',
    templateUrl: './create-report-modal.component.html',
    styleUrls: ['./create-report-modal.component.css'],
})
export class CreateReportModalComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<CreateReportModalComponent>
    ) {}

    close(): void {
        this.dialogRef.close();
    }

    save(evt: any): void {}
}
