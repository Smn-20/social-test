import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors } from '@angular/forms';

@Directive({
    selector: '[appPhoneValidator]',
    providers: [{ provide: NG_VALIDATORS, useExisting: PhoneValidatorDirective, multi: true }],
})
export class PhoneValidatorDirective {
    validate(control: AbstractControl): ValidationErrors | null {
        if (!!control.value) {
            return control.value.length === 10 && !isNaN(control.value) ? null : { phone: true };
        }
        return { invalid: true };
    }
}
