import { Component, Input } from '@angular/core';
import { EAction, EBeneficiaryHelpStatus, EOtherStatus, EState, ETargetingStatus } from 'src/app/core/enums';

@Component({
    selector: 'app-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.css'],
})
export class StatusComponent {
    @Input() status!: EState | ETargetingStatus | EOtherStatus | EAction | EBeneficiaryHelpStatus | string;
    @Input() progressStatus = 0;
    public EState = EState;
    public ETargetingStatus = ETargetingStatus;
    public EOtherStatus = EOtherStatus;
    public EAction = EAction;
    public EBeneficiaryHelpStatus = EBeneficiaryHelpStatus;

    toFixed(n: any): number {
        return n.toFixed(1);
    }
}
