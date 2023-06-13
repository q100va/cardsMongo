export interface FamilyDay {
  _id?: string;
  nursingHome: string;
  region: string;
  husbandLastName?: string;
  husbandFirstName: string;
  husbandPatronymic?: string;
  husbandYearBirthday?: string;
  wifeLastName?: string;
  wifeFirstName: string;
  wifePatronymic?: string;
  wifeYearBirthday?: string;
  comment1?: string;

  noAddress: boolean;
  isReleased: boolean;
  plusAmount: number;
  holiday: string;
  fullData: string;
}
