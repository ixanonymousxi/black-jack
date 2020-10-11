//http://deckofcardsapi.com/

let id;
let dealerHand = [];
let playerHand = [];

async function newDeck() {
    const result = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
    const data = await result.json();
    id = data.deck_id;
    return await data;
}

async function dealCards() {
    for (let i = 0; i < 4; i++) {
        if (i < 2) {
            await drawCard(dealerHand);
        } else {
            await drawCard(playerHand);
        }
    }
}

async function setUp() {
    await newDeck();
    await dealCards();
}

function start() {
    document.getElementById("d-img-1").src = dealerHand[0].image;

    document.getElementById("d-img-2").src = "images/cardBack.png";

    playerHand.forEach((val, i) => {
        document.getElementById("p-img-" + (i + 1)).src = val.image;
    });

    document.getElementById("beginner").style.display = "none";
    document.getElementById("table").style.display = "flex";

    document.getElementById("start").style.display = "block";
    document.getElementById("load").style.display = "none";
}

async function drawCard(player) {
    const result = await fetch('https://deckofcardsapi.com/api/deck/' + id + '/draw/?count=1');
    const card = await result.json();

    if (player.length >= 2) {
        const newCard = document.createElement("img");
        newCard.className = "cards";
        newCard.src = card.cards[0].image;

        const pileId = player == playerHand ? "p-img-" : "d-img-";
        const prevCard = document.getElementById(pileId + player.length);

        newCard.id = pileId + (player.length + 1);
        newCard.style.left = parseInt(prevCard.style.left) + 20 + "px";


        const handID = player == playerHand ? "playerHand" : "dealerHand";
        document.getElementById(handID).appendChild(newCard);

    }

    player.push(card.cards[0]);
    return card;
}


function sumOfHand(pile) {
    let sum = 0;

    //Duplicate Pile Array so we can manipulate it
    let pileArr = [...pile];

    //Check if any card is an Ace, 
    //if so move it the end
    //so the Ace can change to a 1 or 11
    //depending on the rest of the cards sum
    let aces = 0;
    pile.forEach((card, i) => {
        if (card.value == "ACE") {
            aces++;
            if (i != pile.length - 1) {
                pileArr.push(pileArr.splice(i, 1)[0]);
            }
        }
    });

    //Iterate over manipulated array
    //Assign values to cards
    //Add to sum
    pileArr.forEach((card) => {
        if (card.value == "KING" || card.value == "QUEEN" || card.value == "JACK") {
            sum += 10;
        } else if (card.value == "ACE") {
            if (aces >= 2 || sum > 10) {
                sum += 1;
            } else {
                sum += 11;
            }
        } else {
            sum += parseInt(card.value);
        }
    });

    return sum;
}

async function dealerPlay() {
    const playerSum = sumOfHand(playerHand);
    const dealerSum = sumOfHand(dealerHand);

    document.getElementById("d-img-2").src = dealerHand[1].image;

    if (dealerSum > playerSum && dealerSum <= 21) {
        setTimeout(loseGame, 1500);
    } else if (dealerSum <= 16) {
        setTimeout(async function () {
            await drawCard(dealerHand);
            await dealerPlay();
        }, 1500);
    } else if (dealerSum == playerSum && dealerSum <= 21) {
        setTimeout(drawGame, 1500);
    } else {
        setTimeout(winGame("You Win!"), 1500);
    }
}

function winGame(message) {
    document.getElementById("endMessage").innerHTML = message;
    document.getElementById("endGame").style.display = "flex";
}

function loseGame() {
    document.getElementById("endMessage").innerHTML = "You Lose";
    document.getElementById("endGame").style.display = "flex";
}

function drawGame() {
    document.getElementById("endMessage").innerHTML = "Draw";
    document.getElementById("endGame").style.display = "flex";
}

async function restart() {
    document.getElementById("hit").disabled = false;
    document.getElementById("table").style.display = "none";
    dealerHand = [];
    playerHand = [];

    const images = document.getElementsByClassName("cards");

    for (const [key, value] of Object.entries(images)) {
        let idArr = value.id.split("");
        let idNum = idArr[idArr.length - 1];
        if (idNum > 2) {
            value.parentNode.removeChild(value);
        }
    }
    document.getElementById("endGame").style.display = "none";
    document.getElementById("beginner").style.display = "flex";
}


document.getElementById("start").addEventListener("click", async () => {
    document.getElementById("start").style.display = "none";
    document.getElementById("load").style.display = "block";
    await setUp();
    start();

    const playerHandSum = sumOfHand(playerHand);
    if (playerHandSum == 21) {
        setTimeout(winGame("Black Jack! You Win!"), 1000);
    }
});

document.getElementById("hit").addEventListener("click", async () => {
    document.getElementById("hit").disabled = true;
    await drawCard(playerHand);

    setTimeout(function () {
        document.getElementById("hit").disabled = false;
    }, 1000);

    const playerHandSum = sumOfHand(playerHand);

    if (playerHandSum > 21) {
        document.getElementById("hit").disabled = true;
        setTimeout(function () {
            document.getElementById("d-img-2").src = dealerHand[1].image;
        }, 1000);
        setTimeout(loseGame, 2500);
    }

});

document.getElementById("stand").addEventListener("click", async () => {
    document.getElementById("hit").disabled = true;
    await dealerPlay();
});

document.getElementById("PlayAgain").addEventListener("click", async () => {
    await restart();
});