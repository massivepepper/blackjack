function getNewDealTableClone() {
    return document.getElementById('HandHistoryTableTemplate').cloneNode(true);
}
function getCurrentDealTable() {
    return document.querySelector('#HandHistoryTableSection > .hand-history-table');
}

function logNewDeal() {
    const newDealTable = getNewDealTableClone();
    newDealTable.id = '';

    const playerCards = getPlayerSection().querySelectorAll('.playing-card');
    const playerCards_string = playerCards[0].dataset.display + ', ' + playerCards[1].dataset.display;

    const dealerUpCard = getDealerSection().querySelector('.playing-card:not(.flipped)');
    newDealTable.querySelector('span.dealer-upcard').innerText = dealerUpCard.dataset.display +
        ' (' + dealerUpCard.dataset.value + ')';

    const turnRow = newDealTable.querySelector('tbody tr');
    turnRow.querySelector('.player-cards').innerText = playerCards_string;
    turnRow.querySelector('.player-total').innerText = getPlayerScore();

    newDealTable.classList.remove('collapse');

    document.getElementById('HandHistoryTableSection').prepend(newDealTable);
    const dealTables = document.querySelectorAll('#HandHistoryTableSection table.hand-history-table');
    if (dealTables.length > 5) {
        document.querySelector('#HandHistoryTableSection table.hand-history-table:last-child').remove();
    }
}

/**
 * @param {HTMLElement} dealtCard
 * */
function logDeal(dealtCard) {
    const currentDealTable = getCurrentDealTable();
    const newTurnRow = currentDealTable.querySelector('tbody > tr').cloneNode(true);
    newTurnRow.classList.remove('incorrect');
    newTurnRow.querySelector('.player-cards').innerText = dealtCard.dataset.display;
    newTurnRow.querySelector('.player-total').innerText = getPlayerScore();
    newTurnRow.querySelector('.turn-played').innerText = '';
    newTurnRow.querySelector('.expected-turn').innerText = '';

    currentDealTable.querySelector('tbody').appendChild(newTurnRow);
}

function logTurn(turnPlayed, expectedTurn) {
    let strTurnPlayed;
    let strExpectedTurn;

    switch (turnPlayed) {
        case kHit:
            strTurnPlayed = 'Hit';
            break;
        case kStand: strTurnPlayed = 'Stand';
            break;
        case kDouble:
            strTurnPlayed = 'Double';
            break;
        case kSplit:
            strTurnPlayed = 'Split'
            break;
        case kSurrender:
            strTurnPlayed = 'Surrender';
            break;
        default:
            strTurnPlayed = turnPlayed.toString();
            break;
    }
    switch (expectedTurn) {
        case kHit:
            strExpectedTurn = 'Hit';
            break;
        case kStand: strExpectedTurn = 'Stand';
            break;
        case kDouble:
            strExpectedTurn = 'Double';
            break;
        case kSplit:
            strExpectedTurn = 'Split'
            break;
        case kSurrender:
            strExpectedTurn = 'Surrender';
            break;
        default:
            strExpectedTurn = turnPlayed.toString();
            break;
    }

    const currentDealTable = getCurrentDealTable();
    const currentTurnRow = currentDealTable.querySelector('tbody tr:last-child')
    currentTurnRow.querySelector('.turn-played').innerText = strTurnPlayed;
    currentTurnRow.querySelector('.expected-turn').innerText = strExpectedTurn;
    if (turnPlayed !== expectedTurn) {
        currentTurnRow.classList.add('incorrect');
    }
}
