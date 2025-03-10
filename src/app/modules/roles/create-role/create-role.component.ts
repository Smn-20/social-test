import { EventService } from '../../../core/services/event.service';
import { EPerm, permissionTitles, permissionsMatrixData } from '../../../core/utils/reusable-arrays';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { EPermission } from 'src/app/core/enums';
import { GlobalService } from 'src/app/core/services/global.service';
import { MatDialogRef } from '@angular/material/dialog';
import { permTypes } from 'src/app/constants';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-create-role',
    templateUrl: './create-role.component.html',
    styleUrls: ['./create-role.component.css'],
})
export class CreateRoleComponent {
    permissionsMatrix: EPerm[][] = permissionsMatrixData;
    titles = permissionTitles;
    permissions: string[] = [];
    roleFormGroup: FormGroup;
    errorMessage!: string;
    permTypes = permTypes;
    allSelected = {
        value: '',
        isSelected: false,
    };
    today = new Date().toISOString().split('T')[0];

    snackBarMessages: string[] = ['roleCreatedSuccess']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        public fb: FormBuilder,
        public dataService: DataService,
        private globalService: GlobalService,
        public router: Router,
        public dialogRef: MatDialogRef<CreateRoleComponent>,
        private eventService: EventService,
        private translationService: TranslationService
    ) {
        this.roleFormGroup = this.fb.group({
            roleName: ['', Validators.required],
            description: ['', Validators.required],
            validityPeriod: ['', Validators.required],
        });
    }

    get formControls() {
        return this.roleFormGroup.controls;
    }

    selectColumnPermission(event: any): void {
        const selectedValue = (event.target as HTMLInputElement).value;
        const isChecked = (event.target as HTMLInputElement).checked;

        if (isChecked) {
            permissionsMatrixData.forEach((permissionRow) => {
                permissionRow.forEach((permission) => {
                    if (permission && permission.startsWith(selectedValue)) {
                        if (!this.permissions.includes(permission)) {
                            this.permissions.push(permission);
                        }
                    }
                });
            });
        } else {
            this.permissions = this.permissions.filter((permission) => !permission.startsWith(selectedValue));
        }
    }

    onPermissionChange(event: any): void {
        const value = (event.target as HTMLInputElement).value;
        const index = this.permissions.indexOf(value);

        if (index !== -1) {
            this.permissions.splice(index, 1);
        } else {
            if (!value.startsWith('VIEW')) {
                this.permissions.push(value);
                const viewValue = this.addView(value);
                if (!this.permissions.includes(viewValue)) {
                    this.permissions.push(this.addView(value));
                }
            } else {
                this.permissions.push(value);
            }
        }
    }

    addView(permission: string) {
        // Find the index of the first underscore
        const underscoreIndex = permission.indexOf('_');
        if (underscoreIndex !== -1) {
            // Replace the substring before the underscore with the replacement string
            const newString = 'VIEW' + permission.slice(underscoreIndex);
            return newString;
        }
        // If no underscore is found, return the original string unchanged
        return permission;
    }

    isChecked(permission: EPermission): boolean {
        return this.permissions.some((element) => (element === permission ? true : false));
    }

    createRole(): void {
        if (this.roleFormGroup.invalid) {
            return;
        }

        // TODO: add description
        const role = {
            ...this.roleFormGroup.value,
            permissions: this.permissions,
        };

        this.dataService.createRole(role).subscribe((res: any) => {
            if (res.status) {
                this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                    this.globalService.openSuccessSnackBar(res);
                });
                this.dialogRef.close();
                this.eventService.onActionFinished('roles');
            } else {
                this.errorMessage = res.message;
                this.globalService.openFailureSnackBar(this.errorMessage);
            }
        });
    }
}
