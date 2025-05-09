/*
============================================
app-routing.module.ts
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
import { NameDayComponent } from "./pages/name-day/name-day.component";
import { InstaOrdersComponent } from "./pages/insta-orders/insta-orders.component";
import { AllOrdersComponent } from "./pages/all-orders/all-orders.component";
import { AddListsComponent } from "./pages/add-lists/add-lists.component";
import { AllAbsentsComponent } from "./pages/all-absents/all-absents.component";
import { TeacherDayComponent } from "./pages/teacher-day/teacher-day.component";
import { NewYearComponent } from "./pages/new-year/new-year.component";
import { CheckListsComponent } from "./pages/check-lists/check-lists.component";
import { February23Component } from "./pages/february23/february23.component";
import { March8Component } from "./pages/march8/march8.component";
import { May9Component } from "./pages/may9/may9.component";
import { FamilyDayComponent } from "./pages/family-day/family-day.component";
import { AdminNewYearComponent } from "./pages/admin-new-year/admin-new-year.component";
import { AdminSpringComponent } from "./pages/admin-spring/admin-spring.component";
import { EasterComponent } from "./pages/easter/easter.component";
import { AdminEasterComponent } from "./pages/admin-easter/admin-easter.component";
import { DobroruComponent } from "./pages/dobroru/dobroru.component";
import { AdminVeteransComponent } from "./pages/admin-veterans/admin-veterans.component";
import { SeniorDayComponent } from "./pages/senior-day/senior-day.component";
import { UploadHbComponent } from "./pages/upload-hb/upload-hb.component";
import { UploadNyComponent } from "./pages/upload-ny/upload-ny.component";
import { ManagerGuard } from "./shared/manager.guard";
import { DobroruNewYearComponent } from "./pages/dobroru-new-year/dobroru-new-year.component";
import { DobroruFebruary23Component } from "./pages/dobroru-february23/dobroru-february23.component";
import { DobroruMarch8Component } from "./pages/dobroru-march8/dobroru-march8.component";
import { ReportsComponent } from "./pages/reports/reports.component";
import { DobroruMay9Component } from "./pages/dobroru-may9/dobroru-may9.component";
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
        path: "houses",
        component: HouseListComponent,
        canActivate: [AuthGuard, ManagerGuard],//, RoleGuard
      },
      {
        path: "houses/create/new",
        component: HouseCreateComponent,
        canActivate: [AuthGuard, ManagerGuard]
      },
      {
        path: "houses/update/:id",
        component: HouseDetailsComponent,
        canActivate: [AuthGuard, ManagerGuard],
      },
      {
        path: "users",
        component: UserListComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "users/create/new",
        component: UserCreateComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "users/update/:id",
        component: UserDetailsComponent,
        canActivate: [AuthGuard, RoleGuard],
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
        canActivate: [AuthGuard, ManagerGuard ],//RoleGuard
      },
      {
        path: "seniors/create/new",
        component: SeniorsCreateComponent,
        canActivate: [AuthGuard, ManagerGuard],//RoleGuard
      },
      {
        path: "seniors/update/:id",
        component: SeniorsDetailsComponent,
        canActivate: [AuthGuard, ManagerGuard],//RoleGuard
      },
      {
        path: "roles",
        component: RoleListComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "lists",
        component: ListComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "lists/new-year/check",
        component: CheckListsComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "seniors/update-lists",
        component: AddListsComponent,
        canActivate: [AuthGuard, ManagerGuard],//RoleGuard
      },
      {
        path: "roles/create/new",
        component: RoleCreateComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "orders/birthday",
        component: OrderComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/new-year",
        component: NewYearComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/easter",
        component: EasterComponent,
        canActivate: [AuthGuard],
      },

      {
        path: "orders/dobroru/happy-birthday",
        component: DobroruComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/dobroru/new-year",
        component: DobroruNewYearComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/dobroru/february-23",
        component: DobroruFebruary23Component,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/dobroru/march-8",
        component: DobroruMarch8Component,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/dobroru/may9",
        component: DobroruMay9Component,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/may9",
        component: May9Component,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/family-day",
        component: FamilyDayComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/senior-day",
        component: SeniorDayComponent,
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
        path: "orders/insta",
        component: InstaOrdersComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "orders/group-orders/hb",
        component: UploadHbComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "orders/group-orders/ny",
        component: UploadNyComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "orders/all",
        component: AllOrdersComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "orders/absents/all",
        component: AllAbsentsComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "roles/update/:id",
        component: RoleDetailsComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "orders/name-day",
        component: NameDayComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/teacher-day",
        component: TeacherDayComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/february-23",
        component: February23Component,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/march-8",
        component: March8Component,
        canActivate: [AuthGuard],
      },
      {
        path: "lists/admin-new-year",
        component: AdminNewYearComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "lists/admin-spring",
        component: AdminSpringComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "lists/admin-easter",
        component: AdminEasterComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "lists/admin-veterans",
        component: AdminVeteransComponent,
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: "reports",
        component: ReportsComponent,
        canActivate: [AuthGuard],//, RoleGuard
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
