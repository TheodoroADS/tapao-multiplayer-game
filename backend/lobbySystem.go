package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var (
	MakeGame func() *Game = GameMaker()

	PutPlayer, _ = PlayersGames()

	gamePool = MakeGamePool()

	wsUpgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
)

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func newGame(first_player Player) (*Game, error) {

	game := MakeGame()

	fmt.Println(first_player)

	game.addPlayer(first_player)

	err := gamePool.addGame(game)

	fmt.Println("GamePool :", gamePool.Games)

	if err != nil {
		return nil, err
	}

	PutPlayer(&first_player, game)
	fmt.Println("Game :", game)

	return game, nil

}

func registerPlayer(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {

	wsUpgrader.CheckOrigin = func(r *http.Request) bool { return true } //for getting rid of CORS verification

	wsConn, err := wsUpgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println("Could not upgrade")
		return nil, err
	}

	return wsConn, nil

}

func createGame(w http.ResponseWriter, r *http.Request) {

	fmt.Println("iojsdjkoc sdkoc d")

	if r.Method != "GET" {

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)

	name, present := vars["playerName"]

	if !present {
		http.Error(w, "Bad request path: player name expected", http.StatusBadRequest)
		log.Println("Bad url", r.URL)
		return
	}

	player := new(Player)

	player.Name = name

	wsConn, wsErr := registerPlayer(w, r)

	if wsErr != nil {

		http.Error(w, "Could not upgrade connection", http.StatusFailedDependency)
		log.Println("Socket Upgrade failed")
		return
	}

	player.Conn = wsConn

	game, err := newGame(*player)

	if err != nil {

		log.Println("Could not create new game", err)
		http.Error(w, "Could not create :"+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	wsConn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("{\"Id\" : %v , \"Key\" : %v}", game.id, game.key)))

}

func getCurrentActiveGames(w http.ResponseWriter, r *http.Request) {

	if r.Method != "GET" {

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	encoder := json.NewEncoder(w)

	for _, game := range gamePool.activeGames() {
		encoder.Encode(game.DTO())
	}

}

func getLobbyGames(w http.ResponseWriter, r *http.Request) {

	if r.Method != "GET" {

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return

	}

	enableCors(&w)

	encoder := json.NewEncoder(w)

	encoder.Encode(gamePool.lobbyGames())

}

func joinGame(w http.ResponseWriter, r *http.Request) {

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)

	name, namePresent := vars["playerName"]

	if !namePresent {
		http.Error(w, "Bad request path: player name expected", http.StatusBadRequest)
		return
	}

	gameIDstr, gameIDPresent := vars["gameID"]

	if !gameIDPresent {

		http.Error(w, "Bad request path: game id expected", http.StatusBadRequest)
		log.Println("Bad request path: game id expected")
		return
	}

	gameID, strconvErr := strconv.ParseUint(gameIDstr, 10, 32)

	if strconvErr != nil {

		http.Error(w, "Bad request path: game id is not a number", http.StatusBadRequest)
		log.Println("Bad request path: game id is not a number")
		return
	}

	if uint32(gameID) >= uint32(gamePool.Nb_games) {
		log.Println("Invalid game access")
		http.Error(w, "Game does not exist", http.StatusNotFound)
		return
	}

	game := gamePool.get(uint32(gameID))

	if game.status != Lobby || game.isFull() {

		log.Println("Tried to access a full or already matching game")
		http.Error(w, "The game is either full or already in match", http.StatusConflict)
		return

	}

	concrete_player := new(Player)
	concrete_player.Name = name

	wsConn, wserr := registerPlayer(w, r)

	if wserr != nil {

		http.Error(w, "Could not upgrade connection", http.StatusFailedDependency)
		return
	}

	concrete_player.Conn = wsConn

	game.addPlayer(*concrete_player)

	wsConn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("{\"Id\" : %v , \"Key\" : %v}", game.id, game.key)))

	playerLobbyList, marshallerr := json.Marshal(game.playerLobbyDTOs())

	w.WriteHeader(http.StatusOK)

	if marshallerr != nil {

		log.Println("Error marshalling players in lobby list", marshallerr.Error())

	} else {

		broadCast(game.activePlayers(), websocket.TextMessage, string(playerLobbyList))
		log.Println(string(playerLobbyList))

	}

}
