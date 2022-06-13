/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint1
; Author: Professor Krasso
; Date: April 23, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop user-details component
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { SeniorsService } from "src/app/services/seniors.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { Senior } from "src/app/shared/interfaces/seniors.interface";
//import { ConfirmationService } from "primeng/api";
//import { MessageService } from "primeng/api";

@Component({
  selector: "app-seniors-details",
  templateUrl: "./seniors-details.component.html",
  styleUrls: ["./seniors-details.component.css"],
})
export class SeniorsDetailsComponent implements OnInit {
  senior: Senior;
  seniorId: string;

  form: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private seniorsService: SeniorsService,
    private resultDialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.seniorId = this.route.snapshot.paramMap.get("id");

    this.seniorsService.findSeniorById(this.seniorId).subscribe(
      (res) => {
        this.senior = res["data"];
      },
      (err) => {
        console.log(err);
      },
      () => {
        this.form.controls.region.setValue(this.senior.region);
        this.form.controls.nursingHome.setValue(this.senior.nursingHome);
        this.form.controls.lastName.setValue(this.senior.lastName);
        this.form.controls.firstName.setValue(this.senior.firstName);
        this.form.controls.patronymic.setValue(this.senior.patronymic);
        this.form.controls.isRestricted.setValue(this.senior.isRestricted);
        this.form.controls.dateBirthday.setValue(this.senior.dateBirthday);
        this.form.controls.monthBirthday.setValue(this.senior.monthBirthday);
        this.form.controls.yearBirthday.setValue(this.senior.yearBirthday);
        this.form.controls.gender.setValue(this.senior.gender);
        this.form.controls.comment1.setValue(this.senior.comment1);
        this.form.controls.comment2.setValue(this.senior.comment2);
        this.form.controls.linkPhoto.setValue(this.senior.linkPhoto);
        this.form.controls.nameDay.setValue(this.senior.nameDay);
        this.form.controls.dateNameDay.setValue(this.senior.dateNameDay);
        this.form.controls.monthNameDay.setValue(this.senior.monthNameDay);
      }
    );

    this.seniorsService.findAllSeniors().subscribe(
      (res) => {
        this.senior = res["data"];
      },
      (err) => {
        console.log(err);
      }
    );
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      region: [null, Validators.compose([Validators.required])],
      nursingHome: [null, Validators.compose([Validators.required])],
      lastName: [null, Validators.compose([])],
      firstName: [null, Validators.compose([Validators.required])],
      patronymic: [null, Validators.compose([])],
      isRestricted: [null, Validators.compose([Validators.required])],
      dateBirthday: [null, Validators.compose([])],
      monthBirthday: [null, Validators.compose([])],
      yearBirthday: [null, Validators.compose([])],
      gender: ['', Validators.compose([Validators.required])],
      comment1: [null, Validators.compose([])],
      comment2: [null, Validators.compose([])],
      linkPhoto: [null, Validators.compose([])],
      nameDay: [null, Validators.compose([])],
      dateNameDay: [null, Validators.compose([])],
      monthNameDay: [null, Validators.compose([])],

    });
  }

  saveSenior(): void {
    const updatedSenior: Senior = {
      region: this.form.controls.region.value,
      nursingHome: this.form.controls.nursingHome.value,
      lastName: this.form.controls.lastName.value,
      firstName: this.form.controls.firstName.value,
      patronymic: this.form.controls.patronymic.value,
      isRestricted: this.form.controls.isRestricted.value,
      dateBirthday: this.form.controls.dateBirthday.value,
      monthBirthday: this.form.controls.monthBirthday.value,
      yearBirthday: this.form.controls.yearBirthday.value,
      gender: this.form.controls.gender.value,
      comment1: this.form.controls.comment1.value,
      comment2: this.form.controls.comment2.value,
      linkPhoto: this.form.controls.linkPhoto.value,
      nameDay: this.form.controls.nameDay.value,
      dateNameDay: this.form.controls.dateNameDay.value,
      monthNameDay: this.form.controls.monthNameDay.value,

    };
    this.seniorsService.updateSenior(this.seniorId, updatedSenior).subscribe(
      (res) => {
        this.router.navigate(["/seniors"]);
      },
      (err) => {
        console.log(err);
      },
      () => {
        //alert("Seniors information is updated.");
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Seniors information has been updated successfully.",
          },
          disableClose: true,
          width: "fit-content",
        });
      }
    );
  }

  cancel(): void {
    this.router.navigate(["/seniors"]);
    //alert("Senior information is canceled.");
    this.resultDialog.open(ConfirmationDialogComponent, {
      data: {
        message: "Seniors information updating has been canceled.",
      },
      disableClose: true,
      width: "fit-content",
    });
  }
}
