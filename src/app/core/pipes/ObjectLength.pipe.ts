import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'objectLength',
})
export class ObjectLengthPipe implements PipeTransform {
    transform(value: any, args?: any): any[] {
        return Object.keys(value);
    }
}
