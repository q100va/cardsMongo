/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint 1
; Author: Professor Krasso
; Date: April 21, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop App seniors.interface file
; interface for seniors
;===========================================
*/

export interface Senior {
  _id?: string;
  region: string;
  nursingHome: string;
  lastName?: string;
  firstName: string;
  patronymic?: string;
  isRestricted: boolean | any;
  dateBirthday?: number;
  monthBirthday?: number;
  yearBirthday?: number;
  gender: string;
  comment1?: string;
  comment2?: string;
  linkPhoto?: string;
  nameDay?: string;
  dateNameDay?: number;
  monthNameDay?: number;
  noAddress?: boolean | any;
  isDisabled?: boolean | any;
  isReleased?: boolean | any;
  dateEnter?: Date | string,
  dateExit?: Date | string, 
}
