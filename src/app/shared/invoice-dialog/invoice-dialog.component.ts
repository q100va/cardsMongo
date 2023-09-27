/* import { Component, Inject, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
//import { Invoice } from "../models/invoice";

@Component({
  selector: "app-invoice-dialog",
  templateUrl: "./invoice-dialog.component.html",
  styleUrls: ["./invoice-dialog.component.css"],
})
export class InvoiceDialogComponent implements OnInit { 
  invoice: Invoice;
  username: string;
  orderDate: string;
  total: number;
  labor: number;
  parts: number;
  lineItems: any[];
  printLineItems: any[];
  displayedColumns: string[] = ["item", "cost"];

  constructor(
    private dialogRef: MatDialogRef<InvoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.invoice = data.invoice;
    this.username = this.invoice.getUsername();
    this.orderDate = this.invoice.getOrderDate();
    this.lineItems = this.invoice.getLineItems();
    this.parts = this.invoice.getPartsAmount();
    this.labor = this.invoice.getLaborAmount();
    this.total = this.invoice.getTotal();
    console.log(this.total);
    this.printLineItems = Array.from(this.lineItems);
    this.printLineItems.push({ name: "Parts", price: this.parts });
    this.printLineItems.push({ name: "Labor @ 50/hr", price: this.labor });
  } */
/* 
  ngOnInit(): void {}
}
 */