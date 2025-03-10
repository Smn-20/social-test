import { GlobalService } from 'src/app/core/services/global.service';
import { EventService } from 'src/app/core/services/event.service';
import { Paginate, initPaginate } from '../../../core/utils/reusable-functions';
import { Component, OnInit } from '@angular/core';
import { AppealService } from 'src/app/core/services/appeal.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
    selector: 'app-approved-appeals',
    templateUrl: './approved-appeals.component.html',
    styleUrls: ['./approved-appeals.component.css'],
})
export class ApprovedAppealsComponent implements OnInit {
    openAppealDetails = false;
    selectedRowIndex = -1;
    appeals: any = [];
    totalAppeals = 0;
    loading = false;
    pagination: Paginate = initPaginate(1, 20);
    queryFormGroup!: FormGroup;
    querying = false;

    constructor(
        private appealService: AppealService,
        private eventService: EventService,
        private fb: FormBuilder,
        private globaService: GlobalService
    ) {
        this.queryFormGroup = this.fb.group({
            query: ['', [Validators.required]],
        });
    }

    ngOnInit() {
        this.getAppeals();
        this.eventListening();
        this.autoSearch();
    }

    toggleAppealDetails(index: number) {
        if (!this.openAppealDetails) {
            this.selectedRowIndex = index;
            this.openAppealDetails = true;
        } else if (this.openAppealDetails && this.selectedRowIndex !== index) {
            this.selectedRowIndex = index;
        } else {
            this.openAppealDetails = false;
        }
    }

    getAppeals(): void {
        this.loading = true;

        this.appealService
            .getAppeals(
                'APPROVED',
                this.queryFormGroup.controls['query'].value || '',
                this.pagination.page,
                this.pagination.size
            )
            .subscribe((res: any) => {
                this.loading = false;
                this.querying = false;
                if (res.status) {
                    this.totalAppeals = res.response.totalElements;
                    this.appeals = res.response.appeals;
                    this.pagination.page = res.response.currentPage;
                } else {
                    this.totalAppeals = 0;
                    this.appeals = [];
                    this.globaService.openFailureSnackBar(res?.message);
                }
            });
    }

    autoSearch(): void {
        this.queryFormGroup.get('query')?.valueChanges.pipe();

        this.queryFormGroup
            .get('query')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                if (val !== '' || val !== null) {
                    this.querying = true;
                    this.pagination.page = 1;
                    this.getAppeals();
                }
            });
    }

    onPageChange(event: any): void {
        this.pagination.page = event.pageIndex + 1;
        this.getAppeals();
    }

    receiveRefresh(event: any): void {
        window.location.reload();
    }

    eventListening(): void {
        this.eventService.actionFinished.subscribe((evt) => {
            if (evt === 'appeals') {
                this.getAppeals();
                this.selectedRowIndex = -1;
            }
        });

        this.eventService.stopAllLoaders.subscribe((st) => {
            if (st) {
                this.loading = false;
                this.querying = false;
            }
        });
    }
}
