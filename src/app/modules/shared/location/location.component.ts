import { EventService } from 'src/app/core/services/event.service';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { EJurisdiction } from 'src/app/core/enums';

@Component({
    selector: 'app-location',
    templateUrl: './location.component.html',
    styleUrls: ['./location.component.css'],
})
export class LocationComponent implements OnInit, OnChanges {
    provinces: any[] = [];
    districts: any[] = [];
    sectors: any[] = [];
    cells: any[] = [];
    villages: any[] = [];
    locationInfo: LocationInfo = {};
    _d: Record<EJurisdiction, number> = {
        NATIONAL: 5,
        PROVINCE: 4,
        DISTRICT: 3,
        SECTOR: 2,
        CELL: 1,
        VILLAGE: 0,
    };

    @Input() limit!: EJurisdiction;
    @Input() disableLimit!: EJurisdiction;
    @Input() selectedProvince: any;
    @Input() selectedDistrict: any;
    @Input() selectedSector: any;
    @Input() selectedCell: any;
    @Input() selectedVillage: any;
    @Input() disableField!: boolean;
    @Input() disablePreselectedField!: boolean;
    @Input() ignoreValidation = false;
    @Output() selectedLocation: EventEmitter<LocationInfo> = new EventEmitter<LocationInfo>();
    validationTriggered = false;

    constructor(private dataService: DataService, private eventService: EventService) {}

    get EJurisdiction() {
        return EJurisdiction;
    }

    get showProvince() {
        return (
            this.limit === EJurisdiction.PROVINCE ||
            this.showDistrict ||
            (this.disableField && this._d[this.limit] >= this._d['PROVINCE'])
        );
    }

    get showDistrict() {
        return (
            this.limit === EJurisdiction.DISTRICT ||
            this.showSector ||
            (this.disableField && this._d[this.limit] >= this._d['DISTRICT'])
        );
    }

    get showSector() {
        return (
            this.limit === EJurisdiction.SECTOR ||
            this.showCell ||
            (this.disableField && this._d[this.limit] >= this._d['SECTOR'])
        );
    }

    get showCell() {
        return (
            this.limit === EJurisdiction.CELL ||
            this.showVillage ||
            (this.disableField && this._d[this.limit] >= this._d['CELL'])
        );
    }

    get showVillage() {
        return this.limit === EJurisdiction.VILLAGE || (this.disableField && this._d[this.limit] >= this._d['VILLAGE']);
    }

    ngOnInit(): void {
        this.getProvinces();
        this.eventService.locationFormTriggerValidation.subscribe((res) => {
            this.validationTriggered = res;
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['limit'] !== undefined) {
            this.limit = changes['limit'].currentValue;
        }

        if (changes['selectedProvince'] !== undefined) {
            this.selectedProvince = changes['selectedProvince'].currentValue;
            if (this.selectedProvince) {
                this.getDistricts(this.selectedProvince);
            }
        }

        if (changes['selectedDistrict'] !== undefined) {
            this.selectedDistrict = changes['selectedDistrict'].currentValue;
            if (this.selectedDistrict) {
                this.getSectors(this.selectedDistrict);
            }
        }

        if (changes['selectedSector'] !== undefined) {
            this.selectedSector = changes['selectedSector'].currentValue;
            if (this.selectedSector) {
                this.getCells(this.selectedSector);
            }
        }

        if (changes['selectedCell'] !== undefined) {
            this.selectedCell = changes['selectedCell'].currentValue;
            if (this.selectedCell) {
                this.getVillages(this.selectedCell);
            }
        }

        if (changes['selectedVillage'] !== undefined) {
            this.selectedVillage = changes['selectedVillage'].currentValue;
        }

        if (changes['disableField'] !== undefined) {
            this.disableField = changes['disableField'].currentValue;
        }
    }

    getProvinces(): void {
        this.dataService.getProvinces().subscribe((res: any) => {
            if (res.status) {
                this.provinces = res.response;
            }
        });
    }

    onProvinceChange(e: any) {
        // reset previously loaded data
        this.sectors = [];
        this.cells = [];
        this.villages = [];

        if (this._d[this.limit] >= this._d['PROVINCE'] || this.ignoreValidation) {
            this.locationInfo.id = e?.id;
            this.locationInfo.type = EJurisdiction.PROVINCE;
            this.locationInfo.code = e.code;
            this.locationInfo.name = e.name;
            // should emit the selected province id
            this.selectedLocation.emit(this.locationInfo);
            if (this.limit !== EJurisdiction.PROVINCE) {
                this.getDistricts(e?.id);
            }
            return;
        }
        this.getDistricts(e?.id);
    }

    getDistricts(id: string): void {
        this.dataService.getDistrictsByProvinceId(id).subscribe((res: any) => {
            if (res.status) {
                this.districts = res.response;
            }
        });
    }

    onDistrictChange(e: any) {
        this.cells = [];
        this.villages = [];
        this.locationInfo.id = e?.id;
        this.locationInfo.type = EJurisdiction.DISTRICT;
        this.locationInfo.code = e.code;
        this.locationInfo.name = e.name;
        if (this.ignoreValidation) {
            this.selectedLocation.emit(this.locationInfo);
        }
        if (this._d[this.limit] >= this._d['DISTRICT']) {
            // should emit the selected district id
            this.selectedLocation.emit(this.locationInfo);
            if (this.limit !== EJurisdiction.DISTRICT) {
                this.getSectors(e?.id);
            }
            return;
        }
        this.getSectors(e?.id);
    }

    getSectors(id: string): void {
        this.dataService.getSectorsByDistrictId(id).subscribe((res: any) => {
            if (res.status) {
                this.sectors = res.response;
            }
        });
    }

    onSectorChange(e: any) {
        this.villages = [];
        this.locationInfo.id = e?.id;
        this.locationInfo.type = EJurisdiction.SECTOR;
        this.locationInfo.code = e.code;
        this.locationInfo.name = e.name;
        if (this.ignoreValidation) {
            this.selectedLocation.emit(this.locationInfo);
        }
        if (this._d[this.limit] >= this._d['SECTOR']) {
            // should emit the selected sector id
            this.selectedLocation.emit(this.locationInfo);
            if (this.limit !== EJurisdiction.SECTOR) {
                this.getCells(e?.id);
            }
            return;
        }
        this.getCells(e?.id);
    }

    getCells(id: string): void {
        this.dataService.getCellsBySectorId(id).subscribe((res: any) => {
            if (res.status) {
                this.cells = res.response;
            }
        });
    }

    onCellChange(e: any) {
        this.locationInfo.id = e?.id;
        this.locationInfo.type = EJurisdiction.CELL;
        this.locationInfo.code = e.code;
        this.locationInfo.name = e.name;
        if (this.ignoreValidation) {
            this.selectedLocation.emit(this.locationInfo);
        }
        if (this._d[this.limit] >= this._d['CELL']) {
            // should emit the selected cell id
            this.selectedLocation.emit(this.locationInfo);
            if (this.limit !== EJurisdiction.CELL) {
                this.getVillages(e?.id);
            }
            return;
        }
        this.getVillages(e?.id);
    }

    getVillages(id: string): void {
        this.dataService.getVillagesByCellId(id).subscribe((res: any) => {
            if (res.status) {
                this.villages = res.response;
            }
        });
    }

    onVillageChange(e: any) {
        this.locationInfo.id = e?.id;
        this.locationInfo.type = EJurisdiction.VILLAGE;
        this.locationInfo.code = e.code;
        this.locationInfo.name = e.name;
        // should emit selected village id
        this.selectedLocation.emit(this.locationInfo);
    }
}

interface LocationInfo {
    id?: string;
    type?: EJurisdiction;
    code?: string;
    name?: string;
}
