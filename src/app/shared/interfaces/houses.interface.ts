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
  noAddress: boolean;
  isReleased: boolean;
  isActive: boolean;
  dateLastUpdate?: Date;
  dateLastUpdateClone?: string;
  nameContact?: string;
  contact?: string;
  website?:string;
  statistic?: any;
}
