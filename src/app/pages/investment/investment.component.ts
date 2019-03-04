import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';

import { User } from './../../models/user';
import { AuthenticationService } from './../../services/authentication.service';
import * as invst from './../../../data.json';
import { InvestDialogueComponent } from './../../components/invest-dialogue/invest-dialogue.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss']
})
export class InvestmentComponent implements OnInit, OnDestroy {
  currentUser: User;
  currentUserSubscription: Subscription;
  users: User[] = [];
  invstData: any[] = [];
  invstGroup: any;
  myval: [];
  copyOfInvstData: any[] = [];

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    public dialog: MatDialog,
    public toastr: ToastrService
  ) {
    this.invstData = invst.default.data;
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(
      user => {
        this.currentUser = user;
      }
    );
  }

  ngOnInit() {
    this.loadUserInvestmentData();
  }

  loadUserInvestmentData() {
    this.currentUser.investments.forEach(element => {
      const indx = this.invstData.map(e => e.id).indexOf(element.id);
      if (indx > -1) {
        this.invstData[indx].userInvstedAmt = element.userInvstedAmt;
      }
    });
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  updateUser(item) {
    this.currentUser.investments.push(item);
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    const users: any[] = JSON.parse(localStorage.getItem('users'));
    users.forEach((element, index) => {
      if (element.id === this.currentUser.id) {
        users[index].investments = this.currentUser.investments;
      }
    });
    localStorage.setItem('users', JSON.stringify(users));
    this.loadUserInvestmentData();
  }

  invest(item) {
      const dialogRef = this.dialog.open(InvestDialogueComponent, {
        width: '50%',
        data: item
      });

      dialogRef.afterClosed().pipe(filter(result => result)).subscribe(result => {
        item.userInvstedAmt = parseInt(result);
        this.updateUser(item);
        this.showToaster('Investment completed');
      });
  }

  showToaster(msg) {
    this.toastr.success(msg, '', {timeOut: 2000});
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
  }
}
