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
import { Clipboard } from "@angular/cdk/clipboard";

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
  holiday: string = "Дни рождения июня 2024";
  lineItems: Array<LineItem> = [];
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
  successMessage: string = "";
  errorMessage: string = "";
  canSave: Boolean = false;
  ready: Boolean = false;
  order_id: any;
  contactReminder: string = "";
  clientFirstName: string = "";
  spinner: Boolean = false;
  clicked: Boolean = false;
  useProportion: Boolean = false;
  showMaxNoAddress: Boolean = true;
  showMaxOneHouse: Boolean = true;
  addressFilter: string = "any";
  genderFilter: string = "any";
  showIndexes: false;
  showInstruction: false;
  regions = [];
  nursingHomes = [];
  // activeRegions = [];
  activeNursingHomes = [];
  actualYear = new Date().getFullYear();
  addresses: HTMLElement;
  isMainMonth = true;
  isNextMonth = false;
  isBeforeMonth = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private orderService: OrderService,
    private resultDialog: MatDialog,
    private cookieService: CookieService,
    private clipboard: Clipboard,
    private fb: FormBuilder
  ) {
    this.userName = this.cookieService.get("session_user");
  }

  ngOnInit(): void {
    /*     this.orderService.getRegions().subscribe(
      async (res) => {
        this.regions = res["data"];
      },
      (err) => {
        console.log(err);
      }
    ); */

    this.orderService.getNursingHomes().subscribe(
      async (res) => {
        this.nursingHomes = res["data"]["nursingHomes"];
        this.activeNursingHomes = res["data"]["nursingHomes"];
        this.regions = res["data"]["regions"];
        //  this.activeRegions = res["data"]["regions"];
      },
      (err) => {
        console.log(err);
      }
    );

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
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
      isAccepted: [false],
      source: [null, Validators.compose([Validators.required])],
      comment: [null],
      femaleAmount: [null, [Validators.min(1)]],
      maleAmount: [null, [Validators.min(1)]],
      year1: [null, [Validators.min(1900), Validators.max(this.actualYear)]],
      year2: [null, [Validators.min(1900), Validators.max(this.actualYear)]],
      date1: [null, [Validators.min(1), Validators.max(31)]],
      date2: [null, [Validators.min(1), Validators.max(31)]],
      region: [null],
      nursingHome: [null],
      maxOneHouse: [null, [Validators.min(1)]],
      maxNoAddress: [null, [Validators.min(1)]],
      onlyWithPicture: [false],
      onlyAnniversaries: [false],
      onlyAnniversariesAndOldest: [false],
    });
  }

  goNext(event) {
    event.preventDefault();

    this.isMainMonth = !this.isMainMonth;
    if (this.isMainMonth) {
      this.isNextMonth = false;
    } else {
      this.isNextMonth = true;
    }
    this.isBeforeMonth = false;
    console.log("click");
    if (this.isMainMonth) {
      this.holiday = "Дни рождения июня 2024";
    }
    if (this.isNextMonth) {
      this.holiday = "Дни рождения июля 2024";
    }
  }

  goBack(event) {
    event.preventDefault();
      this.isMainMonth = !this.isMainMonth;
    if (this.isMainMonth) {
      this.isBeforeMonth = false;
    } else {
      this.isBeforeMonth = true;
    }
    this.isNextMonth = false;
    if (this.isMainMonth) {
      this.holiday = "Дни рождения июня 2024";
    }
    if (this.isBeforeMonth) {
      this.holiday = "Дни рождения мая 2024";
    }
  }

  correctProportion(genderValue: string) {
    if (genderValue == "proportion") {
      this.useProportion = true;
    } else {
      this.useProportion = false;
      this.form.controls.femaleAmount.setValue(null),
        this.form.controls.maleAmount.setValue(null);
    }
  }

  correctMaxNoAddress(addressValue: string) {
    if (addressValue == "any" || addressValue == "noReleased") {
      this.showMaxNoAddress = true;
    } else {
      this.showMaxNoAddress = false;
      this.form.controls.maxNoAddress.setValue(null);
    }
  }

  onChangeNursingHome() {
    if (!this.form.controls.nursingHome.value) {
      this.showMaxOneHouse = true;
      if (this.addressFilter == "any" || "noReleased") {
        this.showMaxNoAddress = true;
      }
    } else {
      this.showMaxOneHouse = false;
      this.form.controls.maxOneHouse.setValue(null);
      this.showMaxNoAddress = false;
      this.form.controls.maxNoAddress.setValue(null);
    }
  }

  onChangeRegion() {
    console.log(this.form.controls.region.value);
    console.log(this.form.controls.nursingHome.value);

    if (!this.form.controls.region.value) {
      console.log("no regions were chosen");
      console.log(this.form.controls.region.value);
      this.activeNursingHomes = this.nursingHomes;
    } else {
      this.activeNursingHomes = this.nursingHomes.filter(
        (item) => item.region == this.form.controls.region.value
      );

      if (this.form.controls.nursingHome.value) {
        let activeNursingHome = this.nursingHomes.filter(
          (item) => item.nursingHome == this.form.controls.nursingHome.value
        );
        if (this.form.controls.region.value != activeNursingHome[0].region) {
          this.form.controls.nursingHome.setValue(null);
        }
      }
      console.log(this.activeNursingHomes);
    }
  }

  onSlideToggleChange(reason: string) {
    if (reason == "onlyAnniversaries") {
      if (
        this.form.controls.onlyAnniversariesAndOldest.value &&
        this.form.controls.onlyAnniversaries.value
      ) {
        this.form.controls.onlyAnniversariesAndOldest.setValue(false);
      }
    }
    if (reason == "onlyAnniversariesAndOldest") {
      if (
        this.form.controls.onlyAnniversariesAndOldest.value &&
        this.form.controls.onlyAnniversaries.value
      ) {
        this.form.controls.onlyAnniversaries.setValue(false);
      }
    }
  }

  /*changeRegionsSelection(event) {
    console.log(this.form.controls.region.value);
    console.log(this.form.controls.nursingHome.value);

    if (!this.form.controls.nursingHome.value) {
      console.log("no home were chosen");
      console.log(this.form.controls.nursingHome.value);
      this.activeRegions = this.regions;
    } else {
      this.activeRegions = this.regions.filter(
        (item) => item.name == this.form.controls.nursingHome.value.region
      );

      console.log(this.activeRegions);
    }

    // if (this.form.controls.nursingHome.value) {
      console.log("homes were chosen");
      let activeNursingHome = this.nursingHomes.filter(
        (item) => item.nursingHome == this.form.controls.nursingHome.value
      ); 

     // this.form.controls.region.setValue(activeNursingHome[0].region);

      // console.log(this.activeNursingHomes);
    
  }*/

  exit() {
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите выйти без сохранения заявки?",
      accept: () => {
        this.successMessage = "";
        this.errorMessage = "";
        this.contactReminder = "";
        this.clientFirstName = "";
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
    this.successMessage = "";
    this.errorMessage = "";
    this.contactReminder = "";
    this.clientFirstName = "";
    this.lineItems = [];
    this.canSave = false;
    this.form.reset();
    this.addressFilter = "any";
    this.genderFilter = "any";

    this.clicked = false;
    this.useProportion = false;
    this.showMaxOneHouse = true;
    this.showMaxNoAddress = true;
    this.showIndexes = false;
    this.showInstruction = false;

    this.holiday = "Дни рождения июня 2024";
    this.isMainMonth = true;
    this.isNextMonth = false;
    this.isBeforeMonth = false;
  }
  /*   beforeCreateOrder() {
    console.log("this.spinner");
    console.log(this.spinner);
    if (!this.spinner) {
      this.createOrder();
    } else {
      console.log("Clicked twice!");
    }
  } */
  createOrder() {
    this.clicked = true;
    this.successMessage = "";
    this.errorMessage = "";
    this.contactReminder = "";
    this.clientFirstName = "";
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
      this.clicked = false;
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
        this.clicked = false;
      } else {
        if (
          this.form.controls.contactType.value &&
          !this.form.controls.contact.value
        ) {
          this.resultDialog.open(ConfirmationDialogComponent, {
            data: {
              message:
                "Укажите другой контакт или выберите 'пусто' в поле 'Другой контакт'!",
            },
            disableClose: true,
            width: "fit-content",
          });
          this.clicked = false;
        } else {
          //console.log(this.form.controls.year2.value);
          //console.log(this.form.controls.year1.value);
          if (
            this.form.controls.year2.value != null &&
            this.form.controls.year1.value != null &&
            this.form.controls.year2.value < this.form.controls.year1.value
          ) {
            this.resultDialog.open(ConfirmationDialogComponent, {
              data: {
                message:
                  "Неверно указан период для года рождения: значение 'С' должно быть меньше или равно значению 'ПО'.",
              },
              disableClose: true,
              width: "fit-content",
            });
            this.clicked = false;
            console.log("ERROR");
          } else {
            if (
              this.form.controls.date1.value != null &&
              this.form.controls.date2.value != null &&
              this.form.controls.date2.value < this.form.controls.date1.value
            ) {
              this.resultDialog.open(ConfirmationDialogComponent, {
                data: {
                  message:
                    "Неверно указан период для даты рождения: значение 'С' должно быть меньше или равно значению 'ПО'.",
                },
                disableClose: true,
                width: "fit-content",
              });
              this.clicked = false;
            } else {
              console.log("this.genderFilter");
              console.log(this.genderFilter);

              if (
                this.genderFilter == "proportion" &&
                this.form.controls.femaleAmount.value +
                  this.form.controls.maleAmount.value !=
                  this.form.controls.amount.value
              ) {
                this.resultDialog.open(ConfirmationDialogComponent, {
                  data: {
                    message:
                      "Количество в пропорции женщин и мужчин должно совпадать с общим количеством.",
                  },
                  disableClose: true,
                  width: "fit-content",
                });
                this.clicked = false;
              } else {
                if (
                  this.form.controls.maxOneHouse.value >
                    this.form.controls.amount.value ||
                  this.form.controls.maxNoAddress.value >
                    this.form.controls.amount.value
                ) {
                  this.resultDialog.open(ConfirmationDialogComponent, {
                    data: {
                      message:
                        "Max количество адресов из одного дома или из БОА не может быть больше общего количества адресов.",
                    },
                    disableClose: true,
                    width: "fit-content",
                  });
                  this.clicked = false;
                } else {
                  this.orderService
                    .checkDoubleOrder(
                      this.holiday,
                      this.form.controls.email.value,
                      this.form.controls.contact.value
                    )
                    .subscribe(
                      async (res) => {
                        let result = res["data"];
                        // console.log("res");
                        // console.log(res);
                        if (!result) {
                          this.fillOrder([]);
                        } else {
                          let usernameList = "";
                          for (let user of result.users) {
                            usernameList =
                              usernameList.length == 0
                                ? user
                                : usernameList + ", " + user;
                          }
                          this.confirmationService.confirm({
                            message:
                              "Пользователь с такими контактами уже получил адреса на этот праздник: " +
                              this.holiday +
                              " у волонтера(ов): " +
                              usernameList +
                              ". Вы уверены, что это не дубль?",
                            accept: () => this.fillOrder(result.seniorsIds),
                            reject: () => (this.clicked = false),
                          });
                        }
                      },
                      (err) => {
                        this.errorMessage = err.error.msg + " " + err.message;
                        console.log(err);
                        this.clicked = false;
                      }
                    );
                }
              }
            }
          }
        }
      }
    }
  }

  fillOrder(prohibitedId: []) {
    this.spinner = true;
    /*     if (this.form.controls.genderFilter.value == "proportion") {
      if (!this.form.controls.femaleAmount.value) {
      }
    } */
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
      isAccepted: this.form.controls.isAccepted.value ? true : false,
      source: this.form.controls.source.value,
      comment: this.form.controls.comment.value,
      orderDate: this.orderDate,
      dateOfOrder: new Date(),
      filter: {
        addressFilter: this.addressFilter,
        genderFilter: this.genderFilter,
        year1: this.form.controls.year1.value,
        year2: this.form.controls.year2.value,
        femaleAmount: this.form.controls.femaleAmount.value,
        maleAmount: this.form.controls.maleAmount.value,
        date1: this.form.controls.date1.value,
        date2: this.form.controls.date2.value,
        region: this.form.controls.region.value,
        nursingHome: this.form.controls.nursingHome.value,
        maxOneHouse: this.form.controls.maxOneHouse.value,
        maxNoAddress: this.form.controls.maxNoAddress.value,
        onlyWithPicture: this.form.controls.onlyWithPicture.value,
        onlyAnniversaries: this.form.controls.onlyAnniversaries.value,
        onlyAnniversariesAndOldest:
          this.form.controls.onlyAnniversariesAndOldest.value,
      },
    };
    //console.log("newOrder");
    console.log(newOrder.dateOfOrder);
    //console.log("newOrder");
    //console.log(newOrder);

    this.orderService.createOrder(newOrder, prohibitedId).subscribe(
      async (res) => {
        this.spinner = false;
        this.clicked = false;
        let result = res["data"]["result"];
        if (typeof result == "string") {
          this.errorMessage = result;
          // console.log(res);
        } else {
          //alert(res.msg);
          //console.log(res);
          this.lineItems = result;
          let i = 0;
          for (let lineItem of this.lineItems) {
            for (let celebrator of lineItem.celebrators) {
              celebrator.index = i + 1;
              i++;
            }
          }

          this.canSave = true;
          this.successMessage =
            "Ваша заявка сформирована и сохранена. Пожалуйста, скопируйте список и отправьте поздравляющему. Если список вас не устраивает, удалите эту заявку и обратитесь к администратору.";
          this.contactReminder = " для " + res["data"]["contact"];
          this.clientFirstName = res["data"]["clientFirstName"];
        }
      },
      (err) => {
        this.spinner = false;
        this.clicked = false;
        this.errorMessage = err.error.msg + " " + err.message;
        console.log(err);
      }
    );
  }

  getAddresses() {
    let greeting: string;
    if (this.clientFirstName) {
      greeting = "Добрый день, " + this.clientFirstName + "!\n\n";
    } else {
      greeting = "Добрый день!\n\n";
    }
    let top =
      "Пожалуйста, подтвердите получение этого письма, ответив на него!\n\n" +
      "Мы получили вашу заявку и очень рады вашему участию!\n\n" +
      "Высылаю вам адреса для поздравления жителей домов престарелых (сначала идет адрес, потом - ФИО или несколько ФИО). Иногда в списках встречаются люди, которых к престарелым совсем не относятся. Это инвалиды, которые проживают в домах престарелых. Иногда сразу после детдомов.\n\n" +
      this.holiday +
      "\n" +
      "Если какие-то адреса вам не подходят, обязательно возвращайте - заменю.\n" +
      "Если вы не сможете отправить открытки, сообщите мне, как можно скорее, чтобы я могла их передать другому поздравляющему.\n\n";
    let bottom =
      "Отправляйте письма правильно!\n – Открытки отправляйте Почтой России только ПРОСТЫМИ письмами/открытками (НЕ заказными).\n – Каждому адресату отправляйте отдельную открытку в отдельном конверте или отдельную почтовую открытку без конверта.\n – Учтите, что по России письма идут 7-14 дней.\n\n" +
      "Как писать поздравления?\n – Используйте обращение на 'Вы' и по имени-отчеству (если отчество указано).\n – Пишите поздравления от себя лично (не от организации, не от школы, не от фонда).\n – Подпишитесь своим именем, укажите город и добавьте пару слов о себе.\n – По возможности укажите ваш обратный адрес (кроме случаев, когда мы просим этого не далать)*.\n – Адрес и ФИО получателя на конверте или почтовой открытке укажите обязательно в правом нижнем углу.\n\n" +
      "Что писать не надо.\n – Не желайте семейного уюта, любви близких, финансового благополучия и т.п.\n – Нигде не указывайте ваш телефон (даже, если есть такое поле на конверте), если не готовы на 200%, что вам начнут звонить и писать в любое время.\n – Если написано, что поздравления нужно отправлять без указания обратного адреса, не давайте свой обратный адрес и любые другие контакты*.\n\n" +
      "Получили ответ?\n – Если получили ответ от жителя интерната, обязательно сообщите об этом нам.\n – Не вступайте в переписку с ответившим до того, как это будет согласовано с координатором.\n – Если ваша открытка вернулась, также сообщите нам.\n\n" +
      "Чего просим не делать.\n – Запрещены любые публикации (в соцсетях, на сайтах учебных заведений, на личных страницах и т.д.) адресов и/или ФИО наших подопечных (в т.ч. фото конвертов или открыток, на которых указаны адрес и/или ФИО подопечного).\n – Не отправляйте подарки, сувениры и гостинцы, чтобы не омрачить праздник других людей.\n – Не отправляйте посылки, бандероли, заказные/ценные письма, письма первого класса и прочие регистрируемые отправления, так как возможны проблемы с получением подобной корреспонденции и ваше отправление может вернуться.\n – По указанным адресам нужно отправить открытки только один раз: не нужно поздравлять людей со всеми праздниками или писать им письма!\n\n" +
      "Нашим подопечным нужны продукты, дрова для обогрева домов, медицинская помощь. Сделайте пожертвование на starikam.org\n\n" +
      "Огромное вам спасибо за радость для наших подопечных!\nБудут вопросы — обращайтесь!\n\n" +
      "* - Мы просим отправлять без указания обратного адреса поздравления в психоневрологические интернаты (ПНИ) и специальные интернаты по настоятельной просьбе администрации этих учреждений, чтобы их жители не потревожили поздравляющих ответными письмами. Если в вашем списке есть такой адрес, то под ним обязательно идет соответствующий комментарий: (администрация настоятельно просит не указывать ваш личный адрес на отправлениях в этот интернат, в графе откуда укажите адрес вашего почтового отделения, в графе от кого – Волонтер и ваше имя). Если такого комментария нет, то можете указать свой личный адрес.";
    let addresses = "";
    console.log(this.lineItems);
    for (let lineItem of this.lineItems) {
      addresses =
        addresses +
        lineItem.address +
        " " +
        "\n" +
        (lineItem.infoComment ? lineItem.infoComment + "\n" : "") +
        (lineItem.adminComment ? lineItem.adminComment + "\n" : "");

      for (let celebrator of lineItem.celebrators) {
        addresses =
          addresses +
          (this.showIndexes ? celebrator.index + ". " : "") +
          celebrator.lastName +
          " " +
          celebrator.firstName +
          " " +
          celebrator.patronymic +
          " " +
          celebrator.fullDayBirthday +
          " " +
          celebrator.comment1 +
          " " +
          celebrator.linkPhoto +
          " " +
          celebrator.specialComment +
          "\n";
      }
      addresses = addresses + "\n";
    }
    if (this.showInstruction) {
      addresses = greeting + top + addresses + bottom;
    }
    console.log("addresses");
    console.log(addresses);
    const successful = this.clipboard.copy(addresses);
    console.log("successful");
    console.log(successful);
  }
}
