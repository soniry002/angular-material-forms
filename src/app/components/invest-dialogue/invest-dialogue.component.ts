import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-invest-dialogue',
  templateUrl: './invest-dialogue.component.html',
  styleUrls: ['./invest-dialogue.component.scss']
})
export class InvestDialogueComponent {

  amt: FormControl;
  errorMsg: string;
  constructor(
    public dialogRef: MatDialogRef<InvestDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.amt = new FormControl('', [Validators.max(10000), Validators.maxLength(5), Validators.min(this.data.amount)]);
      this.errorMsg = 'The value should be between ' + this.data.amount + ' and 10000';
    }
}
