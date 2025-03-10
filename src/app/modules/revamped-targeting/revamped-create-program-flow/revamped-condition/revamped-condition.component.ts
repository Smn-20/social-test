import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EState } from 'src/app/core/enums';
import {
	IConditionValue,
	IOneSidedConditionValue,
	ITwoSidedConditionValue
} from 'src/app/core/types';

@Component({
	selector: 'app-revamped-condition',
	templateUrl: './revamped-condition.component.html',
	styleUrls: ['./revamped-condition.component.css']
})
export class RevampedConditionComponent {
	@Input() condition?: any; /// change to a proper rough type ==> IConditionValue
	@Input() showRemoveButton = true;
	@Input() hideActionButtons = false;
	@Input() showStatus = false;
	@Input() isStringArray = false;
	@Input() isSmallCard = false;
	@Input() elpsisNo = 50;
	@Input() editable = false;
	@Output() removeEvent = new EventEmitter<any>();
	public EState = EState;
	conditionStatus = EState.INACTIVE;
	openEditForm = false;
	openEditFormOut = false;
	confirmAction = '';
	actionLoading = false;

	getConditionValue(
		condition_value: ITwoSidedConditionValue | IOneSidedConditionValue | 'ALL',
		is_second_value: boolean
	): string | number | boolean | string[] | null {
		return (condition_value as IOneSidedConditionValue)?.value ?? 
			(is_second_value 
				? (condition_value as ITwoSidedConditionValue)?.number_value_two
				: (condition_value as ITwoSidedConditionValue)?.number_value_one) ?? null;
	}

	getOperationValue(value: ITwoSidedConditionValue | IOneSidedConditionValue | 'ALL'): string {
		return value === 'ALL' ? 'ALL' : 
			((value as ITwoSidedConditionValue | ITwoSidedConditionValue)?.operation)
	}

	checkIfArray(value: any): boolean {
		return Array.isArray(value)
	}

	turnToArray(value: any): Array<any> {
		return Array.from(value)
	}

	renderAnswerString(value: any): string {
		if (typeof value === 'string' || typeof value === 'number') {
			return value.toString();
		}
		return value?.answer ?? value?.target?.value ?? 'UNKNOWN';
	}

	removeCondition(i: number): void {
		this.removeEvent.emit(i);
	}

	getValue(arr: any): any[] {
		return arr?.split('_') || [];
	}

	onActionEvent(action: string, event: any): void {
		if (action === 'edit-condition') {
			this.openEditFormOut = !this.openEditFormOut;
		}
		// this.actionEvent.emit({ action, event: { ...this.criteria, ...event } });
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
		// this.householdService.actionProgramCriteria(evt.id, this.confirmAction).subscribe((res) => {
		// 	this.actionLoading = false;
		// 	if (res?.status) {
		// 		this.eventService.onActionFinished('programs');
		// 		this.globalService.openSuccessSnackBar(res.message);
		// 		this.close();
		// 	} else {
		// 		this.globalService.openFailureSnackBar(res.message);
		// 	}
		// });
	}
}
