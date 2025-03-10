import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
    selector: 'app-user-details',
    templateUrl: './user-details.component.html',
    styleUrls: ['./user-details.component.css'],
})
export class UserDetailsComponent implements OnChanges {
    @Input() user: any = {};
    @Input() status: any;
    @Input() phoneNumber = '';
    profilePhoto: any;
    isStatus = false;

    isNida = false;

    constructor(private _sanitizer: DomSanitizer, private translateService: TranslationService) {}

    genders: Record<string, string> = {
        M: 'Male',
        F: 'Female',
    };

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['user'] !== undefined) {
            this.user = changes['user'].currentValue;

            if (this.user?.photo) {
                this.profilePhoto = this._sanitizer.bypassSecurityTrustResourceUrl(
                    'data:image/jpg;base64,' + this.user?.photo
                );
            }
            this.isStatus = this.status;
        }
    }
}
