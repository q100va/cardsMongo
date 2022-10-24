
export interface NewYear {
  _id?: string;
  nursingHome: string;
  region:string;
  lastName?: string;
  firstName: string;
  patronymic?: string;   
  dateBirthday?: number;
  monthBirthday?: number;
  yearBirthday?: number;
  fullDayBirthday?: string;
  comment1?: string;
  comment2?: string;
  specialComment?: string;
  linkPhoto?: string;
  nameDay?: string;
  dateNameDay?: number;
  monthNameDay?: number;

  noAddress: boolean;
  isReleased:boolean;  
  gender:string;   
  plusAmount: number;
  celebrator_id?: string; 
  holyday: string; 
  fullData: string; 
}
