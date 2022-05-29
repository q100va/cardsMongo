/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint1
; Author: Professor Krasso
; Date: May 7, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop App model for invoice.
;===========================================
*/
/* 
import { LineItem } from '../../shared/interfaces/line-item.interface';

export class Invoice {
    private username: string;
    private lineItems: LineItem[];
    private orderDate: string;
    private LABOR_RATE: number = 50;    


partsAmount: number;
laborHours: number;

constructor(username?: string, partsAmount?: number, laborHours?: number) {
    this.username = username || '';
    this.partsAmount = partsAmount || 0;
    this.laborHours = laborHours || 0;
    this.orderDate = new Date().toLocaleDateString();
    this.lineItems = [];
}

getUsername(): string {
    return this.username;
}

setLineItems(lineItems: LineItem[]): void {
    this.lineItems = lineItems;
}

getLineItems():LineItem[] {
    return this.lineItems;
}

getLineItemTotal(): number {
    let total: number = 0;

    for (let lineItem of this.lineItems) {
        total = total + Number(lineItem.price);
    }

    return Number(total);
}

getLaborAmount(): number {
    return Number(this.laborHours) * Number(this.LABOR_RATE);
}

getOrderDate(): string {
    return this.orderDate;
}

getPartsAmount(): number {
    return Number(this.partsAmount);
}

getTotal(): number {
    console.log(Number(this.partsAmount));
    console.log(this.getLaborAmount());
    console.log(this.getLineItemTotal());
    return Number(this.partsAmount) + Number(this.getLaborAmount()) + Number(this.getLineItemTotal());
}

clear() {
    this.partsAmount = 0;
    this.laborHours = 0;
    this.lineItems = [];
}

} */