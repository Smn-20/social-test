import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventService } from 'src/app/core/services/event.service';
import { EJurisdiction } from 'src/app/core/enums/jurisdiction.enum';

@Component({
    selector: 'app-jurisdiction-filter',
    templateUrl: './jurisdiction-filter.component.html',
    styleUrls: ['./jurisdiction-filter.component.css'],
})
export class JurisdictionFilterComponent {
    limit = EJurisdiction.VILLAGE;
    selectedLocation!: string;
    preselectedLocation: any;
    disableLimit!: EJurisdiction;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<JurisdictionFilterComponent>,
        private eventService: EventService
    ) {
        this.preselectedLocation = data.selectedJurisdictionLocation;
        this.disableLimit = data.disableLimit;
    }

    receiveLocation(e: any): void {
        this.selectedLocation = e;
    }

    apply() {
        if (this.selectedLocation) {
            if(!this.data.isDashboard){
                this.eventService.onLocationFilterEvent(this.selectedLocation);
            }else{
                this.eventService.onGetDataEvent(this.selectedLocation);
            }
            this.dialogRef.close();
        }
    }
}
