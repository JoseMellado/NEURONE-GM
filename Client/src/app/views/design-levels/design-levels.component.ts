import { Component, OnInit } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {EndpointsService} from '../../endpoints/endpoints.service';
import {MatDialog} from '@angular/material/dialog';
import {AddLevelDialogComponent} from '../../components/add-level-dialog/add-level-dialog.component';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-design-levels',
  templateUrl: './design-levels.component.html',
  styleUrls: ['./design-levels.component.css']
})
export class DesignLevelsComponent implements OnInit {

  constructor(protected endpointsService: EndpointsService, public dialog: MatDialog, public translate: TranslateService) { }

  table = new MatTableDataSource([]);
  levels = [];
  points = [];
  displayedColumns: string[] = ['name'];
  selectedRow = null;
  focusApp: any = {};

  ngOnInit(): void {
    this.getActiveApp();
  }

  getActiveApp(){
    this.endpointsService.getActiveApp().subscribe((data: {data: object, ok: boolean}) => { // Success
        this.focusApp = data.data;
        this.getLevels();
        this.getPoints();
      },
      (error) => {
        console.error(error);
      });
  }
  getPoints(){
    this.endpointsService.getPoints(this.focusApp.code).subscribe((data: {
        data: any[]; ok: boolean} ) => { // Success
        this.points = data.data;
      },
      (error) => {
        console.error(error);
      });
  }
  getLevels(){
    this.endpointsService.getLevels(this.focusApp.code).subscribe((data: {
        data: any[]; ok: boolean} ) => { // Success
        this.levels = data.data;
        this.table.data = this.levels;
      },
      (error) => {
        console.error(error);
      });
  }

  openAddLevelDialog() {
    let message;
    this.translate.get('level.addLevelTitle').subscribe(res => {
      message = res;
    });
    const dialogRef = this.dialog.open(AddLevelDialogComponent, {
      data: {
        message,
        points: this.points,
        withCode: false}
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        const formData = new FormData();
        formData.append('name', res.name);
        formData.append('description', res.description);
        formData.append('point_required', res.point_required);
        formData.append('point_threshold', res.point_threshold);
        formData.append('file', res.file);
        this.endpointsService.postLevel(formData, this.focusApp.code).subscribe((data: { data: any; ok: boolean }) => {
          this.getLevels();
        }, (error) => {
          console.error(error);
        });
      }
    });
  }
  openEditLevelDialog() {
    let message;
    this.translate.get('level.editLevelTitle').subscribe(res => {
      message = res;
    });
    const dialogRef = this.dialog.open(AddLevelDialogComponent, {
      data: {
        message,
        name: this.selectedRow.name,
        description: this.selectedRow.description,
        point_required: this.selectedRow.point_required.code,
        code: this.selectedRow.code,
        point_threshold: this.selectedRow.point_threshold,
        points: this.points,
        withCode: true
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        const formData = new FormData();
        formData.append('name', res.name);
        formData.append('code', res.code);
        formData.append('description', res.description);
        formData.append('point_required', res.point_required);
        formData.append('point_threshold', res.point_threshold);
        formData.append('file', res.file);
        this.endpointsService.putLevel(formData, this.focusApp.code, this.selectedRow.code).subscribe((data: { data: any; ok: boolean }) => {
          this.getLevels();
          this.selectedRow = null;
        }, (error) => {
          console.error(error);
        });
      }
    });
  }
  deleteLevel(){
    this.endpointsService.deleteLevel(this.focusApp.code, this.selectedRow.code).subscribe( () => {
      this.getLevels();
      this.selectedRow = null;
    },  (error) => {
      console.error(error);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.table.filter = filterValue.trim().toLowerCase();
  }

  select(row){
    this.selectedRow = row;
  }
}
