/******************************************************************************************
    Dealing
******************************************************************************************/
/**
 * @param {HTMLElement} targetSection
 * @param {boolean} flipped
 * */
async function dealCardWithDelay(targetSection, flipped) {
    await sleep(kDealDelay);
    return dealCard(targetSection, flipped);
}

/**
 * @param {HTMLElement} targetSection
 * @param {boolean} flipped
 * */
function dealCard(targetSection, flipped) {
    const targetDiv = getActiveHand(targetSection);
    const dealtCard = kDeck.DealCard();

    setCardFlipped(dealtCard, flipped);

    targetDiv.appendChild(dealtCard);

    updateScore(targetSection);

    return dealtCard;
}

function dealCardSpecific(targetSection, flipped, dealtCard) {
    const targetDiv = getActiveHand(targetSection);

    setCardFlipped(dealtCard, flipped);

    targetDiv.appendChild(dealtCard);

    updateScore(targetSection);
}

/**
 * Reveal all cards in the dealer's hand
 * */
function showAllDealerCards() {
    for (const flippedCard of getDealerActiveHand().querySelectorAll('.playing-card.flipped')) {
        setCardFlipped(flippedCard, false);
    }
    updateScore(getDealerSection());
}

function setCardFlipped(card, flipped) {
    if (flipped) {
        card.classList.add('flipped');
    }
    else {
        card.classList.remove('flipped');
    }
}

/******************************************************************************************
    Start Game Logic
******************************************************************************************/
function clearLastGame() {
    const ps = getPlayerSection();
    // Reset player and dealer scores.
    ps.querySelector('.score').innerText = '0';
    getDealerSection().querySelector('.score').innerText = '0';
    // Clear all cards.
    kDeck.DiscardDealtCards();
    const query = '#DealerSection .playing-card, #PlayerSection .playing-card';
    for (const card of document.querySelectorAll(query)) {
        card.remove();
    }
    setPlayerActiveHand(0);
    // Clear all split hands.
    for (const hand of ps.querySelectorAll('.card-section .hand:not([data-index="0"])')) {
        hand.remove();
    }
    const playerHand = ps.querySelector('.card-section .hand')
    playerHand.dataset.doubled = 0;
    playerHand.dataset.active = 1;
    playerHand.dataset.surrendered = 0;
    ResultTextHandler.RemoveResultText();
}

/**
 * Deals player 2 aces for testing purposes. Not taken from deck so these aces are duplicates.
 * */
async function initialDealRigged() {
    dealCard(getDealerSection(), true);

    await sleep(kDealDelay);
    dealCardSpecific(getPlayerSection(), false, new Card('A', 'hearts').DealCard());

    await dealCardWithDelay(getDealerSection(), false);

    await sleep(kDealDelay);
    dealCardSpecific(getPlayerSection(), false, new Card('A', 'spades').DealCard());
}

async function initialDeal() {
    dealCard(getDealerSection(), true);

    await dealCardWithDelay(getPlayerSection(), false);

    await dealCardWithDelay(getDealerSection(), false);

    await dealCardWithDelay(getPlayerSection(), false);
}

function checkInitialDeal() {
    if (getPlayerScore() === ImportantScores.Win) {
        getPlayerSection().querySelector('.score').innerText = ScoreText.Blackjack;
        nextTurn();
    }
    else {
        showGameplayButtons(true);
        logNewDeal();
    }
}

function startGame() {
    clearLastGame();

    hideAllButtons();

    initialDeal().then(() => {
        checkInitialDeal();
        getDealerSection().dataset.gameOngoing = 1;
    });
}

/******************************************************************************************
    End Game Logic
******************************************************************************************/
function updateRecord(result) {
    const recordDiv = document.getElementById('Record');

    let profit = parseInt(recordDiv.dataset.profit);
    let doubled = parseInt(getPlayerActiveHand().dataset.doubled) === 1;
    let profitChange = 0;

    if (result === HandResults.Win) {
        // Blackjack pays 3:2
        if (getPlayerScore() === 21 && getPlayerActiveHand().querySelectorAll('.playing-card').length === 2) {
            profitChange = 3;
        }
        else {
            profitChange = 2;
        }
    }
    else if (result === HandResults.Lose) {
        profitChange = -2;
    }
    else if (result === HandResults.Surrender) {
        profitChange = -1;
    }
    else {
        profitChange = 0;
    }

    if (doubled) {
        profitChange *= 2;
    }

    profit = profitChange + profit;
    getPlayerActiveHand().dataset.doubled = 0;
    let profitString = profit >= 0 ? '$' + profit : '-$' + Math.abs(profit);
    recordDiv.querySelector('span').innerText = profitString;
    recordDiv.dataset.profit = profit;
}

function showResults() {
    showAllDealerCards();

    const playerScore = getPlayerScore();
    const dealerScore = getDealerScore();
    let result;

    // Get result
    if (parseInt(getPlayerActiveHand().dataset.surrendered) === 1) {
        result = HandResults.Surrender;
    }
    else if (playerScore > ImportantScores.Win) {
        result = HandResults.Lose;
    }
    else if (dealerScore > ImportantScores.Win) {
        result = HandResults.Win;
    }
    else if (playerScore > dealerScore) {
        result = HandResults.Win;
    }
    else if (playerScore < dealerScore) {
        result = HandResults.Lose;
    }
    else if (dealerScore === playerScore) {
        if (dealerScore === ImportantScores.Win) {
            const dealerCardLength = getDealerActiveHand().querySelectorAll('.playing-card').length;
            const playerCardLength = getPlayerActiveHand().querySelectorAll('.playing-card').length;

            if (dealerCardLength === playerCardLength) {
                result = HandResults.Push;
            }
            // Dealer's blackjack beats player's unnatural 21
            else if (dealerCardLength === 2) {
                result = HandResults.Lose;
            }
            // Player's blackjack beats dealer's unnatural 21
            else if (playerCardLength === 2) {
                result = HandResults.Win;
            }
            else {
                result = HandResults.Push;
            }
        }
        else {
            result = HandResults.Push;
        }
    }
    else {
        result = HandResults.Push;
    }

    // Show results
    updateRecord(result);
    ResultTextHandler.ShowResultText(result);
}

function endGame() {
    getDealerSection().dataset.gameOngoing = 0;
    hideAllButtons();

    if (getPlayerHighestHandIndex() === 0) {
        dealerTurn().then(() => {
            showResults();
            showGameplayButtons(false);
        });
    }
    else {
        showShowResultsButton();
    }
}

function showResultsButton() {
    setPlayerActiveHand(0);
    dealerTurn().then(() => {
        showResults();
        showNextHandButton();
    });
}


/******************************************************************************************
    Turn Logic
******************************************************************************************/
function checkIfDealerPlays() {
    const playerHands = getPlayerSection().querySelectorAll('.hand');

    for (const hand of playerHands) {
        if (parseInt(hand.dataset.surrendered) !== 1 &&
            !playerHasBlackjack() &&
            getPlayerScore(hand) <= ImportantScores.Win) {

            return true;
        }
    }

    return false;
}

async function dealerTurn() {
    showAllDealerCards();

    if (checkIfDealerPlays()) {
        hideAllButtons();
        while (getDealerScore() < ImportantScores.DealerStands) {
            await dealCardWithDelay(getDealerSection(), false);
        }
    }
}

function nextTurn() {
    if (parseInt(getPlayerActiveHand().dataset.index) === getPlayerHighestHandIndex()) {
        endGame();
    }
    else {
        showNextHandButton();
    }
}

function turnButton(turnType) {
    updateBasicStrategyScore(turnType);

    switch(turnType) {
        case Plays.Hit:
            hit();
            break;
        case Plays.Stand:
            stand();
            break;
        case Plays.Double:
            double();
            break;
        case Plays.Split:
            split();
            break;
        case Plays.Surrender:
            surrender();
            break;
    }
}

function hit() {
    logDeal(dealCard(getPlayerSection(), false));
    document.getElementById(ElementIDs.FirstTurnOnlyButtons).classList.add('hidden');
    if (getPlayerScore() >= 21) {
        nextTurn();
    }
}

function stand() {
    nextTurn();
}

function double() {
    logDeal(dealCard(getPlayerSection(), false));
    getPlayerActiveHand().dataset.doubled = 1;
    nextTurn();
}

function split() {
    const newHand = document.createElement('div');
    newHand.classList.add('hand');
    newHand.dataset.index = getPlayerHighestHandIndex() + 1;
    newHand.dataset.active = '0';
    newHand.appendChild(getPlayerActiveHand().querySelector('.playing-card'));
    getPlayerSection().querySelector('.card-section').appendChild(newHand);
    hideAllButtons();
    dealCardWithDelay(getPlayerSection(), false).then(() => {
        checkInitialDeal();
    });
}

function surrender() {
    getPlayerActiveHand().dataset.surrendered = 1;
    nextTurn();
}

function nextHandButton() {
    setNextPlayerHandActive();
    ResultTextHandler.RemoveResultText();

    const gameOngoing = parseInt(getDealerSection().dataset.gameOngoing);

    if (gameOngoing === 1) {
        if (getPlayerActiveHand().querySelectorAll('.playing-card').length < 2) {
            hideAllButtons();
            dealCardWithDelay(getPlayerSection(), false).then(() => {
                checkInitialDeal();
            });
        }
    }
    else {
        if (parseInt(getPlayerActiveHand().dataset.index) === getPlayerHighestHandIndex()) {
            hideAllButtons();
            showGameplayButtons(false);
        }
        showResults();
    }
}
