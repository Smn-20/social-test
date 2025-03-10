import { Paginate, ResponseObject } from 'src/app/core/utils/reusable-functions';
import { RemoveUnderscorePipe } from '../../../core/pipes/remove-underscore.pipe';
import { initPaginate } from '../../../core/utils/reusable-functions';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { docTypes, jurOptions } from 'src/app/constants';
import { DataService } from 'src/app/core/services/data.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { UserService } from 'src/app/core/services/user.service';
import { EDocumentType, EJurisdiction, EState } from 'src/app/core/enums';
import { HouseholdService } from 'src/app/core/services/household.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { InstitutionService } from 'src/app/core/services/institution.service';

@Component({
    selector: 'app-create-user',
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.css'],
})
export class CreateUserComponent implements OnInit {
    userFormGroup: FormGroup;
    roles!: any[];
    limit!: EJurisdiction;
    hasFetched = false;
    fetchedUser: any;
    fetchedStatus: any;
    selectedLocation!: string;
    isSaving = false;
    docTypes: any[] = [];
    jurOptions: any[] = [];
    householdsLoading = false;
    households!: any[];
    selectedhouseholdIds: { [key: string]: any } = {};
    pagination: Paginate = initPaginate(1, 10);
    totalHouseholds = 0;
    institutionsLoading = false;
    institutions = [];
    public EState = EState;

    private documentNumberValidators = [Validators.required];

    snackBarMessages: string[] = ['provideValidIDNumber', 'fillAllRequiredFields', 'userCreatedSuccess']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        public dialogRef: MatDialogRef<CreateUserComponent>,
        public fb: FormBuilder,
        private dataService: DataService,
        private userService: UserService,
        private golabService: GlobalService,
        private removeUnderscore: RemoveUnderscorePipe,
        private householdService: HouseholdService,
        private translationService: TranslationService,
        private institutionService: InstitutionService
    ) {
        this.initTranslatable();
        this.userFormGroup = this.fb.group({
            documentType: [EDocumentType.NATIONAL_ID, Validators.required],
            documentNumber: ['', this.documentNumberValidators],
            jurisdiction: [null, Validators.required],
            emailAddress: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
            roleId: [null, Validators.required],
            institutionId: [null, Validators.required],
            jobTitle: [null, Validators.required],
        });
    }

    get formControls() {
        return this.userFormGroup.controls;
    }

    get EJurisdiction() {
        return EJurisdiction;
    }

    get EDocumentType() {
        return EDocumentType;
    }

    get isParasocial() {
        const foundRole = this.roles?.find((el) => this.formControls['roleId']?.value?.includes(el.id));
        return (
            this.formControls['jurisdiction']?.value !== EJurisdiction.NATIONAL &&
            this.selectedLocation &&
            foundRole?.roleName === 'Parasocial'
        );
    }

    ngOnInit(): void {
        this.docNumberAutoFetch();
        this.getRoles();
        this.getAllInstitutions();

        this.userFormGroup.get('documentType')?.valueChanges.subscribe((value) => {
            if (value === EDocumentType.NATIONAL_ID) {
                this.userFormGroup
                    .get('documentNumber')
                    ?.setValidators(
                        this.documentNumberValidators.concat(Validators.minLength(16), Validators.maxLength(16))
                    );
            }
            if (value === EDocumentType.NIN) {
                this.userFormGroup
                    .get('documentNumber')
                    ?.setValidators(
                        this.documentNumberValidators.concat(Validators.minLength(12), Validators.maxLength(12))
                    );
            }
            if (value === EDocumentType.CHILD_ID) {
                this.userFormGroup
                    .get('documentNumber')
                    ?.setValidators(
                        this.documentNumberValidators.concat(Validators.minLength(8), Validators.maxLength(8))
                    );
            }
        });
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.docTypes = this.translationService.translateArray(docTypes, res.docTypes);
            this.jurOptions = this.translationService.translateArray(jurOptions, res.jurOptions);
        });
    }

    getRoles(): void {
        this.dataService.getRoles(initPaginate(1, 1000)).subscribe((res: any) => {
            if (res.status) {
                this.roles = this.filterActiveRole(res.response.roles);
            }
        });
    }

    filterActiveRole(roles: any[]): any[] {
        return roles
            .filter((role: any) => role.state === EState.ACTIVE)
            .map((role: any) => ({ roleName: this.removeUnderscore.transform(role.roleName), id: role.id }));
    }

    docNumberAutoFetch(): void {
        this.userFormGroup.get('documentNumber')?.valueChanges.pipe();

        this.userFormGroup
            .get('documentNumber')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                this.hasFetched = false;
                const documentType = this.formControls['documentType'].value;
                if (documentType === EDocumentType.NATIONAL_ID && val?.length === 16) {
                    this.getUserInfo(val);
                }
                if (documentType === EDocumentType.CHILD_ID && val?.length === 8) {
                    this.getUserInfo(val);
                }
                if (documentType === EDocumentType.NIN && val?.length === 12) {
                    this.getUserInfo(val);
                }
            });
    }

    getUserInfo(id: string): void {
        this.hasFetched = true;
        this.dataService.getExternalRecord(id).subscribe((res: any) => {
            this.fetchedStatus = res.status;
            if (res.status) {
                this.hasFetched = false;
                this.fetchedUser = res.response;
            } else {
                this.hasFetched = false;
                this.golabService.openFailureSnackBar(res.message);
            }
        });
    }

    createUser(): void {
        if (!this.fetchedUser) {
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                this.golabService.openFailureSnackBar(res);
            });
            return;
        }

        if (this.userFormGroup.invalid && this.fetchedUser) {
            this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
                this.golabService.openFailureSnackBar(res);
            });
            return;
        }
        this.isSaving = true;
        const locationId =
            this.formControls['jurisdiction'].value === EJurisdiction.NATIONAL
                ? 'c3e60701-2227-4568-b899-e38b8a43413f'
                : this.selectedLocation;

        const user = {
            firstName: this.fetchedUser.foreName,
            lastName: this.fetchedUser.surnames,
            documentType: this.formControls['documentType'].value,
            nationalId: this.formControls['documentNumber'].value,
            email: this.formControls['emailAddress'].value,
            jurisdiction: this.formControls['jurisdiction'].value,
            phoneNumber: this.formControls['phoneNumber'].value,
            roleId: this.formControls['roleId'].value,
            locationId,
            picture: this.fetchedUser.photo,
            households: Object.keys(this.selectedhouseholdIds) || null,
            jobTitle: this.formControls['jobTitle'].value,
            institutionId: this.formControls['institutionId'].value,
        };

        this.userService.createUser(user).subscribe((res: any) => {
            this.isSaving = false;
            if (res.status) {
                this.dialogRef.close();
                this.translationService.getInstantTranslations(this.snackBarMessages[2]).subscribe((res) => {
                    this.golabService.openSuccessSnackBar(res);
                });
            } else {
                this.golabService.openFailureSnackBar(res.message);
            }
        });
    }

    getAllInstitutions() {
        this.institutionsLoading = true;
        this.institutionService.filterInstittutions().subscribe((res: any) => {
            this.institutionsLoading = false;
            if (res?.status) {
                this.institutions = res.response.filter((item: any) => item.status === 'ACTIVE');
            }
        });
    }

    receiveJurisdiction(e: any): void {
        this.limit = e?.value;
    }

    receiveLocation(e: any): void {
        if (this.limit === e.type) {
            this.selectedLocation = e.id;
            if (this.isParasocial) {
                this.getHouseholds();
            }
        }
    }

    onHouseholdChange(evt: any, index: any): void {
        if (!this.selectedhouseholdIds || this.selectedhouseholdIds[evt.id] !== index) {
            this.selectedhouseholdIds[evt.id] = index;
        } else {
            delete this.selectedhouseholdIds[evt.id];
        }
    }

    getHouseholds(): void {
        this.householdsLoading = true;
        this.householdService
            .getHouseholds(this.formControls['jurisdiction'].value, this.selectedLocation, this.pagination, '', '', '')
            .subscribe((res: ResponseObject<any>) => {
                this.householdsLoading = false;
                if (res.status) {
                    this.households = res.response?.households;
                    this.totalHouseholds = res.response.totalElements;
                    this.pagination.page = res.response.currentPage;
                } else {
                    this.households = [];
                    this.golabService.openFailureSnackBar(res.message);
                }
            });
    }

    roleChange(evt: any): void {
        const found = evt.find((el: any) => el.roleName === 'Parasocial');
        if (found?.id) {
            this.limit = EJurisdiction.CELL;
            this.formControls['jurisdiction'].setValue(EJurisdiction.CELL);
            this.formControls['roleId'].setValue([found?.id]);
        } else {
            this.formControls['jurisdiction'].setValue(null);
        }
    }

    onPageChange(event: any): void {
        this.pagination.page = event.pageIndex + 1;
        this.getHouseholds();
    }
}
