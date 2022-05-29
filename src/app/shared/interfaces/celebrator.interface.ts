/*
============================================
interface
;===========================================
*/

export interface Celebrator {
    _id?: string;
    nursingHome: string;
    position: number; 
    lastName?: string;
    firstName: string;
    patronymic?: string;   
    dateBirthday?: number;
    monthBirthday?: number;
    yearBirthday?: number;
    fullDayBirthday?: string;
    comment1?: string;
    specialComment?: string;
    linkPhoto?: string;
    nameDay?: string;
    dateNameDay?: number;
    monthNameDay?: number;
    category: string;
    noAddress: boolean;
    oldest: boolean;
    gender:string;   
    plusAmount: number;
    celebrator_id?: string; 
    
  }
  