document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------
        Buttons
    ----------------------------------------- */
    const showButton = document.getElementById('show');
    const nextButton = document.getElementById('next');

    /* -----------------------------------------
        Other Elements
    ----------------------------------------- */
    const shoeImage = document.getElementById('shoe-img')
    const runningCountElement = document.getElementById('running-count');
    const cardsDealtElement = document.getElementById('cards-dealt');
    const divisorElement = document.getElementById('divisor');
    const trueCountElement = document.getElementById('true-count');

    // Global variable to store running count
    let runningCount;
    let cardsDealt;
    let numDecks;
    let divisor;

    /* -----------------------------------------
        Game Control Flow
    ----------------------------------------- */
    function getRandomCount() {
        return Math.floor(Math.random() * (15 - (-8) + 1)) + (-8);
    }
      
    function getImagePath(numCards, numDecks) {
        return `https://dkf1anc6yv6k4.cloudfront.net/${numDecks}D/1/D${numDecks}_${numCards}.jpg`;
    }     
    
    function generateCount() {
        const selectedRadio = document.querySelector('input[name="group1"]:checked');
        numDecks = selectedRadio.value;

        hideTrueCount();

        // Generate random count
        const minCount = 13;
        const maxCount = numDecks * 52 - 26;
        cardsDealt = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
        shoeImage.src = getImagePath(cardsDealt, numDecks)
        runningCount = getRandomCount();

        // Set info based on count
        runningCountElement.textContent = `Running Count: ${runningCount}`;
        cardsDealtElement.textContent = `Cards Dealt: ${cardsDealt} / ${numDecks * 52}`;
        divisor = (numDecks - (cardsDealt / 52)).toFixed(1);
        divisorElement.textContent = `Deck Divisor: ${divisor}`;
        trueCountElement.textContent = `True Count: ${(runningCount / divisor).toFixed(1)}`;
    }

    function hideTrueCount () {
        document.querySelectorAll('#info p').forEach(function(paragraph) {
            paragraph.style.visibility = 'hidden';
        });    
    }

    function showTrueCount() {
        document.querySelectorAll('#info p').forEach(function(paragraph) {
            paragraph.style.visibility = 'visible';
        });
    }

    showButton.addEventListener('click', showTrueCount);
    nextButton.addEventListener('click', generateCount);

    // Generate count on page load
    generateCount()
});
