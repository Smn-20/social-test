import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EPermission } from 'src/app/core/enums';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { CreateDashboardComponent } from '../create-dashboard/create-dashboard.component';

@Component({
    selector: 'app-dashboard-selector',
    templateUrl: './dashboard-selector.component.html',
    styleUrls: ['./dashboard-selector.component.css'],
})
export class DashboardSelectorComponent implements OnInit {
    allDashboardsShow = false;
    dashboards: any[] = [];
    openConfirmModal = false;
    confirmAction = '';
    actionLoading = false;
    loading = false;
    loadingArray = new Array(16);
    public EPermission = EPermission;
    public dashboardTitle = '';

    constructor(
        private dashboardService: HouseholdService,
        private globalService: GlobalService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.loadDashboardData();
    }

    openCreateDashboardDialog(): void {
        this.dialog.open(CreateDashboardComponent, {
            data: null,
            width: '932px',
            maxHeight: '95vh',
        });
    }

    loadDashboardData() {
        this.loading = true;
        this.dashboardService.loadAllDashboard().subscribe((response) => {
            this.loading = false;
            if (response.status) {
                this.dashboards = response.response;
            } else {
                this.globalService.openFailureSnackBar(response.message);
            }
        });
    }

    changeDashboardStatus(title: string, status: string) {
        let newStatus = '';
        switch (status) {
            case 'ACTIVE':
                newStatus = 'INACTIVE';
                break;
            case 'INACTIVE':
                newStatus = 'ACTIVE';
                break;
            case 'DELETED':
                newStatus = 'DELETED';
                break;
            default:
                break;
        }
        this.dashboardService.changeDashboardStatus(title, newStatus).subscribe((res) => {
            this.close();
            if (res.status) {
                this.globalService.openSuccessSnackBar(res.message);
            } else {
                console.log(res);
                this.globalService.openFailureSnackBar(res.message);
            }
            this.loadDashboardData();
        });
    }

    close(): void {
        this.confirmAction = '';
        this.openConfirmModal = false;
        this.actionLoading = false;
    }

    action(title: string, event: string): void {
        this.openConfirmModal = !this.openConfirmModal;
        this.confirmAction = event;
        this.dashboardTitle = title;
    }

    showAllDashboard() {
        this.allDashboardsShow = !this.allDashboardsShow;

        for (const dashboard of this.dashboards) {
            dashboard.state = this.allDashboardsShow ? 1 : 0;
        }
    }
}
