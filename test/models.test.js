import { suits, values, options } from '../src/js/enums.js';
import { Card, Shoe, calculateHandValue, basicStrategy, shouldSplit, softDecision, hardDecision } from '../src/js/models.js';

describe('Card class tests', () => {
    test('getValue should return face value for number cards', () => {
        const card1 = new Card(values.EIGHT, suits.SPADES);
        expect(card1.getValue()).toBe(8);

        const card2 = new Card(values.TWO, suits.SPADES);
        expect(card2.getValue()).toBe(2);
    });

    test('getValue should return 11 for Ace', () => {
        const ace = new Card(values.ACE, suits.HEARTS);
        expect(ace.getValue()).toBe(11);
    });

    test('getValue should return 10 for face cards', () => {
        const king = new Card(values.KING, suits.DIAMONDS);
        expect(king.getValue()).toBe(10);
    });
});

describe('Shoe class tests', () => {
    test('Empty shoe should return null when drawn from', () => {
        const shoe = new Shoe(0);
        expect(shoe.remainingCards()).toBe(0);
        expect(shoe.drawCard()).toBe(null);
    });

    test('Drawing cards from a 6 deck Shoe', () => {
        const shoe = new Shoe(6);
        expect(shoe.remainingCards()).toBe(312);
        shoe.drawCard();
        expect(shoe.remainingCards()).toBe(311);
        for (let i = 0; i < 5; i++) {
            shoe.drawCard();
        }
        expect(shoe.remainingCards()).toBe(306);
    });
});

describe('calculateHandValue function tests', () => {
    test('Hard total for a hand with no Aces', () => {
        const hand = [new Card(values.TEN, suits.CLUBS), new Card(values.SEVEN, suits.HEARTS)];
        const result = calculateHandValue(hand);
        expect(result.totalValue).toBe(17);
        expect(result.isSoft).toBe(false);
    });

    test('Soft total for a hand with Aces', () => {
        const hand = [new Card(values.ACE, suits.CLUBS), new Card(values.SIX, suits.HEARTS), new Card(values.TWO, suits.SPADES)];
        const result = calculateHandValue(hand);
        expect(result.totalValue).toBe(19);
        expect(result.isSoft).toBe(true);
    });

    test('Hard total for hands WITH Aces', () => {
        const hand1 = [new Card(values.ACE, suits.CLUBS), new Card(values.NINE, suits.HEARTS), new Card(values.THREE, suits.SPADES)];
        const result1 = calculateHandValue(hand1);
        expect(result1.totalValue).toBe(13);
        expect(result1.isSoft).toBe(false);

        const hand2 = [new Card(values.ACE, suits.CLUBS), new Card(values.ACE, suits.HEARTS), new Card(values.JACK, suits.DIAMONDS)];
        const result2 = calculateHandValue(hand2);
        expect(result2.totalValue).toBe(12);
        expect(result2.isSoft).toBe(false);
    });

    test('Soft total for hands with multiple Aces', () => {
        const hand1 = [new Card(values.ACE, suits.CLUBS), new Card(values.ACE, suits.HEARTS), new Card(values.SEVEN, suits.DIAMONDS)];
        const result1 = calculateHandValue(hand1);
        expect(result1.totalValue).toBe(19);
        expect(result1.isSoft).toBe(true);

        const hand2 = [new Card(values.ACE, suits.CLUBS), new Card(values.ACE, suits.HEARTS), new Card(values.ACE, suits.DIAMONDS)];
        const result2 = calculateHandValue(hand2);
        expect(result2.totalValue).toBe(13);
        expect(result2.isSoft).toBe(true);
    });
});

describe('shouldSplit function tests', () => {
    test('Always split As and 8s', () => {
        expect(shouldSplit(11, 10)).toBe(true);
        expect(shouldSplit(11, 11)).toBe(true);
        expect(shouldSplit(8, 11)).toBe(true);
        expect(shouldSplit(8, 10)).toBe(true);
    });

    test('Never split 5s', () => {
        expect(shouldSplit(5, 10)).toBe(false);
    });

    test('Split 9s vs dealer 8', () => {
        expect(shouldSplit(9, 8)).toBe(true);
    });

    test('Do not split 9s vs dealer 7', () => {
        expect(shouldSplit(9, 7)).toBe(false);
    });

    test('Split 4s vs dealer 5 if DAS', () => {
        expect(shouldSplit(4, 5)).toBe(true);
        expect(shouldSplit(4, 5, false)).toBe(false);
    });

    test('Split 2s vs dealer 3 if DAS', () => {
        expect(shouldSplit(2, 3)).toBe(true);
        expect(shouldSplit(2, 3, false)).toBe(false);
    });
});

describe('softDecision function tests', () => {
    test('Soft 18 Tests', () => {
        const hand1 = [new Card(values.ACE, suits.HEARTS), new Card(values.SEVEN, suits.CLUBS)];
        const dealerValue1 = 9;
        expect(softDecision(hand1, dealerValue1)).toBe(options.HIT);

        const hand2 = [new Card(values.ACE, suits.HEARTS), new Card(values.SEVEN, suits.CLUBS)];
        const dealerValue2 = 6;
        expect(softDecision(hand2, dealerValue2)).toBe(options.DOUBLE);

        const hand3 = [new Card(values.ACE, suits.HEARTS), new Card(values.SEVEN, suits.CLUBS)];
        const dealerValue3 = 8;
        expect(softDecision(hand3, dealerValue3)).toBe(options.STAND);

        const hand4 = [new Card(values.ACE, suits.HEARTS), new Card(values.FIVE, suits.CLUBS), new Card(values.TWO, suits.CLUBS)];
        const dealerValue4 = 4;
        expect(softDecision(hand4, dealerValue4)).toBe(options.STAND);
    });

    test('Soft 15 Tests', () => {
        const hand1 = [new Card(values.ACE, suits.HEARTS), new Card(values.FOUR, suits.CLUBS)];
        const dealerValue1 = 4;
        expect(softDecision(hand1, dealerValue1)).toBe(options.DOUBLE);

        const hand2 = [new Card(values.ACE, suits.HEARTS), new Card(values.THREE, suits.CLUBS), new Card(values.ACE, suits.CLUBS)];
        const dealerValue2 = 4;
        expect(softDecision(hand2, dealerValue2)).toBe(options.HIT);
    });
});

describe('hardDecision function tests', () => {
    test('Always Stand on hard 17', () => {
        const hand1 = [new Card(10, suits.HEARTS), new Card(7, suits.CLUBS)];
        const dealerValue1 = 11;
        expect(hardDecision(hand1, dealerValue1)).toBe(options.STAND);

        const hand2 = [new Card(values.NINE, suits.HEARTS), new Card(values.EIGHT, suits.CLUBS)];
        const dealerValue2 = 10;
        expect(hardDecision(hand2, dealerValue2)).toBe(options.STAND);
    });

    test('12 Hits vs dealer 2', () => {
        const hand = [new Card(10, suits.HEARTS), new Card(2, suits.CLUBS)];
        const dealerValue = 2;
        expect(hardDecision(hand, dealerValue)).toBe(options.HIT);
    });

    test('10 Doubles vs dealer 6 on first 2 cards only', () => {
        const hand1 = [new Card(values.EIGHT, suits.HEARTS), new Card(values.TWO, suits.CLUBS)];
        const dealerValue1 = 6;
        expect(hardDecision(hand1, dealerValue1)).toBe(options.DOUBLE);

        const hand2 = [new Card(values.SIX, suits.HEARTS), new Card(values.TWO, suits.CLUBS), new Card(values.TWO, suits.SPADES)];
        const dealerValue2 = 6;
        expect(hardDecision(hand2, dealerValue2)).toBe(options.HIT);
    });

    test('16 Surrenders vs dealer 10 on first 2 cards, else Hits', () => {
        const hand1 = [new Card(values.NINE, suits.HEARTS), new Card(values.SEVEN, suits.CLUBS)];
        const dealerValue1 = 10;
        expect(hardDecision(hand1, dealerValue1)).toBe(options.SURRENDER);

        const hand2 = [new Card(values.SIX, suits.HEARTS), new Card(values.TWO, suits.CLUBS), new Card(values.EIGHT, suits.SPADES)];
        const dealerValue2 = 10;
        expect(hardDecision(hand2, dealerValue2)).toBe(options.HIT);
    });
});

describe('Basic Strategy tests', () => {
    test('8s Split vs dealer 10', () => {
        const playerHand = [new Card(8, suits.CLUBS), new Card(8, suits.HEARTS)];
        const dealerCard = new Card(10, suits.SPADES);
        expect(basicStrategy(playerHand, dealerCard)).toBe(options.SPLIT);
    });
});
