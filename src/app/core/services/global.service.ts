import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { formatMessage } from '../utils/reusable-functions';

@Injectable({
    providedIn: 'root',
})
export class GlobalService {
    constructor(private snackBar: MatSnackBar) {}

    openSuccessSnackBar(message: string) {
        this.snackBar.open(message, 'Close', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 5000,
            panelClass: ['green-snackbar'],
        });
    }

    openFailureSnackBar(message: string) {
        const msg = formatMessage(message);
        this.snackBar.open(msg, 'Close', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 7000,
            panelClass: ['red-snackbar'],
        });
    }
}
