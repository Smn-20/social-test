import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-change-pwd',
  templateUrl: './change-pwd.component.html',
  styleUrls: ['./change-pwd.component.css']
})
export class ChangePwdComponent implements OnInit {
  previousState: any;

  constructor(private location: Location) {
    this.previousState = this.location.getState();
  }

  ngOnInit() {
  }

}
