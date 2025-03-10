import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { InstitutionService } from 'src/app/core/services/institution.service';
import { initPaginate, removeIndex } from 'src/app/core/utils/reusable-functions';
import { EOperations } from '../../../core/enums/operations.enum';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-create-program',
    templateUrl: './create-program.component.html',
    styleUrls: ['./create-program.component.css'],
})
export class CreateProgramComponent implements OnInit {
    @Input() isCompact = false;
    @Input() program: any;
    @Output() closeEvent = new EventEmitter<any>();
    @Output() saveEvent = new EventEmitter<any>();
    programFormGroup!: FormGroup;
    loading = false;
    cutoffsLoading = false;
    cutoffs!: any[];
    programsLoading = false;
    selectedExcludedPrograms: any[] = [];
    programs!: any[];
    criterias: { [key: number]: any[] } = {};
    targetGroups: any[] = [];
    criteriaFormIsOpen = false;
    toggleNewTargetingForm = false;
    programDataLoading = false;
    showForm = false;
    selectedTargetGroups: any[] = [];
    programsToInclude: any[] = [];
    programsToExclude: any[] = [];
    targetingFormIsOpen = true;
    institutions: any;
    createInstitUrl: string | undefined;
    institutionNameValue: string | undefined;
    institutionsLoading = true;
    matchAllGroups = false;

    public EOperations = EOperations;

    snackBarMessages: string[] = ['sameTargetGroupNameNotAllowed', 'fillAllRequiredFields']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        public fb: FormBuilder,
        private globalService: GlobalService,
        private householdService: HouseholdService,
        private institutionService: InstitutionService,
        private translationService: TranslationService
    ) {
        this.programFormGroup = this.fb.group({
            programName: [null, Validators.required],
            cutoffId: [null, Validators.required],
            programId: [null],
            programIdd: [null],
            institutionName: [null, Validators.required],
        });
    }

    ngOnInit(): void {
        this.getAllActiveCutoffs();
        this.getAllProgramsToExclude();
        this.initUpdate();
        this.getAllInstitutions();
    }

    get formControls() {
        return this.programFormGroup.controls;
    }

    getAllActiveCutoffs(): void {
        this.cutoffsLoading = true;
        this.householdService.getAllActiveCuttoffs(initPaginate(1, 1000)).subscribe((res) => {
            this.cutoffsLoading = false;
            if (res?.status) {
                this.cutoffs = res.response.content;
            }
        });
    }

    getAllProgramsToExclude(): void {
        this.programsLoading = true;
        this.householdService.getAllPrograms('', initPaginate(1, 1000)).subscribe((res) => {
            this.programsLoading = false;
            if (res.status) {
                this.programs = res.response.content;
                this.programsToExclude = res.response.content;
                this.programsToInclude = res.response.content;
                this.programFormGroup.controls['programId'].setValue(this.program?.excludedProgramIds);
                this.programFormGroup.controls['programIdd'].setValue(this.program?.includedProgramIds);
            } else {
                this.programs = [];
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    onProgramExclude(evt: any): void {
        const arr = [...this.programs];
        this.programsToInclude = arr.filter((item) => !evt.includes(item));
    }

    onProgramInclude(evt: any): void {
        const arr = [...this.programs];
        this.programsToExclude = arr.filter((item) => !evt.includes(item));
    }

    close(): void {
        this.closeEvent.emit();
    }

    initUpdate(): void {
        if (this.program?.programName) {
            this.programFormGroup.controls['programName'].setValue(this.program.programName);
            this.programFormGroup.controls['cutoffId'].setValue(this.program.cutOff);
            this.programFormGroup.controls['institutionName'].setValue(this.program.institutionId);
            this.matchAllGroups = this.program.matchAllGroups;
            this.targetGroups = this.program.programGroups;
            this.targetingFormIsOpen = false;
        }
    }

    removeTargetGroup(i: number): void {
        this.targetGroups = removeIndex(this.targetGroups, i);
    }

    onTargetGroup(evt: any): void {
        const targetGroup = this.targetGroups.find(({ name }) => name === evt.name);
        if (!targetGroup) {
            this.targetGroups.push({ ...evt, categories: [] });
        } else {
            this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe((res) => {
                this.globalService.openFailureSnackBar(res);
            });
        }
    }

    submitProgram(): void {
        if (this.programFormGroup.invalid) {
            this.translationService.getInstantTranslations(this.snackBarMessages[1]).subscribe((res) => {
                this.globalService.openFailureSnackBar(res);
            });
            this.programFormGroup.markAllAsTouched();
            return;
        } else {
            this.createProgram();
        }
    }

    getAllInstitutions() {
        this.institutionsLoading = true;
        this.institutionService.filterInstittutions().subscribe((res: any) => {
            this.institutionsLoading = false;
            if (res?.status) {
                this.institutions = res.response.filter((item: any) => item.status === 'ACTIVE');
            }
        });
    }

    createProgram(): void {
        const { id, cutoffName } = this.formControls['cutoffId'].value;
        const programs = this.formControls['programId'].value;
        const programss = this.formControls['programIdd'].value;
        const request = {
            programName: this.formControls['programName']?.value,
            cutOff: { id, cutoffName },
            targetGroups: this.targetGroups,
            institutionId: this.formControls['institutionName']?.value,
            matchAllGroups: this.matchAllGroups,
            excludedProgramIds:
                programs?.map((el: any) => {
                    return { id: el.id, name: el.programName };
                }) || [],
            includedProgramIds:
                programss?.map((el: any) => {
                    return { id: el.id, name: el.programName };
                }) || [],
        };
        this.householdService.setTargetingProgramData(request);
        this.saveEvent.emit(request);
    }

    onCancelEvent(evt: any): void {
        const { action, event } = evt;
        let newTargetingGroup = [];
        newTargetingGroup = [...this.targetGroups];
        switch (action) {
            case 'cancel-target-group-category':
                newTargetingGroup = removeIndex(newTargetingGroup, event);
                this.targetGroups = newTargetingGroup;
                this.targetingFormIsOpen = false;
                break;
        }
    }

    onActionReceive(evt: any, i: number): void {
        const { action, event } = evt;
        let newTargetingGroup = [];
        newTargetingGroup = [...this.targetGroups];
        switch (action) {
            case 'add-target-group-category':
                this.onTargetGroup(event);
                break;
            case 'edit-target-group-category':
            case 'update-target-group-category':
                newTargetingGroup[i] = { ...event, categories: [] };
                this.targetGroups = newTargetingGroup;
                break;
        }
        this.targetingFormIsOpen = false;
    }

    toggleShowForm(): void {
        this.targetGroups.push({
            name: '',
            matchAllCategories: false,
            categories: [],
            matchAllMembers: false,
            operation: null,
            numberOfMembers: 0,
        });
        this.targetingFormIsOpen = true;
    }
}
