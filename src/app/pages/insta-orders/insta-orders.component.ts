import { Component, OnInit } from "@angular/core";
import readXlsxFile from "read-excel-file";
import { orders } from "server/models/orders-list.js";
import { OrderService } from "src/app/services/order.service";
import { LineItem } from "src/app/shared/interfaces/line-item.interface";
import { Order } from "src/app/shared/interfaces/order.interface";

@Component({
  selector: "app-insta-orders",
  templateUrl: "./insta-orders.component.html",
  styleUrls: ["./insta-orders.component.css"],
})
export class InstaOrdersComponent implements OnInit {
  isShowOrder: Boolean = false;
  order: Order;
  lineItems: Array<LineItem>;
  fullName: string;
  needAccepting: string;
  contact: string;
  index: number = 0;
  orderDate: string = new Date().toLocaleDateString();
  isNext: Boolean = false;
  isFirst: Boolean = true;
  file: File;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {}

  async addFile(event) {
    console.log("START");
    this.file = event.target.files[0];
    //let result = [];

    let rows = await readXlsxFile(this.file);

    console.log("rows");
    console.log(rows);

    let columnsNumber = rows[0].length;
    let rowsNumber = rows.length;

    for (let j = 1; j < rowsNumber; j++) {
      let item = {};
      for (let i = 0; i < columnsNumber; i++) {
        let propertyName = rows[0][i];
        item[propertyName.toString()] = rows[j][i];
        orders[j - 1] = item;
      }
    }

    console.log(orders);

   if (orders.length == 0) alert("list is empty");
  }


  start(index: number) {
 

    let newOrder: Order = {
      userName: orders[index].userName,
      holiday: orders[index].holiday,
      clientFirstName: orders[index].clientFirstName ? orders[index].clientFirstName : null,
      clientPatronymic: orders[index].clientPatronymic ? orders[index].clientPatronymic : null,
      clientLastName: orders[index].clientLastName ? orders[index].clientLastName : null,
      email: orders[index].email,
      contactType: orders[index].contactType,
      contact: orders[index].contact,
      institute: orders[index].institute ? orders[index].institute : null,
      amount: +orders[index].amount,
      isAccepted: orders[index].isAccepted == 'true' ? true : false,
      comment: orders[index].comment ? orders[index].comment : null,
      orderDate: this.orderDate,
      filter: {
        addressFilter: orders[index].addressFilter ? orders[index].addressFilter : "any",
        genderFilter: orders[index].genderFilter ? orders[index].genderFilter : "any",
        year1: orders[index].year1 ? +orders[index].year1 : null,
        year2: orders[index].year2 ? +orders[index].year2 : null,
        date1: orders[index].date1 ? +orders[index].date1 : null,
        date2: orders[index].date2 ? +orders[index].date2 : null,
        region: orders[index].region ? orders[index].region : null,
        nursingHome: orders[index].nursingHome ? orders[index].nursingHome : null,
        onlyWithPicture: orders[index].onlyWithPicture ? true : false,
      },
    };

    console.log("newOrder");
    console.log(newOrder);

    this.orderService.createOrder(newOrder).subscribe(
      async (res) => {
        let result = res["data"]["result"];
        if (typeof result == "string") {
          alert(result);
          console.log(res);
        } else {
          //alert(res.msg);
          console.log(res);
          this.orderService.findOrderById(res["data"]["order_id"]).subscribe(
            (res) => {
              console.log(res["data"]);
              this.order = res["data"];
              this.needAccepting = !this.order.isAccepted
                ? "Требует подтверждения"
                : "Не требует подтверждения";

              this.fullName =
                (this.order.clientLastName ? this.order.clientLastName : "") +
                " " +
                (this.order.clientFirstName ? this.order.clientFirstName : "") +
                " " +
                (this.order.clientPatronymic
                  ? this.order.clientPatronymic
                  : "") +
                (this.order.institute ? this.order.institute : "");
              this.contact =
                (this.order.email ? this.order.email : "") +
                " " +
                (this.order.contactType ? this.order.contactType : "") +
                " " +
                (this.order.contact ? this.order.contact : "");
            },
            (err) => {
              console.log(err);
            }
          );
          this.lineItems = result;
          this.isShowOrder = true;
          this.index++;
          if (this.index < orders.length) {
            this.isNext = true;
            this.isFirst = false;
          } else {
            this.isNext = false;
          }
        }
      },
      (err) => {
        alert(err.error.msg + " " + err.message);
        console.log(err);
      }
    );
  }

  next() {}
}
