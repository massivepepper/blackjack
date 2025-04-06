// Dealing

/**
 * @param {HTMLElement} targetSection
 * @param {boolean} flipped
 * */
function dealCard(targetSection, flipped) {
    const targetDiv = targetSection.querySelector('.card-section');
    const dealtCard = kDeck.DealCard();
    setCardFlipped(dealtCard, flipped);

    targetDiv.appendChild(dealtCard);

    updateScore(targetSection);

    return dealtCard;
}

/**
 * Reveal all cards in the dealer's hand
 * */
function showAllDealerCards() {
    for (const flippedCard of getDealerSection().querySelectorAll('.playing-card.flipped')) {
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

// Turn/Game Logic

/**
 * @param {Event} e
 * */
async function startGame() {
    getPlayerSection().querySelector('.score').innerText = '0';
    getDealerSection().querySelector('.score').innerText = '0';
    for (const card of
    document.querySelectorAll('#DealerSection .playing-card, #PlayerSection .playing-card')) {
        card.remove();
    }
    kDeck.DiscardDealtCards();

    for (const textDiv of document.querySelectorAll('#WinText, #LoseText, #PushText, #SurrenderText')) {
        textDiv.classList.add('collapse');
    }
    document.querySelector('#Overlay .placeholder').classList.remove('collapse');

    document.getElementById('DealButtonSection').classList.add('collapse');

    dealCard(getDealerSection(), true);
    await sleep(kDealDelay);

    dealCard(getPlayerSection(), false);
    await sleep(kDealDelay);

    dealCard(getDealerSection(), false);
    await sleep(kDealDelay);

    dealCard(getPlayerSection(), false);


    if (getPlayerScore() === kWinningScore) {
        getPlayerSection().querySelector('.score').innerText = kBlackjackText;
        endGame();
    }
    else {
        showGameplayButtons(true);
        logNewDeal();
    }
}

/**
 * @param {number} result
 * */
function updateRecord(result) {
    const recordDiv = document.getElementById('Record');

    let profit = parseInt(recordDiv.dataset.profit);
    let doubled = parseInt(getPlayerSection().dataset.doubled) !== 0;
    let profitChange = 0;

    if (result === kWin) {
        // Blackjack pays 3:2
        if (getPlayerScore() === 21 && getPlayerSection().querySelectorAll('.playing-card').length === 2) {
            profitChange = 3;
        }
        else {
            profitChange = 2;
        }
    }
    else if (result === kLose) {
        profitChange = -2;
    }
    else if (result === kSurrenderResult) {
        profitChange = -1;
    }
    else {
        profitChange = 0;
    }

    if (doubled) {
        profitChange *= 2;
    }

    profit = profitChange + profit;
    getPlayerSection().dataset.doubled = 0;
    let profitString = profit >= 0 ? '$' + profit : '-$' + Math.abs(profit);
    recordDiv.querySelector('span').innerText = profitString;
    recordDiv.dataset.profit = profit;
}

function endGame() {
    showAllDealerCards();

    const playerScore = getPlayerScore();
    const dealerScore = getDealerScore();
    let result;

    // Get result
    if (playerScore > kWinningScore) {
        result = kLose;
    }
    else if (dealerScore > kWinningScore) {
        result = kWin;
    }
    else if (playerScore > dealerScore) {
        result = kWin;
    }
    else if (playerScore < dealerScore) {
        result = kLose;
    }
    else if (dealerScore === kWinningScore &&
        getDealerSection().querySelectorAll('.playing-card').length === 2 &&
        getPlayerSection().querySelectorAll('.playing-card').length > 2) {

        // Dealer blackjack beats player's unnatural 21
        result = kLose;
    }
    else {
        result = kPush;
    }

    // Show results
    updateRecord(result);
    let textDiv;
    if (result === kWin)  {
        textDiv = document.getElementById('WinText');
    }
    else if (result === kLose) {
        textDiv = document.getElementById('LoseText');
    }
    else {
        textDiv = document.getElementById('PushText');
    }
    const placeholder = document.querySelector('#Overlay .placeholder');
    placeholder.classList.add('collapse');
    textDiv.classList.remove('collapse');
    showGameplayButtons(false);
}

async function dealerTurn() {
    showGameplayButtons(false);
    document.getElementById('DealButtonSection').classList.add('collapse');
    showAllDealerCards();

    while (getDealerScore() < kDealerStands) {
        await sleep(kDealDelay);
        dealCard(getDealerSection(), false);
    }
    endGame();
}

/**
 * Checks if the player busted and the game should end.
 * */
function turnLogic() {
    if (getPlayerScore() > kWinningScore) {
        endGame();
    }
}

/**
 * @param {number} type
 * */
function turnButton(type) {
    updateBasicStrategyScore(type);

    switch (type) {
        case kHit:
            hit();
            break;
        case kStand:
            stand();
            break;
        case kDouble:
            double();
            break;
        case kSplit:
            split();
            break;
        case kSurrender:
            surrender();
        break;
        default:
            break;
    }
}

function hit() {
    logDeal(dealCard(getPlayerSection(), false));
    document.getElementById('FirstTurnOnlyButtons').classList.add('hidden');
    turnLogic();
    if (getPlayerScore() === kWinningScore) {
        dealerTurn();
    }
}

function stand() {
    turnLogic();
    dealerTurn();
}

function double() {
    logDeal(dealCard(getPlayerSection(), false));
    getPlayerSection().dataset.doubled = 1;
    turnLogic();
    if (getPlayerScore() <= 21) {
        dealerTurn();
    }
}

/**
 * Unimplemented
 * */
function split() {
    // TODO: Implement
    turnLogic();
    endGameWithNoResult();
}

function surrender() {
    showAllDealerCards();
    showGameplayButtons(false);
    const placeholder = document.querySelector('#Overlay .placeholder');
    placeholder.classList.add('collapse');
    document.getElementById('SurrenderText').classList.remove('collapse');
    updateRecord(kSurrenderResult);
}

/**
 * Temporary function until splitting is implemented.
 * */
function endGameWithNoResult() {
    showAllDealerCards();
    showGameplayButtons(false);
    const placeholder = document.querySelector('#Overlay .placeholder');
    placeholder.classList.add('collapse');
    document.getElementById('PushText').classList.remove('collapse');
}
