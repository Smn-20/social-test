import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from 'src/app/core/services/event.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { removeIndex, ResponseObject } from 'src/app/core/utils/reusable-functions';
import { EOperations, EState } from 'src/app/core/enums';
import { TranslationService } from 'src/app/core/services/translation.service';
import { IConditionValue, ICriteria, IOneSidedConditionValue, ITargetGroupPayload, ITwoSidedConditionValue } from 'src/app/core/types';

@Component({
    selector: 'app-revamped-create-program-flow',
    templateUrl: './revamped-create-program-flow.component.html',
    styleUrls: ['./revamped-create-program-flow.component.css'],
})
export class RevampedCreateProgramFlowComponent implements OnDestroy {
    loading = false;
    criterias: { [key: number]: any[] } = {}; //key categoty group index
    categories: { [key: number]: any[] } = {}; //key target group index
    targetGroups: any[] = [];
    criteriaFormIsOpen = false;
    toggleNewTargetingForm = false;
    programDataLoading = false;
    showForm = false;
    selectedTargetGroups: any[] = [];
    program: any;
    steps: any[] = [];
    openProgramEditForm = true;

    programData!: any;

    public EOperations = EOperations;

    snackBarMessages: string [] = [
        'sameTargetGroupNameNotAllowed',
        'targetGroupCriteriasMissing'
    ]   // snackbar messages to be translated --> PLEASE do NOT modify the array values 

    constructor(
        private globalService: GlobalService,
        private householdService: HouseholdService,
        private eventService: EventService,
        private router: Router,
        private route: ActivatedRoute,
        private translationService: TranslationService
    ) {
        this.route.params.subscribe((params: any) => {
            if (params?.id) {
                this.getProgramInfo(params?.id);
            } else {
                this.initUpdate();
            }
        });
    }

    ngOnDestroy(): void {
        this.cleanLocalStorage();
    }

    cleanLocalStorage(): void {
        localStorage.removeItem('new-program');
    }

    receiveCoreProgramData = (data: any) => {
        this.programData = data;
    }

    receiveCriteriaData = (data: any) => {
        this.criterias = data;
        this.programData.criterias = this.criterias;
    }

    transformProgramFromFrontend(frontendProgram: any) {
        return {
            programReturns: frontendProgram.programReturns?.value,
            programName: frontendProgram.programName,
            cutoffGroup: frontendProgram.cutoffId?.id,
            includedPrograms: frontendProgram.programId.map((program: { id: any; }) => program?.id),
            excludedPrograms: frontendProgram.programIdd.map((program: { id: any; }) => program?.id) ?? [],
            institution: frontendProgram.institutionName?.id,
            criterias: frontendProgram.criterias.map((frontendCriteria: ICriteria) => ({
                criteriaId: frontendCriteria.criteria_id,
                criteriaStatement: frontendCriteria.criteria_statement,
                appliesTo: frontendCriteria.applies_to,
                mustMeet: frontendCriteria.must_meet,
                conditions: frontendCriteria.conditions.map((frontendCondition: any) => ({
                    conditionId: frontendCondition.condition_id,
                    questionCategory: frontendCondition.question_category,
                    question: frontendCondition.question?.id,
                    conditionStatus: EState.ACTIVE,
                    conditionCategory: {
                        inputType: frontendCondition.condition_category.inputType,
                        questionType: frontendCondition.condition_category.questionType,
                        respondentType: frontendCondition.condition_category.respondentType,
                    },
                    conditionValue: this.transformConditionValue(frontendCondition.condition_value),
                    conditionMetricValue: frontendCondition.value === 'ALL'
                        ? { type: 'ONE_SIDED', operation: 'EQUAL', value: 'ALL' }
                        : this.transformConditionValue(frontendCondition.value),
                }))
            }))
        };
    }
  
    renderAnswerAccordingToType(value: any) {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            const parsedValue = Number(value);
            return isNaN(parsedValue) ? value : parsedValue;
        }
        if (value instanceof Event) {
            const inputValue = (value.target as HTMLInputElement)?.value;
            const parsedValue = Number(inputValue);
            return isNaN(parsedValue) ? inputValue : parsedValue;
        }
        if (Array.isArray(value)) {
            return value.map(v => v.id ?? v);
        }
        if (typeof value === 'object' && value !== null) {
            return value.id ?? value;
        }
        return value;
    }

    // Updated transformation for condition values
    transformConditionValue(conditionValue: ITwoSidedConditionValue | IOneSidedConditionValue) {
        if ('number_value_one' in conditionValue && 'number_value_two' in conditionValue) {
            return {
                type: 'TWO_SIDED',
                operation: conditionValue.operation,
                numberValueOne: this.renderAnswerAccordingToType(conditionValue.number_value_one),
                numberValueTwo: this.renderAnswerAccordingToType(conditionValue.number_value_two),
            }
        } else {
            return {
                type: 'ONE_SIDED',
                operation: conditionValue.operation,
                value: this.renderAnswerAccordingToType(conditionValue.value),
            }
        }
    }
  
    saveProgramPayload = (isCancelled: boolean) => {
        if (isCancelled) {
            // delete program data and remove it from the other components while if edit cancel
        } else {
            console.error(this.programData)
            console.warn(this.transformProgramFromFrontend(this.programData))
        }
    }










    initUpdate(): void {
        const programData = localStorage.getItem('new-program');
        if (programData) {
            const program = { ...this.program, ...JSON.parse(programData) };
            program.excludedProgramIds = this.mapExcludedIds(program.excludedProgramIds);
            program.includedProgramIds = this.mapExcludedIds(program.includedProgramIds);
            const { targetGroups } = program;
            program.programGroups = targetGroups;
            program.targetGroups = targetGroups;
            this.program = program;

            this.setProgramData(targetGroups);
        }
    }

    mapExcludedIds(arr: any[]): any[] {
        return arr.map((el: any) => {
            return { ...el, programName: el.name };
        });
    }

    setProgramData(targetGroups: any, isCompleted = false): void {
        this.targetGroups = targetGroups;
        targetGroups.forEach((el: any, i: number) => {
            this.categories[i] = el.categories;
        });
        const arr: any[] = [...this.targetGroups];
        this.steps = arr.map((el: any, i: number) => {
            return { step: i + 1, label: el.name, isCompleted };
        });
        this.householdService.setTargetingProgramData(arr);
    }

    getProgramInfo(id: string): void {
        this.programDataLoading = true;
        this.householdService.getProgramId(id).subscribe((res: ResponseObject<any>) => {
            this.programDataLoading = false;
            if (res.status) {
                this.program = res.response;

                const { programGroups } = this.program;
                this.program.targetGroups = programGroups;
                this.setProgramData(programGroups, this.program?.id);
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    removeCriteria(targetIndex: number, criteriaIndex: number): void {
        this.criterias[targetIndex] = removeIndex(this.criterias[targetIndex], criteriaIndex);
        this.eventService.onStreamCriterias({ [targetIndex]: this.criterias[targetIndex] });
    }

    removeTargetGroup(i: number): void {
        this.targetGroups = removeIndex(this.targetGroups, i);
        this.criterias[i] = [];
    }

    onTargetGroup(evt: any): void {
        const targetGroup = this.targetGroups.find(({ name }) => name === evt.name);
        if (!targetGroup) {
            this.targetGroups.push(evt);
            this.toggleNewTargetingProgram();
            this.showForm = false;
        } else {
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe(res => {
                this.globalService.openFailureSnackBar(res)
            });
        }
    }

    submitProgram(): void {
        if (
            Object.keys(this.criterias).length !== this.targetGroups.length &&
            this.targetGroups.some((el, i) => this.criterias[i].length > 0)
        ) {
            this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe(res => {
                this.globalService.openFailureSnackBar(res)
            });
            return;
        } else {
            this.createProgram();
        }
    }

    createProgram(): void {
        const request = {
            programName: this.program.programName,
            cutOffId: this.program.cutOff.id,
            targetGroups: this.targetGroups,
            institutionId: this.program.institutionId.id,
            matchAllGroups: this.program.matchAllGroups,
            excludedProgramIds: this.program.excludedProgramIds.map((el: any) => el.id),
            includedProgramIds: this.program.includedProgramIds.map((el: any) => el.id),
        };
        this.loading = true;
        if (this.program?.id) {
            this.householdService.updateProgram(this.program?.id, request).subscribe((res) => {
                this.processRes(res);
            });
        } else {
            this.householdService.createProgram(request).subscribe((res) => {
                this.processRes(res);
            });
        }
    }

    processRes(res: any): void {
        this.loading = false;
        if (res?.status) {
            this.eventService.onActionFinished('programs');
            this.globalService.openSuccessSnackBar(res.message);
            this.cleanLocalStorage();
            this.router.navigate(['/admin/targeting/programs']);
        } else {
            this.globalService.openFailureSnackBar(res.message);
        }
    }

    onActionReceive(evt: any, i: number): void {
        const { action, event } = evt;

        if (action === 'criteria-editing') {
            this.criteriaFormIsOpen = event;
        }

        if (action === 'add-criteria') {
            if (!this.criterias[i]) {
                this.criterias[i] = [event];
                this.eventService.onStreamCriterias({ [i]: this.criterias[i] });
            } else {
                this.criterias[i].push(event);
                this.eventService.onStreamCriterias({ [i]: this.criterias[i] });
            }
        }

        if (action === 'edit-criteria') {
            const newCriterias = [...this.criterias[i]];
            newCriterias[event.index] = event;
            this.criterias[i] = newCriterias;
            this.eventService.onStreamCriterias({ [i]: this.criterias[i] });
        }

        if (action === 'editable-add-criteria') {
            this.criterias[i] = [...this.criterias[i], event];
            this.eventService.onStreamCriterias({ [i]: this.criterias[i] });
        }

        if (action === 'update-target-group') {
            const foundIndex = this.selectedTargetGroups.findIndex((obj) => obj.id === event.id);

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
                const newArr = [...this.targetGroups];
                newArr[i] = event;
                this.targetGroups = newArr;
            }
        }
    }

    save(evt: any): void {
        this.openProgramEditForm = false;
        evt.programGroups = evt.targetGroups.map((el: any, i: number) => {
            return { ...el, categories: this.categories[i] };
        });
        const { programGroups } = evt;
        const newProgram = {
            ...this.program,
            programName: evt.programName,
            excludedProgramIds: this.mapExcludedIds(evt.excludedProgramIds),
            includedProgramIds: this.mapExcludedIds(evt.includedProgramIds),
            targetGroups: programGroups,
            programGroups: programGroups,
            matchAllGroups: evt.matchAllGroups,
        };
        this.program = newProgram;
        this.setProgramData(programGroups, this.program?.id);
    }

    toggleNewTargetingProgram(): void {
        this.toggleNewTargetingForm = !this.toggleNewTargetingForm;
    }

    toggleShowForm(): void {
        this.showForm = !this.showForm;
        this.toggleNewTargetingForm = false;
    }

    toggleProgramEditForm(): void {
        this.openProgramEditForm = !this.openProgramEditForm;
    }

    onNext(event: any, index: number, isNext = true): void {
        const condition = isNext ? index + 1 : index;
        this.processNextPrev(event, index);

        if (this.targetGroups.length === condition) {
            this.createProgram();
        } else {
            this.steps[index].isCompleted = true;
        }
    }

    onPrevious(event: any, index: number): void {
        this.processNextPrev(event, index);
    }

    processNextPrev(event: any, index: number, isNext = true): void {
        const newTargetGroups = [...this.targetGroups];

        newTargetGroups[index] = {
            ...newTargetGroups[index],
            categories: isNext ? event : newTargetGroups[index].categories,
        };
        this.categories[index] = isNext ? event : newTargetGroups[index].categories;
        this.targetGroups = newTargetGroups;
        this.householdService.setTargetingProgramData(newTargetGroups);
    }
}
