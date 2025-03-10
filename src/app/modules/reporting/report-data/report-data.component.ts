import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ETargetingStatus } from 'src/app/core/enums';
import { HouseholdService } from 'src/app/core/services/household.service';
import { Paginate, initPaginate, saveFile } from 'src/app/core/utils/reusable-functions';

@Component({
    selector: 'app-report-data',
    templateUrl: './report-data.component.html',
    styleUrls: ['./report-data.component.css'],
})
export class ReportDataComponent implements OnInit, OnDestroy {
    data: any[] = [];
    total = 0;
    pagination: Paginate = initPaginate(1, 10);
    loading = false;
    reportLoading = false;
    reportData!: any;
    public ETargetingStatus = ETargetingStatus;
    constructor(private householdService: HouseholdService, private route: ActivatedRoute) {}

    ngOnInit() {
        this.getData();
    }

    ngOnDestroy(): void {
        localStorage.removeItem(`${this.reportData.id}`);
        this.reportData = null;
    }

    getData(): void {
        this.route.params.subscribe((params: any) => {
            if (params?.reportId) {
                this.reportData = JSON.parse(localStorage.getItem(`${params?.reportId}`) as any);
                this.getReportData(params?.reportId);
            }
        });
    }
    getReportData(id: string): void {
        this.loading = true;
        this.householdService.viewReportData(id, this.pagination).subscribe((res) => {
            this.loading = false;
            if (res.status) {
                this.data = res.response?.content || [];
                this.total = res.response.totalElements;
                this.pagination.page = res.response.number;
            }
        });
    }

    onPageChange(event: any): void {
        this.pagination.page = event.pageIndex + 1;
        this.getData();
    }

    downloadFile(): void {
        const { id, fileType, reportName } = this.reportData;
        this.reportLoading = true;
        this.householdService.downloadReport(id).subscribe((res) => {
            this.reportLoading = false;
            if (res) {
                const extension = '.' + fileType.toLowerCase();
                const reportN_ = reportName ? reportName.concat(extension) : id.concat(extension);
                saveFile(fileType, reportN_, res);
            }
        });
    }
}
