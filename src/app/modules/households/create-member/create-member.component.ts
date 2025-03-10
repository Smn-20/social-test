import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { EGender, EInterviewee, EMembershipType, EState } from 'src/app/core/enums';
import { EDocumentType } from 'src/app/core/enums/document-type.enum';
import { AuthService } from 'src/app/core/services/auth.service';
import { DataService } from 'src/app/core/services/data.service';
import { EventService } from '../../../core/services/event.service';
import { GlobalService } from '../../../core/services/global.service';
import { HouseholdService } from '../../../core/services/household.service';
import { TranslationService } from '../../../core/services/translation.service';
import { docTypes, gender, membershipTypes, reasonsOfHouseholdRemoval } from '../../../core/utils/reusable-arrays';
import { ResponseObject } from '../../../core/utils/reusable-functions';
import { civilStatuses } from './../../../core/utils/reusable-arrays';
import { HouseholdMemberObject } from './../../shared/interfaces/household.d';

@Component({
    selector: 'app-create-member',
    templateUrl: './create-member.component.html',
    styleUrls: ['./create-member.component.css'],
})
export class CreateMemberComponent implements OnInit {
    memeberFormGroup!: FormGroup;
    deleteFormGroup!: FormGroup;
    deleteExistingMemberFormGroup!: FormGroup;
    hasFetched = false;
    memberId = '';
    householdId = '';
    memberType = '';
    fetchedUser: any;
    fetchedStatus: any;
    loggedInUser: any;
    loading = false;
    memberExist = false;
    docTypes = docTypes;
    membershipTypes = membershipTypes;
    civilStatuses = civilStatuses;
    selectedDocType = EDocumentType.NATIONAL_ID;
    locationLoading = false;
    location: any;
    reasons: any[] = [];
    reasonsArray: any[] = [];
    genders: any[] = [];
    messages: any = {};
    fetchedEducation: any;
    hasFetchedEducation: any;
    fetchedIncome: any;
    hasFetchedIncome = false;
    hasFetchedDisability = false;
    fetchedDisability: any;
    snackBarMessages: string[] = ['memberTransferedSuccess']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<CreateMemberComponent>,
        public fb: FormBuilder,
        private dataService: DataService,
        private householdService: HouseholdService,
        private globaService: GlobalService,
        private authService: AuthService,
        private eventService: EventService,
        private router: Router,
        private translationService: TranslationService
    ) {
        this.initTranslatable();
        this.memeberFormGroup = this.fb.group({
            identificationType: [null, [Validators.required]],
            documentNumber: [null, [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
            membershipType: [null, [Validators.required]],
        });

        this.deleteFormGroup = this.fb.group({
            reason: [null, [Validators.required]],
        });

        this.deleteExistingMemberFormGroup = this.fb.group({
            reason: [null, [Validators.required]],
        });
    }

    get formControls() {
        return this.memeberFormGroup.controls;
    }

    get deleteExistingMemberControls() {
        return this.deleteExistingMemberFormGroup.controls;
    }

    get deleteFormControls() {
        return this.deleteFormGroup.controls;
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.messages = res.messages;
            this.genders = this.translationService.translateArray(gender, res.genders);
            this.docTypes = this.translationService.translateArray(docTypes, res.docTypes);
            this.membershipTypes = this.translationService.translateArray(membershipTypes, res.membershipTypes);
            this.civilStatuses = this.translationService.translateArray(civilStatuses, res.civilStatuses);
            this.reasonsArray = this.translationService.translateArray(reasonsOfHouseholdRemoval, res.reasons);
        });
    }

    ngOnInit(): void {
        this.docNumberAutoFetch();
        this.loggedInUser = JSON.parse(this.authService.getItem('user'));
        this.getHouseholdMembers(this.data?.id);
        this.householdService.selectedHid = this.data.id;
        const { action, member } = this.data;
        if (action && action === 'delete') {
            if (member?.membershipType === EMembershipType.SPOUSE) {
                this.reasons = reasonsOfHouseholdRemoval;
            } else {
                this.reasons = reasonsOfHouseholdRemoval.filter((item) => item.value !== 'Divorce');
            }
        }
        if (action && action === 'migration-update') {
            const { member } = this.data;
            this.addControls(true);
            if (member && this.memeberFormGroup) {
                this.memeberFormGroup.controls['documentNumber'].setValue(member.documentNumber);
                this.memeberFormGroup.controls['firstName'].setValue(member.firstName);
                this.memeberFormGroup.controls['lastName'].setValue(member.lastName);
                this.memeberFormGroup.controls['dateOfBirth'].setValue(member.dateOfBirth);
                this.memeberFormGroup.controls['gender'].setValue(member.gender);
                this.memeberFormGroup.controls['maritalStatus'].setValue(member.civilStatus);
                this.memeberFormGroup.controls['identificationType'].setValue(member.identificationType);
                this.memeberFormGroup.controls['memberCode'].setValue(member.memberCode);
                this.memeberFormGroup.controls['membershipType'].setValue(member.membershipType);
            }
        }
    }

    addControls(isMemberUpdate = false): void {
        this.memeberFormGroup.addControl('firstName', new FormControl(null, [Validators.required]));
        this.memeberFormGroup.addControl('lastName', new FormControl(null, [Validators.required]));
        this.memeberFormGroup.addControl('dateOfBirth', new FormControl(null, [Validators.required]));
        this.memeberFormGroup.addControl('gender', new FormControl(null, [Validators.required]));
        this.memeberFormGroup.addControl('maritalStatus', new FormControl(null, [Validators.required]));
        if (!isMemberUpdate) {
            this.memeberFormGroup.removeControl('documentNumber');
        } else {
            this.memeberFormGroup.addControl('memberCode', new FormControl(null, [Validators.required]));
        }
    }

    removeControls(): void {
        this.memeberFormGroup.addControl(
            'documentNumber',
            new FormControl(null, [Validators.required, Validators.minLength(16), Validators.maxLength(16)])
        );
        this.memeberFormGroup.removeControl('firstName');
        this.memeberFormGroup.removeControl('lastName');
        this.memeberFormGroup.removeControl('dateOfBirth');
        this.memeberFormGroup.removeControl('gender');
        this.memeberFormGroup.removeControl('maritalStatus');
    }

    docNumberAutoFetch(): void {
        this.memeberFormGroup.get('documentNumber')?.valueChanges.pipe();

        this.memeberFormGroup
            .get('documentNumber')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                this.hasFetched = false;
                if (val !== '' && val !== null && this.memeberFormGroup.controls['documentNumber'].valid) {
                    this.getUserInfo(val);
                    this.getEducationInfo(val);
                    this.getIncomeInfo(val);
                    this.getDisabiltyInfo(val);
                }
            });
    }

    getUserInfo(id: string): void {
        this.hasFetched = true;
        this.fetchedUser = null;
        this.dataService.getExternalRecord(id).subscribe((res: any) => {
            this.fetchedStatus = res.status;
            if (res.status) {
                this.hasFetched = false;
                this.fetchedUser = res.response;
            } else {
                this.hasFetched = false;
                this.globaService.openFailureSnackBar(this.messages.userIdNotFound);
            }
        });
    }

    getEducationInfo(id: string): void {
        this.hasFetchedEducation = true;
        this.householdService.getEducationDetails(id).subscribe((res: any) => {
            this.hasFetchedEducation = false;
            if (res.status) {
                this.fetchedEducation = res.response;
            }
        });
    }

    getIncomeInfo(id: string): void {
        this.hasFetchedIncome = true;
        // this.householdService.getIncomeDetails(id).subscribe((res: any) => {
        //      this.hasFetchedIncome = false;
        //      if (res.status) {
        this.fetchedIncome = null; // res.response;
        //      }
        // });
    }

    getDisabiltyInfo(id: string): void {
        this.hasFetchedDisability = true;
        this.householdService.getDisabilityDetails(id).subscribe((res: any) => {
            this.hasFetchedDisability = false;
            if (res.status) {
                this.fetchedDisability = res.response;
            }
        });
    }

    updateMember(): void {
        this.loading = true;
        const member: Partial<HouseholdMemberObject> = {
            id: this.data.member.id,
            identificationType: this.formControls['identificationType'].value,
            documentNumber: this.fetchedUser ? this.formControls['documentNumber'].value : null,
            firstName: this.formControls['firstName']?.value,
            lastName: this.formControls['lastName']?.value,
            dateOfBirth: new Date(this.formControls['dateOfBirth']?.value),
            gender: this.formControls['gender']?.value,
            civilStatus: this.formControls['maritalStatus']?.value,
            membershipType: this.formControls['membershipType']?.value,
            memberCode: this.formControls['memberCode']?.value,
        };
        this.householdService.updateSrisMember(this.data.id, member).subscribe((res) => {
            this.loading = false;
            if (res.status) {
                setTimeout(() => {
                    this.globaService.openSuccessSnackBar(res.message);
                    this.eventService.onActionFinished({ name: 'households-migrate' });
                    this.dialogRef.close();
                }, 1);
            } else {
                this.globaService.openFailureSnackBar(res.message);
            }
        });
    }

    createHouseholdMember(isCreateMember = true): void {
        if (isCreateMember) {
            if (this.memeberFormGroup.invalid) {
                this.memeberFormGroup.markAllAsTouched();
                this.globaService.openFailureSnackBar(this.messages.someFieldsAreMissing);
                return;
            }

            const member: Partial<HouseholdMemberObject> = {
                identificationType: this.formControls['identificationType'].value,
                documentNumber: this.fetchedUser ? this.formControls['documentNumber'].value : null,
                firstName: this.formControls['firstName']?.value || this.fetchedUser?.surnames,
                lastName: this.formControls['lastName']?.value || this.fetchedUser?.foreName,
                dateOfBirth: !this.fetchedUser
                    ? new Date(this.formControls['dateOfBirth']?.value)
                    : new Date(this.fetchedUser?.dateOfBirth),
                gender: this.formControls['gender']?.value || this.transformNidaGender(this.fetchedUser?.sex),
                maritalStatus:
                    this.formControls['maritalStatus']?.value || this.fetchedUser?.maritalStatus?.toUpperCase(),
                membershipType: this.formControls['membershipType']?.value,
            };

            this.householdService.householdMemberPayload = {
                request: member,
                data: {
                    householdId: this.data.id,
                    fetchedUser: this.fetchedUser,
                    educationLevel: this.fetchedEducation,
                    incomeLevel: this.fetchedIncome,
                    disabilityLevel: this.fetchedDisability,
                },
            };
            this.householdService.previousPagination = this.data.pagination;
            this.loading = false;
            if (this.selectedDocType !== EDocumentType.NO_IDENTIFICATION) {
                this.householdService
                    .validateHouseholdHeadOrMember(
                        `${this.formControls['documentNumber'].value}`,
                        `${this.fetchedUser?.surnames} ${this.fetchedUser?.foreName}`
                    )
                    .subscribe((res: any) => {
                        this.loading = false;
                        if (!res?.response.isMemberExist || res.response.memberStatus === EState.DELETED) {
                            this.router.navigate(['/admin/questionnaires/renderer/' + EInterviewee.PERSON]);
                            this.dialogRef.close();
                        } else {
                            if (res?.response.type === 'HEAD') {
                                this.seHouseholdExistError1(res);
                            } else {
                                if (this.data.id === res?.response.HouseholdId) {
                                    this.seHouseholdExistError2();
                                } else {
                                    this.memberExist = true;
                                    this.memberId = res?.response.memberId;
                                    this.memberType = res?.response.type;
                                    this.householdId = res?.response.HouseholdId;
                                    this.reasons = reasonsOfHouseholdRemoval;
                                }
                            }
                        }
                    });
            } else {
                this.router.navigate(['/admin/questionnaires/renderer/' + EInterviewee.PERSON]);
                this.dialogRef.close();
            }
        } else {
            this.updateMember();
        }
    }

    seHouseholdExistError1(res: any): void {
        const language = localStorage.getItem('i18n');
        if (language === 'rw') {
            this.globaService.openFailureSnackBar(
                `Umuntu ufite ID ${this.formControls['documentNumber'].value} asanzwe ari umukuru w’umuryango wa HH  ${res?.response.code} uherereye i ${res?.response.location}`
            );
        } else if (language === 'fr') {
            this.globaService.openFailureSnackBar(
                `La personne avec l'ID ${this.formControls['documentNumber'].value} est déjà chef de ménage pour le ménage ${res?.response.code} situé à ${res?.response.location}`
            );
        } else {
            this.globaService.openFailureSnackBar(
                `Person with ID ${this.formControls['documentNumber'].value} is alread HouseHold Head for HH ${res?.response.code} located in ${res?.response.location}`
            );
        }
    }

    seHouseholdExistError2(): void {
        const language = localStorage.getItem('i18n');
        if (language === 'rw') {
            this.globaService.openFailureSnackBar(
                `Umuntu ufite ID ${this.formControls['documentNumber'].value} asanzwe ari umunyamuryango w’uyu muryango.`
            );
        } else if (language === 'fr') {
            this.globaService.openFailureSnackBar(
                `La personne avec l'ID ${this.formControls['documentNumber'].value} est déjà membre de ce ménage.`
            );
        } else {
            this.globaService.openFailureSnackBar(
                `Person with ID ${this.formControls['documentNumber'].value} is already a member of this HouseHold.`
            );
        }
    }

    deleteHouseholdMember(): void {
        if (this.deleteFormGroup.invalid && this.data.action !== 'migration-delete') {
            this.deleteFormGroup.markAllAsTouched();
            this.globaService.openFailureSnackBar(this.messages.someFieldsAreMissing);
            return;
        }
        this.loading = true;

        if (this.data.action === 'delete') {
            this.householdService
                .deleteHouseholdMember(
                    this.data.member.id,
                    this.data.id,
                    this.deleteFormGroup.controls['reason']?.value
                )
                .subscribe((res: any) => {
                    this.loading = false;
                    if (res.status) {
                        setTimeout(() => {
                            this.globaService.openSuccessSnackBar(this.messages.householdDeleted);
                            this.eventService.onActionFinished({
                                name: 'households',
                                pagination: this.data.pagination,
                            });
                            this.dialogRef.close();
                        }, 1);
                    } else {
                        this.globaService.openFailureSnackBar(res.message);
                    }
                });
        } else {
            this.householdService.deleteSrisMember(this.data.member.id, this.data.id).subscribe((res: any) => {
                this.loading = false;
                if (res.status) {
                    setTimeout(() => {
                        this.globaService.openSuccessSnackBar(this.messages.householdDeleted);
                        this.eventService.onActionFinished({
                            name: 'households-migrate',
                            pagination: this.data.pagination,
                        });
                        this.dialogRef.close();
                    }, 1);
                } else {
                    this.globaService.openFailureSnackBar(res.message);
                }
            });
        }
    }

    transferExistingHouseholdMember(): void {
        this.loading = true;
        this.householdService.transferHouseholdMember(this.data?.id, this.memberId).subscribe((res: any) => {
            this.loading = false;
            if (res.status) {
                setTimeout(() => {
                    this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                        this.globaService.openSuccessSnackBar(res);
                    });
                    this.eventService.onActionFinished({ name: 'households', pagination: this.data.pagination });
                    this.dialogRef.close();
                }, 1);
            } else {
                this.globaService.openSuccessSnackBar(res.message);
            }
        });
    }

    receiveDocType(e: any, bypass = false): void {
        this.selectedDocType = e?.value;
        if (e?.value === EDocumentType.NO_IDENTIFICATION || bypass) {
            this.addControls(bypass);
        } else {
            this.removeControls();
            this.idTypeValidation(e);
        }
    }

    idTypeValidation(e: any): void {
        const { value } = e;
        this.memeberFormGroup.controls['documentNumber'].clearValidators();
        this.memeberFormGroup.controls['documentNumber'].setValue(null);
        if (value === EDocumentType.NATIONAL_ID) {
            this.memeberFormGroup
                .get('documentNumber')
                ?.addValidators([Validators.minLength(16), Validators.maxLength(16)]);
        } else if (value === EDocumentType.NIN) {
            this.memeberFormGroup
                .get('documentNumber')
                ?.addValidators([Validators.minLength(12), Validators.maxLength(12)]);
        } else {
            this.memeberFormGroup
                .get('documentNumber')
                ?.addValidators([Validators.minLength(8), Validators.maxLength(10)]);
        }
        setTimeout(() => {
            this.memeberFormGroup.controls['documentNumber'].updateValueAndValidity();
        }, 1);
    }

    transformNidaGender(sex: string): EGender {
        return sex === 'M' ? EGender.MALE : EGender.FEMALE;
    }

    getHouseholdMembers(householdId: string): void {
        this.locationLoading = true;
        this.householdService.getHouseholdMembers(householdId).subscribe((res: ResponseObject<any>) => {
            this.locationLoading = false;
            if (res?.status) {
                this.location = res.response?.location;
            } else {
                // todo: show error and empty/not found message
            }
        });
    }
}
