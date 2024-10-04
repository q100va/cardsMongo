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
      notes: [null],
      noAddress: [false],
      isReleased: [false],
      isActive: [true],
      dateLastUpdate: [null],
      dateLastUpdateClone:[null],
      nameContact: [null],
      contact: [null],
      website:[null]
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
    newHouse.notes = this.form.controls.notes.value;
    newHouse.noAddress = this.form.controls.noAddress.value;
    newHouse.isReleased = this.form.controls.isReleased.value;
    newHouse.isActive = this.form.controls.isActive.value;
    newHouse.dateLastUpdate = new Date(this.form.controls.dateLastUpdate.value);
    newHouse.dateLastUpdateClone = String(newHouse.dateLastUpdate.getDate()).padStart(2, '0') +
    '.' +
    String(newHouse.dateLastUpdate.getMonth() + 1).padStart(2, '0') +
    '.' +
    newHouse.dateLastUpdate.getFullYear();
    newHouse.nameContact  = this.form.controls.nameContact.value;
    newHouse.contact  = this.form.controls.contact.value;
    newHouse.website  = this.form.controls.website.value;

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
