package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

const PORT = 8080

func main() {

	router := mux.NewRouter()

	router.HandleFunc("/createGame/{playerName}", createGame)
	router.HandleFunc("/lobbyGames", getLobbyGames)
	router.HandleFunc("/activeGames", getCurrentActiveGames)
	router.HandleFunc("/join/{playerName}/{gameID:[0-9]+}", joinGame)
	router.HandleFunc("/start", startGame)

	fmt.Println("Listening on port : " + fmt.Sprint(PORT))
	log.Fatal(http.ListenAndServe(":"+fmt.Sprint(PORT), router))

}
