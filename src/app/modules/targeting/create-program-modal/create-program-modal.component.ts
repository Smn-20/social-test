import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-program-modal',
    templateUrl: './create-program-modal.component.html',
    styleUrls: ['./create-program-modal.component.css'],
})
export class CreateProgramModalComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<CreateProgramModalComponent>,
        private router: Router
    ) {}

    close(): void {
        this.dialogRef.close();
    }

    save(evt: any): void {
        localStorage.setItem('new-program', JSON.stringify(evt));
        this.router.navigate(['/admin/targeting/programs/new-program']);
        this.close();
    }
}
