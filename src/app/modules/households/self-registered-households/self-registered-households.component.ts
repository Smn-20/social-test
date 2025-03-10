import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { EPermission } from 'src/app/core/enums';

@Component({
	selector: 'app-self-registered-households',
	templateUrl: './self-registered-households.component.html',
	styleUrls: ['./self-registered-households.component.css'],
	providers: [DatePipe],
})
export class SelfRegisteredHouseholdsComponent {

    public EPermission = EPermission;
	loggedInUser = JSON.parse(this.authService.getItem('user'));

	constructor(
		private authService: AuthService,
	) { }

	get isAdmin() {
		return this.loggedInUser.roles.some((r: string) => ['MINALOC_SUPER_ADMIN']?.includes(r));
	}
}
