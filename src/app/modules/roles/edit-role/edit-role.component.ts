import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { permTypes } from 'src/app/constants';
import { EPermission } from 'src/app/core/enums';
import { AuthService } from 'src/app/core/services/auth.service';
import { DataService } from 'src/app/core/services/data.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { EventService } from '../../../core/services/event.service';
import { EPerm, permissionTitles, permissionsMatrixData } from '../../../core/utils/reusable-arrays';

@Component({
    selector: 'app-edit-role',
    templateUrl: './edit-role.component.html',
    styleUrls: ['./edit-role.component.css'],
})
export class EditRoleComponent implements OnInit {
    @Input() roleId = '';
    id = '';
    permissionsMatrix: EPerm[][] = permissionsMatrixData;
    titles = permissionTitles;
    selectedPermissions: string[] = [];
    roleFormGroup: FormGroup;
    errorMessage = '';
    openEditRoleForm = false;
    permTypes = permTypes;
    allSelected = {
        value: '',
        isSelected: false,
    };
    isUpdating = false;
    today = new Date().toISOString().split('T')[0];
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    selectedRole!: any;

    toggleEditRoleForm() {
        this.openEditRoleForm = !this.openEditRoleForm;
    }

    snackBarMessages: string[] = ['fillAllRequiredFields', 'roleUpdatedSuccessNeedToLogout', 'roleUpdatedSuccess']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        public fb: FormBuilder,
        public dataService: DataService,
        private globalService: GlobalService,
        private authService: AuthService,
        private eventService: EventService,
        private translationService: TranslationService
    ) {
        this.roleFormGroup = this.fb.group({
            roleName: ['', Validators.required],
            description: ['', Validators.required],
            validityPeriod: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        const id = this.roleId;
        if (id) {
            this.dataService.getRoleById(id).subscribe((res: any) => {
                const role = res.response;
                this.selectedRole = role;
                this.formControls['roleName'].setValue(role.roleName);
                this.formControls['description'].setValue(role.description);
                this.formControls['validityPeriod'].setValue(role.validityPeriod);
                this.selectedPermissions = role.permissions?.map((p: any) => p.name);
            });
        }
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
                        if (!this.selectedPermissions.includes(permission)) {
                            this.selectedPermissions.push(permission);
                        }
                    }
                });
            });
        } else {
            this.selectedPermissions = this.selectedPermissions.filter(
                (permission) => !permission.startsWith(selectedValue)
            );
        }
    }

    onPermissionChange(event: any): void {
        const value = (event.target as HTMLInputElement).value;
        const index = this.selectedPermissions.indexOf(value);

        if (index !== -1) {
            this.selectedPermissions.splice(index, 1);
        } else {
            if (!value.startsWith('VIEW')) {
                this.selectedPermissions.push(value);
                const viewValue = this.addView(value);
                if (!this.selectedPermissions.includes(viewValue)) {
                    this.selectedPermissions.push(this.addView(value));
                }
            } else {
                this.selectedPermissions.push(value);
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

    isViewChecked(permission: EPermission): boolean {
        return this.selectedPermissions.some((element) => (element === permission ? true : false));
    }

    updateRole(): void {
        if (this.roleFormGroup.invalid) {
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                this.globalService.openFailureSnackBar(res);
            });
            this.roleFormGroup.markAsDirty();
            return;
        }

        this.isUpdating = true;
        const role = {
            ...this.roleFormGroup.value,
            id: this.roleId,
            permissions: this.selectedPermissions,
        };

        this.dataService.updateRole(role).subscribe((res: any) => {
            this.isUpdating = false;
            if (res.status) {
                if (
                    this.loggedInUser?.roles.includes(this.selectedRole?.roleName) &&
                    this.selectedPermissions?.length !== this.loggedInUser?.permissions?.length
                ) {
                    this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
                        this.globalService.openSuccessSnackBar(res);
                    });
                    this.authService.logout();
                } else {
                    this.translationService.getInstantTranslations(this.snackBarMessages[2]).subscribe((res) => {
                        this.globalService.openSuccessSnackBar(res);
                    });
                    this.eventService.onActionFinished('roles');
                }
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    isChecked(arr: string[], value: string): boolean {
        return arr.includes(value);
    }
}
