import { EventService } from 'src/app/core/services/event.service';
import { MatDialog } from '@angular/material/dialog';
import { storageLocation } from './../../../core/utils/reusable-arrays';
import { EStorageLocation } from './../../../core/enums/storage.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslationService } from 'src/app/core/services/translation.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EMembershipType, EJurisdiction, EState, ETargetingStatus, EPermission } from 'src/app/core/enums';
import { CreateMemberComponent } from '../create-member/create-member.component';

@Component({
  selector: 'app-migration-compare',
  templateUrl: './migration-compare.component.html',
  styleUrls: ['./migration-compare.component.css']
})
export class MigrationCompareComponent implements OnInit {
  srisHead: any;
  misHead: any;
  srisMembers!: any[];
  misMembers!: any[];
  srisLoading = false;
  misLoading = false;
  approveLoading = false;
  headPhoto: any;
  headPhotoLoading = false;
  selectedStorage!: EStorageLocation;
  householdlocation: any;
  storageLocations = storageLocation;
  rsisHouseholdData!: any;
  srisOnly:any[];
  misOnly:any[];
  selectedHeadNationalId!: string;

  public EJurisdiction = EJurisdiction;
  public EStorageLocation = EStorageLocation;
  public EPermission = EPermission;
  public ETargetingStatus = ETargetingStatus;

  constructor(
      private householdService: HouseholdService,
      private globalService: GlobalService,
      public dialog: MatDialog,
      private route: ActivatedRoute,
      private router: Router,
      private eventService: EventService,
      private _sanitizer: DomSanitizer,
      private translationService: TranslationService
  ) {
    this.translationService.loadLanguage();
    this.srisOnly = storageLocation.filter(el => el.value !== EStorageLocation.MIS);
    this.misOnly = storageLocation.filter(el => el.value !== EStorageLocation.SRIS);
  }

  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      if (params.nationalId) {
        this.selectedHeadNationalId = params.nationalId;
        this.getSRISHouseholdsData(params.nationalId);
        this.getMISHouseholdsData(params.nationalId);
      }
    });
    this.eventListening();
  }



  getSRISHouseholdsData(nationalId: string): void {
    this.srisLoading = true;
    this.householdService
        .getMigrationHeadByNationalID(
            EStorageLocation.SRIS,
            nationalId,
        )
        .subscribe((res: any) => {
            if (res.status && res.response) {
                this.rsisHouseholdData = res.response
                this.srisHead = res.response.head;
                this.fetchHeadPhoto(nationalId, EMembershipType.HEAD);
                this.householdService.getMigrationMembersByID(EStorageLocation.SRIS, this.rsisHouseholdData.id)
                .subscribe(members => {
                  this.srisLoading = false;
                  if (members.status) {
                    this.householdlocation = members.response.location;
                    this.srisMembers = members.response.members;
                  }
                })

            } else {
              this.srisLoading = false;
            }
        });
  }

  getMISHouseholdsData(nationalId: string): void {
    this.misLoading = true;
    this.householdService
        .getMigrationHeadByNationalID(
            EStorageLocation.MIS,
            nationalId,
        )
        .subscribe((res: any) => {
            if (res.status && res.response) {
                this.misHead = res.response;
                this.fetchHeadPhoto(nationalId, EMembershipType.HEAD);
                this.householdService.getMigrationMembersByID(EStorageLocation.MIS, this.misHead.id)
                .subscribe(members => {
                  this.misLoading = false;
                  if (members.status) {
                    this.misMembers = members.response;
                  }
                })

            } else {
              this.misLoading = false;
            }
        });
  }

  fetchHeadPhoto(documentNumber: string, membershipType: EMembershipType): void {
    if (!this.headPhoto) {
      this.headPhotoLoading = true;
      this.householdService.getUserPhoto(documentNumber, membershipType).subscribe((res) => {
        this.headPhotoLoading = false;
        if (res?.status) {
              this.headPhoto = this.getImage(res.response);
        } else {
          this.headPhoto = null
        }
      });
    }
  }

  eventListening(): void {
    this.eventService.actionFinished.subscribe((res) => {
        if (res?.name === 'households-migrate') {
            this.getSRISHouseholdsData(this.selectedHeadNationalId);
            this.getMISHouseholdsData(this.selectedHeadNationalId);
        }
    });

    this.eventService.stopAllLoaders.subscribe((st) => {
        if (st) {
          this.srisLoading = false;
          this.misLoading = false;
          this.approveLoading = false;
          this.headPhotoLoading = false;
        }
    });
}

  getImage(input: string): any {
    return this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + input);
  }

  toggleMISRSIS(type: EStorageLocation): void {
    this.selectedStorage = type;
  }

  accept(): void {
    this.approveLoading = true;
    let householdId;

    if (this.selectedStorage === EStorageLocation.SRIS) {
      if (!this.rsisHouseholdData) {
        this.translationService.getInstantTranslations('HouseholdNotFoundRSIS').subscribe((res) => {
          this.globalService.openFailureSnackBar(res);
        });
        this.approveLoading = false;
        return;
      }
      householdId = this.rsisHouseholdData.id;
    }

    if (this.selectedStorage === EStorageLocation.MIS) {
      if (!this.misHead) {
        this.translationService.getInstantTranslations('HouseholdNotFoundRMIS').subscribe((res) => {
          this.globalService.openFailureSnackBar(res);
        });
        this.approveLoading = false;
        return
      }
      householdId = this.misHead.id;
    }

    this.householdService.getSrisMisHousehold(this.selectedStorage, householdId).subscribe(res => {
      this.approveLoading = false;
      if (res.status) {
        this.globalService.openSuccessSnackBar(res.message);
        this.getSRISHouseholdsData(this.selectedHeadNationalId);
        this.getMISHouseholdsData(this.selectedHeadNationalId);
      } else {
        this.globalService.openFailureSnackBar(res.message);
      }
    })
  }

  openCreateMemberDialog(member: any, action: string): void {
        this.dialog.open(CreateMemberComponent, {
            data: {
                ...this.rsisHouseholdData,
                ...{ member },
                ...{ action }
            },
            width: '1024px',
        });
  }

}
