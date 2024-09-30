import { suits, values, options } from './enums.js';

export class Card {
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
    }

    getValue() {
        if (typeof this.rank === 'number') {
            return this.rank;
        }
        if (this.rank === values.ACE) {
            return 11;
        }
        if (this.rank === values.JACK || this.rank === values.QUEEN || this.rank === values.KING) {
            return 10;
        }

        return 0; // Indicates an invalid rank
    }
}

export class Shoe {
    constructor(numDecks) {
        this.numDecks = numDecks;
        this.cards = this.createShoe();
        this.shuffle();
    }

    createDeck() {
        const deck = [];
        for (const suit of Object.values(suits)) {
            for (const value of Object.values(values)) {
                deck.push(new Card(value, suit));
            }
        }
        return deck;
    }

    createShoe() {
        const shoe = [];
        for (let i = 0; i < this.numDecks; i++) {
            shoe.push(...this.createDeck());
        }
        return shoe;
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]; // Swap cards
        }
    }

    drawCard() {
        if (this.remainingCards() == 0) {
            return null;
        }
        return this.cards.pop();
    }

    remainingCards() {
        return this.cards.length;
    }

    reset() {
        this.cards = this.createShoe();
        this.shuffle();
    }
}

export function calculateHandValue(hand) {
    let totalValue = 0;
    let aceCount = 0;
    let isSoft = false;

    for (const card of hand) {
        totalValue += card.getValue();
        
        if (card.rank === values.ACE) {
            aceCount++;
        }
    }

    // Adjust for Aces if totalValue exceeds 21
    while (totalValue > 21 && aceCount > 0) {
        totalValue -= 10; // Count an Ace as 1 instead of 11
        aceCount--;
    }

    // A hand is soft if there's at least one Ace that is being counted as 11
    if (aceCount > 0 && totalValue <= 21) {
        isSoft = true;
    }

    return {
        totalValue: totalValue,
        isSoft: isSoft
    };
}

/**
 * This function should only be called on a pair of player cards of the same value.
 *
 * @param playerCardValue - Value of the player's pair of cards
 * @param dealerValue - Value of the dealer card
 * @param DAS - Boolean representing whether Double after split is allowed.
 */
export function shouldSplit(playerCardValue, dealerValue, DAS=true) {

    // Always split Aces and Eights
    if (playerCardValue == 11 || playerCardValue == 8) {
        return true;
    }
    // Never split Tens (in BS) or Fives
    if (playerCardValue == 10 || playerCardValue == 5) {
        return false;
    } 
    if (playerCardValue == 9) {
        if (dealerValue <= 9 && dealerValue != 7) {
            return true;
        }
    }
    if (playerCardValue == 7) {
        if (dealerValue <= 7) {
            return true;
        }
    } 
    if (playerCardValue == 6) {
        if (dealerValue == 2 && DAS) {
            return true;
        }
        if (dealerValue >= 3 && dealerValue <= 6) {
            return true;
        }
    } 
    if (playerCardValue == 4) {
        if (dealerValue == 5 || dealerValue == 6) {
            if (DAS) {
                return true;
            }
        }
    } 
    if (playerCardValue == 2 || playerCardValue == 3) {
        if (dealerValue >= 4 && dealerValue <= 7) {
            return true;
        }
        if (dealerValue == 2 || dealerValue == 3) {
            if (DAS) {
                return true;
            }
        }
    } 
    return false;
}

/**
 * This function returns a player decision for a hand with a soft total.
 * Works with any number of player cards. 
 *
 * @param playerHand - Array of player cards
 * @param dealerValue - Value of the dealer card
 */
export function softDecision(playerHand, dealerValue) {
    
    let playerValue = calculateHandValue(playerHand)['totalValue'];

    if (playerValue == 20) {
        return options.STAND;
    } 

    // Double only possible on first two cards
    if (playerHand.length == 2) {
        if (dealerValue == 6) {
            return options.DOUBLE;
        } 
        if (dealerValue == 5 && playerValue <= 18) {
            return options.DOUBLE;
        }
        if (dealerValue == 4 && playerValue <= 18 && playerValue >= 15) {
            return options.DOUBLE;
        }
        if (dealerValue == 3 && playerValue <= 18 && playerValue >= 17) {
            return options.DOUBLE;
        } 
        if (dealerValue == 2 && playerValue == 18) {
            return options.DOUBLE;
        } 
    }

    if (playerValue == 19) {
        return options.STAND;
    } 
    if (playerValue == 18 && dealerValue <= 8) {
        return options.STAND;
    } 

    // Hit by default (all Double and Stand cases exhausted)
    return options.HIT;

}

/**
 * This function returns a player decision based solely on the hard total.
 * Works with any number of player cards. 
 * Does not account for splits or soft totals etc
 *
 * @param playerHand - Array of player cards
 * @param dealerValue - Value of the dealer card
 */
export function hardDecision(playerHand, dealerValue) {

    let playerValue = calculateHandValue(playerHand)['totalValue'];

    if (playerValue >= 17) {
        return options.STAND;
    } 

    // Surrender and Double only possible on first two cards
    if (playerHand.length == 2) {
        if (playerValue == 16) {
            if (dealerValue == 9 || dealerValue == 10 || dealerValue == 11) {
                return options.SURRENDER;
            }
        }
        if (playerValue == 15 && dealerValue == 10) {
            return options.SURRENDER;
        }
        if (playerValue == 11) {
            return options.DOUBLE;
        } 
        if (playerValue == 10) {
            if (dealerValue < 10) {
                return options.DOUBLE;
            }
        }
        if (playerValue == 9) {
            if (dealerValue >= 3 && dealerValue <= 6) {
                return options.DOUBLE;
            }
        } 
    }

    if (dealerValue <= 6) {
        if (playerValue >= 12) {
            if (playerValue == 12 && (dealerValue == 2 || dealerValue == 3)) {
                return options.HIT;
            }
            return options.STAND;
        }
    }

    // Hit by default if no conditions are met
    return options.HIT;
}

/* 
 * Order of Operations:
 * 1. Split
 * 2. Surrender / Double
 */
export function basicStrategy(playerHand, dealerCard) {

    let handDetails = calculateHandValue(playerHand);
    
    if (handDetails['totalValue'] == 21) {
        return options.STAND;
    } 

    // Check for split if player hand is paired
    if (playerHand.length == 2 && playerHand[0].getValue() == playerHand[1].getValue()) {
        if (shouldSplit(playerHand[0].getValue(), dealerCard.getValue())) {
            return options.SPLIT;
        }
    }

    if (handDetails['isSoft']) {
        return softDecision(playerHand, dealerCard.getValue());
    }
    else {
        return hardDecision(playerHand, dealerCard.getValue());
    }
}

