document.addEventListener('DOMContentLoaded', () => {
    const resetButton = document.getElementById('reset');
    const hitButton = document.getElementById('hit');
    const standButton = document.getElementById('stand');
    const doubleButton = document.getElementById('double');
    const splitButton = document.getElementById('split');
    const surrenderButton = document.getElementById('surrender');
    const card1 = document.getElementById('card1');
    const card2 = document.getElementById('card2');
    const card3 = document.getElementById('card3');
    const accuracyDisplay = document.getElementById('accuracy');
    const handsDisplay = document.getElementById('hands');
    const correctMessage = document.getElementById('correct');
    const incorrectMessage = document.getElementById('incorrect');

    const allValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const softValues = ['2', '3', '4', '5', '6', '7', '8', '9'];
    const hardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const valueMap = new Map([
        ["2", 2],
        ["3", 3],
        ["4", 4],
        ["5", 5],
        ["6", 6],
        ["7", 7],
        ["8", 8],
        ["9", 9],
        ["10", 10],
        ["J", 10],
        ["Q", 10],
        ["K", 10],
        ["A", 11],
    ]);

    function convertToValue(string) {
        return valueMap.get(string);
    }

    function getRandomCard(valueArr) {
        return valueArr[Math.floor(Math.random() * valueArr.length)];
    }

    function shouldSplit(playerCard, dealerCard) {
        if (playerCard == 'A' || playerCard == '8') {
            return true;
        }
        if (convertToValue(playerCard) == 10 || playerCard == '5' || playerCard == '4') {
            return false;
        } 
        if (playerCard == '2' || playerCard == '3') {
            if (convertToValue(dealerCard) >= 4 && convertToValue(dealerCard) <= 7) {
                return true;
            }
            return false;
        } 
        if (playerCard == '6') {
            if (convertToValue(dealerCard) >= 3 && convertToValue(dealerCard) <= 6) {
                return true;
            }
            return false;
        } 
        if (playerCard == '7') {
            if (convertToValue(dealerCard) <= 7) {
                return true;
            }
            return false;
        } 
        if (playerCard == '9') {
            if (convertToValue(dealerCard) <= 6 || dealerCard == '8' || dealerCard == '9') {
                return true;
            }
            return false;
        }
    }

    function softDecision(playerCard, dealerCard) {
        if (playerCard == '9') {
            return 'Stand';
        } 
        if (dealerCard == '6') {
            return 'Double';
        } 
        if (playerCard == '8') {
            return 'Stand';
        } 
        if (dealerCard == '5') {
            return 'Double';
        } 
        if (playerCard == '7') {
            if (dealerCard == '7' || dealerCard == '8') {
                return 'Stand';
            } 
            if (dealerCard == '9' || dealerCard == 'A' || convertToValue(dealerCard) == 10) {
                return 'Hit';
            }
            return 'Double';
        } 
        if (dealerCard == '4') {
            if (convertToValue(playerCard) <= 6 && convertToValue(playerCard) >= 4) {
                return 'Double';
            }
            return 'Hit';
        } 
        if (dealerCard == '3' && playerCard == '6') {
            return 'Double'
        } 
        return 'Hit';
    }

    function hardDecision(playerSum, dealerCard) {
        if (playerSum == 16) {
            if (dealerCard == '9' || convertToValue(dealerCard) == 10 || dealerCard == 'A') {
                return 'Surrender';
            }
        }
        if (playerSum == 15 && convertToValue(dealerCard) == 10) {
            return 'Surrender';
        }
        if (playerSum >= 17) {
            return 'Stand';
        } 
        if (playerSum == 11) {
            return 'Double'
        } 
        if (convertToValue(dealerCard) <= 6) {
            if (playerSum >= 12) {
                if (playerSum == 12 && (dealerCard == '2' || dealerCard == '3')) {
                    return 'Hit';
                }
                return 'Stand';
            }
        }
        if (playerSum == 10) {
            if (convertToValue(dealerCard) < 10) {
                return 'Double';
            }
            return 'Hit';
        }
        if (playerSum == 9) {
            if (convertToValue(dealerCard) >= 3 && convertToValue(dealerCard) <= 6) {
                return 'Double';
            }
            return 'Hit';
        } 
        return 'Hit';
    }

    let correctAnswers = 0;
    let totalHands = 0;

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

    function dealPairs() {
        const sameCard = getRandomCard(allValues);
        card1.textContent = getRandomCard(allValues);
        card2.textContent = sameCard;
        card3.textContent = sameCard;
    }

    function dealSoft() {
        card1.textContent = getRandomCard(allValues);
        if (Math.random() < 0.5) {
            card2.textContent = getRandomCard(softValues);
            card3.textContent = 'A';
        } else {
            card2.textContent = 'A';
            card3.textContent = getRandomCard(softValues);
        }
    }

    function dealHard() {
        card1.textContent = getRandomCard(allValues);
        card2.textContent = getRandomCard(hardValues);
        card3.textContent = getRandomCard(hardValues);
    }

    function deal() {
        const selectedRadio = document.querySelector('input[name="group1"]:checked');
        if (selectedRadio.value == 'hard') {
            dealHard();
        }
        else if (selectedRadio.value == 'pairs') {
            dealPairs();
        }
        else if (selectedRadio.value == 'soft') {
            dealSoft();
        } 
        else if (selectedRadio.value == 'softpairs') {
            if (Math.random() < 0.5) {
                dealPairs();
            } else {
                dealSoft();
            }
        }
        else {
            card1.textContent = getRandomCard(allValues);
            card2.textContent = getRandomCard(allValues);
            card3.textContent = getRandomCard(allValues);
        }

        if (convertToValue(card2.textContent) + convertToValue(card3.textContent) == 21) {
            deal();
        }
    }

    function checkAnswer(playerChoice) {
        const correctChoice = getCorrectChoice(card1.textContent, card2.textContent, card3.textContent);
        if (playerChoice === correctChoice) {
            correctMessage.style.display = 'block';
            correctAnswers++;
            console.log(`Correct! ${card2.textContent} ${card3.textContent} vs ${card1.textContent} is a ${correctChoice}`);
        } else {
            incorrectMessage.textContent = `Correct play was ${correctChoice}!`;
            incorrectMessage.style.display = 'block';
            console.log(`WRONG! ${card2.textContent}${card3.textContent} vs ${card1.textContent} is a ${correctChoice}. You chose ${playerChoice}`);
        }
        setTimeout(() => {
            incorrectMessage.style.display = 'none';
            correctMessage.style.display = 'none';
            totalHands++;
            updateScoreboard();
            deal();
        }, 1000); 
    }

    function getCorrectChoice(dealerCard, playerCard1, playerCard2) {
        if (playerCard1 == playerCard2) { // Pair
            if (shouldSplit(playerCard1, dealerCard)) {
                return 'Split';
            }
        }  
        if (playerCard1 == 'A') { // Soft total
            return softDecision(playerCard2, dealerCard);
        }
        if (playerCard2 == 'A') { // Soft total
            return softDecision(playerCard1, dealerCard);
        }
        return hardDecision(convertToValue(playerCard1) + convertToValue(playerCard2), dealerCard);
    }

    // resetButton.addEventListener('click', resetAndDeal);

    hitButton.addEventListener('click', () => checkAnswer('Hit'));
    standButton.addEventListener('click', () => checkAnswer('Stand'));
    doubleButton.addEventListener('click', () => checkAnswer('Double'));
    splitButton.addEventListener('click', () => checkAnswer('Split'));
    surrenderButton.addEventListener('click', () => checkAnswer('Surrender'));
});
