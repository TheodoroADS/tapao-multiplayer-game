package main

import (
	"github.com/gorilla/websocket"
)

type Player struct {
	Name     string
	Conn     *websocket.Conn
	Nb_cards uint
}

type PlayerLobbyStatus uint8

const (
	READY PlayerLobbyStatus = iota
	NOT_READY
)

type PlayerLobbyDTO struct {
	Name   string
	Status PlayerLobbyStatus
}

type PlayerDTO struct {
	Name     string
	Nb_cards uint
}

// func (player Player) joiningDTO(joining uint32) PlayerJoiningDTO {
// 	return PlayerJoiningDTO{player.Name, joining}
// }

func (player Player) DTO() PlayerDTO {
	return PlayerDTO{player.Name, player.Nb_cards}
}

func playerDTOs(players []Player) []PlayerDTO {

	dtos := make([]PlayerDTO, len(players))

	for i := range players {
		dtos[i] = players[i].DTO()
	}

	return dtos
}

func PlayersGames() (func(player *Player, game *Game), func(player *Player) *Game) {

	playersGames := map[*Player]*Game{}

	return func(player *Player, game *Game) {

			playersGames[player] = game

		},

		func(player *Player) *Game {

			return playersGames[player]

		}

}

func (player Player) playerLobbyDTO(status PlayerLobbyStatus) PlayerLobbyDTO {
	return PlayerLobbyDTO{player.Name, status}
}
