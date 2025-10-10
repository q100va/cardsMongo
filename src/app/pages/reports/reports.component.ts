import { Component, OnInit } from '@angular/core';
import { ListService } from 'src/app/services/list.service';
import { CookieService } from "ngx-cookie-service";

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  displayedColumns = ['indicator', 'holiday1', 'holiday3', 'holiday4', 'holiday7'];//, 'holiday2', 'holiday5', 'holiday6'
  statistic = [];
  userName;
  name;
  orderAmount = 0;
  celebratorsAmount = 0;

  constructor(
    private listService: ListService,
    private cookieService: CookieService, 
  ) { 
    this.userName = this.cookieService.get("session_user");
    this.name = sessionStorage.getItem("name");
  }

  ngOnInit(): void {

      this.listService.statistic().subscribe(
        (res) => {
          this.statistic = res["data"];
        },
        (err) => {
          console.log(err);
        }
      );

      this.listService.report(this.userName).subscribe(
        (res) => {
          this.orderAmount = res.data.orderAmount;
          this.celebratorsAmount = res.data.celebratorsAmount;
        },
        (err) => {
          console.log(err);
        }
      );


  

    }

}
