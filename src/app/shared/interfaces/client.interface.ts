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
    gender: string;
    email?: string;
    phoneNumber?: string;
    whatsApp?: string;
    telegram?: string;
    vKontakte?: string;
    instagram?: string;
    facebook?: string;
    country?: string;
    region?: string;
    city?: string;
    nameDay: boolean;
    comments?: string;
    institute?: string;
    correspondent?: string;
    coordinator?: string;

    isRestricted: boolean;
  
  }
  