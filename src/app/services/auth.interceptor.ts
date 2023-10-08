import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SigninService } from "./signin.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private signinService: SigninService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authToken = this.signinService.getToken();
    console.log("authToken");
    console.log(authToken);
    const authRequest = req.clone({
        headers: req.headers.set('Authorization', "Bearer " + authToken)
    })
    console.log("authRequest");
    console.log(authRequest);
    return next.handle(authRequest);
  }
}
