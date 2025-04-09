/**
 * Returns if the player should split. Will treat values of 1 and 11 as Aces.
 * Double after split is allowed.
 * @param {number} dealerUpCardValue
 * @param {number} playerCardValue
 * */
function checkBasicStrategySplits(dealerUpCardValue, playerCardValue) {
    if (playerCardValue === 11) {
        playerCardValue = 1;
    }

    let shouldSplit = false;

    if (playerCardValue === 1 || playerCardValue === 8) {
        shouldSplit = true;
    }
    else if (playerCardValue === 10 || playerCardValue === 5) {
        shouldSplit = false;
    }
    else if (playerCardValue === 9) {
        if (dealerUpCardValue === 7 || dealerUpCardValue >= 10) {
            shouldSplit = false;
        }
        else {
            shouldSplit = true;
        }
    }
    else if (playerCardValue === 7) {
        shouldSplit = dealerUpCardValue <= 7;
    }
    else if (playerCardValue === 6) {
        shouldSplit = dealerUpCardValue <= 6;
    }
    else if (playerCardValue === 4) {
        shouldSplit = (dealerUpCardValue === 5 || dealerUpCardValue === 6);
    }
    else if (playerCardValue <= 3) {
        shouldSplit = dealerUpCardValue <= 7;
    }

    return shouldSplit;
}

/**
 * Basic strategy checker for hard totals (No aces).
 * @param {number} dealerUpCardValue
 * @param {number} playerTotal
 * @param {boolean} canDouble
 * */
function checkBasicStrategyHard(dealerUpCardValue, playerTotal, canDouble) {
    let idealTurn = -1;

    if (playerTotal >= 17) {
        idealTurn = Plays.Stand;
    }
    else if (playerTotal === 16 && canDouble && dealerUpCardValue >= 9) {
        idealTurn = Plays.Surrender;
    }
    else if (playerTotal === 15 && canDouble && dealerUpCardValue === 10) {
        idealTurn = Plays.Surrender;
    }
    else if (playerTotal >= 13) {
        if (dealerUpCardValue >= 7) {
            idealTurn = Plays.Hit;
        }
        else {
            idealTurn = Plays.Stand;
        }
    }
    else if (playerTotal === 12) {
        if (dealerUpCardValue <= 3 || dealerUpCardValue >= 7) {
            idealTurn = Plays.Hit;
        }
        else if (dealerUpCardValue >= 4 && dealerUpCardValue <= 6) {
            idealTurn = Plays.Stand;
        }
    }
    else if (playerTotal === 11) {
        idealTurn = Plays.Double;
    }
    else if (playerTotal === 10) {
        if (dealerUpCardValue <= 9) {
            idealTurn = Plays.Double;
        }
        else if (dealerUpCardValue >= 10) {
            idealTurn = Plays.Hit;
        }
    }
    else if (playerTotal === 9) {
        if (dealerUpCardValue === 2 || dealerUpCardValue >= 7) {
            idealTurn = Plays.Hit;
        }
        else if (dealerUpCardValue >= 3 && dealerUpCardValue <= 6) {
            idealTurn = Plays.Double;
        }
    }
    else if (playerTotal <= 8) {
        idealTurn = Plays.Hit;
    }

    if (!canDouble && idealTurn === Plays.Double) {
        idealTurn = Plays.Hit;
    }
    return idealTurn;
}

/**
 * Basic strategy checker for soft totals (hand has at least one ace).
 * @param {number} dealerUpCardValue
 * @param {number} playerTotal
 * @param {boolean} canDouble
 * */
function checkBasicStrategySoft(dealerUpCardValue, playerTotal, canDouble) {
    let idealTurn = -1;

    if (playerTotal >= 20) {
        idealTurn = Plays.Stand;
    }
    else if (playerTotal === 19) {
        if (dealerUpCardValue === 6) {
            idealTurn = canDouble ? Plays.Double : Plays.Stand;
        }
        else {
            idealTurn = Plays.Stand;
        }
    }
    else if (playerTotal === 18) {
        if (dealerUpCardValue <= 6) {
            idealTurn = canDouble ? Plays.Double : Plays.Stand;
        }
        else if (dealerUpCardValue <= 8) {
            idealTurn = Plays.Stand;
        }
        else if (dealerUpCardValue >= 9) {
            idealTurn = Plays.Hit;
        }
    }
    else if (playerTotal === 17) {
        if (dealerUpCardValue === 2 || dealerUpCardValue >= 7) {
            idealTurn = Plays.Hit;
        }
        else if (dealerUpCardValue >= 3 && dealerUpCardValue <= 6) {
            idealTurn = canDouble ? Plays.Double : Plays.Hit;
        }
    }
    else if (playerTotal === 16 || playerTotal === 15) {
        if (dealerUpCardValue <= 3 || dealerUpCardValue >= 7) {
            idealTurn = Plays.Hit;
        }
        else if (dealerUpCardValue >= 4 && dealerUpCardValue <= 6) {
            idealTurn = canDouble ? Plays.Double : Plays.Hit;
        }
    }
    else if (playerTotal === 14 || playerTotal === 13) {
        if (dealerUpCardValue <= 4 || dealerUpCardValue >= 7) {
            idealTurn = Plays.Hit;
        }
        else if (dealerUpCardValue === 5 || dealerUpCardValue === 6) {
            idealTurn = canDouble ? Plays.Double : Plays.Hit;
        }
    }

    return idealTurn;
}

/**
 * Returns the correct turn type based on the passed parameters
 * @param {number} turnType - Turn constant that describes what the player just played
 * (Hit, Stand, Double, or Split)
 * */
function checkTurn(turnType) {
    let dealerUpValue =
    parseInt(getDealerActiveHand().querySelector('.playing-card:not(.flipped)').dataset.value);
    // Easier to work with the table if aces are counted as 11.
    if (dealerUpValue === 1) dealerUpValue = 11;
    const playerTotal = getPlayerScore();

    let playerTotalIsSoft;
    if (getPlayerActiveHand().querySelector('.playing-card[data-value="1"]') &&
        getPlayerScoreAcesLow() <= 11) {
        playerTotalIsSoft = true;
    }
    else {
        playerTotalIsSoft = false;
    }

    const playerCards = getPlayerActiveHand().querySelectorAll('.playing-card');

    if (checkPlayerCanSplit() &&
        checkBasicStrategySplits(dealerUpValue, parseInt(playerCards[0].dataset.value))) {

        logTurn(turnType, Plays.Split);
        return turnType === Plays.Split;
    }

    const canDouble = playerCards.length === 2;

    if (playerTotalIsSoft) {
        const idealTurn = checkBasicStrategySoft(dealerUpValue, playerTotal, canDouble);
        logTurn(turnType, idealTurn);
        return idealTurn === turnType;
    }
    else {
        const idealTurn = checkBasicStrategyHard(dealerUpValue, playerTotal, canDouble);
        logTurn(turnType, idealTurn);
        return idealTurn === turnType;
    }
}

/**
 * Updates the basic strategy correctness tracker based on what was just played.
 * */
function updateBasicStrategyScore(turnType) {
    const bsScore = document.getElementById('Correct');
    let correct = bsScore.dataset.correct;
    let total = bsScore.dataset.total;

    total++;
    if (checkTurn(turnType)) {
        correct++;
        bsScore.classList.remove('incorrect');
    }
    else {
        bsScore.classList.add('incorrect');
    }
    bsScore.dataset.correct = correct;
    bsScore.dataset.total = total;
    const percent = (correct * 1.0)/total * 100;
    bsScore.querySelector('span').innerText = `${correct} / ${total} - ${percent.toFixed(2)}%`;
}
