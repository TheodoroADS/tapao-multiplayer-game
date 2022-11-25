import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private _playerName : string = ""

  private _selectedGame_id? : number

  private _selectedGame_key? : number


  get selectedGame_id() : number{
    return this._selectedGame_id || -1;
  }

  get selectedGame_key() : number{
    return this._selectedGame_key || -1;
  }

  set selectedGame_id(id : number){
    this._selectedGame_id = id;
  } 

  set selectedGame_key(key : number){
    this._selectedGame_key = key;
  } 

  set playerName(name : string){
    this._playerName = name;
  }

  get playerName() : string {
    return this._playerName;
  }



  constructor(private http : HttpClient, private router : Router) { }

  public startGameResquest(){

    if (this._playerName === "" || this._selectedGame_key === undefined || this._selectedGame_id === undefined ){
      
      console.error("playername , game id or game key is missing!");
      return
    }

    lastValueFrom(
      this.http.post(
        "http://localhost:8080/start",
        JSON.stringify( {Id : this.selectedGame_id, Key : this._selectedGame_key})
      )
    )
    .then(() => this.router.navigate(['game/multiplayer']))
    .catch((err) => console.error(err));



  }

}
