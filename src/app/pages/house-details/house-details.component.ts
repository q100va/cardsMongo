/*
============================================
; Title: WEB450 Bob's Computer Repair Shop SPrint1
; Author: Professor Krasso
; Date: April 24, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop App security-house-details.component file
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { HousesService } from "src/app/services/houses.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { House } from "src/app/shared/interfaces/houses.interface";

@Component({
  selector: "app-houses-details",
  templateUrl: "./house-details.component.html",
  styleUrls: ["./house-details.component.css"],
})
export class HouseDetailsComponent implements OnInit {
  house: House;
  houseId: string;
  form: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private housesService: HousesService,
    private fb: FormBuilder,
    private resultDialog: MatDialog
  ) {
    this.houseId = this.route.snapshot.paramMap.get("id");
    console.log(this.route.snapshot.paramMap);
    console.log(this.houseId);
    this.housesService.findHouseById(this.houseId).subscribe(
      (res) => {
        this.house = res["data"];
        console.log(this.house);
      },
      (err) => {
        console.log(err);
      },
      () => {
        console.log("WORKING");
        console.log(this.house.nursingHome);
        this.form.controls.nursingHome.setValue(this.house.nursingHome);
        console.log(this.form.controls.nursingHome);
        this.form.controls.address.setValue(this.house.address);
        this.form.controls.region.setValue(this.house.region);
        this.form.controls.adminComment.setValue(this.house.adminComment);
        this.form.controls.infoComment.setValue(this.house.infoComment);
        this.form.controls.isActive.setValue(this.house.isActive);
        this.form.controls.isRestricted.setValue(this.house.isRestricted);
        this.form.controls.dateStart.setValue(this.house.dateStart);
        this.form.controls.nameContact.setValue(this.house.nameContact);
        this.form.controls.contact.setValue(this.house.contact);
      }
    );
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      nursingHome: [null, Validators.compose([Validators.required])],
      region: [null, Validators.compose([Validators.required])],
      address: [null, Validators.compose([Validators.required])],
      infoComment: [null],
      adminComment: [null],
      isRestricted: [false],
      isActive: [true],
      dateStart: [null],
      dateStartClone: [null],
      nameContact: [null],
      contact: [null],
    });
  }

  saveHouse(): void {
    const dateUpdate = new Date(this.form.controls.dateStart.value);

    const updatedHouse: House = {
      nursingHome: this.form.controls.nursingHome.value,
      region: this.form.controls.region.value,
      address: this.form.controls.address.value,
      infoComment: this.form.controls.infoComment.value,
      adminComment: this.form.controls.adminComment.value,
      isRestricted: this.form.controls.isRestricted.value,
      isActive: this.form.controls.isActive.value,
      dateStart: dateUpdate,
      dateStartClone:
        String(dateUpdate.getDate()).padStart(2, "0") +
        "." +
        String(dateUpdate.getMonth() + 1).padStart(
          2,
          "0"
        ) +
        "." +
        dateUpdate.getFullYear(),
      nameContact: this.form.controls.nameContact.value,
      contact: this.form.controls.contact.value,
    };

    this.housesService
      .updateHouse(this.houseId, updatedHouse)
      .subscribe((res) => {
        this.router.navigate(["/houses"]);
        //alert("Security house is updated.");
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Security house has been updated successfully.",
          },
          disableClose: true,
          width: "fit-content",
        });
      });
  }

  cancel(): void {
    this.router.navigate(["/houses"]);
    //alert("Security house updating is canceled.");
    this.resultDialog.open(ConfirmationDialogComponent, {
      data: {
        message: "Security house updating has been canceled.",
      },
      disableClose: true,
      width: "fit-content",
    });
  }
}
