import { Component, OnDestroy, OnInit, } from '@angular/core';
import { PlayerLobby, isPlayerLobbyArray, PlayerLobbyStatus } from 'src/app/models/Player';
import { WsService } from 'src/app/services/ws.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit , OnDestroy{


  players : Array<PlayerLobby> = [{Name : "You" , Status :  PlayerLobbyStatus.READY}]

  socketSubscription : EventListener

  constructor(private websocketService : WsService , private api : ApiService ) {

      const _this = this;
      this.socketSubscription = websocketService.subscribe(
        
        (message : string) => {

          console.log("Socket subscription recieved :", message)
          try {
            
            const receivedPlayers = JSON.parse(message)
            if (isPlayerLobbyArray(receivedPlayers)){
              _this.players = receivedPlayers; 
            }else{
              console.log("bunda mole e seca");
              
            }
          
          }catch(err){
            console.error(err)
          }

          console.log(_this.players)
        
      } , true)

      console.log(this.socketSubscription);
      

   }

  playerStatusToString(status : PlayerLobbyStatus) : string{
  
    switch(status){
      case PlayerLobbyStatus.READY:
        return "ready"
      case PlayerLobbyStatus.NOT_READY:
      return "not ready"
    }
  
  }

  startGame(){
    this.api.startGameResquest();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
      this.websocketService.unsubscribe(this.socketSubscription, true)
  }

}
