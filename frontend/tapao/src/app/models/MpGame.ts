import { Router } from "@angular/router";
import { Game } from "./Game";
import { Player } from "./Player";
import { TapaoMove, GameUpdate } from "./GameDTO";
import { WsService } from "../services/ws.service";
import { OnDestroy } from "@angular/core";

export class MpGame implements Game{
    static readonly HIGHEST : number = 13;
    static readonly TURN_TIME : number = 1000;
    static readonly NUMBER_CARD : number = 52;
    
    current_number : number;
    current_card : number;
    cards_on_table : number;

    lost_round : boolean =  false;
    turn : boolean = true;
  
    
    players : Array<Player> = [];

    current_player : number = 0;
    
    listener : EventListener = () => {}
  
    get nb_players() : number { return this.players.length} 
  
    constructor(private readonly router : Router, private readonly socketService : WsService) { 
        
        this.current_number = 1;
        this.current_card = 1;
        this.cards_on_table = 0;
        

        this.subscribeToBackend();

    }   

    private subscribeToBackend() : void {
      this.listener = this.socketService.subscribe((response: string) => {
  
        const gameUpdate : GameUpdate = JSON.parse(response)

        if (gameUpdate === undefined) {
          console.error("Error parsing server response. Response :", response)
          return
        }
  
        this.current_card = gameUpdate.Played_card
        this.cards_on_table = gameUpdate.Cards_on_table
        this.current_player = gameUpdate.Turn
        this.current_number = gameUpdate.Current_card
        this.players = gameUpdate.Players

        this.turn = this.current_player == 0
        

      }, true)

    }

    update() : void{

      this.socketService.send(JSON.stringify({Tapao : false}))

    }

    tapao() : void{

      this.socketService.send(JSON.stringify({Tapao : true}))

    }
  
    winRound() : void{}
  
    winGame() : void{}
 
    loseGame() : void{}


}