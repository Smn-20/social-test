import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ellipsis',
})
export class EllipsisPipe implements PipeTransform {
    transform(value: string, length = 50): string {
        if (value.length <= length) {
            return value;
        } else {
            return value.substr(0, length) + '...';
        }
    }
}
