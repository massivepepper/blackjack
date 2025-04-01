const kDealer = 0;
const kPlayer = 1;

const kBlackjackText = 'Blackjack';
const kBustText = 'Bust';

const kDealDelay = 350;

const kWinningScore = 21;
const kDealerStands = 17;

const kWin = 1;
const kLose = 2;
const kPush = 3;

const kHit = 0;
const kStand = 1;
const kDouble = 2;
const kSplit = 3;

function getPlayerSection() {
    return document.getElementById('PlayerSection');
}

function getDealerSection() {
    return document.getElementById('DealerSection');
}

function getSection(target) {
    if (target === kDealer) {
        return getDealerSection();
    }
    else if (target === kPlayer) {
        return getPlayerSection();
    }
}

function getPlayerScore() {
    return getScore(getPlayerSection());
}

function getPlayerScoreAcesLow() {
    let score = 0;
    for (const card of getPlayerSection().querySelectorAll('.playing-card')) {
        score += parseInt(card.dataset.value);
    }

    return score;
}

function getDealerScore() {
    return getScore(getDealerSection());
}

/**
 * Must be used in an async function with the await keyword
 * (e.g. await sleep(500))
 * */
function sleep(delay) {
    return new Promise(r => setTimeout(r, delay));
}

// Scoring

/**
 * @param {HTMLElement} section
 * */
function getScore(section) {
    let aceCount = 0;
    let sum = 0;

    for (const card of section.querySelectorAll('.playing-card')) {
        let value = parseInt(card.dataset.value);
        if (value === 1) {
            value = 11;
            aceCount++;
        }
        sum += value;
    }

    while (sum > kWinningScore && aceCount > 0) {
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

    for (const card of section.querySelectorAll('.playing-card')) {
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
    while (totalSum > kWinningScore && aceCount > 0) {
        aceCount--;
        totalSum -= 10;
    }
    let scoreText;
    if (totalSum > kWinningScore) {
        scoreText = kBustText;
    }
    else {
        if (!certain) {
            scoreText = sum + '?';
        }
        else {
            scoreText = totalSum;
        }
    }
    if (scoreSection.innerText !== kBlackjackText) {
        scoreSection.innerText = scoreText;
    }
}

/**
 * @param {boolean} gameStarted
 * */
function showGameplayButtons(gameStarted) {
    const query = '#HitButton, #StandButton, #DoubleButton, #SplitButton';

    for (const btn of document.querySelectorAll(query)) {
        if (gameStarted) {
            btn.classList.remove('collapse');
            btn.classList.remove('hidden');
        }
        else {
            btn.classList.add('collapse');
        }
    }
    if (gameStarted) {
        document.getElementById('DealButton').classList.add('collapse');
    }
    else {
        document.getElementById('DealButton').classList.remove('collapse');
    }
}

