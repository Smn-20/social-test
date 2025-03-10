import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EventService } from 'src/app/core/services/event.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { removeIndex } from 'src/app/core/utils/reusable-functions';

@Component({
    selector: 'app-category-section',
    templateUrl: './category-section.component.html',
    styleUrls: ['./category-section.component.css'],
})
export class CategorySectionComponent implements OnInit {
    @Input() targetGroup: any;
    @Input() isLast = false;
    @Input() isFirst = false;
    @Input() isLoading = false;
    @Input() index = -1;
    @Input() categories: any[] = [];
    @Output() categoriesEvent = new EventEmitter<any>();
    @Output() nextEvent = new EventEmitter<any>();
    @Output() previousEvent = new EventEmitter<any>();

    criterias: { [key: number]: any[] } = {};
    criteriaFormIsOpen = false;
    toggleNewTargetingForm = false;
    showForm = false;
    selectedTargetGroups: any[] = [];
    erroredCategory = -1;
    matchAllCategories = false;

    snackBarMessages: string [] = ['sameTargetGroupNameNotAllowed', 'emptyCategoryCantProceed', 'criteriasMissingInCategory']   // snackbar messages to be translated --> PLEASE do NOT modify the array values 

    constructor(
        private globalService: GlobalService,
        private householdService: HouseholdService,
        private eventService: EventService,
        private translationService: TranslationService
    ) {}

    ngOnInit() {
        if (this.targetGroup?.name && this.targetGroup.categories?.length > 0) {
            this.targetGroup.categories.forEach((el: any, i: number) => {
                this.criterias[i] = el.criteria;
            });
        }
    }

    processCriteria(i: number, event: any): void {
        if (!this.criterias[i]) {
            this.criterias[i] = [event];
            this.eventService.onStreamCriterias({ [i]: this.criterias[i] });
        } else {
            this.criterias[i].push(event);
            this.eventService.onStreamCriterias({ [i]: this.criterias[i] });
        }
    }

    onActionReceive(evt: any, i: number): void {
        const { action, event } = evt;
        if (action === 'criteria-editing') {
            this.criteriaFormIsOpen = !this.criteriaFormIsOpen;
        }
        let newCriterias: { [key: number]: any[] } = {};
        let foundIndex = -1;
        switch (action) {
            case 'add-criteria':
                this.processCriteria(i, event);
                break;
            case 'edit-criteria':
            case 'update-criteria':
                if (event.index > -1) {
                    newCriterias = { ...this.criterias };
                    newCriterias[i][event.index] = { ...event.event, index: event.index };
                    this.criterias = newCriterias;
                }
                break;
            case 'editable-add-criteria':
                this.criterias[i] = [...this.criterias[i], event];
                this.eventService.onStreamCriterias({ [i]: this.criterias[i] });
                break;
            case 'update-target-group':
                foundIndex = this.selectedTargetGroups.findIndex((obj) => obj.id === event.id);

                if (foundIndex !== -1) {
                    const newArr = [...this.selectedTargetGroups];
                    newArr[foundIndex] = event;
                    this.selectedTargetGroups = newArr;

                    this.householdService.updateTargetingGroup(event.id, event).subscribe((res) => {
                        if (res?.status) {
                            this.globalService.openSuccessSnackBar(res.message);
                            return;
                        }
                    });
                } else {
                    const newArr = [...this.categories];
                    newArr[i] = event;
                    this.categories = newArr;
                }
                break;
            case 'add-category':
                this.onTargetGroup(event);
                break;
            case 'edit-category':
            case 'update-category':
                if (this.categories[i]) {
                    const newArr = [...this.categories];
                    newArr[i] = event;
                    this.categories = newArr;
                    this.showForm = false;
                    this.toggleNewTargetingForm = false;
                }

                break;
        }
    }

    toggleNewTargetingProgram(): void {
        this.toggleNewTargetingForm = !this.toggleNewTargetingForm;
    }

    toggleShowForm(): void {
        this.showForm = !this.showForm;
        this.toggleNewTargetingForm = false;
    }

    removeCriteria(targetIndex: number, criteriaIndex: number): void {
        if (criteriaIndex !== 0) {
            this.criterias[targetIndex] = removeIndex(this.criterias[targetIndex], criteriaIndex);
            this.eventService.onStreamCriterias({ [targetIndex]: this.criterias[targetIndex] });
        } else {
            this.criterias[targetIndex] = [];
            this.eventService.onStreamCriterias({ [targetIndex]: [] });
        }
    }

    removeTargetGroup(i: number): void {
        this.categories = removeIndex(this.categories, i);
        this.criterias[i] = [];
    }

    onTargetGroup(evt: any): void {
        const targetGroup = this.categories?.find(({ name }) => name === evt.name);
        if (!targetGroup) {
            const newCats = [];
            newCats.push(evt);
            this.categories = newCats;
            this.showForm = false;
            this.toggleNewTargetingForm = false;
        } else {
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe(res => {
                this.globalService.openFailureSnackBar(res)
            });
        }
    }

    onNext(): void {
        const empyCategory = this.categories?.length === 0 || !this.categories;
        const emptyCriteria = this.categories?.some((el, i) => !this.criterias[i] || this.criterias[i]?.length < 1);
        if (empyCategory) {
            this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe(res => {
                this.globalService.openFailureSnackBar(res)
            });
            return;
        }
        if (emptyCriteria) {
            this.translationService.getInstantTranslations(this.snackBarMessages[2]).subscribe(res => {
                this.globalService.openFailureSnackBar(res)
            });
            return;
        }
        this.nextEvent.emit(this.newCats());
    }

    newCats(): any[] {
        let cats = [...this.categories];
        cats = cats.map((el, i) => {
            return { ...el, criteria: this.criterias[i] };
        });
        this.categories = cats;
        return cats;
    }

    onPrevious(): void {
        this.previousEvent.emit(this.newCats());
    }

    toggleMoreCategory(): void {
        this.categories.push({
            members: '',
            name: '',
            operation: '',
        });
        this.toggleNewTargetingForm = true;
    }
}
