import { Component, Input, OnChanges, OnInit, Output, SimpleChanges, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent implements OnInit, OnChanges {
    @Input() items!: Array<any>;
    @Output() changePage = new EventEmitter<any>(true);
    @Input() initialPage = 1;
    @Input() pageSize = 10;
    @Input() maxPages = 10;
    @Input() totalPages!: number;
    @Input() isPaginated = false;

    pager: any = {};
    currentPage = 1;

    constructor() {}

    ngOnInit(): void {
        // get new pager object for specified page
        const length = this.isPaginated ? this.totalPages : this.items.length;
        this.pager = this.paginate(length, this.pageSize, this.maxPages);

        // get new page of items from items array
        // const pageOfItems = this.items.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }

    ngOnChanges(changes: SimpleChanges): void {
        // reset page if items array has changed
        if (changes['items'] !== undefined) {
            this.items = changes['items'].currentValue;
        }

        if (changes['totalPages'] !== undefined) {
            this.totalPages = changes['totalPages'].currentValue;
        }

        if (changes['isPaginated'] !== undefined) {
            this.isPaginated = changes['isPaginated'].currentValue;
        }
    }

    setPage(page: number) {
        // call change page function in parent component
        this.currentPage = page;
        this.changePage.emit(page);
    }

    private paginate(totalItems: number, pageSize = 10, maxPages = 10) {
        let currentPage = 1;
        // calculate total pages
        const totalPages = Math.ceil(totalItems / pageSize);

        // ensure current page isn't out of range
        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        let startPage: number, endPage: number;
        if (totalPages <= maxPages) {
            // total pages less than max so show all pages
            startPage = 1;
            endPage = totalPages;
        } else {
            // total pages more than max so calculate start and end pages
            const maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
            const maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
            if (currentPage <= maxPagesBeforeCurrentPage) {
                // current page near the start
                startPage = 1;
                endPage = maxPages;
            } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                // current page near the end
                startPage = totalPages - maxPages + 1;
                endPage = totalPages;
            } else {
                // current page somewhere in the middle
                startPage = currentPage - maxPagesBeforeCurrentPage;
                endPage = currentPage + maxPagesAfterCurrentPage;
            }
        }

        // calculate start and end item indexes
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        const pages = Array.from(Array(endPage + 1 - startPage).keys()).map((i) => startPage + i);

        // return object with all pager properties required by the view
        return {
            totalItems,
            currentPage,
            pageSize,
            totalPages,
            startPage,
            endPage,
            startIndex,
            endIndex,
            pages,
        };
    }
}
