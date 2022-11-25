import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-win',
  templateUrl: './game-win.component.html',
  styleUrls: ['./game-win.component.css']
})
export class GameWinComponent implements OnInit {

  constructor(public readonly router : Router) { }

  ngOnInit(): void {
  }


  @HostListener('window:keyup', ['$event'])
  keyEvent(event : KeyboardEvent){

    if (event.key === " "){
      this.router.navigate(['/'])
    }

  }

}
