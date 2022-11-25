import { Injectable } from '@angular/core';
import { Observer, Observable, map} from 'rxjs';
import { AnonymousSubject, Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService { // WARNING! This service is very over-engineered and has been deprecated in favour os WsService

  static readonly serverUrl : string = "ws://localhost:8080/"

  private socket? : WebSocket 

  public messages? : Subject<string> // a subject is an event emitter and an observable at the same time
  // we can manually trigger the next funcion on it an we can subscribe to it multiple times
  // I feel it is kinda like the child of C#'s delegate and an observable

  connected : boolean = false

  error? : Error

  constructor() { }

  createSocket(path : string) : AnonymousSubject<MessageEvent>{
    
    this.socket = new WebSocket(path)

    this.socket.addEventListener("open", () => this.connected = true);

    const observable = new Observable((obs : Observer<MessageEvent>) =>{

      this.socket!!.onmessage = obs.next.bind(obs);
      this.socket!!.onerror = obs.error.bind(obs);
      this.socket!!.onclose = obs.complete.bind(obs);

      return this.socket!!.close.bind(this.socket!!); // this is the "TearDownLogic", the function to be called when the observable is destroyed

    });

    const observer = {

      next : (data : Object) => { //data is the data to be sent to the backend

        console.log("Received:", data)

        if (this.socket!!.readyState == WebSocket.OPEN){
          this.socket!!.send(JSON.stringify(data));
        }

      },

      error : (err : Error) => {

        console.error("Error",err );

      },


      complete : () => {

        this.connected = false;
        console.log("disconnected")

      }

    };


    // this.socket.addEventListener("open" , () => this.connected = true);

    // this.socket.addEventListener("close", () => this.connected = false);

    // this.socket.addEventListener("message",(ev : MessageEvent<any>) =>{
    //   this.message?.pipe(map((val : string) => ev.data))
    // } )

    // this.socket.addEventListener("error", (ev :Event ) => this.error = new Error("Websocket Error"));
    
    return new AnonymousSubject<MessageEvent>(observer, observable);

  }

  private createMessages(subject : AnonymousSubject<MessageEvent>) : Subject<string> {

    return <Subject<string>>subject.pipe(
      map((response : MessageEvent) : string => {

        console.log(response.data)

        return response.data;

      })
    );


  }

  joinGame(playerName : string , gameID : number){

    const path : string = WebsocketService.serverUrl + "join/" + playerName + "/" + gameID;

    this.messages = this.createMessages(this.createSocket(path));
    
  }

  createGame(playerName : string){
    
    const path : string = WebsocketService.serverUrl + "createGame/" + playerName;
    
    this.messages = this.createMessages(this.createSocket(path));

  } 
  

  send(message :  string) {

    this.socket?.send(message);

  }

  // one questions remains : was all of that reallly necessary??? Couldn't we just have used addEventListener??
  // Who knows...
}
