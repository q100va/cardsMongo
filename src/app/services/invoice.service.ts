/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint1
; Author: Professor Krasso
; Date: May 7, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop App services for invoice.
;===========================================
*/
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
//import { Invoice } from "../shared/models/invoice";

@Injectable({
  providedIn: "root",
})
export class InvoiceService {
  constructor(private http: HttpClient) {}

 /*  createInvoice(userName: string, invoice: Invoice): Observable<any> {
    return this.http.post("/api/invoices/" + userName, {
      userName: userName,
      lineItems: invoice.getLineItems(),
      partsAmount: invoice.partsAmount,
      laborAmount: invoice.getLaborAmount(),
      total: invoice.getTotal(),
    });
  } */


}
