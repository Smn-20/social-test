import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { requestTypes } from 'src/app/core/utils/reusable-arrays';
import { EMovementEvent } from 'src/app/core/enums';
import { EJurisdiction } from 'src/app/core/enums/jurisdiction.enum';
import { HouseholdMovment } from 'src/app/modules/shared/interfaces/household';
import { EventService } from '../../../core/services/event.service';
import { GlobalService } from '../../../core/services/global.service';
import { HouseholdService } from '../../../core/services/household.service';
import { ResponseObject, removeSecondCharacter } from '../../../core/utils/reusable-functions';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-transfer',
    templateUrl: './transfer.component.html',
    styleUrls: ['./transfer.component.css'],
})
export class TransferComponent implements OnInit {
    limit = EJurisdiction.VILLAGE;
    disableLimit = EJurisdiction.CELL;
    transferFormGroup!: FormGroup;
    selectedLocation!: string;
    loggedInUser: any;
    locationLoading = false;
    showUPI = false;
    showLocation = false;
    location: any;
    loading = false;
    transferTypes = requestTypes;
    upiLoading = false;
    fetchedLand: any;
    selectedVillageCode: string | null = null;
    preselectedLocation: any;
    snackBarMessages: string[] = [
        'pleaseProvideUPI',
        'pleaseSelectVillage',
        'HHTransferedSuccess',
        'HHArchivedSuccess',
    ]; // snackbar messages to be translated --> PLEASE do NOT modify the array values
    public EJurisdiction = EJurisdiction;

    constructor(
        public dialogRef: MatDialogRef<TransferComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private householdService: HouseholdService,
        private globaService: GlobalService,
        private authService: AuthService,
        private eventService: EventService,
        private translationService: TranslationService
    ) {
        this.transferFormGroup = this.fb.group({
            requestType: [null, [Validators.required]],
            phoneNumber: [null],
            chooseOption: [null],
        });
    }

    get formControls() {
        return this.transferFormGroup.controls;
    }

    ngOnInit(): void {
        this.loggedInUser = JSON.parse(this.authService.getItem('user'));
        this.getHouseholdMembers(this.data?.id);
    }

    receiveLocation(e: any): void {
        if (this.limit === e.type) {
            this.selectedLocation = e.id;
            if (e.type === EJurisdiction.VILLAGE) {
                this.selectedVillageCode = e.code;
            }
        }
    }

    receiveRequestType(e: any): void {
        if (e.value === 'transfer') {
            this.removeControls();
            this.upiNumberAutoFetch();
        } else {
            this.addControls();
        }
        this.transferFormGroup.get('chooseOption')?.setValue(null);
        this.updateForm();
    }

    addControls(): void {
        this.transferFormGroup.addControl('description', new FormControl(null, [Validators.required]));
        this.transferFormGroup.removeControl('upi');
        this.transferFormGroup.removeControl('phoneNumber');
    }

    removeControls(): void {
        this.transferFormGroup.removeControl('description');
        this.transferFormGroup.addControl('upi', new FormControl(null, [this.householdService.UPI]));
        this.transferFormGroup.addControl('phoneNumber', new FormControl(null, [Validators.required]));
    }

    updateForm(): void {
        const chooseOption = this.transferFormGroup.get('chooseOption')?.value;
        this.showUPI = this.transferFormGroup.get('requestType')?.value === 'transfer' && chooseOption === 'upi';
        this.showLocation =
            this.transferFormGroup.get('requestType')?.value === 'transfer' && chooseOption === 'location';
    }

    getHouseholdMembers(householdId: string): void {
        this.locationLoading = true;
        this.householdService.getHouseholdMembers(householdId).subscribe((res: ResponseObject<any>) => {
            this.locationLoading = false;
            if (res?.status) {
                this.location = res.response?.location;
            }
        });
    }

    upiNumberAutoFetch(): void {
        this.transferFormGroup.get('upi')?.valueChanges.pipe();
        this.transferFormGroup
            .get('upi')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                this.upiLoading = false;
                if (val?.match(/^[0-9]\/[0-9]{2}\/[0-9]{2}\/[0-9]{2}\/[-0-9]{1,9}$/)) {
                    this.getLandInfo(val);
                }
            });
    }

    getLandInfo(upi: string): void {
        this.upiLoading = true;
        this.householdService.getLandDetails(upi).subscribe((res: any) => {
            if (res.status) {
                this.upiLoading = false;
                const {
                    centralCoordinate: { lon, lat },
                    parcelLocation: {
                        village: { villageName, villageCode },
                        cell: { cellName },
                        district: { districtName },
                        sector: { sectorName },
                        province: { provinceName },
                    },
                    size,
                    upi,
                } = res.response;
                this.fetchedLand = {
                    lon,
                    lat,
                    villageCode,
                    villageName,
                    cellName,
                    districtName,
                    sectorName,
                    provinceName,
                    size,
                    upi,
                };
            } else {
                this.upiLoading = false;
            }
        });
    }

    submitTransfer(): void {
        if (this.transferFormGroup.controls['requestType'].value === 'transfer') {
            this.createHouseholdTransferRequest();
        } else {
            this.createHouseholdArchiveRequest();
        }
    }

    createHouseholdTransferRequest(): void {
        const chooseOption = this.transferFormGroup.get('chooseOption')?.value;
        const VillageCode =
            chooseOption === 'upi' ? removeSecondCharacter(this.fetchedLand?.villageCode!) : this.selectedVillageCode!;

        if (chooseOption === 'upi' && !this.fetchedLand) {
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                this.globaService.openFailureSnackBar(res);
            });
            this.loading = false;
            return;
        }

        if (chooseOption === 'location' && !this.selectedVillageCode) {
            this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
                this.globaService.openFailureSnackBar(res);
            });
            this.loading = false;
            return;
        }

        this.loading = true;

        const request: Partial<HouseholdMovment> = {
            householdId: this.data.id,
            villageCode: VillageCode,
            memberDocumentNumber: this.data.head.documentNumber,
            event: EMovementEvent.REQUEST,
            upi: this.fetchedLand?.upi,
            longitude: this.fetchedLand?.lon,
            latitude: this.fetchedLand?.lat,
            phoneNumber: this.transferFormGroup.controls['phoneNumber'].value,
            enumeratorId: this.loggedInUser?.principalId,
            userType: 'SYSTEM_USER',
        };

        this.householdService.createHouseholdTransferRequest(request).subscribe((res: any) => {
            this.loading = false;
            if (res.status) {
                this.translationService.getInstantTranslations(this.snackBarMessages[2]).subscribe((res) => {
                    this.globaService.openSuccessSnackBar(res);
                });
                this.eventService.onActionFinished({ name: 'households' });
                this.dialogRef.close();
            } else {
                this.globaService.openFailureSnackBar(res.message);
            }
        });
    }

    createHouseholdArchiveRequest(): void {
        if (!this.transferFormGroup.valid) {
            return;
        }
        this.loading = true;

        const request: Partial<HouseholdMovment> = {
            householdId: this.data.id,
            description: this.transferFormGroup.controls['description'].value,
            event: EMovementEvent.REQUEST,
            enumeratorId: this.loggedInUser?.principalId,
            userType: 'SYSTEM_USER',
        };

        this.householdService.createHouseholdArchiveRequest(request).subscribe((res: any) => {
            this.loading = false;
            if (res.status) {
                this.translationService.getInstantTranslations(this.snackBarMessages[3]).subscribe((res) => {
                    this.globaService.openSuccessSnackBar(res);
                });
                this.eventService.onActionFinished({ name: 'households' });
                this.dialogRef.close();
            } else {
                this.globaService.openSuccessSnackBar(res.message);
            }
        });
    }
}
