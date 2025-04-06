const kCardDisplays = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const kSuits = ['hearts', 'diamonds', 'spades', 'clubs'];
const kNumDecks = 1;

class Card {
    #Display;
    #Suit;
    #Value;
    #CardElement;
    #NumAvailable;

    constructor(display, suit) {
        this.#Display = display;
        this.#Suit = suit;
        if (['J', 'Q', 'K'].includes(this.#Display)) {
            this.#Value = 10;
        }
        else if (this.#Display === 'A') {
            this.#Value = 1;
        }
        else {
            this.#Value = parseInt(this.#Display);
        }
        this.#NumAvailable = kNumDecks;
    }

    /**
     * Returns this.#CardElement, which will be created if necessary.
     * */
    DealCard() {
        if (this.#NumAvailable === 0) {
            return undefined;
        }

        this.#NumAvailable -= 1;

        if (!this.#CardElement) {
            this.#CardElement = document.createElement('div');
            this.#CardElement.innerHTML = this.#Display + '<br />';
            this.#CardElement.dataset.display = this.#Display;
            this.#CardElement.dataset.value = this.#Value;
            this.#CardElement.classList.add('playing-card');
            this.#CardElement.classList.add(this.#Suit);
        }

        return this.#CardElement;
    }

    GetNumAvailable() {
        return this.#NumAvailable;
    }

    ResetNumAvailable() {
        this.#NumAvailable = kNumDecks;
    }
}

class CardDeck {
    #DeckArray;
    #DiscardArray;
    #TotalCardsLeft;

    constructor() {
        this.#DeckArray = [];
        this.#TotalCardsLeft = 0;

        for (const display of kCardDisplays) {
            for (const suit of kSuits) {
                this.#DeckArray.push(new Card(display, suit));
                this.#TotalCardsLeft += kNumDecks;
            }
        }

        this.#DiscardArray = [];
    }

    #ResetDeck() {
        this.#DeckArray = [];
        this.#TotalCardsLeft = 0;

        for (const card of this.#DiscardArray) {
            card.ResetNumAvailable();
            this.#DeckArray.push(card);
            this.#TotalCardsLeft += kNumDecks;
        }

        this.#DiscardArray = [];
    }

    /**
     * Gets a random card HTMLElement from the deck.
     * Will reshuffle deck if no cards left.
     * Will update deck and card's NumAvailable
     * and remove any cards from the Deck array with NumAvailable === 0.
     * */
    DealCard() {
        if (this.#TotalCardsLeft === 0) {
            this.#ResetDeck();
        }

        const index = Math.floor(Math.random() * this.#DeckArray.length);
        const dealtCard = this.#DeckArray[index];
        const dealtCardElement = dealtCard.DealCard();

        if (dealtCard.GetNumAvailable() === 0) {
            const deleted = this.#DeckArray.splice(index, 1);
            this.#DiscardArray.push(deleted[0]);
        }
        this.#TotalCardsLeft -= 1;

        return dealtCardElement;
    }
}
