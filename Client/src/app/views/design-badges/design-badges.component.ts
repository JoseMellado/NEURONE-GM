import { Component, OnInit } from '@angular/core';
import { EndpointsService } from 'src/app/endpoints/endpoints.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { AddBadgeDialogComponent } from 'src/app/components/add-badge-dialog/add-badge-dialog.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-design-badges',
  templateUrl: './design-badges.component.html',
  styleUrls: ['./design-badges.component.css']
})
export class DesignBadgesComponent implements OnInit {

  constructor(protected endpointsService: EndpointsService, public dialog: MatDialog, public translate: TranslateService, private toastr: ToastrService) { }
  table = new MatTableDataSource([]);
  badges = [];
  displayedColumns: string[] = ['title'];
  selectedRow = null;
  focusApp: any = {};
  ngOnInit(): void {
    this.getActiveApp();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.table.filter = filterValue.trim().toLowerCase();
  }

  select(row){
    this.selectedRow = row;
  }

  getActiveApp(){
    this.endpointsService.getActiveApp().subscribe((data: {data: object, ok: boolean}) => { // Success
        this.focusApp = data.data;
        this.getBadges();
      },
      (error) => {
        console.error(error);
      });
  }

  getBadges(){
    this.endpointsService.getBadges(this.focusApp.code).subscribe((data: {
        badges: any[]; ok: boolean} ) => { // Success
        this.badges = data.badges;
        this.table.data = this.badges;
      },
      (error) => {
        console.error(error);
      });
  }

  openAddBadgeDialog() {
    let message, successMessage;
    this.translate.get('badge.addBadgeTitle').subscribe(res => {
      message = res;
    });
    this.translate.get('badge.addSuccess').subscribe(res => {
      successMessage = res;
    });
    const dialogRef = this.dialog.open(AddBadgeDialogComponent, {
      data: {message, withCode: false},
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        const formData = new FormData();
        formData.append('title', res.title);
        formData.append('description', res.description);
        formData.append('file', res.file);
        this.endpointsService.postBadges(formData, this.focusApp.code).subscribe((data: { data: any; ok: boolean }) => {
          if(data.ok){
            this.toastr.success(successMessage, null, {
              timeOut: 3000,
              positionClass: 'toast-center-center'
            });
            this.getBadges();
          }
        }, (error) => {
          console.error(error);
        });
      }
    });
  }
  openEditBadgeDialog() {
    let message, successMessage;
    this.translate.get('badge.editPointTitle').subscribe(res => {
      message = res;
    });
    this.translate.get('badge.editSuccess').subscribe(res => {
      successMessage = res;
    });
    const dialogRef = this.dialog.open(AddBadgeDialogComponent, {
      data: {
        message,
        editData: this.selectedRow,
        withCode: true
      },
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        const formData = new FormData();
        formData.append('title', res.title);
        formData.append('description', res.description);
        formData.append('file', res.file);
        formData.append('code', res.code);
        this.endpointsService.putBadge(formData, this.focusApp.code, this.selectedRow.code).subscribe((data: { data: any; ok: boolean }) => {
          if(data.ok){
            this.toastr.info(successMessage, null, {
              timeOut: 3000,
              positionClass: 'toast-center-center'
            });
            this.getBadges();
            this.selectedRow = null;
          }
        }, (error) => {
          console.error(error);
        });
      }
    });
  }
  deleteBadge(){
    let successMessage, confirmMessage;
    this.translate.get('badge.deleteSuccess').subscribe(res => {
      successMessage = res;
    });
    this.translate.get('badge.deleteConfirm').subscribe(res => {
      confirmMessage = res;
    });
    if(confirm(confirmMessage)){
      this.endpointsService.deleteBadge(this.focusApp.code, this.selectedRow.code).subscribe( () => {
        this.toastr.error(successMessage, null, {
          timeOut: 3000,
          positionClass: 'toast-center-center'
        });
        this.getBadges();
        this.selectedRow = null;
      },  (error) => {
        console.error(error);
      });
    }
  }

}
