import { Player, isPlayer } from "./Player"

export enum GameStatus {
    Lobby,
    Match,
    Finished
}

export type GameDTO = {
    Id : number,
    Key : number,
    Nb_players : number,
    Players : Array<string>

}

export type GameUpdate = {

    Turn : number,
    Cards_on_table : number,
    Current_card : number,
    Played_card : number,
    Players : Array<Player>,
    Game_end : boolean
    

}

export type TapaoMove = {

    Tapao : boolean

}


export function isGameUpdate(object : any) : object is GameUpdate {

    return typeof object.Turn == "number" 
        && typeof object.Cards_on_table === "number"
        && typeof object.Current_card === "number"
        && typeof object.Played_card === "number"
        && Array.isArray(object.Players) && object.Players.every(isPlayer)
        && typeof object.Game_end === "boolean";

}   

export function isGameDTO(object : any) : object is GameDTO {
    return object !== undefined 
        && typeof object.Id === "number"
        && typeof object.Key === "number"
        && typeof object.Nb_players === "number"
        && Array.isArray(object.Players) && object.Players.every((el : any) => typeof el === "string");
}

export function isGameDTOArray(object : any) : object is Array<GameDTO> {
    return Array.isArray(object) && object.every(isGameDTO);
}