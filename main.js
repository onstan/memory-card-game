(() => document.addEventListener('DOMContentLoaded', () => {
  const vertical = document.getElementById('vertical-number');
  const horizontal = document.getElementById('horizontal-number');
  const startButton = document.getElementById('start-btn'); // по клику на странице появится нужное к-во карточек

  let pairs;
  let timerDisplay;
  let seconds;
  let timer;

  let flipped = false; // пользователь ещё не перевернул ни одной карты
  let firstCard, secondCard; // первая и вторая открытые карточки

  let gameboard;
  let foundPairs = 0;
  let firstMove = false; // пользователь еще не начал игру (эта переменная позволит запустить таймер)

  let cardsArray = []; // массив карточек
  let frontFace = []; // массив лицевых сторон карточек, на которых будет написано число

  // добавляем слушатели на поля ввода, чтобы можно было вводить только четные числа
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

  // добавляем слушатель на кнопку, котрая запустит игру
  startButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (vertical.value === "" || horizontal.value === "") return //игра не начнется если поля с числами пустые
    if (vertical.value % 2 !== 0 || horizontal.value % 2 !== 0) return //игра не начнется если пользователь успел
    //ввести нечетные числа
    if ((horizontal.value > 10 || horizontal.value < 2) || (vertical.value > 10 || vertical.value < 2)) return
    // игра не начнется если пользователь успел ввести число вне указанного диапазона
    else startGame();
  });

  // внешний вид таймера
  function createTimerItem() {
    const timerItem = document.createElement('div');
    timerItem.classList.add('mt-3', 'align-self-center', 'bg-light', 'p-3');
    timerItem.innerHTML = '1:00';
    return timerItem;
  }

  function startGame() {
    if (gameboard) {
      resetGame(); // если на экране уже есть карточки, необходимо сбросить игру
    }

    // после сброса создаем заново таймер и необходимое число карточек
    const gameControl = document.getElementById('game-control');
    timerDisplay = createTimerItem();
    gameControl.append(timerDisplay);
    createGame(vertical.value, horizontal.value);

    // оставляем поля ввода чисел пустыми чтобы не стирать вручную
    vertical.value = "";
    horizontal.value = "";

  };

  // функция для сброса параметров игры если она уже была запущена
  function resetGame() {
    // если уже был совершен первый ход необходимо сбросить таймер и другие параметры, которые изменяются по первому клику
    if (firstMove) {
      clearInterval(timer);
      resetMove();
      firstMove = false;
      foundPairs = 0;
    };

    // стандартные действия вне зависимости от того был первый ход или нет
    gameboard.remove();
    gameboard = null;
    timerDisplay.remove();
    timerDisplay = null;
    cardsArray = []; // обязательно очищаем массивы с карточками
    frontFace = [];
  }

  // пишем функцию, которая создаст карточки с учетом количества по вертикали и горизонтали
  function createGame(vertical, horizontal) {
    pairs = (vertical * horizontal) / 2;
    const container = document.getElementById('main-container');
    gameboard = document.createElement('section'); //контейнер игры, внутри которого
    //будут располагаться карточки
    gameboard.classList.add('container', 'justify-content-between', 'cards-game-section');
    container.append(gameboard);

    // в зависимости от того сколько карточек по горизонтали меняем свойство flex-basis,
    // чтобы в ряду было необходимое к-во карточек
    const flexBasis = Math.floor(100 / horizontal);

    // массив с позициями карточек
    const cardPos = [];
    for (let pos = 1; pos <= pairs * 2; pos++) {
      cardPos.push(pos);
    };

    // перемешанные позиции
    const shuffledPos = shuffleCards(cardPos);

    //массив с числами которые нужно добавить внутрь карточек
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

    // каждой карточке присваивается позиция из пермешанного массива и добавляется слушатель
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

  // функция для пермешивания позиций
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

    if (!firstMove) { // первый ход, запускаем таймер
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

  // таймер
  function tick() {
    seconds--;
    if (seconds >= 0) {
      timerDisplay.innerHTML = seconds;
    } else {
      clearInterval(timer);
      if (foundPairs !== pairs) {
        // если найдены не все пары а таймер закончился необходимо убрать слушатели у карточек
        cardsArray.forEach(card => card.removeEventListener('click', flip));
        const playAgain = confirm('Вы проиграли :(\nХотите сыграть ещё?');
        if (playAgain) {
          resetGame();
        };
      };
    };
  };

  // проверяем совпадение карточек
  function checkMatch() {
    let match = firstCard.lastChild.textContent === secondCard.lastChild.textContent;
    match ? freezeCards() : unflip();
  }

  function freezeCards() {
    firstCard.removeEventListener('click', flip);
    secondCard.removeEventListener('click', flip);
    resetMove();
    foundPairs++; // увеличиваем счетчик найденных пар
    if (foundPairs === pairs) {
      clearInterval(timer); // если все пары найдены останавливаем таймер
      setTimeout(() => {
        const playAgain = confirm('Поздравляем! Вы нашли все пары. Сыграть ещё раз?');
        if (playAgain) {
          resetGame();
        }
      }, 1000);
    }
  }

  // сбрасываем значения 1 и 2 карточек, чтобы при следующем ходе записать в них новые значения
  function resetMove() {
    firstCard = null;
    secondCard = null;
    flipped = false;
  }

  // переворачиваем карточки обратно если не совпадают
  function unflip() {
    setTimeout(() => {
      firstCard.classList.remove('flip');
      secondCard.classList.remove('flip');
      resetMove();
    }, 1000)
  }
}))
()
