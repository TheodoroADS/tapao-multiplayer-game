import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { WsService } from 'src/app/services/ws.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {

  constructor(public websocketService : WsService, public router : Router, private api : ApiService) {}

  playerName : string = ""

  error_message = false

  ngOnInit(): void {

  }

  createGame() : void {

    if (this.playerName !== ""){
      
      this.api.playerName = this.playerName;
      this.websocketService.createGame(this.playerName)
      const _this = this;
      const connectedSubscription = this.websocketService.subscribeOnce(
        (message : string) => {
          console.log("Waiting for Game Created response. Recieved:", message);
            
          const infostr = JSON.parse(message)

          if (infostr !== undefined && typeof infostr.Id === "number" && typeof infostr.Key === "number"){

            this.api.selectedGame_id = infostr.Id;
            this.api.selectedGame_key = infostr.Key;
            _this.router.navigate(["/lobby"]);
          }
          

        }
      )

    }else{
      this.error_message = true;
    }


  }

  joinGame(gameId : number){

    if (this.playerName !== ""){

      this.api.playerName = this.playerName;
      this.websocketService.joinGame(this.playerName, gameId)
      const _this = this;
      const connectedSubscription = this.websocketService.subscribeOnce(
        (message : string) => {

          console.log("Waiting for joined response. Recieved:", message);
            
          const infostr = JSON.parse(message)

          if (infostr !== undefined && typeof infostr.Id === "number" && typeof infostr.Key === "number"){

            this.api.selectedGame_id = infostr.Id;
            this.api.selectedGame_key = infostr.Key;
            _this.router.navigate(["/lobby"]);
          }
          
        }
      )

    }else{
      this.error_message = true;
    }

  }

}
