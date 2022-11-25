import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WsService {
  static readonly serverUrl : string = "ws://localhost:8080/"

  private socket? : WebSocket 

  private debugPrintListener  = (message_evt : MessageEvent) => console.log("websocket debug print :",message_evt.data)

  connected : boolean = false

  error? : Error

  constructor() { }

  createSocket(path : string){
    
    this.socket = new WebSocket(path)

    this.socket.addEventListener("open" , () => this.connected = true);
    
    this.socket.addEventListener("close", () => {
      this.connected = false;
      if (this.socket !== undefined && this.socket.removeAllListeners !== undefined) this.socket.removeAllListeners("message");
    });

    this.socket.addEventListener("message", this.debugPrintListener)

    this.socket.addEventListener("error", (ev :Event ) => this.error = new Error("Websocket Error"));
    
  }



  joinGame(playerName : string , gameID : number){

    const path : string = WsService.serverUrl + "join/" + playerName + "/" + gameID;
    this.createSocket(path);
    
  }

  createGame(playerName : string){
    
    const path : string = WsService.serverUrl + "createGame/" + playerName;
    
    this.createSocket(path);

  } 
  

  send(message :  string) {

    this.socket?.send(message);

  }

  subscribe( func : (data : string) => void, capturing : boolean = false ) : EventListener {

    const listener = (ev : MessageEvent) => func(ev.data);
    listener
    this.socket?.addEventListener("message",listener , capturing)
    return listener as EventListener
  }

  subscribeOnce(func : (data : string) => void) : void {

    this.socket?.addEventListener("message", ((ev : MessageEvent) =>func(ev.data)) , {once: true})

    console.log(this.socket?.eventListeners?.call("message"))
  }

  unsubscribe(listener : EventListener, capturing : boolean){
    removeEventListener("message", listener, capturing)
  }

  // one questions remains : was all of that reallly necessary??? Couldn't we just have used addEventListener??
  // Who knows...
}
