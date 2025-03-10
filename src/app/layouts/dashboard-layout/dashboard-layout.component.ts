import { Component } from '@angular/core';

@Component({
    selector: 'app-dashboard-layout',
    templateUrl: './dashboard-layout.component.html',
    styleUrls: ['./dashboard-layout.component.css'],
})
export class DashboardLayoutComponent {
    isModalOpen = false;
    selectors: any[] = [
        'dash1',
        'dash2',
        'dash3',
        'dash4',
        'dash5',
        'dash6',
        'dash7',
        'dash2',
        'dash3',
        'dash4',
        'dash5',
        'dash6',
    ];
    selectedDashboard: any[] = [
        'dash1',
        'dash2',
        'dash3',
        'dash4',
        'dash5',
        'dash6',
        'dash7',
        'dash2',
        'dash3',
        'dash4',
        'dash5',
        'dash6',
    ];

    closeModal(): void {
        this.isModalOpen = false;
    }
}
