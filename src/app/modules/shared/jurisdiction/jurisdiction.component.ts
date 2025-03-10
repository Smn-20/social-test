import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { ResponseObject } from 'src/app/core/utils/reusable-functions';
import { EFilterAction, EJurisdiction, EPermission } from 'src/app/core/enums';
import { Location } from '@angular/common';

@Component({
    selector: 'app-jurisdiction',
    templateUrl: './jurisdiction.component.html',
    styleUrls: ['./jurisdiction.component.css'],
})
export class JurisdictionComponent implements OnInit {
    @Input() title!: string;
    @Input() permissions!: EPermission[];
    @Input() showButton = false;
    @Input() buttonName!: string;
    @Input() hasLocationFilter = false;
    @Input() hasBack = false;
    @Input() isCompact = false;
    @Input() locationConfig: any;
    @Output() jurisdictionEvent = new EventEmitter<any>();
    @Output() locationEvent = new EventEmitter<any>();

    loggedInUser = JSON.parse(this.authService.getItem('user'));
    location: any;
    loading = false;
    selectedJurisdictionLocation: any;
    public EJurisdiction = EJurisdiction;
    public EPermission = EPermission;
    public EFilterAction = EFilterAction;

    constructor(
        private householdService: HouseholdService,
        private authService: AuthService,
        private _location: Location
    ) {}

    ngOnInit() {
        this.getJuridictionLocation();
    }

    getJuridictionLocation(): void {
        if (!this.locationConfig?.location) {
            this.loading = true;
            this.householdService
                .getJuridictionLocation(
                    this.locationConfig?.type || this.loggedInUser?.jurisdiction,
                    this.locationConfig?.id || this.loggedInUser?.locationId
                )
                .subscribe((res: ResponseObject<any>) => {
                    this.loading = false;
                    if (res.status) {
                        const { province, district, sector, cell, villages } = res.response;
                        this.location = {
                            cellName: cell?.name,
                            districtName: district?.name,
                            provinceName: province?.name,
                            sectorName: sector?.name,
                            villageName: villages?.name,
                        };

                        this.selectedJurisdictionLocation = {
                            selectedProvince: province?.id,
                            selectedDistrict: district?.id,
                            selectedSector: sector?.id,
                            selectedCell: cell?.id,
                            selectedVillage: villages?.id,
                        };

                        this.onSetFilterEvent(this.selectedJurisdictionLocation);
                    }
                });
        } else {
            this.location = this.locationConfig.location;
        }
    }

    onOutputEvent(): void {
        this.jurisdictionEvent.emit();
    }

    onSetFilterEvent(evt: any): void {
        this.locationEvent.emit(evt);
    }

    goBack(): void {
        this._location.back();
    }
}
