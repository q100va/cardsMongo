/*
============================================
; interface for OrderDialog
;===========================================
*/

import { LineItem } from "./line-item.interface";

export interface Order {
  _id?: string;
  userName: string;
  holiday: string;
  clientFirstName: string;
  clientPatronymic: string;
  clientLastName: string;
  email: string;
  contactType: string;
  contact: string;
  institute: string;
  amount: number;
  isRestricted: boolean;
  isAccepted: boolean;
  comment: string;
  lineItems: Array<LineItem>;
  orderDate: string;
}
