import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.css']
})
export class GameOverComponent implements OnInit {

  constructor(public readonly router : Router) { }

  ngOnInit(): void {
  }

  @HostListener("window:keyup", ["$event"])
  keyEvent(event : KeyboardEvent){

    if (event.key === " "){
      this.router.navigate(["/"])
    }

  }


}
