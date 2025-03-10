import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'removeUnderscore',
})
export class RemoveUnderscorePipe implements PipeTransform {
    transform(value: string): string {
        return value?.replace(/_/g, ' ').replace(/(\w)(\w*)/g, function (g0, g1, g2) {
            return g1?.toUpperCase() + g2.toLowerCase();
        });
    }
}
