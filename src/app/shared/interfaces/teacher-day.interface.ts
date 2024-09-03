
export interface TeacherDay {
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
  teacher?: string;
  specialComment?: string;
  linkPhoto?: string;
  dateHoliday?: number;
  monthHoliday?: number;

  noAddress: boolean;
  isReleased:boolean;  
  gender:string;   
  plusAmount: number;
  celebrator_id?: string; 
  holiday: string; 
  fullData: string; 
}
