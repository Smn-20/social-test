import { GlobalService } from '../../../core/services/global.service';
import { DataService } from 'src/app/core/services/data.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
// import { EPermission } from '../../core/enums';

@Component({
    selector: 'app-translation-update',
    templateUrl: './translation-update.component.html',
    styleUrls: ['./translation-update.component.css'],
})
export class TranslationUpdateComponent implements OnInit {
    loading = false;
    translationForm!: FormGroup;
    // public EPermission = EPermission;

    constructor(
        public dialogRef: MatDialogRef<TranslationUpdateComponent>,
        private globalService: GlobalService,
        private dataService: DataService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder
    ) {
        this.translationForm = this.fb.group({
            key: ['', [Validators.required]],
            englishVersion: ['', [Validators.required]],
            frenchVersion: ['', [Validators.required]],
            rwandaVersion: ['', [Validators.required]],
        });
    }
    ngOnInit(): void {
        this.translationForm = this.fb.group({
            key: [this.data.key, [Validators.required]],
            englishVersion: [this.data.englishVersion, [Validators.required]],
            frenchVersion: [this.data.frenchVersion, [Validators.required]],
            rwandaVersion: [this.data.rwandaVersion, [Validators.required]],
        });
    }

    updateTranslation(): void {
        if (this.translationForm.valid) {
            this.loading = true;
            this.dataService.updateTranslation(this.translationForm.value).subscribe((res) => {
                this.loading = false;
                this.dialogRef.close();
                if (res.status) {
                    this.globalService.openSuccessSnackBar(res.message);
                } else {
                    this.globalService.openFailureSnackBar(res.message);
                }
            });
        }
    }
}
