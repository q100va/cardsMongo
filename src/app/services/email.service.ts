import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private http: HttpClient) { }

  sendEmail(emailData): Observable<any> {

    return this.http.post("/api/email/send-email",{
      domainName: emailData.domainName,
      clientEmail: emailData.clientEmail,
      // clientName: "Оксана",
      subject: emailData.subject,        
      text: emailData.text,
      html: emailData.html,
    });
  }

  fetchEmail(domainName): Observable<any> {     
       return this.http.get("/api/email/fetch-email/" + domainName);   
  }
}
