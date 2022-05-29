/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint1
; Author: Professor Krasso
; Date: April 24, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop App app-routing.module.ts
; 
;===========================================
*/

//import { HomeComponent } from "./pages/home/home.component";
import { BaseLayoutComponent } from "./shared/base-layout/base-layout.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { UserListComponent } from "./pages/user-list/user-list.component";
import { HouseListComponent } from "./pages/house-list/house-list.component";
import { AuthLayoutComponent } from "./shared/auth-layout/auth-layout.component";
import { SigninComponent } from "./pages/signin/signin.component";
import { AuthGuard } from "./shared/auth.guard";
import { HouseDetailsComponent } from "./pages/house-details/house-details.component";
import { UserDetailsComponent } from "./pages/user-details/user-details.component";
import { UserCreateComponent } from "./pages/user-create/user-create.component";
import { HouseCreateComponent } from "./pages/house-create/house-create.component";
import { ResetPasswordFormComponent } from "./forms/reset-password-form/reset-password-form.component";
import { NotFoundComponent } from "./pages/not-found/not-found.component";
import { ErrorComponent } from "./pages/error/error.component";
import { AboutComponent } from "./pages/about/about.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { UserProfileComponent } from "./pages/user-profile/user-profile.component";
import { SeniorsListComponent } from "./pages/seniors-list/seniors-list.component";
import { SeniorsCreateComponent } from "./pages/seniors-create/seniors-create.component";
import { SeniorsDetailsComponent } from "./pages/seniors-details/seniors-details.component";
import { RoleGuard } from "./shared/role.guard";
//import { InvoiceDialogComponent } from "./shared/invoice-dialog/invoice-dialog.component";
import { RoleListComponent } from "./pages/role-list/role-list.component";
import { RoleCreateComponent } from "./pages/role-create/role-create.component";
import { RoleDetailsComponent } from "./pages/role-details/role-details.component";
import { ConfirmationDialogComponent } from "./shared/confirmation-dialog/confirmation-dialog.component";
import { ClientListComponent } from "./pages/client-list/client-list.component";
import { ClientDetailsComponent } from "./pages/client-details/client-details.component";
import { ClientCreateComponent } from "./pages/client-create/client-create.component";
import { OrderComponent } from "./pages/order/order.component";
import { ListComponent } from "./pages/list/list.component";
import { OrderDetailsComponent } from "./pages/order-details/order-details.component";
import { OrderListComponent } from "./pages/order-list/order-list.component";

const routes: Routes = [
  {
    path: "",
    component: BaseLayoutComponent,
    children: [
      {
        path: "",
        component: OrderListComponent,
        canActivate: [AuthGuard],
      },

      {
        path: "user",
        component: UserListComponent,
        canActivate: [AuthGuard],
      },

      {
        path: "about",
        component: AboutComponent,
      },

      {
        path: "contact",
        component: ContactComponent,
      },

      {
        path: "houses",
        component: HouseListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "houses/create/new",
        component: HouseCreateComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "houses/update/:id",
        component: HouseDetailsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "users",
        component: HouseListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "users/create/new",
        component: HouseCreateComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "users/update/:id",
        component: HouseDetailsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/create/new",
        component: OrderComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/order/:id",
        component: OrderDetailsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/find/:userName",
        component: OrderListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "clients",
        component: ClientListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "clients/update/:id",
        component: ClientDetailsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "clients/create/new",
        component: ClientCreateComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "users/user/profile",
        component: UserProfileComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "seniors",
        component: SeniorsListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "seniors/create/new",
        component: SeniorsCreateComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "seniors/update/:id",
        component: SeniorsDetailsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "roles",
        component: RoleListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "lists",
        component: ListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "roles/create/new",
        component: RoleCreateComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "roles/update/:id",
        component: RoleDetailsComponent,
        canActivate: [AuthGuard],
      },
      //dialogs
      /*       {
        path: "order-summary",
        component: InvoiceDialogComponent,
        canActivate: [AuthGuard],
      }, */
      {
        path: "confirmation",
        component: ConfirmationDialogComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: "session",
    component: AuthLayoutComponent,
    children: [
      {
        path: "signin",
        component: SigninComponent,
      },
      {
        path: "reset-password",
        component: ResetPasswordFormComponent,
      },
      {
        path: "404",
        component: NotFoundComponent,
      },
      {
        path: "500",
        component: ErrorComponent,
      },
    ],
  },
  {
    path: "**",
    redirectTo: "session/404",
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      enableTracing: false,
      scrollPositionRestoration: "enabled",
      relativeLinkResolution: "legacy",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}