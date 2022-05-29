import { Celebrator } from "./celebrator.interface";

export interface List {
  _id?: string;
  key: number;
  period: string;
  active: boolean,
  celebrators: Array<Celebrator>;
  
}
