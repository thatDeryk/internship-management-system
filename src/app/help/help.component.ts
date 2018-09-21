import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MD_DIALOG_DATA, MdDialog, MdDialogRef, MdPaginator, PageEvent } from '@angular/material';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

	studentHelpData: Object;
	coordinatorHelpData: Object;
	companyHelpData: Object;
	isBackBtn = false;
	constructor(public dialog: MdDialog, private route:ActivatedRoute, private router: Router) {

		this.studentHelpData = [{
	id: 1,
	title: 'How to Login Student',
	imageOne: '/assets/student/home.png',
	imageTwo: '/assets/student/login.png',
},
	{
		id: 2,
		title: 'How to Sign Up Student',
		imageOne: '/assets/student/home.png',
		imageTwo: '/assets/student/signup1.png',
		imageThree: '/assets/student/signup.png',
	},

	{
		id: 3,
		title: 'How to Change Password Student',
		imageOne: '/assets/student/profile1.png',
		imageTwo: '/assets/student/profile.png',
	}

]



		this.companyHelpData = [{
			id: 1,
			title: 'How to Login Company',
			imageOne: '/assets/company/home1.png',
			imageTwo: '/assets/company/login.png',
		},
		{
			id: 2,
			title: 'How to Change Password Company',
			imageOne: '/assets/company/pass_step/home.png',
			imageTwo: '/assets/company/pass_step/password.png',
		}

		]

		this.coordinatorHelpData = [{
			id: 1,
			title: 'How to Login Coordinator',
			imageOne: '/assets/coordinator/login/home.png',
			imageTwo: '/assets/coordinator/login/login.png',
		},
		{
			id: 2,
			title: 'How to Change Password Coordinator',
			imageOne: '/assets/coordinator/pass_step/home.png',
			imageTwo: '/assets/coordinator/pass_step/profile.png',
		}

		]

	 }

  ngOnInit() {

  	if(this.route.snapshot.queryParams['bck']){
  		this.isBackBtn = true
  	}

  	if(localStorage.getItem('bck')){
			this.isBackBtn = true;
  	}

  }
  openHelpDialog(help) {
		const dialogRef = this.dialog.open(HelpDialogComponent, {
			data:help
		});
		dialogRef.afterClosed()
			.subscribe(result => {
				if (result) {
					console.log(result);
				}
				console.log(result);
			});
	}
}





@Component({
	selector: 'app-help-dialog',
	templateUrl: './help-dialog.html',
	styleUrls: ['./help.component.scss'],

})
export class HelpDialogComponent {
	helpData: any;
	constructor(public dialogRef: MdDialogRef<HelpComponent>,
		@Inject(MD_DIALOG_DATA) public data: any) {

		this.helpData = data;
		console.log(this.helpData);

	}






}
