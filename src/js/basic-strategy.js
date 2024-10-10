import { suits, values, options } from './enums.js';
import { Card, calculateHandValue, basicStrategy} from './models.js';

document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------
        Page Elements
    ----------------------------------------- */

    // Decision buttons
    const hitButton = document.getElementById('hit');
    const standButton = document.getElementById('stand');
    const doubleButton = document.getElementById('double');
    const splitButton = document.getElementById('split');
    const surrenderButton = document.getElementById('surrender');

    // Scoreboard elements
    const accuracyDisplay = document.getElementById('accuracy');
    const handsDisplay = document.getElementById('hands');

    // Feedback elements
    const feedback = document.getElementById('feedback');
    const wrongChoice = document.getElementById('wrong-choice');
    const cardsRecap = document.getElementById('cards-recap');
    const correctChoice = document.getElementById('correct-choice');
    const dismissButton = document.getElementById('dismiss');

    // Global variables
    let correctAnswers = 0;
    let totalHands = 0;
    let playerHand;
    let dealerCard;

    /* -----------------------------------------
        Manipulate Page Elements
    ----------------------------------------- */

    function showFeedback() {
        feedback.style.display = "block";
    }

    function hideFeedback() {
        feedback.style.display = "none";
    }

    const buttons = document.querySelectorAll('button');

    function disableButtons(disable) {
        buttons.forEach(button => {
            if (button !== dismissButton) {
                button.disabled = disable;
            }
        });
    }

    /* -----------------------------------------
        Dealing Functions
    ----------------------------------------- */
    function getCardImagePath(card) {
        const rank = card.rank.toString().toLowerCase();
        const suit = card.suit.toLowerCase();
        return `assets/cards/${rank}_of_${suit}.png`;
    }

    function dealCards() {
        const playerSection = document.getElementById('player');
        const dealerSection = document.getElementById('dealer');
    
        // Clear previous cards
        playerSection.innerHTML = '';
        dealerSection.innerHTML = '';
    
        // Loop through player's hand and create card images
        playerHand.forEach((card, index) => {
            const cardImg = document.createElement('img');
            cardImg.classList.add('card');
            cardImg.src = getCardImagePath(card);
            cardImg.alt = `Card rank ${card.rank}`;
            cardImg.id = `player-card-${index + 1}`;
    
            // Add card initially from the side
            cardImg.style.transform = 'translate(300px, -200px)'; // Initial off-screen position
            playerSection.appendChild(cardImg);
    
            // Apply animation with a delay for each card
            setTimeout(() => {
                const translateX = index * 22;
                const translateY = index * -22;
                cardImg.style.transform = `translate(${translateX}px, ${translateY}px)`; // Final position
            }, index * 150);
        });
    
        // Deal the dealer's card
        const dealerCardImg = document.createElement('img');
        dealerCardImg.classList.add('card');
        dealerCardImg.src = getCardImagePath(dealerCard);
        dealerCardImg.alt = 'Dealer Card';
        dealerCardImg.id = 'dealer-card-up';

        // Add card initially from the side
        dealerCardImg.style.transform = 'translate(300px, 200px)';
        dealerSection.appendChild(dealerCardImg);

        // Animate the dealer's card
        setTimeout(() => {
            dealerCardImg.style.transform = 'translate(0, 0)'; // Final position
        }, 0);
    }

    /* -----------------------------------------
        Card Generation Utility Functions
    ----------------------------------------- */
    function getRandomCard() {
        const suit = suits[Object.keys(suits)[Math.floor(Math.random() * 4)]];
        const value = values[Object.keys(values)[Math.floor(Math.random() * 13)]];
        return new Card(value, suit);
    }
    
    function getRandomPair() {
        const value = values[Object.keys(values)[Math.floor(Math.random() * 13)]];
        const suit1 = suits[Object.keys(suits)[Math.floor(Math.random() * 4)]];
        const suit2 = suits[Object.keys(suits)[Math.floor(Math.random() * 4)]];
        return [new Card(value, suit1), new Card(value, suit2)];
    }

    function getRandomSoft() {
        const suit1 = suits[Object.keys(suits)[Math.floor(Math.random() * 4)]];
        const suit2 = suits[Object.keys(suits)[Math.floor(Math.random() * 4)]];
    
        // Get all values except Ace
        const nonAceValues = Object.keys(values).filter(value => value !== values.ACE);
    
        // One card is guaranteed to be an Ace
        const aceValue = values.ACE;
        const nonAceValue = values[nonAceValues[Math.floor(Math.random() * nonAceValues.length)]];
    
        // Randomly decide whether the Ace will be the first or second card
        const isFirstCardAce = Math.random() < 0.5;
    
        const card1 = isFirstCardAce ? new Card(aceValue, suit1) : new Card(nonAceValue, suit1);
        const card2 = isFirstCardAce ? new Card(nonAceValue, suit2) : new Card(aceValue, suit2);
    
        return [card1, card2]; // Return both cards
    }
    
    function getRandomHard() {
        const suit1 = suits[Object.keys(suits)[Math.floor(Math.random() * 4)]];
        const suit2 = suits[Object.keys(suits)[Math.floor(Math.random() * 4)]];
    
        // Get all values except Ace
        const nonAceValues = Object.keys(values).filter(value => value != 'ACE');
    
        // Randomly select two values that are not Aces
        const value1 = values[nonAceValues[Math.floor(Math.random() * nonAceValues.length)]];
        const value2 = values[nonAceValues[Math.floor(Math.random() * nonAceValues.length)]];
    
        const card1 = new Card(value1, suit1);
        const card2 = new Card(value2, suit2);
    
        return [card1, card2];
    }
    
    /* -----------------------------------------
        Game Control Flow
    ----------------------------------------- */
    function updateScoreboard() {
        const accuracy = totalHands === 0 ? 0 : Math.round((correctAnswers / totalHands) * 100);
        accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
        handsDisplay.textContent = `${correctAnswers} of ${totalHands} hands`;
    }

    function resetScoreboard() {
        correctAnswers = 0;
        totalHands = 0;
        updateScoreboard();
    }

    function startGame() {
        resetScoreboard();
        deal();
    }

    function deal() {
        const selectedRadio = document.querySelector('input[name="group1"]:checked');

        if (selectedRadio.value == 'hard') {
            playerHand = getRandomHard();
        }
        else if (selectedRadio.value == 'pairs') {
            playerHand = getRandomPair();
        }
        else if (selectedRadio.value == 'soft') {
            playerHand = getRandomSoft();
        } 
        else if (selectedRadio.value == 'softpairs') {
            if (Math.random() < 0.5) {
                playerHand = getRandomPair();
            } else {
                playerHand = getRandomSoft();
            }
        }
        else { // "All" option
            playerHand = [getRandomCard(), getRandomCard()];
        }

        // Calculate player hand value to reuse below
        let playerValue = calculateHandValue(playerHand);

        // Redeal if player gets a 20 or 21
        // 20s are too common and are not worth practicing
        if (playerValue['totalValue'] >= 20) {
            return deal();
        }

        // Generate dealer card
        dealerCard = getRandomCard();

        // If the option for any arbitrary hand is to HIT, simulate the hit a certain percent of the time
        // to test the decision after a third card has been dealt
        if (playerValue['isSoft'] || playerValue['totalValue'] < 10) {
            // Tweak this percentage to set what percent of the time a third card is dealt in this drill
            if (Math.random() < 0.5 && basicStrategy(playerHand, dealerCard) == options.HIT) {
                playerHand.push(getRandomCard());
            }
        }

        dealCards(playerHand, dealerCard);

    }

    function checkAnswer(playerChoice) {
        const correctDecision = basicStrategy(playerHand, dealerCard);
        if (playerChoice === correctDecision) {
            correctAnswers++;
            setTimeout(() => {
                deal();
            }, 100); 
        } else {
            let recapString = playerHand.map(card => card.rank).join(', ');
            wrongChoice.innerHTML = `You chose: <span style="color: rgb(255, 61, 27); font-weight: 500;">${playerChoice}</span>`;
            cardsRecap.innerHTML = `${recapString}&nbsp&nbspvs&nbsp&nbspDealer ${dealerCard.rank}`;
            correctChoice.textContent = `${correctDecision}s`;
            disableButtons(true);
            showFeedback();
        }
        totalHands++;
        updateScoreboard();
    }

    hitButton.addEventListener('click', () => checkAnswer(options.HIT));
    standButton.addEventListener('click', () => checkAnswer(options.STAND));
    doubleButton.addEventListener('click', () => checkAnswer(options.DOUBLE));
    splitButton.addEventListener('click', () => checkAnswer(options.SPLIT));
    surrenderButton.addEventListener('click', () => checkAnswer(options.SURRENDER));

    dismissButton.addEventListener('click', () => {
        hideFeedback();
        disableButtons(false);
        deal();
    });

    // Start the game on page load
    startGame()

});
