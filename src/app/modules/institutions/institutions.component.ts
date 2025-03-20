import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { EFilterAction, EPermission } from 'src/app/core/enums';
import { InstitutionService } from 'src/app/core/services/institution.service';
import { initPaginate } from 'src/app/core/utils/reusable-functions';
import { DataService } from '../../core/services/data.service';
import { EventService } from '../../core/services/event.service';
import { TranslationService } from '../../core/services/translation.service';
import { CreateInstitutionComponent } from './create-institution/create-institution.component';

@Component({
    selector: 'app-institutions',
    templateUrl: './institutions.component.html',
    styleUrls: ['./institutions.component.css'],
})
export class InstitutionsComponent implements OnInit {
    institutionsArr: any = [];
    totalInstitutions = 0;
    activeArr: Array<any> = [];
    inactiveArr: Array<any> = [];
    querying = false;
    loading = false;
    public EPermission = EPermission;
    queryFormGroup!: FormGroup;
    pagination = initPaginate(1, 20);
    status!: string;
    query = '';
    total: any;
    isSearching = false;

    filterBy: any = ['All', 'Active', 'Inactive'];
    public EFilterAction = EFilterAction;

    constructor(
        private institutions: InstitutionService,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private dataService: DataService,
        private eventService: EventService,
        private translationService: TranslationService
    ) {
        this.initTranslatable();

        this.queryFormGroup = this.fb.group({
            query: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.getSearchedInstitutions(this.query);
        this.onSearch();
        this.eventListening();
    }

    initTranslatable(): void {
        this.translationService.loadLanguage();
        this.translationService.getInstantTranslations('component').subscribe((res) => {
            this.filterBy = this.translationService.translateArray(this.filterBy, res.filterBy);
        });
    }

    onSearch(): void {
        this.queryFormGroup.get('query')?.valueChanges.pipe();

        this.queryFormGroup
            .get('query')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                if (val !== '' || val !== null) {
                    this.querying = true;
                    this.isSearching = true;
                    this.query = val;
                    this.pagination = initPaginate(1, 20);
                    this.getSearchedInstitutions(this.query);
                }
            });
    }

    viewByStatus(status: any): void {
        this.status = status;
        this.getAllinstitutions();
    }

    disableInstitution(id: string) {
        this.institutions.disableInstitution(id).subscribe((res) => {
            this.getAllinstitutions();
        });
    }

    enableInstitution(id: string) {
        this.institutions.enableInstitution(id).subscribe((res) => {
            this.getAllinstitutions();
        });
    }

    toggleNewInstitutionModal(item?: any): void {
        this.dialog.open(CreateInstitutionComponent, {
            data: item,
            minWidth: '60vw',
        });
    }

    onPageChange(event: any) {
        this.pagination.page = event.pageIndex + 1;
        this.getSearchedInstitutions(this.query);
    }

    getSearchedInstitutions(queryText: string): void {
        this.loading = true;
        this.dataService.getInstitutions(queryText, this.pagination).subscribe((res: any) => {
            this.loading = false;
            this.querying = false;
            this.institutionsArr = res.response.content.filter((institution:any)=>institution.name === "LODA");
            this.totalInstitutions = 1;
            this.pagination.page = res.response.number;
        });
    }

    getAllinstitutions(): void {
        this.loading = true;
        this.institutions.filterInstittutions().subscribe((res: any) => {
            if (this.status === 'Active') {
                return (this.institutionsArr = res.response.filter((item: any) => item.status === 'ACTIVE'));
            }
            if (this.status === 'Inactive') {
                return (this.institutionsArr = res.response.filter((item: any) => item.status === 'INACTIVE'));
            }
            return (this.institutionsArr = res.response);
        });
    }

    eventListening(): void {
        this.eventService.stopAllLoaders.subscribe((st) => {
            if (st) {
                this.loading = false;
                this.isSearching = false;
            }
        });
    }
}
