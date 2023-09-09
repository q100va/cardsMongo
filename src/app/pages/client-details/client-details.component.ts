/*
============================================
client-details component
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FormControl, FormArray } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ClientService } from "src/app/services/client.service";
import { Client } from "src/app/shared/interfaces/client.interface";
//import { ConfirmationService } from "primeng/api";
//import { MessageService } from "primeng/api";
import { Role } from "src/app/shared/interfaces/role.interface";
import { RoleService } from "src/app/services/roles.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material/dialog";


@Component({
  selector: "app-client-details",
  templateUrl: "./client-details.component.html",
  styleUrls: ["./client-details.component.css"],
})
export class ClientDetailsComponent implements OnInit {
  constructor(private formBuilder: FormBuilder) {}
  ngOnInit() {}

  
  teamForm = this.formBuilder.group({
    teamName: ["", Validators.required],
    employees: this.formBuilder.array(
      [new FormControl()],
      [Validators.required, Validators.maxLength(5)]
    ),
  });
  get teamName() {
    return this.teamForm.get("teamName") as FormControl;
  }
  get employees() {
    return this.teamForm.get("employees") as FormArray;
  }
  addEmployeeControl() {
    this.employees.push(new FormControl());
  }
  deleteEmployeeControl(index: number) {
    this.employees.removeAt(index);
  }
  insertEmployeeControl() {
    this.employees.insert(1, new FormControl());
  }
  setEmployeeControl() {
    this.employees.setControl(2, new FormControl("Shiv"));
  }
  setEmployeeValue() {
    this.clearEmployeeControls();
    this.addEmployeeControl();
    this.addEmployeeControl();
    this.addEmployeeControl();
    this.employees.setValue(["Mahesh", "Vishal", "Krishn"]);
  }
  patchEmployeeValue() {
    this.employees.patchValue(["Mahesh", "Vishal", "Krishn"]);
  }
  resetEmployees() {
    this.employees.reset();
  }
  clearEmployeeControls() {
    this.employees.clear();
  }
  onFormSubmit() {
    const emp = this.employees.at(0);
    console.log(emp.value);
    const rawVal = this.employees.getRawValue();
    console.log(rawVal);
    console.log(this.teamForm.value);
    // this.teamMngService.saveTeam(this.teamForm.value);
    this.teamForm.reset();
  }
}
