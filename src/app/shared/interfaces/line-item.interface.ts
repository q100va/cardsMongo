/*
============================================
interface
;===========================================
*/

import { Celebrator } from "./celebrator.interface";

export interface LineItem {
  _id?: string;
  region: string;
  nursingHome: string;
  address: string;
  infoComment?: string;
  adminComment?: string;
  noAddress: boolean;
  celebrators: Array<Celebrator>;
  
}
