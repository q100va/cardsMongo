/*
============================================
 order-details component
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { ConfirmationService } from "primeng/api";
import { OrderService } from "src/app/services/order.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { LineItem } from "src/app/shared/interfaces/line-item.interface";
import { Order } from "src/app/shared/interfaces/order.interface";

//import { ConfirmationService } from "primeng/api";
//import { MessageService } from "primeng/api";

@Component({
  selector: "app-order",
  templateUrl: "./order.component.html",
  styleUrls: ["./order.component.css"],
})
export class OrderComponent implements OnInit {
  order: Order;
  userName: string;
  form: FormGroup;
  holiday: string = "Дни рождения июня 2022";
  lineItems: Array<LineItem>;
  types: Array<string> = [
    "phoneNumber",
    "whatsApp",
    "telegram",
    "vKontakte",
    "instagram",
    "facebook",
  ];
  orderDate: string = new Date().toLocaleDateString();
  counter: Array<number> = [];
  emptyMessage: string = "";
  canSave: Boolean = false;
  ready: Boolean = false;
  order_id: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private orderService: OrderService,
    private resultDialog: MatDialog,
    private cookieService: CookieService,
    private fb: FormBuilder
  ) {
    this.userName = this.cookieService.get("session_user");
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      clientFirstName: [null],
      clientPatronymic: [null],
      clientLastName: [null],
      email: [null, Validators.compose([Validators.email])],
      contactType: [null],
      contact: [null],
      institute: [null],
      amount: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern("^[0-9]+$"),
        ]),
      ],
      isRestricted: [false],
      isAccepted: [false],
      comment: [null],
    });
  }

  generateOrder() {
    this.emptyMessage = "";
    this.lineItems = [];
    this.canSave = false;

    if (!this.form.controls.email.value && !this.form.controls.contact.value) {
      this.resultDialog.open(ConfirmationDialogComponent, {
        data: {
          message: "Обязательно укажите email или другой возможный контакт!",
        },
        disableClose: true,
        width: "fit-content",
      });
    } else {
      if (
        !this.form.controls.contactType.value &&
        this.form.controls.contact.value
      ) {
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Обязательно выберите тип другого возможного контакта!",
          },
          disableClose: true,
          width: "fit-content",
        });
      } else {
        if(this.form.controls.contactType.value &&
          !this.form.controls.contact.value){
            this.resultDialog.open(ConfirmationDialogComponent, {
              data: {
                message: "Укажите другой контакт или выберите 'пусто' в поле 'Другой контакт'!",
              },
              disableClose: true,
              width: "fit-content",
            });
          }
        else {
        this.orderService
          .getProportion(this.form.controls.amount.value)
          .subscribe(
            (res) => {
              let proportion = res["data"];
              console.log(res);
              this.orderService.getLists().subscribe(
                (res) => {
                  let allLists = res["data"];
                  console.log(res);
                  this.orderService.findNursingHomes().subscribe(
                    (res) => {
                      let nursingHomes = res["data"];
                      console.log(res);
                      let result = this.orderService.generateOrder(
                        proportion,
                        allLists,
                        nursingHomes
                      );
                      if (!result) {
                        this.emptyMessage =
                          "Список не может быть сформирован из-за недостатка адресов. Обратитесь к администратору.";
                        console.log(this.emptyMessage);
                      } else {
                        this.lineItems = result;
                        this.canSave = true;
                        this.emptyMessage =
                          "Это предварительный список! Не отправляйте его поздравляющему!";
                        /* for (let i = 0; i < result.length; i++) {
                          this.counter.push(i + 1);
                        }
                        console.log(this.counter); */
                      }
                    },
                    (err) => {
                      console.log(err);
                    }
                  );
                },
                (err) => {
                  console.log(err);
                }
              );
            },
            (err) => {
              console.log(err);
            }
          );
      }}
    }
  }

  exit() {
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите выйти без сохранения заявки?",
      accept: () => {
        this.emptyMessage = "";
        this.lineItems = [];
        this.canSave = false;
        this.router.navigate(["/orders/find/" + this.userName]);
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Заявка не была сохранена",
          },
          disableClose: true,
          width: "fit-content",
        });
      },
    });
  }

  clear(): void {
    this.emptyMessage = "";
    this.lineItems = [];
    this.canSave = false;
    this.form.reset();
  }

  createOrder(): void {
    let newOrder: Order = {
      userName: this.userName,
      holiday: this.holiday,
      clientFirstName: this.form.controls.clientFirstName.value,
      clientPatronymic: this.form.controls.clientPatronymic.value,
      clientLastName: this.form.controls.clientLastName.value,
      email: this.form.controls.email.value,
      contactType: this.form.controls.contactType.value,
      contact: this.form.controls.contact.value,
      institute: this.form.controls.institute.value,
      amount: this.form.controls.amount.value,
      isRestricted: this.form.controls.isRestricted.value,
      isAccepted: this.form.controls.isAccepted.value,
      comment: this.form.controls.comment.value,
      lineItems: this.lineItems,
      orderDate: this.orderDate,
    };
    console.log(newOrder);

    this.orderService.getLists().subscribe(
      (res) => {
        let lists = res["data"];
        let result = this.checkOrder(newOrder.lineItems, lists);
        if (result) {
          this.resultDialog.open(ConfirmationDialogComponent, {
            data: {
              message:
                "По некоторым из выбранных адресов получилось задвоение. Сформируйте новый список.",
            },
            disableClose: true,
            width: "fit-content",
          });
        } else {
          this.orderService.createOrder(newOrder).subscribe(
            (res) => {
              console.log(res);
              this.order_id = res['data']['_id']
              for (let lineItem of res['data']['lineItems']) {
                for (let celebrator of lineItem.celebrators) {
              this.orderService.updateList(celebrator.celebrator_id).subscribe(
                (res) => {
                  console.log(res); 
                },
                (err) => {
                  console.log(err);
                  this.resultDialog.open(ConfirmationDialogComponent, {
                    data: {
                      message: err.error.msg,
                    },
                    disableClose: true,
                    width: "fit-content",
                  });
                }
              );
                }}

                this.orderService.ifCloseList().subscribe(
                  (res) => {

                    if(res['data']) {this.orderService.changeActiveList();} 
                    
                    this.router.navigate(["/orders/order/"+ this.order_id]);
     
                  },
                  (err) => {
                    console.log(err);
                  }
                );
                
                

                
   
            },
            (err) => {
              console.log(err);
              this.resultDialog.open(ConfirmationDialogComponent, {
                data: {
                  message: err.error.msg,
                },
                disableClose: true,
                width: "fit-content",
              });
            }
          );
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  checkOrder(lineItems, lists) {
    let isDoubles: boolean = false;
    for (let lineItem of lineItems) {
      for (let celebrator of lineItem.celebrators) {
        for (let list of lists) {
          console.log(list);
          let index = list.celebrators.findIndex(
            (item) => item.celebrator_id == celebrator.celebrator_id
          );
          console.log(index);
          console.log(list.celebrators[index]);
          if(index>-1) {
          if (
            (list.celebrators[index].plusAmount > 2 &&
              !list.celebrators[index].oldest) ||
            (list.celebrators[index].plusAmount > 3 &&
              list.celebrators[index].oldest)
          ) {
            isDoubles = true;
          } else {
          }
        }
        }
      }
    }
    return isDoubles;
  }
}
