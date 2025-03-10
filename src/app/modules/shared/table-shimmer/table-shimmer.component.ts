import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-table-shimmer',
    templateUrl: './table-shimmer.component.html',
    styleUrls: ['./table-shimmer.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableShimmerComponent {
    @Input() rows = 10;
    @Input() cols = 6;
    @Input() searchSkeleton = true;
    @Input() buttonNumber = 0;
    @Input() showHeader = true;
    @Input() searchRight = false;

    getArray(input: number): any[] {
        return new Array(input);
    }
}
