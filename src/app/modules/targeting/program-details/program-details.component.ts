import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-program-details',
    templateUrl: './program-details.component.html',
    styleUrls: ['./program-details.component.css'],
})
export class ProgramDetailsComponent {
    @Input() program: any;
    @Input() selectedTargetGroups: any;
    @Input() programDataLoading = false;
    @Input() hideActionButtons = false;
}
