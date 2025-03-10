import { EPermission } from 'src/app/core/enums';
import { HouseholdService } from 'src/app/core/services/household.service';
import { CreateCategoryComponent } from '../create-category/create-category.component';
import { debounceTime } from 'rxjs';
import { EventService } from 'src/app/core/services/event.service';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { initPaginate } from 'src/app/core/utils/reusable-functions';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-dashboard-categories',
    templateUrl: './dashboard-categories.component.html',
    styleUrls: ['./dashboard-categories.component.css'],
})
export class DashboardCategoriesComponent implements OnInit {
    categories: any[] = [];
    totalCategories = 0;
    loading = false;
    query = '';
    isSearching = false;
    pagination = initPaginate(1, 20);
    queryFormGroup!: FormGroup;
    public EPermission = EPermission;
    constructor(
        private householdService: HouseholdService,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private eventService: EventService
    ) {
        this.queryFormGroup = this.fb.group({
            query: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.getCategories();
        this.onSearch();
        this.eventListening();
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
                    this.getCategories();
                }
            });
    }

    onPageChange(event: any) {
        this.pagination.page = event.pageIndex + 1;
        this.getCategories();
    }

    getCategories(): void {
        this.loading = true;
        this.householdService.getDashboardCategories().subscribe((res: any) => {
            this.loading = false;
            this.categories = res.response;
            this.pagination.page = res.response.number;
        });
    }

    openDialog(category: any = null): void {
        this.dialog.open(CreateCategoryComponent, {
            data: category,
            width: '700px',
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
