import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MpGame } from 'src/app/models/MpGame';
import { SpGame } from 'src/app/models/SpGame';
import { WsService } from 'src/app/services/ws.service';
import { Game } from 'src/app/models/Game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  
  game : Game;

  constructor(private readonly router : Router, private readonly activatedRoute : ActivatedRoute, 
    private readonly socketService : WsService
    ) { 

    if (this.activatedRoute.snapshot.params["gameMode"] == "mp"){
      
      this.game = new MpGame(router, socketService);

    }else{
      
      this.game = new SpGame(router);
      
    }

  }

  ngOnInit(): void {
  }

  translate(num : number) : number | "A" | "J" |"Q" | "K" {

    switch (num){
      
      case 1 :
        return "A";
      case 11 :
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";

        default:
          return num;

    }

  }
  

  @HostListener('window:keyup', ['$event'])
  keyEvent(event : KeyboardEvent){

    if (event.key === " "){
      this.game.turn ? this.game.update() : this.game.tapao()
    }

  }
} 
