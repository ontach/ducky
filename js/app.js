document.addEventListener("DOMContentLoaded", function () {
  var score = 0;
  var timeLeft = 60;
  var gameEnded = false;
  var geesePercentage = 5;
  var bombsPercentage = 20;
  var minBombs = 1;
  var maxBombs = 5;
  var breadChance = 10;
  var breadActive = false;
  var scoreMultiplier = 1;
  var lastBombTime = 0;

  var timeInput = document.getElementById("time");
  var pointsInput = document.getElementById("points");
  var geesePercentageInput = document.getElementById("geesePercentage");
  var breadChanceInput = document.getElementById("breadChance");
  var bombsPercentageInput = document.getElementById("bombsPercentage");
  var minBombsInput = document.getElementById("minBombs");
  var maxBombsInput = document.getElementById("maxBombs");
  var startButton = document.getElementById("start-button");
  var themeToggle = document.getElementById("theme-toggle");
  var themeStylesheet = document.getElementById("theme-stylesheet");
  var gameContainer = document.querySelector(".game-container");
  var menuContainer = document.querySelector(".menu-container");
  var scoreDisplay = document.getElementById("score");
  var timerDisplay = document.getElementById("timer");
  var messageBox = document.getElementById("message");

  var customFont = new FontFace("CustomFont", "url(path/to/custom-font.woff)");
  customFont.load().then(function (loadedFont) {
    document.fonts.add(loadedFont);
  });

  var restartButton = document.createElement("button");
  restartButton.id = "restart-button";
  restartButton.className = "menu-button";
  restartButton.textContent = "Restart";

  function randomPosition() {
    var maxX = window.innerWidth - 100;
    var maxY = window.innerHeight - 100;
    var x = Math.random() * maxX;
    var y = Math.random() * maxY;
    return { x: x, y: y };
  }

  function updateScore() {
    scoreDisplay.textContent = "Punkty: " + score;
  }

  function updateTimer() {
    timerDisplay.textContent = "Czas: " + timeLeft;
  }

  function showGameOver(message) {
    gameEnded = true;
    messageBox.style.display = "block";
    messageBox.style.color = "red";
    messageBox.innerHTML =
      '<div class="message-content"><img src="../img/zaslona.jpg" alt="Zasłona"><h1>' +
      message +
      "</h1></div>";
    messageBox.appendChild(restartButton);
    restartButton.addEventListener("click", restartGame);
  }

  function spawnDuck() {
    if (gameEnded) {
      return;
    }

    var position = randomPosition();
    var duck = document.createElement("div");
    duck.className = "duck";
    duck.textContent = "🦆";
    duck.style.left = position.x + "px";
    duck.style.top = position.y + "px";

    var random = Math.random();
    if (random < geesePercentage / 100) {
      duck.textContent = "🦢";
    }

    duck.addEventListener("click", function (event) {
      if (!gameEnded) {
        var duck = this;
        if (duck.textContent === "🦆") {
          setTimeout(function () {
            duck.remove();
            score += 1 * scoreMultiplier;
            updateScore();
            if (score >= parseInt(pointsInput.value, 10)) {
              setHighScore(score); // Zapisz najlepszy wynik w plikach cookies
              showGameOver("WYGRAŁEŚ");
            }
          }, 300);
        } else if (duck.textContent === "🦢") {
          duck.remove();
          score += 2 * scoreMultiplier;
          updateScore();
        }
        event.stopPropagation();
        spawnDuck();
      }
    });

    gameContainer.appendChild(duck);
  }

  function spawnBomb() {
    if (gameEnded) {
      return;
    }

    var position = randomPosition();
    var bomb = document.createElement("div");
    bomb.className = "bomb";
    bomb.textContent = "💣";
    bomb.style.left = position.x + "px";
    bomb.style.top = position.y + "px";

    bomb.addEventListener("click", function (event) {
      if (!gameEnded) {
        bomb.remove();
        score -= 5;
        if (score < 0) {
          score = 0;
        }
        updateScore();
      }
      event.stopPropagation();
    });

    gameContainer.appendChild(bomb);

    // Losowa prędkość i kierunek ruchu
    var velocityX = (Math.random() - 0.5) * 6; // Prędkość pozioma (-3 do 3 px/s)
    var velocityY = (Math.random() - 0.5) * 6; // Prędkość pionowa (-3 do 3 px/s)

    // Aktualizacja pozycji bomby w interwałach co 50 ms
    var interval = setInterval(function () {
      if (!gameEnded) {
        position.x += velocityX;
        position.y += velocityY;
        bomb.style.left = position.x + "px";
        bomb.style.top = position.y + "px";

        // Sprawdź, czy bomba wyszła poza ekran lub minęło 5 sekund
        if (
          position.x < -50 ||
          position.x > window.innerWidth ||
          position.y < -50 ||
          position.y > window.innerHeight
        ) {
          clearInterval(interval); // Zatrzymaj interwał
          bomb.remove(); // Usuń bombę
        }
      }
    }, 50);

    // Usuń bombę po 5 sekundach
    setTimeout(function () {
      if (!gameEnded) {
        clearInterval(interval); // Zatrzymaj interwał przed usunięciem bomby
        bomb.remove(); // Usuń bombę
      }
    }, 5000);
  }

  function generateRandomBombs() {
    if (gameEnded) {
      return;
    }

    var currentTime = new Date().getTime();
    var timeSinceLastBomb = (currentTime - lastBombTime) / 1000;

    if (timeSinceLastBomb >= 5 && Math.random() < bombsPercentage / 100) {
      var numBombsToSpawn =
        Math.floor(Math.random() * (maxBombs - minBombs + 1)) + minBombs;
      for (var i = 0; i < numBombsToSpawn; i++) {
        spawnBomb();
      }
      lastBombTime = currentTime;
    }

    var random = Math.random();
    if (random < breadChance) {
      spawnBread();
    }

    setTimeout(generateRandomBombs, 3000);
  }

  function spawnBread() {
    if (gameEnded || breadActive) {
      return;
    }

    var position = randomPosition();
    var bread = document.createElement("div");
    bread.className = "bread";
    bread.textContent = "🍞";
    bread.style.left = position.x + "px";
    bread.style.top = position.y + "px";

    bread.addEventListener("click", function (event) {
      if (!gameEnded) {
        breadActive = true;
        bread.remove();
        scoreMultiplier = 2;
        updateScore();
        var timer = 5;
        var timerInterval = setInterval(function () {
          if (timer > 0) {
            timerDisplay.textContent = "🕒 " + timer;
            timer -= 1;
          } else {
            clearInterval(timerInterval);
            timerDisplay.textContent = "";
            scoreMultiplier = 1;
            breadActive = false;
          }
        }, 1000);
      }
      event.stopPropagation();
    });

    gameContainer.appendChild(bread);

    setTimeout(function () {
      if (!gameEnded && breadActive === false) {
        bread.remove();
      }
    }, 10000);
  }

  function countdown() {
    if (timeLeft > 0 && !gameEnded) {
      timeLeft -= 1;
      updateTimer();
      setTimeout(countdown, 1000);
    } else if (!gameEnded && score < parseInt(pointsInput.value, 10)) {
      showGameOver("PRZEGRAŁEŚ");
    }
  }

  function restartGame() {
    timeLeft = parseInt(timeInput.value, 10);
    score = 0;
    updateTimer();
    updateScore();
    geesePercentage = parseInt(geesePercentageInput.value, 10);
    bombsPercentage = parseInt(bombsPercentageInput.value, 10);
    minBombs = parseInt(minBombsInput.value, 10);
    maxBombs = parseInt(maxBombsInput.value, 10);
    breadActive = false;
    scoreMultiplier = 1;
    lastBombTime = 0;
    gameEnded = false;
    messageBox.style.display = "none";
    gameContainer.style.display = "block";
    spawnDuck();
    generateRandomBombs();
    countdown();
  }

  startButton.addEventListener("click", function () {
    restartGame();
    menuContainer.style.display = "none";
  });
});
