(() => document.addEventListener('DOMContentLoaded', () => {
  const vertical = document.getElementById('vertical-number');
  const horizontal = document.getElementById('horizontal-number');
  const startButton = document.getElementById('start-btn'); // cards appean when button is clicked

  let pairs;
  let timerDisplay;
  let seconds;
  let timer;

  let flipped = false; // the user hasn't flipped any cards yet
  let firstCard, secondCard; // first and second open cards

  let gameboard;
  let foundPairs = 0;
  let firstMove = false; // the game hasn't started yet (we will set the timer using this variable)

  let cardsArray = [];
  let frontFace = []; // array of cards' front faces that will hold a number

  // adding event listeners to inputs to prevent entering odd numbers
  [vertical, horizontal].forEach(input => {
    input.addEventListener('input', () => {
      setTimeout(() => {
        if (input.value === "") return
        if (input.value % 2 !== 0 || (input.value > 10 || input.value < 2)) {
          input.value = 4;
        }
      }, 500)
    })
  });

  // add event listener to the button that will start the game
  startButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (vertical.value === "" || horizontal.value === "") return //the game won't start if fields are empty
    if (vertical.value % 2 !== 0 || horizontal.value % 2 !== 0) return //the game won't start if the user somehow
    //managed to enter odd number
    if ((horizontal.value > 10 || horizontal.value < 2) || (vertical.value > 10 || vertical.value < 2)) return
    // the game won't start if the user somehow entered numbers that are out of range
    else startGame();
  });

  // how the timer looks
  function createTimerItem() {
    const timerItem = document.createElement('div');
    timerItem.classList.add('mt-3', 'align-self-center', 'bg-light', 'p-3');
    timerItem.innerHTML = '1:00';
    return timerItem;
  }

  function startGame() {
    if (gameboard) {
      resetGame(); // we need to reset the game if there are cards on the page
    }

    // after resetting we create timer and cards again
    const gameControl = document.getElementById('game-control');
    timerDisplay = createTimerItem();
    gameControl.append(timerDisplay);
    createGame(vertical.value, horizontal.value);

    // leaving fields empty so the user won't have to empty them
    vertical.value = "";
    horizontal.value = "";

  };

  // function for resetting game parameters if the game has already started
  function resetGame() {
    // if a first move has been made (first ever card was flipped) we need to reset the timer
    // and other parameters that are changed on the very first card flip in the game
    if (firstMove) {
      clearInterval(timer);
      resetMove();
      firstMove = false;
      foundPairs = 0;
    };

    // standard actions no matter if the first move was made or not
    gameboard.remove();
    gameboard = null;
    timerDisplay.remove();
    timerDisplay = null;
    // empty the arrays with cards!!
    cardsArray = [];
    frontFace = [];
  }

  // function that creates cards based on what number the user provided
  function createGame(vertical, horizontal) {
    pairs = (vertical * horizontal) / 2;
    const container = document.getElementById('main-container');
    gameboard = document.createElement('section'); //game container that will hold the cards
    gameboard.classList.add('container', 'justify-content-between', 'cards-game-section');
    container.append(gameboard);

    // change flex-basis property depending on the number of cards across
    // so that one row has the required number of cards
    const flexBasis = Math.floor(100 / horizontal);

    // an array holding cards position
    const cardPos = [];
    for (let pos = 1; pos <= pairs * 2; pos++) {
      cardPos.push(pos);
    };

    // shuffle position numbers
    const shuffledPos = shuffleCards(cardPos);

    //array of numbers that will be added to the cards
    const cardNumbers = [];
    for (let num = 1; num <= pairs; num++) {
      cardNumbers.push(num);
    };


    for (let cards = 0; cards < pairs * 2; cards++) {
      const card = document.createElement('div');
      card.classList.add('card', 'card-wrapper');

      const back = document.createElement('div');
      back.classList.add('backface', 'card', 'bg-primary');

      const front = document.createElement('div');
      front.classList.add('frontface', 'card', 'bg-light', 'align-items-center', 'justify-content-center');
      frontFace.push(front);

      card.append(back, front);
      cardsArray.push(card);
    }

    //each card needs a position and an event listener
    cardsArray.forEach(card => {
      gameboard.append(card);
      card.style.flexBasis = `${flexBasis}%`;
      card.style.order = shuffledPos[cardsArray.indexOf(card)];
      card.addEventListener('click', flip);
    });

    frontFace.forEach(front => {
      let cardNum = document.createElement('div');
      cardNum.style.fontSize = `${flexBasis*1.5}px`;
      front.append(cardNum);
      cardNum.textContent = cardNumbers[frontFace.indexOf(front) % cardNumbers.length];
    })
  }

  // function for shuffling position numbers
  function shuffleCards(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const swapIndex = Math.floor(Math.random() * (i + 1));
      const currentCard = array[i];
      const cardToSwap = array[swapIndex];
      array[i] = cardToSwap;
      array[swapIndex] = currentCard;
    }
    return array;
  };

  function flip() {
    if (firstCard && secondCard) return

    if (!firstMove) { // first move, start timer
      firstMove = true;
      seconds = 60;
      timer = setInterval(tick, 1000);
    }
    if (this === firstCard) return;
    this.classList.add('flip');
    if (!flipped) {
      firstCard = this;
      flipped = true;
      return;
    }

    secondCard = this;

    checkMatch();
  }

  // how the timer works
  function tick() {
    seconds--;
    if (seconds >= 0) {
      timerDisplay.innerHTML = seconds;
    } else {
      clearInterval(timer);
      if (foundPairs !== pairs) {
        // if not all pairs are found we need to remove event listeners
        cardsArray.forEach(card => card.removeEventListener('click', flip));
        const playAgain = confirm('You lost :(\nGive it one more try?');
        if (playAgain) {
          resetGame();
        };
      };
    };
  };

  // check if the cards match
  function checkMatch() {
    let match = firstCard.lastChild.textContent === secondCard.lastChild.textContent;
    match ? freezeCards() : unflip();
  }

  function freezeCards() {
    firstCard.removeEventListener('click', flip);
    secondCard.removeEventListener('click', flip);
    resetMove();
    foundPairs++; // increase the counter of found pairs
    if (foundPairs === pairs) {
      clearInterval(timer); // stop timer if all pairs are found
      setTimeout(() => {
        const playAgain = confirm('Congratulations! You found all pairs. Play again?');
        if (playAgain) {
          resetGame();
        }
      }, 1000);
    }
  }

  // reset first and second cards values to add new values on next move
  function resetMove() {
    firstCard = null;
    secondCard = null;
    flipped = false;
  }

  // unflip cards if they don't match
  function unflip() {
    setTimeout(() => {
      firstCard.classList.remove('flip');
      secondCard.classList.remove('flip');
      resetMove();
    }, 1000)
  }
}))
()
