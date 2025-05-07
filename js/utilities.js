const Players = Object.freeze({
    Dealer: 0,
    Player: 1
});

const ScoreText = Object.freeze({
    Blackjack: 'Blackjack',
    Bust: 'Bust'
});

const kDealDelay = 350;

const ImportantScores = Object.freeze({
    Win: 21,
    DealerStands: 17
});

const HandResults = Object.freeze({
    Win: 0,
    Lose: 1,
    Push: 2,
    Surrender: 3
});

const Plays = Object.freeze({
    Hit: 0,
    Stand: 1,
    Double: 2,
    Split: 3,
    Surrender: 4
});

class ResultTextHandler {
    static ShowResultText(result) {
        let textDiv;
        switch(result) {
            case HandResults.Win:
                textDiv = document.getElementById('WinText');
                break;
            case HandResults.Lose:
                textDiv = document.getElementById('LoseText');
                break;
            case HandResults.Push:
                textDiv = document.getElementById('PushText');
                break;
            case HandResults.Surrender:
                textDiv = document.getElementById('SurrenderText');
                break;
        }
        if (textDiv) {
            document.querySelector('#Overlay .placeholder').classList.add('collapse');
            textDiv.classList.remove('collapse');
        }
    }
    static RemoveResultText() {
        const query = '#WinText, #LoseText, #PushText, #SurrenderText';
        for (const textDiv of document.querySelectorAll(query)) {
            textDiv.classList.add('collapse');
        }
        document.querySelector('#Overlay .placeholder').classList.remove('collapse');
    }
}

const ElementIDs = Object.freeze({
    FirstTurnOnlyButtons: 'FirstTurnOnlyButtons'
});

const kDeck = new CardDeck();

function getPlayerSection() {
    return document.getElementById('PlayerSection');
}

function getDealerSection() {
    return document.getElementById('DealerSection');
}

function getActiveHand(target) {
    const activeIndex = parseInt(target.dataset.activeIndex);
    return target.querySelector(`.card-section > .hand[data-index="${activeIndex}"`);
}

function getPlayerActiveHand() {
    return getActiveHand(getPlayerSection());
}
function getPlayerHighestHandIndex() {
    const allHands = getPlayerSection().querySelectorAll('.hand');
    return parseInt(allHands[allHands.length - 1].dataset.index);
}

function setNextPlayerHandActive() {
    const ps = getPlayerSection();
    const activeIndex = parseInt(ps.dataset.activeIndex);

    if (ps.querySelector(`.card-section > .hand[data-index="${activeIndex + 1}"]`)) {
        setPlayerActiveHand(activeIndex + 1);
    }
    else {
        setPlayerActiveHand(0);
    }
}
/**
 * Does not check if hand with data-index=updatedIndex actually exists. If it does not, the hand
 * with data-index="0" will be set as active.
 * @param {number} updatedIndex
 * */
function setPlayerActiveHand(updatedIndex) {
    const ps = getPlayerSection();
    const activeIndex = parseInt(ps.dataset.activeIndex);
    const currentActiveHand = ps.querySelector(`.card-section > .hand[data-index="${activeIndex}"]`);
    let newActiveHand = ps.querySelector(`.card-section > .hand[data-index="${updatedIndex}"]`);

    if (!newActiveHand) {
        updatedIndex = 0;
        newActiveHand = ps.querySelector(`.card-section > .hand[data-index="${updatedIndex}"]`);
    }
    ps.dataset.activeIndex = updatedIndex;
    currentActiveHand.dataset.active = "0";
    newActiveHand.dataset.active = "1";
    updateScore(getPlayerSection());
}
function resetPlayerHands() {
    setPlayerActiveHand(0);
    for (const h of getPlayerSection().querySelectorAll('.hand:not([data-index="0"])')) {
        h.remove();
    }
}

/**
 * Checks if passed hand has blackjack. If no hand is passed, will get player's active hand.
 * @param {HTMLElement} hand
 * */
function playerHasBlackjack(hand) {
    if (!hand) {
        hand = getPlayerActiveHand();
    }
    return hand.querySelectorAll('.playing-card').length === 2 && getScoreForHand(hand) === 21;
}

function getDealerActiveHand() {
    return getActiveHand(getDealerSection());
}

function getSection(target) {
    if (target === Players.Dealer) {
        return getDealerSection();
    }
    else if (target === Players.Player) {
        return getPlayerSection();
    }
}

function getPlayerScore() {
    return getScore(getPlayerSection());
}

function getPlayerScoreAcesLow() {
    let score = 0;
    for (const card of getPlayerActiveHand().querySelectorAll('.playing-card')) {
        score += parseInt(card.dataset.value);
    }

    return score;
}

function getDealerScore() {
    return getScore(getDealerSection());
}

function checkPlayerCanSplit() {
    const playerHand = getPlayerActiveHand().querySelectorAll('.playing-card');
    if (playerHand.length !== 2) {
        return false;
    }
    return parseInt(playerHand[0].dataset.value) === parseInt(playerHand[1].dataset.value);
}

// Scoring

/**
 * @param {HTMLElement} section
 * */
function getScore(section) {
    return getScoreForHand(getActiveHand(section));
}

function getScoreForHand(hand) {
    let aceCount = 0;
    let sum = 0;

    for (const card of hand.querySelectorAll('.playing-card')) {
        let value = parseInt(card.dataset.value);
        if (value === 1) {
            value = 11;
            aceCount++;
        }
        sum += value;
    }

    while (sum > ImportantScores.Win && aceCount > 0) {
        aceCount--;
        sum -= 10;
    }

    return sum;
}

/**
 * @param {HTMLElement} section
 * */
function updateScore(section) {
    const scoreSection = section.querySelector('.score');
    let certain = true;
    let aceCount = 0;
    let sum = 0;
    let hiddenSum = 0;
    const playerCards = getActiveHand(section).querySelectorAll('.playing-card');

    for (const card of playerCards) {
        let value = parseInt(card.dataset.value);
        if (value === 1) {
            value = 11;
            aceCount++;
        }
        if (card.classList.contains('flipped')) {
            certain = false;
            hiddenSum += value;
        }
        else {
            sum += value;
        }
    }
    let totalSum = sum + hiddenSum;
    while (totalSum > ImportantScores.Win && aceCount > 0) {
        aceCount--;
        totalSum -= 10;
    }
    let scoreText;
    if (totalSum > ImportantScores.Win) {
        scoreText = ScoreText.Bust;
    }
    else if (totalSum === 21 && playerCards.length === 2 && certain) {
        scoreText = ScoreText.Blackjack;
    }
    else {
        if (!certain) {
            scoreText = sum + '?';
        }
        else {
            scoreText = totalSum;
        }
    }
    scoreSection.innerText = scoreText;
}

/**
 * @param {boolean} gameStarted
 * */
function showGameplayButtons(gameStarted) {
    if (gameStarted) {
        document.getElementById('DealButtonSection').classList.add('collapse');
        document.getElementById('HandNavigationSection').classList.add('collapse');

        document.getElementById('AllTurnsButtons').classList.remove('collapse');
        document.getElementById('FirstTurnOnlyButtons').classList.remove('collapse');
        document.getElementById('FirstTurnOnlyButtons').classList.remove('hidden');

        document.getElementById('HandNavigationSection').classList.add('collapse');

        if (!checkPlayerCanSplit()) {
            document.getElementById('SplitButton').classList.add('hidden');
        }
    }
    else  {
        document.getElementById('DealButtonSection').classList.remove('collapse');

        document.getElementById('AllTurnsButtons').classList.add('collapse');
        document.getElementById('FirstTurnOnlyButtons').classList.add('collapse');

        document.getElementById('SplitButton').classList.remove('hidden');
    }
}

function hideAllButtons() {
    document.getElementById('DealButtonSection').classList.add('collapse');

    document.getElementById('AllTurnsButtons').classList.add('collapse');
    document.getElementById('FirstTurnOnlyButtons').classList.add('collapse');

    document.getElementById('SplitButton').classList.remove('hidden');

    document.getElementById('HandNavigationSection').classList.add('collapse');
    document.getElementById('ShowResultsSection').classList.add('collapse');
}

function showNextHandButton() {
    hideAllButtons();
    document.getElementById('HandNavigationSection').classList.remove('collapse');
}

function showShowResultsButton() {
    hideAllButtons();
    document.getElementById('ShowResultsSection').classList.remove('collapse');
}

/**
 * Must be used in an async function with the await keyword
 * (e.g. await sleep(500))
 * */
function sleep(delay) {
    return new Promise(r => setTimeout(r, delay));
}
