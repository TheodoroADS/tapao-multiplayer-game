package main

import (
	"math/rand"
)

type Card int

const (
	As Card = iota
	Two
	Three
	Four
	Five
	Six
	Seven
	Eight
	Nine
	Ten
	Jockey
	Queen
	King
)

/*
func (c Card) toString() string {
	switch c {
	case As:
		return "As"
	case Two:
		return "Two"
	case Three:
		return "Three"
	case Four:
		return "Four"
	case Five:
		return "Five"
	case Six:
		return "Six"
	case Seven:
		return "Seven"
	case Eight:
		return "Eight"
	case Nine:
		return "Nine"
	case Ten:
		return "Ten"
	case Jockey:
		return "Jockey"
	case Queen:
		return "Queen"
	case King:
		return "King"
	default:
		return "wtf"
	}

}
*/

func randomCard() Card {
	return Card(rand.Intn(int(King) + 1))
}
