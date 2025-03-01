/*
============================================
; interface for OrderDialog
;===========================================
*/

import { Celebrator } from "./celebrator.interface";
import { LineItem } from "./line-item.interface";

export interface Order {
  _id?: string;
  
  userName: string;
  holiday: string;
  source?: string;
  clientId?: string;
  clientFirstName: string;
  clientPatronymic: string;
  clientLastName: string;
  email?: string;
  contactType: string;
  contact: string;
  institute?: string;
  institutes?: Array<any>;
  amount: number;
  isAccepted: boolean;
  isOverdue?: boolean;
  isReturned?: boolean;
  isDisabled?: boolean;
  comment: string;
  orderDate: string;
  dateOfOrder?: Date;
  filter?: {
    addressFilter: string,
    genderFilter?: string,
    femaleAmount?: number,
    maleAmount?: number,
    region?: string,
    regions?: Array<any>;
    spareRegions?: boolean,
    minNumberOfHouses?: boolean,
    noNames?: boolean,
    onlyWithConcent?: boolean,
    nursingHome: string,
    maxOneHouse?: number,
    maxNoAddress?: number,
    year1: number,
    year2:  number,
    date1?:  number,
    date2?: number,
    onlyWithPicture: boolean,
    onlyAnniversaries?: boolean,
    onlyAnniversariesAndOldest?: boolean,
  },
  temporaryLineItems?: Array<any>,
  lineItems?: Array<any>
  

}
