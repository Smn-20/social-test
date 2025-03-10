import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { EFilterAction, EPermission, EState, ETargetingStatus } from '../../core/enums';
import { DataService } from '../../core/services/data.service';
import { EventService } from '../../core/services/event.service';
import { TranslationService } from '../../core/services/translation.service';
import { targetingStatus } from '../../core/utils/reusable-arrays';
import { initPaginate } from '../../core/utils/reusable-functions';
import { TranslationUpdateComponent } from './translation-update/translation-update.component';
@Component({
    selector: 'app-translations',
    templateUrl: './translations.component.html',
    styleUrls: ['./translations.component.css'],
})
export class TranslationsComponent implements OnInit {
    translations: any[] = [];
    totalTranslations = 0;
    loading = false;
    query = '';
    isSearching = false;
    pagination = initPaginate(1, 20);
    queryFormGroup!: FormGroup;
    statuses: any;
    selectedFilter = { type: null, code: null, id: null, name: null };
    selectedStatusFilter = { name: null, value: null };
    openFilters = false;
    isStatusDropdown = false;
    finishedTranslations: any[] = [];

    public EFilterAction = EFilterAction;
    public EState = EState;
    public ETargetingStatus = ETargetingStatus;
    public EPermission = EPermission;

    constructor(
        private dataService: DataService,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private translationService: TranslationService,
        private eventService: EventService
    ) {
        this.initTranslatable();
        this.queryFormGroup = this.fb.group({
            query: ['', [Validators.required]],
        });
    }
    ngOnInit(): void {
        this.getTranslations(this.query);
        this.onSearch();
        this.eventListening();
    }

    clearStatusFilter(): void {
        this.selectedStatusFilter = { value: null, name: null };
        this.getTranslations(this.query);
    }

    initTranslatable(): void {
      this.translationService.loadLanguage();
      this.translationService.getInstantTranslations('component').subscribe((res) => {
        const statuses = targetingStatus.filter(
          (item) =>
              item.value !== ETargetingStatus.NOT_STARTED &&
              item.value !== ETargetingStatus.RUNNING &&
              item.value !== ETargetingStatus.FAILED
      );
          this.statuses = this.translationService.translateArray(statuses, res.targetingStatus);
      });
    }

    onSearch(): void {
        this.queryFormGroup.get('query')?.valueChanges.pipe();

        this.queryFormGroup
            .get('query')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                if (val !== '' || val !== null) {
                    this.isSearching = true;
                    this.query = val;
                    this.pagination = initPaginate(1, 20);
                    this.getTranslations(val);
                    this.isSearching = false;
                }
            });
    }

    onPageChange(event: any) {
        this.pagination.page = event.pageIndex + 1;
        // this.getTranslations(this.query);
        if (this.selectedStatusFilter.value === 'PENDING') this.getPendingTranslationStatus();
        if (this.selectedStatusFilter.value === 'FINISHED') this.getFinishedTranslationStatus();
        this.getTranslations(this.query);
    }

    getTranslations(queryText: string): void {
        this.loading = true;
        this.dataService.getTranslations(queryText, this.pagination).subscribe((res: any) => {
            this.loading = false;
            this.translations = res.response.content;
            this.totalTranslations = res.response.totalElements;
            this.pagination.page = res.response.number;
        });
    }

    getPendingTranslationStatus() {
        this.dataService
            .getPendingTranslationStatus(this.selectedStatusFilter.value, this.pagination)
            .subscribe((res: any) => {
                this.translations = res.response.content;
                this.totalTranslations = res.response.totalElements;
                this.pagination.page = res.response.number;
            });
    }

    getFinishedTranslationStatus() {
        this.loading = true;
        this.dataService.getFinishedTranslationStatus(this.pagination).subscribe((res: any) => {
            this.loading = false;
            this.totalTranslations = res.response.totalElements;
            this.pagination.page = res.response.number;
            this.finishedTranslations = res.response.content;
            this.translations = this.finishedTranslations.filter((item: any) => item.translationStatus === 'FINISHED');
        });
    }

    openEditDialog(translation: any): void {
        this.dialog.open(TranslationUpdateComponent, {
            data: translation,
            width: '400px',
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

    initPaginationPage(): void {
        this.pagination.page = 1;
    }

    onSetFilterEvent(evt: any): void {
        const { action, event } = evt;
        switch (action) {
            case EFilterAction.STATUS:
                this.selectedStatusFilter = event;
                break;
        }
        this.initPaginationPage();
        if (this.selectedStatusFilter.value === 'PENDING') {
            this.getPendingTranslationStatus();
        } else if (this.selectedStatusFilter.value === 'FINISHED') {
            this.getFinishedTranslationStatus();
        } else {
            this.getTranslations(this.query);
        }
    }
}
