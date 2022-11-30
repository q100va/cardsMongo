import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Senior } from "src/app/shared/interfaces/seniors.interface";
import { SeniorsService } from "src/app/services/seniors.service";
import { Router } from "@angular/router";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-seniors-create",
  templateUrl: "./seniors-create.component.html",
  styleUrls: ["./seniors-create.component.css"],
})
export class SeniorsCreateComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private seniorsService: SeniorsService,
    private resultDialog: MatDialog
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      region: [null, Validators.compose([Validators.required])],
      nursingHome: [null, Validators.compose([Validators.required])],
      lastName: [null],
      firstName: [null, Validators.compose([Validators.required])],
      patronymic: [null],
      isRestricted: [false],
      dateBirthday: [null],
      monthBirthday: [null],
      yearBirthday: [null],
      gender: ['', Validators.compose([Validators.required])],
      comment1: [null],
      comment2: [null],
      linkPhoto: [null],
      nameDay: [null],
      dateNameDay: [null],
      monthNameDay: [null],

    });
  }

  createSenior() {
    const newSenior = {} as Senior;
    newSenior.region = this.form.controls.region.value;
    newSenior.nursingHome = this.form.controls.nursingHome.value;
    newSenior.lastName = this.form.controls.lastName.value;
    newSenior.firstName = this.form.controls.firstName.value;
    newSenior.patronymic = this.form.controls.patronymic.value;
    newSenior.isRestricted = this.form.controls.isRestricted.value;
    newSenior.dateBirthday = this.form.controls.dateBirthday.value;
    newSenior.monthBirthday = this.form.controls.monthBirthday.value;
    newSenior.yearBirthday = this.form.controls.yearBirthday.value;
    newSenior.gender = this.form.controls.gender.value;
    newSenior.comment1 = this.form.controls.comment1.value;
    newSenior.comment2 = this.form.controls.comment2.value;
    newSenior.linkPhoto = this.form.controls.linkPhoto.value;
    newSenior.nameDay = this.form.controls.nameDay.value;
    newSenior.dateNameDay = this.form.controls.dateNameDay.value;
    newSenior.monthNameDay = this.form.controls.monthNameDay.value;

    this.seniorsService.createSenior(newSenior).subscribe(
      (res) => {
        this.router.navigate(["/seniors"]);
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "New senior has been created successfully.",
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
    this.router.navigate(["/seniors"]);
  }
}
