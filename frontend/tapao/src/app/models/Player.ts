export type Player = {

    name : string,
    number_cards : number

}

export enum PlayerLobbyStatus {
    READY,
     NOT_READY
} 

export type PlayerLobby = {

    Name : string,
    Status : PlayerLobbyStatus

}

export function isPlayer(object : any ) : object is Player {
    return object !== undefined && typeof object.name === "string" && typeof object.number_cards === "number";
}

export function isPlayerLobby(object : any) : object is PlayerLobby{
    return object !== undefined && typeof object.Name === "string" && (object.Status === PlayerLobbyStatus.READY || object.Status === PlayerLobbyStatus.NOT_READY);
}

export function isPlayerLobbyArray(object : any) : object is PlayerLobby[] {
    return Array.isArray(object) && object.every(isPlayerLobby);
}