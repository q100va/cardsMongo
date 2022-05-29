/*
============================================
; interface
;===========================================
*/

export interface House {

  _id?: string;
  nursingHome: string;
  region: string;
  address: string;
  infoComment?: string;
  adminComment?: string;
  isRestricted: boolean;
  isActive: boolean;
  dateStart?: Date;
  dateStartClone?: string;
  nameContact?: string;
  contact?: string;
}
