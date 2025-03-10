import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'splitBy',
})
export class SplitByPipe implements PipeTransform {
    transform(value: string, args = '_'): any {
        return value?.split(args) || [];
    }
}
