import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { EFilterAction, EJurisdiction, EPermission, EState } from 'src/app/core/enums';
import { AuthService } from 'src/app/core/services/auth.service';
import { EventService } from 'src/app/core/services/event.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { searchBy, statuses } from 'src/app/core/utils/reusable-arrays';
import { initPaginate, Paginate } from 'src/app/core/utils/reusable-functions';
import { EStorageLocation } from './../../../core/enums/storage.enum';

@Component({
  selector: 'app-migration',
  templateUrl: './migration.component.html',
  styleUrls: ['./migration.component.css']
})
export class MigrationComponent implements OnInit, OnDestroy {
  queryFormGroup!: FormGroup;
  households: any[] = [];
  selectedFilter = { type: null, code: null, id: null, name: null };
  selectedStatusFilter = { name: null, value: null };
  nationalLocationId = 'c3e60701-2227-4568-b899-e38b8a43413f';

  openHouseholdDetails = false;
  selectedRowIndex = -1;
  pagination: Paginate = initPaginate(1, 10);
  total = 0;
  searchBy: any[] = [];

  loggedInUser = JSON.parse(this.authService.getItem('user'));
  location: any;
  householdQuerying = false;
  loading = false;
  statuses: any;
  selectedStorageLocation = EStorageLocation.SRIS;
  selectedSearchType = '';
  public EJurisdiction = EJurisdiction;
  public EState = EState;
  public EPermission = EPermission;
  public EStorageLocation = EStorageLocation;
  public EFilterAction = EFilterAction;

  @ViewChild('queryingText', { static: false }) queryingText!: ElementRef;

  constructor(
      public dialog: MatDialog,
      private householdService: HouseholdService,
      private eventService: EventService,
      private authService: AuthService,
      private globalService: GlobalService,
      private fb: FormBuilder,
      private translationService: TranslationService
  ) {
      this.queryFormGroup = this.fb.group({
          query: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
      });

      this.statuses = statuses.filter((item) => item.value !== EState.CREATED && item.value !== EState.ARCHIVED);
      this.initTranslatable();
  }

  ngOnDestroy(): void {
      this.loading = false;
      this.householdQuerying = false;
      this.selectedFilter = { type: null, code: null, id: null, name: null };
      this.selectedStatusFilter = { name: null, value: null };
  }

  get isAdmin() {
    return this.loggedInUser.roles.some((r: string) => ['MINALOC_SUPER_ADMIN']?.includes(r));
  }

  ngOnInit(): void {
      this.eventListening();
      this.householdAutoSearch();
      this.getHouseholds();
      this.householdService.previousPagination = this.pagination;
  }

  async initTranslatable(): Promise<void> {
    this.translationService.loadLanguage();
    this.translationService.getInstantTranslations('component').subscribe((res) => {
        this.searchBy = this.translationService.translateArray(searchBy, res.searchBys);
    });
    await Promise.all(
        this.statuses.map((value: { name: string, value: string }, index: number) => {
            const key = `status${value?.value?.charAt(0).toUpperCase() + value?.value?.slice(1)?.toLowerCase()}`;
            this.translationService.getInstantTranslations(key).subscribe((res) => {
                this.statuses[index] = ({ ...value, name: res ?? value.name })
            });
        })
    )
}


  householdAutoSearch(): void {
      this.queryFormGroup.get('query')?.valueChanges.pipe();

      this.queryFormGroup
          .get('query')
          ?.valueChanges.pipe(debounceTime(1000))
          .subscribe((val) => {
              if (val !== '' || val !== null) {
                  this.householdQuerying = true;
                  this.pagination.page = 1;
              }
          });
  }


  getHouseholds(): void {
      this.loading = true;
      this.householdService
          .getPendingMigrationHouseholds(
              this.selectedStorageLocation,
              (this.selectedFilter.type? this.selectedFilter.type : this.loggedInUser?.jurisdiction),
              (this.selectedFilter.id? this.selectedFilter.id : this.loggedInUser?.locationId),
              this.pagination,
              this.selectedStorageLocation ? 'PENDING' : '',
          )
          .subscribe((res: any) => {
              this.loading = false;
              if (res.status) {
                  this.households = res.response?.content;

                  this.total = res.response.totalElements;
                  this.pagination.page = res.response.number + 1;
                  this.householdService.previousPagination = this.pagination;
              } else {
                  this.households = [];
                  this.globalService.openFailureSnackBar(res.message);
              }
          });
  }


  onPageChange(event: any): void {
      this.openHouseholdDetails = false;
      this.pagination.page = event.pageIndex + 1;

      this.getHouseholds();
  }


  eventListening(): void {
      this.eventService.actionFinished.subscribe((res) => {
          if (res?.name === 'households') {
              this.getHouseholds();
          }
      });

      this.eventService.stopAllLoaders.subscribe((st) => {
          if (st) {
              this.loading = false;
          }
      });
  }


  receiveRefresh(event: any): void {
      window.location.reload();
  }

  initPaginationPage(): void {
      this.pagination.page = 1;
  }


  setQueryingFocus(): void {
      setTimeout(() => {
          this.queryingText.nativeElement.focus();
      }, 0);
  }


  onSetFilterEvent(evt: any): void {
      const { action, event } = evt;
      switch (action) {
        case EFilterAction.LOCATION:
          this.removePersistedLocationFilter();
          this.selectedFilter = event;
          break;
      }
      this.initPaginationPage();
      this.getHouseholds();
  }

  selectTab(evt: EStorageLocation): void {
    if (evt !== this.selectedStorageLocation) {
      this.selectedStorageLocation = evt;
      this.pagination = initPaginate(1, 10);
      this.getHouseholds();
    }
  }

  removePersistedLocationFilter(): void {
    localStorage.removeItem('selectedFilter');
}

}
