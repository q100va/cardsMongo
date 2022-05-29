/*
============================================
component file
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { HousesService } from "../../services/houses.service";
import { House } from "../../shared/interfaces/houses.interface";

@Component({
  selector: "app-house-create",
  templateUrl: "./house-create.component.html",
  styleUrls: ["./house-create.component.css"],
})
export class HouseCreateComponent implements OnInit {
  form: FormGroup;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private HousesService: HousesService,
    private resultDialog: MatDialog
  ) {}

  ngOnInit() {
    // This is for validators.
    this.form = this.fb.group({
      nursingHome: [null, Validators.compose([Validators.required])],
      region: [null, Validators.compose([Validators.required])],
      address: [null, Validators.compose([Validators.required])],
      infoComment: [null],
      adminComment: [null],
      isRestricted: [false],
      isActive: [true],
      dateStart: [null],
      dateStartClone:[null],
      nameContact: [null],
      contact: [null],
    });
  }

  // This is the create function
  create() {
    const newHouse = {} as House;
    newHouse.nursingHome = this.form.controls.nursingHome.value;
    newHouse.region = this.form.controls.region.value;
    newHouse.address = this.form.controls.address.value;
    newHouse.infoComment = this.form.controls.infoComment.value;
    newHouse.adminComment = this.form.controls.adminComment.value;
    newHouse.isRestricted = this.form.controls.isRestricted.value;
    newHouse.isActive = this.form.controls.isActive.value;
    newHouse.dateStart = new Date(this.form.controls.dateStart.value);
    newHouse.dateStartClone = String(newHouse.dateStart.getDate()).padStart(2, '0') +
    '.' +
    String(newHouse.dateStart.getMonth() + 1).padStart(2, '0') +
    '.' +
    newHouse.dateStart.getFullYear();
    newHouse.nameContact  = this.form.controls.nameContact.value;
    newHouse.contact  = this.form.controls.contact.value;
 

    this.HousesService.createHouse(newHouse).subscribe(
      (res) => {
        this.router.navigate(["/houses"]);
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Новый интернат успешно добавлен.",
          },
          disableClose: true,
          width: "fit-content",
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  // This is the cancel button.
  cancel() {
    this.router.navigate(["/houses"]);
  }
}
