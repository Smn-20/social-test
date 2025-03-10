import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    loading = false;

    @HostListener('document:mousemove', ['$event'])
    @HostListener('document:keydown', ['$event'])
    @HostListener('document:click', ['$event'])
    onUserActivity(event: Event): void {
        this.authService.resetTimer(); // removed window:focus since it is not the most indicator of user inactivity
    }


    constructor(private authService: AuthService, private router: Router) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                window.scrollTo(0, 0); // Scroll to the top of the page
            }
        });
    }

    ngOnInit() {}
}
