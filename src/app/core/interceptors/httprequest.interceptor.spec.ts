import { TestBed } from '@angular/core/testing';

import { HttprequestInterceptor } from './httprequest.interceptor';

describe('HttprequestInterceptor', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            providers: [HttprequestInterceptor],
        })
    );

    it('should be created', () => {
        const interceptor: HttprequestInterceptor = TestBed.inject(HttprequestInterceptor);
        expect(interceptor).toBeTruthy();
    });
});
