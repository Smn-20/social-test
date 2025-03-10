import { HouseholdService } from 'src/app/core/services/household.service';
import { EState } from '../../../core/enums/state.enum';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';
import { EventService } from 'src/app/core/services/event.service';

@Component({
    selector: 'app-target-group-category',
    templateUrl: './target-group-category.component.html',
    styleUrls: ['./target-group-category.component.css'],
})
export class TargetGroupCategoryComponent {
    @Input() targetGroupCategory: any;
    @Input() index!: number;
    @Input() editable = false;
    @Input() hideRemoveButton = false;
    @Input() hideCanceButton = false;
    @Input() hideActionButtons = false;
    @Input() openEditForm = false;
    @Input() isPreview = false;
    @Input() showStatus = false;
    @Input() elpsisNo = 50;
    @Output() removeEvent = new EventEmitter<any>();
    @Output() cancelEvent = new EventEmitter<any>();
    @Output() actionEvent = new EventEmitter();

    public EState = EState;
    confirmAction = '';
    actionLoading = false;

    constructor(
        private householdService: HouseholdService,
        private globalService: GlobalService,
        private eventService: EventService
    ) {}

    removeTargetGroupCategory(): void {
        this.removeEvent.emit(this.index);
    }

    onActionEvent(action: string, event: any): void {
        if (action === 'edit-target-group-category') {
            this.toggleEditForm();
            this.targetGroupCategory = event;
        } else {
            this.actionEvent.emit({ action, event });
        }
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

    onCancelEvent(): void {
        this.openEditForm = false;
        this.cancelEvent.emit({ action: 'cancel-target-group-category', event: this.index });
    }

    triggerAction(evt: any): void {
        this.actionLoading = true;
        this.householdService.actionTargetingGroup(evt.id, this.confirmAction).subscribe((res) => {
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
