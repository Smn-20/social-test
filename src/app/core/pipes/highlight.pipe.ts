import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'highlight',
})
export class HighlightPipe implements PipeTransform {
    transform(value: string, query: string): string {
        if (!query) {
            return value;
        }

        const pattern = new RegExp(query, 'gi');
        return value.replace(pattern, (match) => `<span class="font-medium bg-yellow-200">${match}</span>`);
    }
}
