import { Paginate, ResponseObject, populateHouseholdIds, compareObjects } from 'src/app/core/utils/reusable-functions';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { USER } from 'src/app/constants';
import { DataService } from 'src/app/core/services/data.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { UserService } from 'src/app/core/services/user.service';
import { initPaginate } from 'src/app/core/utils/reusable-functions';
import { EDocumentType, EJurisdiction, EState } from 'src/app/core/enums';
import { RemoveUnderscorePipe } from 'src/app/core/pipes/remove-underscore.pipe';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.css'],
})
export class EditUserComponent implements OnInit {
    docTypes: any[] = [
        {
            name: 'National ID',
            value: EDocumentType.NATIONAL_ID,
        },
        {
            name: 'Child ID',
            value: EDocumentType.CHILD_ID,
        },
        {
            name: 'NIN',
            value: EDocumentType.NIN,
        },
    ];
    jurOptions: any[] = [
        {
            name: 'National',
            value: EJurisdiction.NATIONAL,
        },
        {
            name: 'Province',
            value: EJurisdiction.PROVINCE,
        },
        {
            name: 'District',
            value: EJurisdiction.DISTRICT,
        },
        {
            name: 'Sector',
            value: EJurisdiction.SECTOR,
        },
        {
            name: 'Cell',
            value: EJurisdiction.CELL,
        },
        {
            name: 'Village',
            value: EJurisdiction.VILLAGE,
        },
    ];
    roles!: any[];
    selectedLocation!: string;
    limit!: EJurisdiction;
    userFormGroup: FormGroup;
    selectedProvince: any;
    selectedDistrict: any;
    selectedSector: any;
    selectedCell: any;
    selectedVillage: any;
    initiallySelectedhouseholdIds: { [key: string]: any } = {};
    selectedhouseholdIds: { [key: string]: any } = {};
    householdsLoading = false;
    totalHouseholds = 0;
    households!: any[];
    isUpdating = false;
    pagination: Paginate = initPaginate(1, 10);
    isFetchingUser = false;
    user: any;
    public EState = EState;
    @Input() userId: any;
    @Input() fetchedUser: any;
    @Output() shouldRefresh = new EventEmitter<any>(false);

    snackBarMessages: string[] = ['fillAllRequiredFields', 'userUpdateSuccess']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        private dataService: DataService,
        private userService: UserService,
        private fb: FormBuilder,
        private globalService: GlobalService,
        private removeUnderscore: RemoveUnderscorePipe,
        private householdService: HouseholdService,
        private translationService: TranslationService
    ) {
        this.initTranslatable();
        this.userFormGroup = this.fb.group({
            documentType: [null, Validators.required],
            documentNumber: ['', []],
            jurisdiction: [null, Validators.required],
            emailAddress: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
            roleId: [null, Validators.required],
        });
    }

    get isParasocial() {
        const foundRole = this.roles?.find((el) => this.formControls['roleId']?.value?.includes(el.id));
        return (
            this.formControls['jurisdiction']?.value !== EJurisdiction.NATIONAL &&
            this.selectedLocation &&
            foundRole?.roleName === 'Parasocial'
        );
    }

    get formControls() {
        return this.userFormGroup.controls;
    }

    get EJurisdiction() {
        return EJurisdiction;
    }

    get loggedInUserEmail(): string {
        const user = JSON.parse(localStorage.getItem(USER) as string);
        return user ? user.username : '';
    }

    ngOnInit(): void {
        this.getRoles();
        this.isFetchingUser = true;
        this.userService.getUserById(this.userId).subscribe((res: any) => {
            this.isFetchingUser = false;
            if (res.status) {
                const user = res.response;
                this.user = user;
                this.presetValues(user);

                this.dataService.getParentLocation(user.locationId, this.user.jurisdiction).subscribe((res: any) => {
                    this.isFetchingUser = false;
                    if (res.status) {
                        this.presetLocationValues(res.response);
                        if (this.isParasocial) {
                            this.getHouseholds(user.jurisdiction, user.locationId);
                        }
                    }
                });
            }
        });
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.jurOptions = this.translationService.translateArray(this.jurOptions, res.jurOptions);
            this.docTypes = this.translationService.translateArray(this.docTypes, res.docTypes);
        });
    }

    presetValues(user: any) {
        if (user.nationalId && user.nationalId.length === 16) {
            this.formControls['documentType'].setValue(EDocumentType.NATIONAL_ID);
            this.formControls['documentType'].disable();
        }

        if (user.nationalId && user.nationalId.length === 8) {
            this.formControls['documentType'].setValue(EDocumentType.CHILD_ID);
            this.formControls['documentType'].disable();
        }

        if (user.nationalId && user.nationalId.length === 10) {
            this.formControls['documentType'].setValue(EDocumentType.NIN);
            this.formControls['documentType'].disable();
        }

        this.limit = user.jurisdiction;
        this.selectedLocation = user.locationId;
        this.formControls['documentNumber'].setValue(user.nationalId);
        // this.formControls['documentNumber'].disable();
        this.formControls['jurisdiction'].setValue(user.jurisdiction);
        this.formControls['emailAddress'].setValue(user.email);
        this.formControls['phoneNumber'].setValue(user.phoneNumber);

        if (this.loggedInUserEmail === user.email) {
            this.formControls['jurisdiction'].disable();
            this.formControls['roleId'].disable();
        }
        const roles = user.roles?.map((r: any) => r.id);
        this.formControls['roleId'].setValue(roles);
    }

    presetLocationValues(location: any) {
        if (location.province) {
            this.selectedProvince = location.province.id;
        }
        if (location.district) {
            this.selectedDistrict = location.district.id;
        }
        if (location.sector) {
            this.selectedSector = location.sector.id;
        }
        if (location.cell) {
            this.selectedCell = location.cell.id;
        }
        if (location.villages) {
            this.selectedVillage = location.villages.id;
        }
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

    receiveJurisdiction(e: any): void {
        this.limit = e?.value;
    }

    receiveLocation(e: any): void {
        if (this.limit === e.type) {
            this.selectedLocation = e.id;
        }
    }

    onHouseholdChange(evt: any, index: any): void {
        if (!this.selectedhouseholdIds || this.selectedhouseholdIds[evt.id] !== index) {
            this.selectedhouseholdIds[evt.id] = index;
        } else {
            delete this.selectedhouseholdIds[evt.id];
        }
    }

    getHouseholds(jurisdiction: any, location: any): void {
        this.householdsLoading = true;
        this.householdService
            .getHouseholds(jurisdiction, location, this.pagination, '', '', '')
            .subscribe((res: ResponseObject<any>) => {
                this.householdsLoading = false;
                if (res.status) {
                    this.households = res.response?.households;
                    this.totalHouseholds = res.response.totalElements;
                    this.pagination.page = res.response.currentPage;
                    this.getParasocialHouseholdsIds(this.user.id);
                } else {
                    this.households = [];
                    this.globalService.openFailureSnackBar(res.message);
                }
            });
    }

    getParasocialHouseholdsIds(userId: string): void {
        this.householdService.getParasocialHouseholdsIds(userId).subscribe((res: ResponseObject<any>) => {
            if (res.status) {
                this.selectedhouseholdIds = populateHouseholdIds(res.response, this.households);
                this.initiallySelectedhouseholdIds = populateHouseholdIds(res.response, this.households);
            } else {
                this.households = [];
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    updateUser(): void {
        if (this.userFormGroup.invalid && this.fetchedUser) {
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                this.globalService.openFailureSnackBar(res);
            });
            return;
        }

        this.isUpdating = true;

        const locationId =
            this.formControls['jurisdiction'].value === EJurisdiction.NATIONAL
                ? 'c3e60701-2227-4568-b899-e38b8a43413f'
                : this.selectedLocation;

        const userData = {
            id: this.user.id,
            phoneNumber: this.formControls['phoneNumber'].value,
            firstName: this.fetchedUser?.foreName,
            lastName: this.fetchedUser?.surnames,
            nationalId: this.formControls['documentNumber'].value,
            email: this.formControls['emailAddress'].value,
            jurisdiction: this.formControls['jurisdiction'].value,
            roleId: this.formControls['roleId'].value,
            locationId,
            households: !compareObjects(this.initiallySelectedhouseholdIds, this.selectedhouseholdIds)
                ? Object.keys(this.selectedhouseholdIds)
                : [],
        };

        this.userService.updateUser(userData).subscribe((res: any) => {
            this.isUpdating = false;
            if (res.status) {
                this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
                    this.globalService.openSuccessSnackBar(res);
                });
                this.shouldRefresh.emit(true);
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    onPageChange(event: any): void {
        this.pagination.page = event.pageIndex + 1;
        this.getHouseholds(this.user.jurisdiction, this.user.locationId);
    }
}
