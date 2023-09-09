/*
============================================
interface file
;===========================================
*/

export interface Client {
  _id?: string;
  firstName: string;
  patronymic?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  whatsApp?: string;
  telegram?: string;
  vKontakte?: string;
  instagram?: string;
  facebook?: string;
  otherContact: string;
  country?: string;
  region?: string;
  city?: string;
  nameDayCelebration: boolean;
  comments?: string;
  institutes?: Array<any>;
  correspondents?: Array<any>;
  coordinators?: Array<string>;
  publishers?: Array<string>; 
  isRestricted: boolean;
  causeOfRestriction: string;
  preventiveAction: Array<string>;
  isDisabled: boolean;
}
