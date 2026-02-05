import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { HousesService } from "src/app/services/houses.service";
import { OrderService } from "src/app/services/order.service";
import { SeniorsService } from "src/app/services/seniors.service";

@Component({
  selector: "app-just-in-case",
  templateUrl: "./just-in-case.component.html",
  styleUrls: ["./just-in-case.component.css"],
})
export class JustInCaseComponent implements OnInit {
  form: FormGroup;
  regions: { _id: number; name: string; spareRegions: string[] }[] = [];
  nursingHomes = [];
  activeNursingHomes = [];
  lineItems = [];
  femaleItems = [];
  showChoiceSpareRegions = false;
  showIndexes = false;
  showDOB = false;
  onlyFemale = false;
  constructor(
    private fb: FormBuilder,
    private housesService: HousesService,
    private seniorsService: SeniorsService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      region: [null],
      spareRegions: [false],
      nursingHome: [null],
    });
    this.housesService.getNursingHomesList().subscribe(
      async (res) => {
        console.log("res");
        console.log(res);
        this.nursingHomes = res["data"]["nursingHomes"];
        this.activeNursingHomes = res["data"]["nursingHomes"];
        this.regions = res["data"]["regions"];
        console.log("this.regions");
        console.log(this.regions);
      },
      (err) => {
        console.log("err");
        console.log(err);
      },
    );
  }

  onChangeRegion() {
    console.log(this.form.controls.region.value);
    console.log(this.form.controls.nursingHome.value);

    if (!this.form.controls.region.value) {
      this.showChoiceSpareRegions = false;
      this.form.controls.spareRegions.setValue(false);
      console.log("no regions were chosen");
      console.log(this.form.controls.region.value);
      this.activeNursingHomes = this.nursingHomes;
    } else {
      this.activeNursingHomes = this.nursingHomes.filter(
        (item) => item.region == this.form.controls.region.value,
      );
      this.showChoiceSpareRegions = true;
      if (this.form.controls.nursingHome.value) {
        let activeNursingHome = this.nursingHomes.filter(
          (item) => item.nursingHome == this.form.controls.nursingHome.value,
        );
        if (this.form.controls.region.value != activeNursingHome[0].region) {
          this.form.controls.nursingHome.setValue(null);
        }
      }
      console.log(this.activeNursingHomes);
    }
  }

  onSpareRegionsChange() {
    console.log("this.form.controls.spareRegions");
    console.log(this.form.controls.spareRegions);
    if (this.form.controls.spareRegions.value) {
      const spareRegions = this.regions.find(
        (item) => item.name == this.form.controls.region.value,
      ).spareRegions;
      this.activeNursingHomes = this.nursingHomes.filter((item) =>
        spareRegions.includes(item.region),
      );
    } else {
      this.activeNursingHomes = this.nursingHomes.filter(
        (item) => item.region == this.form.controls.region.value,
      );
    }
  }

  // getNursingHomesList() {}

  generateList() {
    this.seniorsService
      .getSeniorsList(
        this.form.controls.region.value,
        this.form.controls.spareRegions.value,
        this.form.controls.nursingHome.value,
      )
      .subscribe(
        async (res) => {
        //  console.log("res");
        //  console.log(res);
          this.lineItems = res["data"]["lineItems"];
          this.femaleItems = [];
          for (let lineItem of this.lineItems) {
            let i = 0;
            const female = lineItem.celebrators.filter(
              (c) => c.gender == "Female",
            );
            if (female.length > 0)
              this.femaleItems.push({
                adminComment: lineItem.adminComment,
                infoComment: lineItem.infoComment,
                address: lineItem.address,
                celebrators: female,
              });
            for (let celebrator of lineItem.celebrators) {
              celebrator.index = i + 1;
              i++;
              if (celebrator.gender == "Female") this.femaleItems;
            }
          }

         // console.log("this.femaleItems");
         // console.log(this.femaleItems);
          for (let lineItem of this.femaleItems) {
            let i = 0;
            for (let celebrator of lineItem.celebrators) {
              celebrator.index = i + 1;
              i++;
            }
          }
        },
        (err) => {
          console.log(err);
        },
      );
  }
}
