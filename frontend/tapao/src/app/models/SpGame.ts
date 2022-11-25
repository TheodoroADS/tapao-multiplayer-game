import { Router } from "@angular/router";
import { Game } from "./Game";
import { Player } from "./Player";

export class SpGame implements Game{


    static readonly HIGHEST : number = 13;
    static readonly TURN_TIME : number = 1000;
    static readonly NUMBER_CARD : number = 52;
    
    current_number : number;
    current_card : number;
    cards_on_table : number;
    
    lost_round : boolean =  false;
    turn : boolean = true;
  
    
    players : Array<Player> = [
      {name : "You", number_cards: 0},
      {name: "Francisco", number_cards : 0},
      {name : "Marcos", number_cards : 0},
      {name: "Eduardo", number_cards : 0}
    ]
    current_player : number = 0;
    
    tapao_timeout? : NodeJS.Timeout;
    update_timeout? : NodeJS.Timeout;
  
    get nb_players() : number { return this.players.length} 
  
    constructor(private readonly router : Router) { 
  
        this.current_number = 1;
        this.current_card = this.sample_num();
        this.cards_on_table = 0;
        this.distribute();
    }
    
    distribute() : void {

        for (const player of this.players) {
          player.number_cards = Math.floor(SpGame.NUMBER_CARD / this.nb_players)
        }
    }

    update_turn(){
        
        let visited : number = 0;
        do {
            this.current_player = (this.current_player + 1) % this.nb_players;
            visited ++;

            if (visited >= this.nb_players) {this.distribute();}

        }while(this.players[this.current_player].number_cards == 0);

      this.turn = this.current_player == 0;
    }
  
    next_num() : void {
      this.current_number = (this.current_number % SpGame.HIGHEST) + 1
    }
  
    sample_num() : number{
      
      return Math.floor(Math.random() * SpGame.HIGHEST + 1);
     
    }
  
  
    public update() : void{
  
      this.update_turn()
      if (this.players[this.current_player].number_cards > 0 ) this.players[this.current_player].number_cards--;
      this.cards_on_table++;
      if (!this.turn) {
        this.next_num();
        this.current_card = this.sample_num();
      }
      
      if (this.current_card != this.current_number){
        
      if (!this.turn) this.update_timeout = setTimeout(() => {
          this.update();
        }, SpGame.TURN_TIME);
        
      }else{ 
        
         this.tapao_timeout = setTimeout(() => {
  
          this.loseRound();
  
        }, SpGame.TURN_TIME);
        
      }
    }
  
    public tapao() {
  
      if (this.current_card == this.current_number){
  
        clearInterval(this.tapao_timeout);
        this.winRound();
  
      }else{
  
        clearInterval(this.update_timeout); 
        this.loseRound();
  
      }
      
    }
    
    loseRound() : void{
    
      if (this.players[0].number_cards >= SpGame.NUMBER_CARD){
        this.loseGame();
      }   
  
      this.lost_round = true;
      setTimeout(() => {
        this.lost_round = false;
      }, SpGame.TURN_TIME);
      
      this.players[0].number_cards += this.cards_on_table;
      this.cards_on_table = 0;
      this.current_number = 1;
      this.next_num();
      this.current_player = 0;
      
      let visited : number = 0;

      while (this.players[this.current_player].number_cards == 0){
        visited++
        this.current_player = (this.current_player + 1) % this.nb_players;
        if (visited >= this.nb_players) this.distribute();
    }
      
      this.turn = true;
      clearInterval(this.tapao_timeout);
  
    }
  
    winRound() : void{
  
      const loser = Math.floor(Math.random() * (this.nb_players - 2 + 1) + 1)
      this.players[loser].number_cards += this.cards_on_table
      this.cards_on_table = 0;
      this.next_num()
      this.current_number = loser;
  
      if (this.players[0].number_cards <= 0){
        this.winGame();
      }
  
      this.update();
  
    }
  
  
    winGame() : void {
      this.router.navigate(['gameWin']);
    }
  
    loseGame() : void {
      this.router.navigate(['gameOver']);
    
    }
  
  

  
  }
  