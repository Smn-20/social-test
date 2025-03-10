import { GlobalService } from 'src/app/core/services/global.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EventService } from 'src/app/core/services/event.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { EState } from 'src/app/core/enums';

@Component({
    selector: 'app-target-group',
    templateUrl: './target-group.component.html',
    styleUrls: ['./target-group.component.css'],
})
export class TargetGroupComponent implements OnInit {
    @Input() targetGroup: any;
    @Input() index!: number;
    @Input() criterias: any[] = [];
    @Input() editable = false;
    @Input() hideRemoveButton = false;
    @Input() openEditForm = false;
    @Input() criteriaConfig: any = {
        isStringArray: false,
        showStatus: false,
        showRemoveButton: true,
        editable: false,
        hideActionButtons: false,
    };
    @Input() showStatus = false;
    @Output() removeEvent = new EventEmitter<any>();
    @Output() removeTargetGroupEvent = new EventEmitter<any>();
    @Output() actionEvent = new EventEmitter();
    toggleCriteriaForm = false;
    selectedCriteria: any;
    public EState = EState;
    confirmAction = '';
    actionLoading = false;

    constructor(
        private householdService: HouseholdService,
        private globalService: GlobalService,
        private eventService: EventService
    ) {}

    ngOnInit(): void {
        if (this.targetGroup?.name) {
            this.criterias = this.targetGroup.criteria;
            this.addIndex();
        }
        this.eventService.streamingGroupFilterCriterias.subscribe((res: { [key: number]: any[] }) => {
            if (res && parseInt(Object.keys(res)[0]) === this.index) {
                this.criterias = res[this.index];
                this.addIndex();
            }
        });
    }

    addIndex(): void {
        if (this.criterias && this.criterias.length > 0) {
            this.criterias.forEach((el, i) => {
                el.index = i;
            });
        }
    }

    removeCriteria(i: number): void {
        this.removeEvent.emit(i);
    }

    removeTargetGroup(): void {
        this.removeTargetGroupEvent.emit(this.index);
    }

    onActionEvent(action: string, event: any): void {
        this.openEditForm = false;
        switch (action) {
            case 'edit-criteria':
                this.toggleEditForm();
                this.selectedCriteria = event.event;
                break;
            case 'edit-category':
            case 'update-category':
                this.toggleCategoryEditForm();
                this.targetGroup = event;
                break;
            default:
                break;
        }
        this.actionEvent.emit({ action, event });
    }

    toggleEditForm(): void {
        this.toggleCriteriaForm = !this.toggleCriteriaForm;
        this.onActionEvent('criteria-editing', this.toggleCriteriaForm);
    }

    toggleCancelEvent(): void {
        this.openEditForm = false;
        this.removeTargetGroup();
    }

    toggleCategoryEditForm(): void {
        this.openEditForm = !this.openEditForm;
    }

    onCriteriaEvent(evt: any): void {
        if (this.selectedCriteria?.criteria) {
            this.onActionEvent('edit-criteria', {
                event: { ...evt, criteriaId: this.selectedCriteria.id },
                index: this.selectedCriteria.index,
            });
            this.resetSelectedCriteria();
        } else {
            this.onActionEvent('add-criteria', evt);
        }
    }

    resetSelectedCriteria(): void {
        this.selectedCriteria = null;
    }

    onTargetGroupUpdate(action: string, event: any): void {
        this.actionEvent.emit({ action, event });
        this.openEditForm = false;
    }

    onEnableDisable(action: 'enable' | 'disable'): void {
        this.confirmAction = action;
    }

    close(): void {
        this.confirmAction = '';
    }

    triggerAction(evt: any): void {
        this.actionLoading = true;
        this.householdService.actionTargetCategory(evt.id, this.confirmAction).subscribe((res) => {
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
