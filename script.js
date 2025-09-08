
// document is the JavaScript object that represents your whole webpage (HTML), and lets you find or change things on it.
const cells = document.querySelectorAll(".cell");//This returns a list (NodeList) of all the elements with class cell.
const statusText = document.getElementById("status");//getElementById=>Finds only ONE element by its unique id.
const resetBtn = document.getElementById("reset");
const micBtn = document.getElementById("micBtn");

let currentPlayer = "X";//Game always starts with Player X.
let board = ["", "", "", "", "", "", "", "", ""];//This is an array with 9 empty strings.Each spot in the array represents one square on the tic-tac-toe board.
let gameActive = true;//true → game is still going.false → someone won or it’s a draw, so no more moves allowed.
let recognition; 
let listening = false;//Keeps track if the mic is currently listening or not.false at the start → because we don’t want the game to listen immediately.When you click the mic button, it changes to true.

/* 🔊 Load sounds */
// new Audio("path")
// Audio is a built-in JavaScript object.
// It loads a sound file from the path you give it.

//Just call .play() whenever needed.such as clickSound.play()
const clickSound = new Audio("sounds/click.mp3");
const winSound = new Audio("sounds/win.mp3");
const drawSound = new Audio("sounds/draw.mp3");


//win patterns
const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],  //top_row,middle_row,bottom_row
  [0, 3, 6], [1, 4, 7], [2, 5, 8],  //left_column,middle_clo,right_col
  [0, 4, 8], [2, 4, 6]              //[0, 4, 8] → From top-left to bottom-right,[2, 4, 6] → From top-right to bottom-left
];

/* ---------- Speech Synthesis ---------- */
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  speechSynthesis.speak(utterance);
}

/* ---------- Game Logic ---------- */
function checkWinner() {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      statusText.textContent = `🎉 Player ${board[a]} wins!`;
      speak(`Player ${board[a]} wins!`);
      winSound.play();
      gameActive = false;
      return true;
    }
  }

  if (!board.includes("")) {
    statusText.textContent = "It's a Draw! 🤝";
    speak("It's a draw!");
    drawSound.play();
    gameActive = false;
    return true;
  }
  return false;
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (board[index] !== "" || !gameActive) return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;

  /* 🎨 Different colors */
  e.target.style.color = currentPlayer === "X" ? "#ff4c4c" : "#4da6ff";
  e.target.classList.add("taken");

  /* 🔊 Play click sound */
  clickSound.play();

  if (!checkWinner()) {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s turn`;
    speak(`Player ${currentPlayer}'s turn`);
  }
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  statusText.textContent = "Player X's turn";
  speak("New game started. Player X's turn");
  cells.forEach(cell => {
    cell.textContent = "";
    cell.style.color = "white";
    cell.classList.remove("taken");
  });
}

/* ---------- Speech Recognition ---------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log("Voice Command:", transcript);

    if (transcript.includes("reset")) {
      resetGame();
      return;
    }

    /* Expanded mapping for middle positions */
    const mapping = {
      "top left": 0, "top center": 1, "top middle": 1, "top right": 2,
      "middle left": 3, "left middle": 3, "center": 4, "middle": 4, "middle center": 4,
      "middle right": 5, "right middle": 5,
      "bottom left": 6, "bottom center": 7, "bottom middle": 7, "bottom right": 8
    };

    for (let key in mapping) {
      if (transcript.includes(key)) {
        const index = mapping[key];
        if (board[index] === "" && gameActive) {
          cells[index].click();
        } else {
          speak("Invalid move");
        }
      }
    }
  };
}

/* ---------- Toggle Mic ---------- */
micBtn.addEventListener("click", () => {
  if (!recognition) {
    alert("Speech Recognition not supported in this browser. Use Google Chrome.");
    return;
  }

  if (!listening) {
    recognition.start();
    listening = true;
    micBtn.classList.remove("inactive");
    micBtn.classList.add("active");
    micBtn.textContent = "🎤 Listening...";
    speak("Voice control enabled. Say a move like top left, center, or reset game.");
  } else {
    recognition.stop();
    listening = false;
    micBtn.classList.remove("active");
    micBtn.classList.add("inactive");
    micBtn.textContent = "🎤 Enable Voice";
    speak("Voice control disabled.");
  }
});

cells.forEach(cell => cell.addEventListener("click", handleClick));
resetBtn.addEventListener("click", resetGame);
