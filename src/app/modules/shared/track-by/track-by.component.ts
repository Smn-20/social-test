import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-track-by',
    templateUrl: './track-by.component.html',
    styleUrls: ['./track-by.component.css'],
})
export class TrackByComponent {
    @Input() titles: string[] = [];
    @Input() items: { name?: string; date?: string; location?: any }[] = [];
    @Input() iconName = 'user';
}
