package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type GameStartToken struct {
	Id  uint32
	Key uint32
}

type GameMove struct {
	Tapao bool
}

type GameUpdate struct {
	Turn           string
	Cards_on_table uint
	Current_card   Card
	Played_card    Card
	Players        []PlayerDTO
	Game_end       bool
}

func broadCast(players []Player, messageType int, message string) {

	for _, player := range players {

		err := player.Conn.WriteMessage(messageType, []byte(message))

		if err != nil {
			log.Println("Websocket error", err)
		}

	}

}

func startGame(w http.ResponseWriter, r *http.Request) {

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	decoder := json.NewDecoder(r.Body)

	var token GameStartToken

	if err := decoder.Decode(&token); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return

	}

	if token.Id >= gamePool.Nb_games {
		http.Error(w, "Invalid Game", http.StatusBadRequest)
		return
	}

	game := gamePool.get(token.Id)

	if game.status != Lobby {

		http.Error(w, "Game is already started", http.StatusForbidden)
		return
	}

	if game.key != token.Key {

		http.Error(w, "Authentification failed", http.StatusForbidden)
		return
	}

	game.status = Match

	broadCast(game.players[:game.nb_players], websocket.TextMessage, "Game Start")

	go match(game)

}

func communicate(ws *websocket.Conn, c chan struct {
	GameMove
	uint
}, who uint) {

	for {

		var move GameMove

		err := ws.ReadJSON(&move)

		if err != nil {

			log.Println("Communication error :", err)
			close(c)
			return

		}

		log.Println("Player", who, "says", move)

		c <- struct {
			GameMove
			uint
		}{move, who}

	}

}

func match(game *Game) {

	game.Turn = 0

	game.Current_card = As

	channel := make(chan struct {
		GameMove
		uint
	})

	var i uint
	for i = 0; i < game.nb_players; i++ {

		game.players[i].Nb_cards = uint(total_cards / game.nb_players)
		go communicate(game.players[i].Conn, channel, i)

	}

	// var state MatchState = Counting

	for game.status != Finished {

		gameUpdate, matchState := game.update()

		marshalledUpdate, marshallErr := json.Marshal(gameUpdate)

		if marshallErr != nil {
			log.Println("Logging error", marshallErr)
			broadCast(game.activePlayers(), websocket.TextMessage, "Error"+marshallErr.Error())
			continue
		}

		broadCast(game.activePlayers(), websocket.TextMessage, string(marshalledUpdate))

		switch matchState {

		case Counting:

			for {

				message := <-channel

				if message.GameMove.Tapao {
					game.loseRound(message.uint)
					break

				} else if message.uint == game.Turn {

					game.updateTurn()
					break

				}

			}

		case TapaoEvent:

			loser := game.tapao(channel)

			game.loseRound(loser)

			matchState = Counting

		}

	}
}
