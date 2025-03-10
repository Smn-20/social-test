import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
    @Input() keyword = '';
    @Input() showButton = true;
    @Input() showMessage = true;
    @Input() overrideMessage!: string | null;
    @Output() refreshEvent: EventEmitter<any> = new EventEmitter<any>();

    onRefreshEvent(evt: string): void {
        this.refreshEvent.emit(evt);
    }

    refreshPage():void {
        window.location.reload()
    }
}
