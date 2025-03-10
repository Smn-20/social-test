import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
    selector: '[appEmailValidator]',
    providers: [{ provide: NG_VALIDATORS, useExisting: EmailValidatorDirective, multi: true }],
})
export class EmailValidatorDirective implements Validator {
    EMAIL_REG_EX =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    validate(control: AbstractControl): ValidationErrors | null {
        if (!!control.value) {
            const emailRegEx = this.EMAIL_REG_EX;
            return emailRegEx.test(String(control.value).toLowerCase()) ? null : { email: true };
        }

        return { invalid: true };
    }
}
