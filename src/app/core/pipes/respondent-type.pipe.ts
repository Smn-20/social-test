import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'Humanreadable',
})
export class HumanReadablePipe implements PipeTransform {
    transform(_v: string, arr: any[]): string | null {
        return arr.find(({ value }) => value === _v)?.name || null;
    }
}
