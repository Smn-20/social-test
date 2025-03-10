import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EState, EPermission } from 'src/app/core/enums';
import { AuthService } from 'src/app/core/services/auth.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { Paginate, initPaginate } from 'src/app/core/utils/reusable-functions';
import { CreateReportModalComponent } from '../create-report-modal/create-report-modal.component';
import { EventService } from 'src/app/core/services/event.service';

@Component({
    selector: 'app-report-types',
    templateUrl: './report-types.component.html',
    styleUrls: ['./report-types.component.css'],
})
export class ReportTypesComponent implements OnInit {
    reports: any[] = [];
    loading = false;
    selectedRowIndex = -1;
    pagination: Paginate = initPaginate(1, 10);
    total = 0;
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    shouldExpand = false;
    openConfirmModal = false;
    actionLoading = false;
    isEditing = false;
    confirmAction = '';
    public EState = EState;
    public EPermission = EPermission;

    constructor(
        public dialog: MatDialog,
        private householdService: HouseholdService,
        private authService: AuthService,
        private globalService: GlobalService,
        private eventService: EventService
    ) {}

    ngOnInit() {
        this.getReports();
        this.eventListening();
    }

    getReports(): void {
        this.loading = true;
        const isAdmin = this.loggedInUser.roles.some((r: string) => ['MINALOC_SUPER_ADMIN']?.includes(r));

        if (isAdmin) {
            this.householdService.getReportModel().subscribe((res) => {
                this.loading = false;
                this.processRes(res);
            });
        }
    }

    eventListening(): void {
        this.eventService.actionFinished.subscribe((evt) => {
            if (evt === 'report-models') {
                this.getReports();
                this.selectedRowIndex = -1;
            }
        });
    }

    processRes(res: any): void {
        if (res.status) {
            this.reports = res.response?.content;
            this.total = res.response.totalElements;
            this.pagination.page = res.response.number;
        } else {
            this.globalService.openFailureSnackBar(res.message);
        }
    }

    toggleDetails(item: any, index: number): void {
        if (this.selectedRowIndex === index) {
            this.selectedRowIndex = -1;
        } else {
            this.selectedRowIndex = index;
        }
    }

    action(event: string): void {
        this.openConfirmModal = !this.openConfirmModal;
        this.confirmAction = event;
    }

    triggerAction(item: any): void {
        const { id } = item;
        this.actionLoading = true;
        this.householdService.actionReportModel(`${id}`, this.confirmAction).subscribe((res) => {
            if (res.status) {
                this.close();
                this.getReports();
            } else {
                this.globalService.openSuccessSnackBar(res.message);
            }
        });
    }

    close(): void {
        this.confirmAction = '';
        this.openConfirmModal = false;
        this.actionLoading = false;
    }

    onPageChange(event: any): void {
        this.selectedRowIndex = -1;
        this.pagination.page = event.pageIndex + 1;
        this.getReports();
    }

    toggleNewReportType(): void {
        this.dialog.open(CreateReportModalComponent, {
            data: {},
            width: '672px',
        });
    }

    toggleIsEditing(evt: boolean): void {
        this.isEditing = evt;
    }
}
