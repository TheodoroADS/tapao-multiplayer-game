import { Player } from "./Player";

export interface Game {
  
  current_number : number;
  current_card : number;
  cards_on_table : number;
  
  lost_round : boolean;
  turn : boolean;
  
  players : Array<Player>;

  current_player : number;

  get nb_players() : number; 

  update() : void;

  tapao() : void;

  winRound() : void;

  winGame() : void;

  loseGame() : void;
}
