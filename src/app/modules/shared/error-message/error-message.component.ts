import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-error-message',
    templateUrl: './error-message.component.html',
    styleUrls: ['./error-message.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageComponent implements OnInit, OnChanges {
    @Input() control: any;
    @Input() fieldName!: string;
    @Input() length!: number;
    pwdRegex = '^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=!?-_<>]).*$';

    constructor() {}

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['control'] !== undefined) {
            this.control = changes['control'].currentValue;
        }

        if (changes['fieldName'] !== undefined) {
            this.fieldName = changes['fieldName'].currentValue;
        }

        if (changes['length'] !== undefined) {
            this.length = changes['length'].currentValue;
        }
    }
}
