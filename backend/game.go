package main

import (
	"errors"
	"fmt"
	"math/rand"
)

const max_players = 5
const max_games = 4
const total_cards = 52

type GameStatus uint8

const (
	Lobby GameStatus = iota
	Match
	Finished
)

type MatchState uint8

const (
	Counting MatchState = iota
	TapaoEvent
	End
)

type Game struct {
	id             uint32
	key            uint32
	players        [max_players]Player
	nb_players     uint
	status         GameStatus
	Cards_on_table uint
	Current_card   Card
	Next_card      Card
	Turn           uint
}

type GameDTO struct {
	Id         uint32
	Key        uint32
	Nb_players uint
	Players    []string
}

type GamePool struct {
	Games    [max_games]*Game
	Nb_games uint32
}

func (game Game) DTO() GameDTO {

	player_names := make([]string, game.nb_players)

	for i, player := range game.activePlayers() {
		player_names[i] = player.Name
	}

	return GameDTO{game.id, game.key, game.nb_players, player_names}

}

func MakeGamePool() GamePool {

	var gamePool GamePool

	gamePool.Nb_games = 0

	return gamePool

}

func GameMaker() func() *Game {

	var id uint32 = 0

	return func() *Game {

		game := new(Game)
		game.id = id
		id += 1
		game.key = rand.Uint32()
		game.nb_players = 0
		game.status = Lobby
		return game
	}

}

func (gamepool *GamePool) addGame(game *Game) error { // add game

	if gamepool.Nb_games >= max_games {
		return errors.New("Game pool already full")
	}

	gamepool.Games[gamepool.Nb_games] = game
	gamepool.Nb_games += 1

	return nil

}

func (gamepool GamePool) get(i uint32) *Game {

	return gamepool.Games[i]

}

func (gamepool *GamePool) lobbyGames() []GameDTO {

	lobby_games := make([]GameDTO, gamepool.Nb_games)

	for idx, g := range gamepool.Games[:gamePool.Nb_games] {

		if g.status == Lobby {

			lobby_games[idx] = g.DTO()

		}

	}

	return lobby_games

}

func (gamepool *GamePool) activeGames() []*Game {

	activeGames := make([]*Game, 0, gamepool.Nb_games)

	for _, g := range gamepool.Games[:gamePool.Nb_games] {

		if g.status == Match {
			activeGames = append(activeGames, g)
		}
	}

	return activeGames
}

func (game Game) isFull() bool {
	return game.nb_players >= max_players
}

func (game *Game) addPlayer(player Player) error {

	if game.isFull() {
		return errors.New("Game already full")
	}

	game.players[game.nb_players] = player
	game.nb_players += 1

	fmt.Println(game.players)

	return nil

}

func (game Game) activePlayers() []Player {
	return game.players[:game.nb_players]
}

func (game *Game) currentPlayer() *Player {
	return &game.players[game.Turn]
}

func (game *Game) playerLobbyDTOs() []PlayerLobbyDTO {
	players := make([]PlayerLobbyDTO, game.nb_players)

	for idx, player := range game.activePlayers() {
		players[idx] = player.playerLobbyDTO(READY)
	}

	return players
}

func (game *Game) distribute() {

	var i uint
	for i = 0; i < game.nb_players; i++ {
		game.players[i].Nb_cards = uint(game.Cards_on_table / game.nb_players)
	}

}

func (game *Game) updateTurn() {

	var visited uint = 0
	turn := game.Turn

	for visited != game.nb_players {

		game.Turn = (game.Turn + 1) % game.nb_players
		visited++

		if game.currentPlayer().Nb_cards > 0 {
			return
		}

	}

	game.distribute()
	game.Turn = (turn + 1) % game.nb_players

}

func (game *Game) update() (GameUpdate, MatchState) {

	game.Current_card = (game.Current_card + 1) % (King + 1)
	game.Next_card = randomCard()
	game.Cards_on_table++

	var state MatchState

	if game.Current_card == game.Next_card {
		state = Counting
	} else {
		state = TapaoEvent
	}

	if game.currentPlayer().Nb_cards > 0 {
		game.currentPlayer().Nb_cards--
	}

	return GameUpdate{
		game.currentPlayer().Name,
		game.Cards_on_table,
		game.Current_card,
		game.Next_card,
		playerDTOs(game.activePlayers()),
		false}, state

}

func (game *Game) tapao(channel chan struct {
	GameMove
	uint
}) uint {

	var tapao_num uint = 0
	tapoes := make([]bool, game.nb_players)
	var last uint

	for tapao_num < game.nb_players {

		message := <-channel

		if message.GameMove.Tapao {

			player := message.uint

			if !tapoes[player] {
				tapoes[player] = true
				tapao_num++
				last = player
			}

		}

	}

	return last

}

func (game *Game) loseRound(loser_idx uint) {

	if loser_idx >= game.nb_players {
		panic("Holy shit")
	}

	loser := game.players[loser_idx]

	loser.Nb_cards += game.Cards_on_table
	game.Cards_on_table = 0

	game.Turn = loser_idx

}
