const cards = document.querySelectorAll('.memory-card');

let hasFlippedCard = false;
let boardLocked = false;
let card1, card2;
let score = 0;

cards.forEach(card => {
    card.addEventListener('click', flipCard);
    const randomIndex = Math.floor(Math.random() * cards.length);
    card.style.order = randomIndex;
});

function flipCard(e){
    if (boardLocked) return;
    const target = e.target.parentElement;
    if (target === card1) return;

    target.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        card1 = target;
    } else {
        hasFlippedCard = false;
        card2 = target;
        checkForMatch();
    }
}

function checkForMatch() {
    if (card1.dataset.type === card2.dataset.type) {
        disableCards();
        score += 2;
        if (score === cards.length) {
            restartGame();
        }
    }
    else unflipCards();
}

function disableCards () {
    card1.removeEventListener('click', flipCard);
    card2.removeEventListener('click', flipCard);
}

function unflipCards () {
    boardLocked = true;
    setTimeout(() => {
        card1.classList.remove('flip');
        card2.classList.remove('flip');
        resetBoard();
    }, 1000);
}


function resetBoard () {
    hasFlippedCard = boardLocked = false;
    card1 = card2 = null;
}

function restartGame() {
    cards.forEach(card => {
        let randomIndex = Math.floor(Math.random() * 4) + 1;
        card.classList.add('remove' + randomIndex);
    });
    setTimeout(() => {
        document.location.reload();
    }, 1000);
}