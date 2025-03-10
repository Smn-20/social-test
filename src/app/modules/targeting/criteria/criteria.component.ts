import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EventService } from 'src/app/core/services/event.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { interviewees2 } from 'src/app/core/utils/reusable-arrays';
import { EState } from 'src/app/core/enums';

@Component({
    selector: 'app-criteria',
    templateUrl: './criteria.component.html',
    styleUrls: ['./criteria.component.css'],
})
export class CriteriaComponent {
    @Input() criteria: any;
    @Input() index!: number;
    @Input() showRemoveButton = true;
    @Input() hideActionButtons = false;
    @Input() showStatus = false;
    @Input() isStringArray = false;
    @Input() isSmallCard = false;
    @Input() criteriaRenameLoading = false;
    @Input() elpsisNo = 50;
    @Input() editable = false;
    @Output() removeEvent = new EventEmitter<any>();
    @Output() actionEvent = new EventEmitter();
    public EState = EState;
    openEditForm = false;
    openEditFormOut = false;
    respondentTypes: any[] = interviewees2;
    confirmAction = '';
    actionLoading = false;

    constructor(
        private householdService: HouseholdService,
        private globalService: GlobalService,
        private eventService: EventService
    ) {}

    removeCriteria(i: number): void {
        this.removeEvent.emit(i);
    }

    getValue(arr: any): any[] {
        return arr?.split('_') || [];
    }

    onActionEvent(action: string, event: any): void {
        if (action === 'edit-criteria') {
            this.openEditFormOut = !this.openEditFormOut;
        }
        this.actionEvent.emit({ action, event: { ...this.criteria, ...event } });
    }

    toggleEditForm(): void {
        this.openEditForm = !this.openEditForm;
    }

    onEnableDisable(action: 'enable' | 'disable'): void {
        this.confirmAction = action;
    }

    close(): void {
        this.confirmAction = '';
    }

    triggerAction(evt: any): void {
        this.actionLoading = true;
        this.householdService.actionProgramCriteria(evt.id, this.confirmAction).subscribe((res) => {
            this.actionLoading = false;
            if (res?.status) {
                this.eventService.onActionFinished('programs');
                this.globalService.openSuccessSnackBar(res.message);
                this.close();
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }
}
