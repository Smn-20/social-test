import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'rowEllipsis',
})
export class RowEllipsisPipe implements PipeTransform {
    transform(text: string, width: number, rows: number, fontWidth = 14): string {
        const charsPerRow = Math.floor(width / fontWidth);
        const totalChars = charsPerRow * rows;
        if (text.length > totalChars) {
            return text.slice(0, totalChars - 3) + '...';
        }
        return text;
      }
}
