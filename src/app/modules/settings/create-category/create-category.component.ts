import { HouseholdService } from 'src/app/core/services/household.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.css']
})
export class CreateCategoryComponent implements OnInit {
  loading = false;
  categoryForm!: FormGroup;
  modalTitle:string=""

  constructor(
    public dialogRef: MatDialogRef<CreateCategoryComponent>,
    private globalService: GlobalService,
    private householdService: HouseholdService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
    ) {
    this.categoryForm = this.fb.group({
        name: [this.data? this.data?.name:"", [Validators.required]],
        description: [this.data? this.data?.description:"", [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.modalTitle = this.data? "updateCategory":"createCategory"
  }

  createCategory(): void {
    if(this.categoryForm.valid){
      this.loading=true;
      if(this.data){
        this.householdService.updateDashboardCategory(this.data?.id,this.categoryForm.value).subscribe((res) => {
          this.loading=false;
          this.dialogRef.close();
            if(res.status){
              this.globalService.openSuccessSnackBar(res.message);
              window.location.reload()
            }
            else{
              this.globalService.openFailureSnackBar(res.message);
            }
        });
      }else{
        this.householdService.createDashboardCategory(this.categoryForm.value).subscribe((res) => {
          this.loading=false;
          this.dialogRef.close();
            if(res.status){
              this.globalService.openSuccessSnackBar(res.message);
              window.location.reload()
            }
            else{
              this.globalService.openFailureSnackBar(res.message);
            }
        });
      }
      


    }
  }

}
