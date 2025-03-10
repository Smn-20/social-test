import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class EventService {
    actionFinished = new Subject<string | any>();
    locationFilterEvent = new Subject<any>();
    getDataEvent = new Subject<any>();
    selectFilter = new Subject<any>();
    locationFormTriggerValidation = new Subject<any>();
    stopAllLoaders = new Subject<boolean>();
    streamingGroupFilterCriterias = new Subject<{ [key: number]: any[] }>();
    triggerFormValidation = new Subject<string>();
    closeEvent = new Subject<any>();
    saveEvent = new Subject<any>();

    constructor() {}

    onActionFinished(event: string | any) {
        this.actionFinished.next(event);
    }

    onGetDataEvent(event: any) {
        this.getDataEvent.next(event);
    }

    onLocationFilterEvent(event: any) {
        this.locationFilterEvent.next(event);
    }

    onSelectFilter(event: any) {
        this.selectFilter.next(event);
    }

    onLocationFormTriggerValidationEvent(event: any) {
        this.locationFormTriggerValidation.next(event);
    }

    triggerStopLoaders(event: boolean) {
        this.stopAllLoaders.next(true);
    }

    onStreamCriterias(event: { [key: number]: any[] }) {
        this.streamingGroupFilterCriterias.next(event);
    }

    onChildrenComponentsValidation(component: string) {
        this.triggerFormValidation.next(component);
    }

    onSave(action: string, event: any) {
        this.saveEvent.next({ action, event });
    }

    onClose(action: string, event: any) {
        this.closeEvent.next({ action, event });
    }
}
