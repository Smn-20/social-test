// Import necessary Angular modules
import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appHoverMenu]', // Selector to use the directive
})
export class HoverMenuDirective {
    @Output() sidebarSizeEvent: EventEmitter<string> = new EventEmitter();
    constructor(private el: ElementRef, private renderer: Renderer2) {}

    // Listen for mouse enter event
    @HostListener('mouseenter', ['$event']) onMouseEnter(event: MouseEvent) {
        const hoveredElement = event.target as HTMLElement;
        const position = hoveredElement.getBoundingClientRect().top;
        this.sidebarSizeEvent.emit(`calc(100vh - ${position}px)`);
        this.addHoverClass();
    }

    // Listen for mouse leave event
    @HostListener('mouseleave') onMouseLeave() {
        this.removeHoverClass(); // Remove the specified class
    }

    @Input() appHoverMenu = false;

    private addHoverClass() {
        if (this.appHoverMenu) return;
        this.renderer.addClass(this.el.nativeElement, 'menu-item'); // Add the class 'hovered'
    }

    private removeHoverClass() {
        this.renderer.removeClass(this.el.nativeElement, 'menu-item'); // Remove the class 'hovered'
    }
}
