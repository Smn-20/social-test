import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { permTypes } from 'src/app/constants';
import { EPermission, EState } from 'src/app/core/enums';
import { DataService } from 'src/app/core/services/data.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { EPerm, permissionTitles, permissionsMatrixData } from '../../../core/utils/reusable-arrays';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-role-detail',
    templateUrl: './role-detail.component.html',
    styleUrls: ['./role-detail.component.css'],
})
export class RoleDetailComponent implements OnInit {
    @Input() roleId = '';
    @Output() shouldRefresh = new EventEmitter<any>(false);
    id = '';
    permissionsMatrix: EPerm[][] = permissionsMatrixData;
    titles = permissionTitles;
    selectedPermissions: string[] = [];
    roleFormGroup: FormGroup;
    errorMessage = '';
    openEditRoleForm = false;
    isDisabling = false;
    isDeleting = false;
    openDeleteConfirmModal = false;
    role: any;
    permTypes = permTypes;
    public EPermission = EPermission;

    toggleEditRoleForm() {
        this.openEditRoleForm = !this.openEditRoleForm;
    }

    snackBarMessages: string[] = ['roleEnabledSuccess', 'roleDisabledSuccess', 'roleDeletedSuccess']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        public fb: FormBuilder,
        public dataService: DataService,
        private globalService: GlobalService,
        private translationService: TranslationService
    ) {
        this.roleFormGroup = this.fb.group({
            roleName: ['', Validators.required],
            description: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        const id = this.roleId;
        if (id) {
            this.dataService.getRoleById(id).subscribe((res: any) => {
                const role = res.response;
                this.role = role;
                this.formControls['roleName'].setValue(role.roleName);
                this.formControls['description'].setValue(role.description);
                this.selectedPermissions = role.permissions?.map((p: any) => p.name);
            });
        }
    }

    get formControls() {
        return this.roleFormGroup.controls;
    }

    get EState() {
        return EState;
    }

    toggleDeleteConfirmModal() {
        this.openDeleteConfirmModal = !this.openDeleteConfirmModal;
    }

    onPermissionChange(event: any): void {
        const value = (event.target as HTMLInputElement).value;
        const index = this.selectedPermissions.indexOf(value);

        if (index !== -1) {
            this.selectedPermissions.splice(index, 1);
        } else {
            this.selectedPermissions.push(value);
        }
    }

    isChecked(arr: string[], value: string): boolean {
        return arr.includes(value);
    }

    enableRole() {
        this.isDisabling = true;
        this.dataService.activateRole(this.roleId).subscribe((res) => {
            if (res.status) {
                this.isDisabling = false;
                this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                    this.globalService.openSuccessSnackBar(res);
                });
                this.shouldRefresh.emit(true);
            } else {
                this.isDisabling = false;
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    disableRole() {
        this.isDisabling = true;
        this.dataService.deactivateRole(this.roleId).subscribe((res) => {
            if (res.status) {
                this.isDisabling = false;
                this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
                    this.globalService.openSuccessSnackBar(res);
                });
                this.shouldRefresh.emit(true);
            } else {
                this.isDisabling = false;
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    deleteRole() {
        this.isDeleting = true;
        this.dataService.deleteRole(this.roleId).subscribe((res) => {
            if (res.status) {
                this.isDeleting = false;
                this.translationService.getInstantTranslations(this.snackBarMessages[2]).subscribe((res) => {
                    this.globalService.openSuccessSnackBar(res);
                });
                this.shouldRefresh.emit(true);
            } else {
                this.isDeleting = false;
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }
}
