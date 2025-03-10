import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { EFilterAction, EInterviewee, EJurisdiction, EPermission, ETargetingStatus } from 'src/app/core/enums';
import { AuthService } from 'src/app/core/services/auth.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { Paginate, ResponseObject, initPaginate, saveFile } from 'src/app/core/utils/reusable-functions';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
    reports: any[] = [];
    loading = false;
    queryFormGroup!: FormGroup;
    selectedFilter = { type: null, code: null, id: null, name: null };
    selectedStatusFilter = { name: null, value: null };

    openHouseholdDetails = false;
    selectedRowIndex = -1;
    pagination: Paginate = initPaginate(1, 20);
    total = 0;
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    statuses: any;
    shouldExpand = false;
    loadingRun: { [key: number]: string | undefined } = {};
    reportDetails: any;
    reportLocation: any;
    reportLoading = false;
    selectedReportData: any;

    public EJurisdiction = EJurisdiction;
    public ETargetingStatus = ETargetingStatus;
    public EPermission = EPermission;
    public EFilterAction = EFilterAction;

    constructor(
        private householdService: HouseholdService,
        private authService: AuthService,
        private globalService: GlobalService,
        private router: Router
    ) {}

    ngOnInit() {
        this.getReports();
    }

    goToCreateReport(): void {
        this.router.navigate(['/admin/reports/new-report']);
    }

    getReports(): void {
        this.loading = true;
        const isAdmin = this.loggedInUser.roles.some((r: string) => ['MINALOC_SUPER_ADMIN']?.includes(r));

        if (isAdmin) {
            this.householdService.getTargetingReport(this.pagination).subscribe((res) => {
                this.loading = false;
                this.processRes(res);
            });
        } else {
            this.householdService.getTargetingReportByUser(this.loggedInUser.id, this.pagination).subscribe((res) => {
                this.loading = false;
                this.processRes(res);
            });
        }
    }

    viewReportData(report: any): void {
        let filters;

        switch (report?.reportType) {
            case 'TARGETING REPORT':
                localStorage.setItem(`${report.id}`, JSON.stringify(report));
                this.router.navigate(['/admin/reports/data/' + report.id]);
                break;
            case 'HOUSEHOLDS REPORT':
                localStorage.setItem(
                    `selectedFilter`,
                    JSON.stringify({ type: report?.jurisdictionLevel, id: report?.locationId })
                );
                this.router.navigate(['/admin/households']);

                break;
            case 'PROGRAMS REPORT':
                filters = JSON.parse(report.filters);
                this.router.navigate([
                    '/admin/households/program/' +
                        filters.programId +
                        '/location/' +
                        report?.jurisdictionLevel +
                        '/' +
                        report?.locationId,
                ]);
                break;
            case 'CUTOFF REPORT':
                filters = JSON.parse(report.filters);
                this.router.navigate([
                    '/admin/households/cutoff/' +
                        filters.cutoffId +
                        '/location/' +
                        report?.jurisdictionLevel +
                        '/' +
                        report?.locationId,
                ]);
                break;
        }
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

    runReport(evt: string, index: number): void {
        this.loadingRun[index] = evt;
        this.householdService.retryReportModel(evt).subscribe((res) => {
            this.loadingRun[index] = undefined;
            if (res?.status) {
                this.globalService.openSuccessSnackBar(res.message);
                this.getReports();
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    onPageChange(event: any): void {
        this.openHouseholdDetails = false;
        this.pagination.page = event.pageIndex + 1;
        this.getReports();
    }

    toFixed(n: any): number {
        return n.toFixed(1);
    }

    downloadFile(evt: any, index: number): void {
        const { id, fileType, reportName } = evt;
        this.loadingRun[index] = id;
        this.householdService.downloadReport(id).subscribe((res) => {
            this.loadingRun[index] = undefined;
            if (res) {
                const extension = '.' + fileType.toLowerCase();
                const reportN_ = reportName ? reportName.concat(extension) : id.concat(extension);
                saveFile(fileType, reportN_, res);
            }
        });
    }

    getCutoffInfo(id: string): void {
        this.reportLoading = true;
        this.householdService.getCutoffById(id).subscribe((res: ResponseObject<any>) => {
            this.reportLoading = false;
            if (res.status) {
                this.reportDetails = res.response;
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    getProgramInfo(id: string): void {
        this.reportLoading = true;
        this.householdService.getProgramId(id).subscribe((res: ResponseObject<any>) => {
            this.reportLoading = false;
            if (res.status) {
                this.reportDetails = res.response;
            } else {
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    toggleDetails(item: any, i: number): void {
        this.selectedReportData = item;
        let reportDetails;

        if (item.filters) {
            reportDetails = JSON.parse(item.filters);
        }

        if (this.selectedRowIndex === i) {
            this.selectedRowIndex = -1;
        } else {
            this.selectedRowIndex = i;
        }

        switch (item?.reportType) {
            case 'TARGETING REPORT':
                this.reportDetails = {
                    head: reportDetails.filter((el: any) => el.respondentType === EInterviewee.HOUSEHOLD),
                    member: reportDetails.filter((el: any) => el.respondentType === EInterviewee.PERSON),
                };
                break;
            case 'HOUSEHOLDS REPORT':
                this.reportDetails = reportDetails;
                break;
            case 'PROGRAMS REPORT':
                this.getProgramInfo(reportDetails.programId);
                break;
            case 'CUTOFF REPORT':
                this.getCutoffInfo(reportDetails.cutoffId);
                break;
        }
    }
}
