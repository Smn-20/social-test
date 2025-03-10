import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { EPermission, EInterviewee } from 'src/app/core/enums';
import { HouseholdService } from 'src/app/core/services/household.service';

@Component({
    selector: 'app-user-info',
    templateUrl: './user-info.component.html',
    styleUrls: ['./user-info.component.css'],
})
export class UserInfoComponent implements OnChanges {
    @Input() user: any;
    @Input() photo: any;
    @Input() additionLinkConfig: { name: string; iconName?: string; permissions?: any[] } | null = null;
    @Input() iconLoading = false;
    @Input() isCompact = true;

    @Output() additionalEvent = new EventEmitter();

    public EPermission = EPermission;
    public EInterviewee = EInterviewee;

    constructor(private router: Router, private householdService: HouseholdService) {
        // ignore
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isCompact']) {
            const currentValue = changes['isCompact'].currentValue;

            this.isCompact = currentValue;
        }
    }

    emitEvent(): void {
        this.additionalEvent.emit();
    }

    emitUpdateDemographics(userId: string): void {
        this.householdService.householdPayload.data = {
            ...this.user,
            photo: this?.photo?.changingThisBreaksApplicationSecurity ?? this?.photo,
        };
        this.router.navigate(['/admin/questionnaires/basic-edit/' + EInterviewee.HOUSEHOLD + '/' + userId]);
    }
}
