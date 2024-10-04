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
        this.form.controls.notes.setValue(this.house.notes);
        this.form.controls.infoComment.setValue(this.house.infoComment);
        this.form.controls.isActive.setValue(this.house.isActive);
        this.form.controls.noAddress.setValue(this.house.noAddress);
        this.form.controls.isReleased.setValue(this.house.isReleased);
        this.form.controls.dateLastUpdate.setValue(this.house.dateLastUpdate);
        this.form.controls.nameContact.setValue(this.house.nameContact);
        this.form.controls.contact.setValue(this.house.contact);
        this.form.controls.website.setValue(this.house.website);
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
      notes: [null],
      noAddress: [false],
      isReleased: [false],
      isActive: [true],
      dateLastUpdate: [null],
      dateLastUpdateClone: [null],
      nameContact: [null],
      contact: [null],
      website: [null],
    });
  }

  saveHouse(): void {
    const dateUpdate = new Date(this.form.controls.dateLastUpdate.value);

    const updatedHouse: House = {
      nursingHome: this.form.controls.nursingHome.value,
      region: this.form.controls.region.value,
      address: this.form.controls.address.value,
      infoComment: this.form.controls.infoComment.value,
      adminComment: this.form.controls.adminComment.value,
      noAddress: this.form.controls.noAddress.value,
      notes: this.form.controls.notes.value,
      isReleased: this.form.controls.isReleased.value,
      isActive: this.form.controls.isActive.value,
      dateLastUpdate: dateUpdate,
      dateLastUpdateClone:
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
      website: this.form.controls.website.value,
    };

    this.housesService
      .updateHouse(this.houseId, updatedHouse)
      .subscribe((res) => {
        this.router.navigate(["/houses"]);
        //alert("Security house is updated.");
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Информация успешно обновлена.",
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
        message: "Вы отменили обновление.",
      },
      disableClose: true,
      width: "fit-content",
    });
  }
}
