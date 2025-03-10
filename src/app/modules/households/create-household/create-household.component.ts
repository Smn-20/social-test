import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { docTypes } from 'src/app/constants';
import { EDocumentType, EInterviewee, EJurisdiction, EState } from 'src/app/core/enums';
import { AuthService } from 'src/app/core/services/auth.service';
import { DataService } from 'src/app/core/services/data.service';
import { ResponseObject } from 'src/app/core/utils/reusable-functions';
import { CreateHousehold } from 'src/app/modules/shared/interfaces/household';
import { EventService } from '../../../core/services/event.service';
import { GlobalService } from '../../../core/services/global.service';
import { HouseholdService } from '../../../core/services/household.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
    selector: 'app-create-household',
    templateUrl: './create-household.component.html',
    styleUrls: ['./create-household.component.css'],
})
export class CreateHouseholdComponent implements OnInit {
    limit = EJurisdiction.VILLAGE;
    disableLimit = EJurisdiction.CELL;
    householdFormGroup!: FormGroup;
    roles!: any[];
    hasFetched = false;
    upiLoading = false;
    fetchedUser: any;
    fetchedLand: any;
    fetchedStatus: any;
    selectedLocation!: any;
    loggedInUser: any;
    loading = false;
    locationLoading = false;
    preselectedLocation: any;
    docTypes: any[] = [];
    selectedDocType = EDocumentType.NATIONAL_ID;
    // hasUPI = true;
    // hasFetchedUpis = false;
    villageLoacation: any;
    hasFetchedEducation = false;
    hasFetchedIncome = false;
    hasFetchedDisability = false;
    upis: any;
    fetchedEducation: any;
    fetchedIncome: any;
    fetchedDisability: any;

    // If a loggedin User's jurisdiction is cell then keep track of their villages in the state below
    hasJursidictionVillage = true;
    villages: any[] = []

    public EJurisdiction = EJurisdiction;

    snackBarMessages: string[] = ['provideValidIDNumber']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        public dialogRef: MatDialogRef<CreateHouseholdComponent>,
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
        this.householdFormGroup = this.fb.group({
            identificationType: [null, [Validators.required]],
            headDocumentNumber: [null, [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
            // upi: [null, [Validators.required, householdService.UPI]],
            check1: [null, []],
            check2: [null, []],
        });
    }

    get formControls() {
        return this.householdFormGroup.controls;
    }

    ngOnInit(): void {
        this.docNumberAutoFetch();
        // this.upiNumberAutoFetch();
        this.loggedInUser = JSON.parse(this.authService.getItem('user'));
        this.getJuridictionLocationOnVillage();
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.docTypes = this.translationService.translateArray(docTypes, res.docTypes);
        });
    }

    // BRING BACK WHEN UPI IS REQUIRED AGAIN (DON'T REMOVE ANY CODE COMMENTS RELATED TO UPI)
    // toggleHasUpi(val: boolean): void {
    //     this.hasUPI = val;
    //     if (!val) {
    //         this.householdFormGroup.removeControl('upi');
    //     } else {
    //         this.householdFormGroup.addControl(
    //             'upi',
    //             new FormControl(null, [Validators.required, this.householdService.UPI])
    //         );
    //     }
    // }

    // getLandInfo(upi: string): void {
    //     this.upiLoading = true;
    //     this.householdService.getLandDetails(upi).subscribe((res: any) => {
    //         if (res.status) {
    //             this.upiLoading = false;
    //             const {
    //                 centralCoordinate: { lon, lat },
    //                 parcelLocation: {
    //                     village: { villageName, villageCode },
    //                     cell: { cellName },
    //                     district: { districtName },
    //                     sector: { sectorName },
    //                     province: { provinceName },
    //                 },
    //                 size,
    //                 upi,
    //             } = res.response;
    //             this.fetchedLand = {
    //                 lon,
    //                 lat,
    //                 villageName,
    //                 villageCode: removeSecondCharacter(villageCode),
    //                 cellName,
    //                 districtName,
    //                 sectorName,
    //                 provinceName,
    //                 size,
    //                 upi,
    //             };
    //         } else {
    //             this.upiLoading = false;
    //             this.globaService.openFailureSnackBar('UPI not found, Invalid UPI');
    //         }
    //     });
    // }

    // upiNumberAutoFetch(): void {
    //     this.householdFormGroup.get('upi')?.valueChanges.pipe();
    //     this.householdFormGroup
    //         .get('upi')
    //         ?.valueChanges.pipe(debounceTime(1000))
    //         .subscribe((val) => {
    //             this.upiLoading = false;
    //             if (val?.match(/^[0-9]\/[0-9]{2}\/[0-9]{2}\/[0-9]{2}\/[-0-9]{1,9}$/)) {
    //                 this.getLandInfo(val);
    //             }
    //         });
    // }
    // getLandDetails2(id: string): void {
    //     this.householdService.getLandDetails2(id).subscribe((res) => {
    //         this.hasFetchedUpis = true;
    //         if (res.status) {
    //             this.upis = res.response.map((item: { upi: any; size: any }) => {
    //                 return {
    //                     upi: item.upi,
    //                     plotSize: item.size,
    //                 };
    //             });
    //         }
    //     });
    // }

    getJuridictionLocationOnVillage(): void {
        if (
            this.loggedInUser?.jurisdiction === EJurisdiction.VILLAGE ||
            this.loggedInUser?.jurisdiction === EJurisdiction.CELL
        ) {
            this.householdService
                .getJuridictionLocation(this.loggedInUser?.jurisdiction, this.loggedInUser.locationId)
                .subscribe((res: ResponseObject<any>) => {
                    this.locationLoading = false;
                    if (res.status) {
                        const { province, district, sector, cell, villages } = res.response;

                        this.fetchedLand = {
                            lon: null,
                            lat: null,
                            cellName: cell?.name,
                            districtName: district?.name,
                            sectorName: sector?.name,
                            provinceName: province?.name,
                            size: null,
                            upi: null,
                        };

                        if (this.loggedInUser?.jurisdiction === EJurisdiction.VILLAGE) {
                            this.fetchedLand.villageName = villages?.name;
                            this.fetchedLand.villageCode = villages?.code;
                            this.hasJursidictionVillage = true;
                        } else {
                            this.getVillages(cell.id)
                        }
                    }
                });
        }

        if (![EJurisdiction.VILLAGE, EJurisdiction.CELL].includes(this.loggedInUser?.jurisdiction)) {
            this.householdFormGroup.get('headDocumentNumber')?.disable();
            this.householdFormGroup.get('identificationType')?.disable();
        }
    }

    docNumberAutoFetch(): void {
        this.householdFormGroup.get('headDocumentNumber')?.valueChanges.pipe();

        this.householdFormGroup
            .get('headDocumentNumber')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                this.hasFetched = false;
                // this.hasFetchedUpis = false;
                if (val !== '' && val !== null && this.householdFormGroup.controls['headDocumentNumber'].valid) {
                    this.getUserInfo(val);
                    // this.getLandDetails2(val);
                    this.getEducationInfo(val);
                    this.getIncomeInfo(val);
                    this.getDisabiltyInfo(val);
                }
            });
    }

    idTypeValidation(e: any): void {
        const { value } = e;
        this.householdFormGroup.controls['headDocumentNumber'].clearValidators();
        this.householdFormGroup.controls['headDocumentNumber'].setValue(null);
        this.selectedDocType = value;
        if (value === EDocumentType.NATIONAL_ID) {
            this.householdFormGroup
                .get('headDocumentNumber')
                ?.addValidators([Validators.minLength(16), Validators.maxLength(16)]);
        } else if (value === EDocumentType.NIN) {
            this.householdFormGroup
                .get('headDocumentNumber')
                ?.addValidators([Validators.minLength(12), Validators.maxLength(12)]);
        } else {
            this.householdFormGroup
                .get('headDocumentNumber')
                ?.addValidators([Validators.minLength(8), Validators.maxLength(10)]);
        }
        this.householdFormGroup.controls['headDocumentNumber'].updateValueAndValidity();
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
                this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                    this.globaService.openFailureSnackBar(res);
                });
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

        // NOTE: API 404 double check with RSSB for the income details
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

    createHousehold(): void {
        if (this.householdFormGroup.invalid) {
            this.householdFormGroup.markAllAsTouched();
            this.householdFormGroup.markAsDirty();
            this.translationService.getInstantTranslations('textMissingFields').subscribe(res => {
              this.globaService.openFailureSnackBar(res)
            });
            return;
        }
        if (this.formControls['headDocumentNumber']?.valid && !this.fetchedUser) {
            this.translationService.getInstantTranslations('textDocumentNumberIsInvalid').subscribe(res => {
              this.globaService.openFailureSnackBar(res)
            });
            return;
        }

        // if (this.formControls['upi']?.valid && !this.fetchedLand) {
        //     this.globaService.openFailureSnackBar('UPI does not exit');
        //     return;
        // }

        if (!this.fetchedLand.villageCode) {
            this.translationService.getInstantTranslations('textNoVillage').subscribe(res => {
              this.globaService.openFailureSnackBar(res)
            });
            this.hasJursidictionVillage = false;
            return;
        }

        if (!this.selectedLocation?.code) {
            this.eventService.onLocationFormTriggerValidationEvent(true);
        }

        const household: CreateHousehold = {
            headDocumentNumber: this.formControls['headDocumentNumber'].value,
            // upi: this.fetchedLand.upi,
            latitude: this.fetchedLand.lat,
            longitude: this.fetchedLand.lon,
            enumeratorId: this.loggedInUser.principalId,
            villageCode: this.fetchedLand.villageCode,
        };

        this.householdService.householdPayload = {
            request: household,
            data: {
                fetchLand: this.fetchedLand,
                fetchedUser: this.fetchedUser,
                // upis: this.upis,
                educationLevel: this.fetchedEducation,
                incomeLevel: this.fetchedIncome,
                disabilityLevel: this.fetchedDisability
            },
        };

        this.loading = true;
        this.householdService
            .validateHouseholdHeadOrMember(
                `${this.formControls['headDocumentNumber'].value}`,
                `${this.fetchedUser?.surnames} ${this.fetchedUser?.foreName}`
            )
            .subscribe((res: any) => {
                this.loading = false;
                if (!res?.response.isMemberExist || res.response.memberStatus === EState.DELETED) {
                    this.router.navigate(['/admin/questionnaires/renderer/' + EInterviewee.HOUSEHOLD]);
                    this.dialogRef.close();
                } else {
                    if (res?.response.type === 'HEAD') {
                        this.seHouseholdExistError1(res);
                    } else {
                      this.seHouseholdExistError2(res);
                    }
                }
            });
    }

    getVillages(id: string): void {
        this.dataService.getVillagesByCellId(id).subscribe((res: any) => {
            if (res.status) {
                this.villages = res.response;
            }
        });
    }

    onVillageChange(village: any) {
        this.fetchedLand.villageCode = village?.code;
        this.fetchedLand.villageName = village?.name;
        this.hasJursidictionVillage = true;
    }

    receiveJurisdiction(e: any): void {
        this.limit = e.value;
    }

    receiveLocation(e: any): void {
        if (this.limit === e.type) {
            this.selectedLocation = e;
        }
    }

    seHouseholdExistError1(res: any): void {
      const language = localStorage.getItem('i18n');
      if (language === 'rw') {
        this.globaService.openFailureSnackBar(
          `Umuntu ufite ID ${this.formControls['headDocumentNumber'].value} asanzwe ari umukuru w’umuryango wa HH  ${res?.response.code} uherereye i ${res?.response.location}`
        );
      } else if (language === 'fr') {
        this.globaService.openFailureSnackBar(
          `La personne avec l'ID ${this.formControls['headDocumentNumber'].value} est déjà chef de ménage pour le ménage ${res?.response.code} situé à ${res?.response.location}`
        );
      } else {
        this.globaService.openFailureSnackBar(
          `Person with ID ${this.formControls['headDocumentNumber'].value} is alread HouseHold Head for HH ${res?.response.code} located in ${res?.response.location}`
        );
      }
  }

  seHouseholdExistError2(res: any): void {
    const language = localStorage.getItem('i18n');
    if (language === 'rw') {
      this.globaService.openFailureSnackBar(
        `Umuntu ufite ID ${this.formControls['headDocumentNumber'].value} asanzwe ari mu muryango  ${res?.response.code} uherereye i ${res?.response.location}`
      );
    } else if (language === 'fr') {
      this.globaService.openFailureSnackBar(
        `La personne avec l'ID ${this.formControls['headDocumentNumber'].value} est déjà dans le ménage ${res?.response.code} situé à ${res?.response.location}`
      );
    } else {
      this.globaService.openFailureSnackBar(
        `Person with ID ${this.formControls['headDocumentNumber'].value} is already in Household ${res?.response.code} located in ${res?.response.location}`
    );
    }
}

}
