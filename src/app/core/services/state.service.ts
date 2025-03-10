// global-state.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { navigation } from '../utils/reusable-arrays';

@Injectable({
    providedIn: 'root',
})
export class StateService {
    private readonly initialState = {
        sideBarOpen: false,
        sidebarOpenMobile: false,
        programs: [], // dispact this state when we are on the programs page just in case we want to create a programs
        cutOffs: [], // dispact this state when we are on the programs page just in case we want to create a programs
        roles: [], // dispact this state when we are on the users page just in case we want to create a user
        institutions: [],
        navigation: navigation,
        breadcrumb: {},
        appealsCounts: 0,
        archiveCounts: 0,
        transferCounts: 0,
        translationCounts: 0,
    };
    private readonly stateSubject = new BehaviorSubject<any>(this.initialState);
    readonly state$: Observable<any> = this.stateSubject.asObservable();

    // Getter function to retrieve the current state
    getState(): any {
        return this.stateSubject.value;
    }

    // Setter function to update the state with immutability
    setStateAll(newState: any): void {
        const currentState = this.getState();
        const nextState = { ...currentState, ...newState };
        this.stateSubject.next(nextState);
    }

    //Setter function to update the state with immutability but for a specific field in the state
    setState(fieldName: string, newValue: any): void {
        const currentState = this.getState();
        const nextState = { ...currentState, [fieldName]: newValue };
        this.stateSubject.next(nextState);
    }
}
