import { initPaginate } from '../../core/utils/reusable-functions';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { EState } from '../../core/enums';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { EventService } from '../../core/services/event.service';

@Component({
    selector: 'app-permissions',
    templateUrl: './permissions.component.html',
    styleUrls: ['./permissions.component.css'],
})
export class PermissionsComponent implements OnInit {
    selectedRowIndex = -1;
    permissions: any[] = [];
    totalPermissions = 0;
    loading = false;
    isSearching = false;
    queryFormGroup!: FormGroup;
    pagination = initPaginate(1, 20);

    constructor(private dataService: DataService, private fb: FormBuilder, private eventService: EventService) {
        this.queryFormGroup = this.fb.group({
            query: ['', [Validators.required]],
        });
    }

    get EState() {
        return EState;
    }

    ngOnInit(): void {
        this.loadPermissions();
        this.onSearch();
        this.eventListening();
    }

    loadPermissions(): void {
        this.loading = true;
        this.dataService.getPermissions(this.pagination).subscribe((res: any) => {
            this.loading = false;
            this.permissions = res.response.permissions;
            this.totalPermissions = res.response.totalElements;
            this.pagination.page = res.response.currentPage;
            console.log(this.permissions);
        });
    }

    onPageChange(event: any) {
        this.pagination.page = event.pageIndex + 1;
        this.loadPermissions();
    }

    onSearch(): void {
        this.queryFormGroup.get('query')?.valueChanges.pipe();

        this.queryFormGroup
            .get('query')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe((val) => {
                if (val !== '' || val !== null) {
                    this.isSearching = true;

                    this.dataService.searchPermission(val).subscribe((res) => {
                        this.isSearching = false;
                        this.permissions = res.response.permissions || [];
                        this.totalPermissions = res.response.totalElements;
                        this.pagination.page = res.response.currentPage;
                    });
                }
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
