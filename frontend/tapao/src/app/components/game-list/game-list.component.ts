import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {GameDTO, isGameDTOArray } from 'src/app/models/GameDTO';
import {map, Subscription} from "rxjs"

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})
export class GameListComponent implements OnInit, OnDestroy {

  gameList : Array<GameDTO> | undefined =  undefined;
  gameListSubscription? : Subscription;
  failure : boolean = false;

  @Output()
  buttonClicket : EventEmitter<number> = new EventEmitter<number>();

  constructor(private http :HttpClient) {   

    this.loadGames();

    this.gameList = [
      {
        Id : 0,
        Key : 124,
        Nb_players : 3,
        Players : ["marcio", "marcos", "mauricio"]
      },
      
      {
        Id : 1,
        Key : 1224,
        Nb_players : 0,
        Players : []
      },
      
      {
        Id : 3,
        Key : 1,
        Nb_players : 1,
        Players : ["cock"]
      }

    ]

    console.log("cocok")

  }

  ngOnInit(): void {

    this.loadGames();

  }

  ngOnDestroy() : void {
    this.gameListSubscription?.unsubscribe(); //prevent memory leaks
  }

  loadGames() {

    const that = this;
    const res = this.http
    .get<Array<GameDTO>>("http://localhost:8080/lobbyGames")
    .pipe(map((res : Array<any>) => {
      console.log(res);

      if (isGameDTOArray(res)){
        return res;
      }else{
        throw new Error("Response is not a valid GameDTO array. Received :  " + res.toString());
      }

      
    }))
    
    this.gameListSubscription = res.subscribe({
      next(list) {that.gameList = list; that.failure = false; },
      error(err) {that.failure = true; console.error(err)}
    })
  

  }

  joinGame(gameId : number ){
    this.buttonClicket.emit(gameId);
  }

}
