import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { InstitutionService } from 'src/app/core/services/institution.service';
import { initPaginate } from 'src/app/core/utils/reusable-functions';
import { TranslationService } from 'src/app/core/services/translation.service';
import { EValueOperations } from 'src/app/core/enums';
import { programReturnals } from 'src/app/core/utils/reusable-arrays';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-revamped-create-program',
    templateUrl: './revamped-create-program.component.html',
    styleUrls: ['./revamped-create-program.component.css'],
})
export class RevampedCreateProgramComponent implements OnInit, OnDestroy, OnChanges {
    @Input() isCompact = false;
    @Input() criterias: any;
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
    programDataLoading = false;
    programsToInclude: any[] = [];
    programsToExclude: any[] = [];
    institutions: any;
    institutionNameValue: string | undefined;
    institutionsLoading = true;
    programReturnals: Array<{
        name: string, value: string
    }> = [...programReturnals];

    public EValueOperations = EValueOperations;
    private formSubscription?: Subscription;

    snackBarMessages: string[] = ['sameTargetGroupNameNotAllowed', 'fillAllRequiredFields']; // snackbar messages to be translated --> PLEASE do NOT modify the array values

    constructor(
        public fb: FormBuilder,
        private globalService: GlobalService,
        private householdService: HouseholdService,
        private institutionService: InstitutionService,
        private translationService: TranslationService
    ) {
        this.programFormGroup = this.fb.group({
            programReturns: [null, Validators.required],
            programName: [null, Validators.required],
            cutoffId: [null, Validators.required],
            programId: [null],
            programIdd: [null],
            institutionName: [null, Validators.required],
            criterias: [null, Validators.required]
        });
    }
    
    get formControls() {
        return this.programFormGroup.controls;
    }

    ngOnInit(): void {
        this.getAllActiveCutoffs();
        this.getAllProgramsToExclude();
        this.initUpdate();
        this.getAllInstitutions();

        this.formSubscription = this.programFormGroup.valueChanges.subscribe(() => {
            this.onFormUpdate();
        });
    }

    onFormUpdate() {
        this.saveEvent.emit(this.programFormGroup.value);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['criterias']) {
            this.programFormGroup.controls['criterias'].setValue(this.criterias)
        }
    }
    
    ngOnDestroy() {
        if (this.formSubscription) {
            this.formSubscription.unsubscribe();
        }
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

    initUpdate(): void {
        if (this.program?.programName) {
            this.programFormGroup.controls['programName'].setValue(this.program.programName);
            this.programFormGroup.controls['cutoffId'].setValue(this.program.cutOff);
            this.programFormGroup.controls['institutionName'].setValue(this.program.institutionId);
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
            institutionId: this.formControls['institutionName']?.value,
            excludedProgramIds:
                programs?.map((el: any) => {
                    return { id: el.id, name: el.programName };
                }) || [],
            includedProgramIds:
                programss?.map((el: any) => {
                    return { id: el.id, name: el.programName };
                }) || [],
        };
        // this.householdService.setTargetingProgramData(request);
        // this.saveEvent.emit(request);
    }
}
