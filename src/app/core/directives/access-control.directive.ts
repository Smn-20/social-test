import { AuthService } from '../services/auth.service';
import { EPermission } from '../enums/permission.enum';
import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[appAccessControl]',
})
export class AccessControlDirective implements OnInit {
    @Input() permissions: EPermission[] = [];

    constructor(private elementRef: ElementRef, private authService: AuthService) {}

    ngOnInit(): void {
        this.elementRef.nativeElement.style.display = 'none';
        this.checkAccess();
    }

    checkAccess(): void {
        const perms = this.authService.getUserPermissions();
        const hasAccess = this.permissions.some((p) => perms?.includes(p));
        this.elementRef.nativeElement.style.display = hasAccess ? '' : 'none';
    }
}
