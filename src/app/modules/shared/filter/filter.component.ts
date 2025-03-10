import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/services/auth.service';
import { EventService } from 'src/app/core/services/event.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { ResponseObject } from 'src/app/core/utils/reusable-functions';
import { EFilterAction, EJurisdiction, EState, ETargetingStatus } from 'src/app/core/enums';
import { JurisdictionFilterComponent } from 'src/app/modules/households/jurisdiction-filter/jurisdiction-filter.component';

@Component({
    selector: 'app-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.css'],
})
export class FilterComponent implements OnInit {
    @Input() allowedFilters!: EFilterAction[];
    @Input() statuses = [];
    @Input() roles = [];
    @Input() isDashboard?: boolean = false;
    @Input() isSelected?: boolean = false;
    @Input() dashboardTitle: any;
    @Input() selectedFilter = { type: null, code: null, id: null, name: null };
    @Input() selectedStatusFilter = { name: null, value: null };
    @Input() selectedRoleFilter = { roleName: null, id: null };

    @Output() setFilterEvent = new EventEmitter<{ action: EFilterAction; event: any }>();

    openFilters = false;
    isStatusDropdown = false;
    isRoleDropdown = false;
    selectedJurisdictionLocation: any;
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    location: any;
    public EState = EState;
    public EFilterAction = EFilterAction;
    public ETargetingStatus = ETargetingStatus;

    @ViewChild('filters') filters!: ElementRef;
    @ViewChild('filtersToggle') filtersToggle!: ElementRef;

    constructor(
        public dialog: MatDialog,
        private authService: AuthService,
        private eventService: EventService,
        private householdService: HouseholdService,
        private renderer: Renderer2
    ) {
        this.renderer.listen('window', 'click', (e: Event) => {
            if (
                e.target !== this.filtersToggle?.nativeElement &&
                e.target !== this.filters?.nativeElement &&
                this.openFilters
            ) {
                this.openFilters = false;
            }
        });
    }

    ngOnInit() {
        this.eventListening();
        this.getJuridictionLocation();
    }

    eventListening(): void {
        this.eventService.locationFilterEvent.subscribe((evt) => {
            if (evt) {
                if (this.selectedFilter.id === evt.id) {
                    return;
                }
                this.selectedFilter = evt;
                this.getJuridictionLocation();
                this.setFilterEvent.emit({ action: EFilterAction.LOCATION, event: this.selectedFilter });
            }
        });
    }

    toggleFilters() {
        const condition = this.allowedFilters?.length > 1;
        switch (true) {
            case condition:
                this.openFilters = !this.openFilters;
                break;
            case !condition && this.allowedFilters.includes(EFilterAction.LOCATION):
                this.openJurisdictionFilterDialog();
                break;
            case !condition && this.allowedFilters.includes(EFilterAction.ROLE):
                this.toggleRoleDropdown();
                break;
            case !condition && this.allowedFilters.includes(EFilterAction.STATUS):
                this.toggleStatusDropdown();
                break;
        }
    }

    toggleStatusDropdown() {
        this.toggleFilters();
        this.isStatusDropdown = !this.isStatusDropdown;
    }

    // set status filter
    setStatusFilter({ value, name }: { value: any; name: any }): void {
        this.selectedStatusFilter = { value, name };
        this.setFilterEvent.emit({ action: EFilterAction.STATUS, event: this.selectedStatusFilter });
    }

    // set role filter
    setRoleFilter({ id, roleName }: { id: any; roleName: any }): void {
        this.selectedRoleFilter = { id, roleName };
        this.setFilterEvent.emit({ action: EFilterAction.ROLE, event: this.selectedRoleFilter });
    }

    // clear status filter
    clearStatusFilter(): void {
        this.selectedStatusFilter = { value: null, name: null };
        this.isStatusDropdown = false;
        this.setFilterEvent.emit({ action: EFilterAction.STATUS, event: this.selectedStatusFilter });
    }

    // clear location filter
    clearFilter(): void {
        this.selectedFilter = { type: null, code: null, id: null, name: null };
        this.setFilterEvent.emit({ action: EFilterAction.LOCATION, event: this.selectedFilter });
    }

    // clear role filter
    clearRoleFilter(): void {
        this.selectedRoleFilter = { id: null, roleName: null };
        this.setFilterEvent.emit({ action: EFilterAction.ROLE, event: this.selectedRoleFilter });
    }

    toggleRoleDropdown() {
        this.toggleFilters();
        this.isRoleDropdown = !this.isRoleDropdown;
    }

    openJurisdictionFilterDialog(): void {
        if (this.dashboardTitle) {
            this.eventService.onSelectFilter(this.dashboardTitle);
        }
        this.dialog.open(JurisdictionFilterComponent, {
            data: {
                selectedJurisdictionLocation: this.selectedJurisdictionLocation,
                disableLimit: this.loggedInUser?.jurisdiction as EJurisdiction,
                isDashboard: this.isDashboard,
            },
            width: '576px',
        });
    }

    getJuridictionLocation(): void {
        this.householdService
            .getJuridictionLocation(
                this.selectedFilter.type || this.loggedInUser?.jurisdiction,
                this.selectedFilter.id || this.loggedInUser?.locationId
            )
            .subscribe((res: ResponseObject<any>) => {
                if (res.status) {
                    const { province, district, sector, cell, villages } = res.response;

                    this.selectedJurisdictionLocation = {
                        selectedProvince: province?.id,
                        selectedDistrict: district?.id,
                        selectedSector: sector?.id,
                        selectedCell: cell?.id,
                        selectedVillage: villages?.id,
                    };

                    if (!this.selectedFilter.name) {
                        const type = this.selectedFilter.type as any;
                        this.location = res.response[type?.toLowerCase()];
                    }
                }
            });
    }
}
