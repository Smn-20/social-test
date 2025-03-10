import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GlobalService } from 'src/app/core/services/global.service';
import { InstitutionService } from 'src/app/core/services/institution.service';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
  selector: 'app-create-institution',
  templateUrl: './create-institution.component.html',
  styleUrls: ['./create-institution.component.css']
})
export class CreateInstitutionComponent implements OnInit {

  institutionsArr: any
  institutionName: string = ''
  institutionDescription: string = ''
  currentId: string = ''

  snackBarMessages: string [] = ['pleaseRefreshPage']   // snackbar messages to be translated --> PLEASE do NOT modify the array values 


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CreateInstitutionComponent>,
    private institutionsService: InstitutionService,
    public dialog: MatDialog,
    private globalService: GlobalService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    if(this.data?.id) {
      this.currentId = this.data.id
      this.institutionName = this.data.name
      this.institutionDescription = this.data.description
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  updateInstitution() {
    let newData = {
      name: this.institutionName.toUpperCase(),
      description: this.institutionDescription.toUpperCase(),
    }

    this.institutionsService.updateInstitution(this.currentId, newData).subscribe((res:any) => {
        this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe(res => {
          this.globalService.openSuccessSnackBar(res)
      })
    })

    this.institutionName = ''
    this.institutionDescription = ''
    this.close()

  }

  createInstitution() {
    let data = {
      name: this.institutionName.toUpperCase(),
      description: this.institutionDescription.toUpperCase()
    }
    this.institutionsService.createInstitution(data).subscribe(res => {
      this.translationService.getInstantTranslations(this.snackBarMessages[0]).subscribe(res => {
        this.globalService.openSuccessSnackBar(res)
    })
    })
    this.institutionName = ''
    this.institutionDescription = ''
    this.close()
  }

  createOrUpdateInstitution() {
    if (this.data?.id) {
      if(this.institutionName && this.institutionDescription) {
        this.updateInstitution()
      }
      this.close()
    }

    if(!this.data?.id) {
      if(this.institutionName && this.institutionDescription) {
        this.createInstitution()
      }
      this.close()
    }



      

  }


}
