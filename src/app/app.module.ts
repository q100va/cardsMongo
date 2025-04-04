/*
============================================
app.module.ts
; 
;===========================================
*/

import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
//import { HomeComponent } from "./pages/home/home.component";
import { BaseLayoutComponent } from "./shared/base-layout/base-layout.component";
import { AuthLayoutComponent } from "./shared/auth-layout/auth-layout.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FlexModule } from "@angular/flex-layout";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDialogModule } from "@angular/material/dialog";
import { MatMenuModule } from "@angular/material/menu";
import { MatDividerModule } from "@angular/material/divider";
import { HouseListComponent } from "./pages/house-list/house-list.component";
import { SigninComponent } from "./pages/signin/signin.component";
import { UserCreateComponent } from "./pages/user-create/user-create.component";
import { UserDetailsComponent } from "./pages/user-details/user-details.component";
import { UserListComponent } from "./pages/user-list/user-list.component";
import { HouseCreateComponent } from "./pages/house-create/house-create.component";
import { HouseDetailsComponent } from "./pages/house-details/house-details.component";
import { PickListModule } from "primeng/picklist";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { MessageModule } from "primeng/message";
import { MessagesModule } from "primeng/messages";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { MatTabsModule } from "@angular/material/tabs";
import { ResetPasswordFormComponent } from "./forms/reset-password-form/reset-password-form.component";
import { MatStepperModule } from "@angular/material/stepper";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { DialogModule } from "primeng/dialog";
import { NotFoundComponent } from "./pages/not-found/not-found.component";
import { ErrorComponent } from "./pages/error/error.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { AboutComponent } from "./pages/about/about.component";
import { UserProfileComponent } from "./pages/user-profile/user-profile.component";
import { SeniorsListComponent } from "./pages/seniors-list/seniors-list.component";
import { SeniorsCreateComponent } from "./pages/seniors-create/seniors-create.component";
import { SeniorsDetailsComponent } from "./pages/seniors-details/seniors-details.component";
import { ChartModule } from "primeng/chart";
//import { InvoiceDialogComponent } from "./shared/invoice-dialog/invoice-dialog.component";
import { MatGridListModule } from "@angular/material/grid-list";
import { RoleListComponent } from "./pages/role-list/role-list.component";
import { RoleCreateComponent } from "./pages/role-create/role-create.component";
import { RoleDetailsComponent } from "./pages/role-details/role-details.component";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { MatRadioModule } from "@angular/material/radio";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from "@angular/material/core";
import { ClientCreateComponent } from './pages/client-create/client-create.component';
import { ClientDetailsComponent } from './pages/client-details/client-details.component';
import { ClientListComponent } from './pages/client-list/client-list.component';
import { OrderComponent } from './pages/order/order.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ListComponent } from './pages/list/list.component';
import { OrderDetailsComponent } from './pages/order-details/order-details.component';
import { OrderListComponent } from './pages/order-list/order-list.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatBadgeModule} from '@angular/material/badge';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NameDayComponent } from './pages/name-day/name-day.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { AddListsComponent } from './pages/add-lists/add-lists.component';
import { InstaOrdersComponent } from './pages/insta-orders/insta-orders.component';
import { AllOrdersComponent } from './pages/all-orders/all-orders.component';
import { AllAbsentsComponent } from './pages/all-absents/all-absents.component';
import { TeacherDayComponent } from "./pages/teacher-day/teacher-day.component";
import { NewYearComponent } from './pages/new-year/new-year.component';
import { CheckListsComponent } from './pages/check-lists/check-lists.component';
import { February23Component } from './pages/february23/february23.component';
import { March8Component } from './pages/march8/march8.component';
import { May9Component } from "./pages/may9/may9.component";
import { FamilyDayComponent } from "./pages/family-day/family-day.component";
import {ClipboardModule} from '@angular/cdk/clipboard';
import { CreateClientDialogComponent } from './shared/create-client-dialog/create-client-dialog.component';
import { UpdateClientDialogComponent } from './shared/update-client-dialog/update-client-dialog.component';
import { AdminNewYearComponent } from './pages/admin-new-year/admin-new-year.component';
import { AuthInterceptor } from "./services/auth.interceptor";
import { AdminSpringComponent } from './pages/admin-spring/admin-spring.component';
import { EasterComponent } from './pages/easter/easter.component';
import { AdminEasterComponent } from './pages/admin-easter/admin-easter.component';
import { DobroruComponent } from './pages/dobroru/dobroru.component';
import { AdminVeteransComponent } from './pages/admin-veterans/admin-veterans.component';
import { SeniorDayComponent } from './pages/senior-day/senior-day.component';
import { UploadHbComponent } from './pages/upload-hb/upload-hb.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { UploadNyComponent } from './pages/upload-ny/upload-ny.component';
import { DobroruNewYearComponent } from "./pages/dobroru-new-year/dobroru-new-year.component";
import { DobroruFebruary23Component } from "./pages/dobroru-february23/dobroru-february23.component";
import { DobroruMarch8Component } from "./pages/dobroru-march8/dobroru-march8.component";
import { ReportsComponent } from './pages/reports/reports.component';
import { DobroruMay9Component } from './pages/dobroru-may9/dobroru-may9.component';

@NgModule({
  declarations: [
    AppComponent,

    BaseLayoutComponent,
    AuthLayoutComponent,
    HouseListComponent,
    SigninComponent,
    UserCreateComponent,
    UserDetailsComponent,
    UserListComponent,
    HouseCreateComponent,
    HouseDetailsComponent,
    ResetPasswordFormComponent,
    NotFoundComponent,
    ErrorComponent,
    ContactComponent,
    AboutComponent,
    UserProfileComponent,
    SeniorsListComponent,
    SeniorsCreateComponent,
    SeniorsDetailsComponent,
    RoleListComponent,
    RoleCreateComponent,
    RoleDetailsComponent,
   
    ConfirmationDialogComponent,
    ClientCreateComponent,
    ClientDetailsComponent,
    ClientListComponent,
    OrderComponent,
    ListComponent,
    OrderDetailsComponent,
    OrderListComponent,
    NameDayComponent,
    AddListsComponent,
    InstaOrdersComponent,
    AllOrdersComponent,
    AllAbsentsComponent,
    TeacherDayComponent,
    NewYearComponent,
    CheckListsComponent,
    February23Component,
    March8Component,
    May9Component,
    FamilyDayComponent,
    CreateClientDialogComponent,
    UpdateClientDialogComponent,
    AdminNewYearComponent,
    AdminSpringComponent,
    EasterComponent,
    AdminEasterComponent,
    DobroruComponent,
    AdminVeteransComponent,
    SeniorDayComponent,
    UploadHbComponent,
    UploadNyComponent,
    DobroruNewYearComponent,
    DobroruFebruary23Component,
    DobroruMarch8Component,
    ReportsComponent,
    DobroruMay9Component,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FlexModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatMenuModule,
    MatDividerModule,
    PickListModule,
    MatTableModule,
    ToastModule,
    ConfirmDialogModule,
    MatTabsModule,
    MessageModule,
    MessagesModule,
    MatStepperModule,
    MatListModule,
    MatSelectModule,
    DialogModule,
    ChartModule,
    MatGridListModule,
    MatButtonToggleModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatBadgeModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatCheckboxModule,
    ClipboardModule,
    MatSidenavModule,
    ScrollingModule,
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    CreateClientDialogComponent,
    UpdateClientDialogComponent
  ],
  providers: [
    ConfirmationService,
    MessageService,
    {provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true}],
  bootstrap: [AppComponent],
})
export class AppModule {}
