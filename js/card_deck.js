const kCardDisplays = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const kSuits = ['hearts', 'diamonds', 'spades', 'clubs'];
const kNumDecks = 1;

class Card {
    #Display;
    #Suit;
    #Value;
    #CardElement;

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
    }

    /**
     * Returns this.#CardElement, which will be created if necessary.
     * */
    DealCard() {
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
}

class CardDeck {
    #DeckArray;
    #DiscardArray;
    #InPlayArray;

    constructor() {
        this.#DeckArray = [];

        for (let i = 0; i < kNumDecks; i++) {
            for (const display of kCardDisplays) {
                for (const suit of kSuits) {
                    this.#DeckArray.push(new Card(display, suit));
                }
            }
        }

        this.#DiscardArray = [];
        this.#InPlayArray = [];
    }

    #ReshuffleDiscardPile() {
        this.#DeckArray.push(...this.#DiscardArray);
        this.#DiscardArray = [];
    }

    /**
     * Gets a random card HTMLElement from the deck.
     * Will reshuffle discarded cards back into deck if no cards left.
     * */
    DealCard() {
        if (this.#DeckArray.length === 0) {
            this.#ReshuffleDiscardPile();
        }

        const index = Math.floor(Math.random() * this.#DeckArray.length);
        const dealtCard = this.#DeckArray.splice(index, 1)[0];
        const dealtCardElement = dealtCard.DealCard();
        this.#InPlayArray.push(dealtCard);

        return dealtCardElement;
    }

    /**
     * Move cards from InPlayArray to DiscardArray
     * */
    DiscardDealtCards() {
        this.#DiscardArray.push(...this.#InPlayArray);
        this.#InPlayArray = [];
    }
}
