let words = [];
let currentIndex = 0;
let currentWord = "";
let pauseTime = 2000; // Default 2 seconds
let correct = 0
let wrong = 0
let wrongWords = []

async function startPractice() {

    const inputWords = document.getElementById("words").value.trim();
    if (!inputWords) {
        alert("Please enter words to practice.");
        return;
    }

    const OverlayElement = document.querySelector(".overlay")
    const HiddenLogo = document.querySelector(".hidden_logo")

    OverlayElement.style.visibility = "visible"
    HiddenLogo.style.visibility = "visible"


    words = inputWords.split(",").map(word => word.trim().toLowerCase());
    pauseTime = parseInt(document.getElementById("pause").value) * 1000; // Convert to ms
    currentIndex = 0;

    // document.getElementById("message").textContent = "Listen carefully...";
    document.getElementById("answer").disabled = false;
    document.getElementById("answer").focus();
    document.querySelector("button[onclick='checkAnswer()']").disabled = false;

    playWord();
}

async function playWord() {

    currentWord = words[currentIndex];
    const selectedVoice = 'Joanna';

    document.getElementById("answer").disabled = true;
    document.querySelector("button[onclick='checkAnswer()']").disabled = true;

    const response = await fetch("http://localhost:3000/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: currentWord, voice: selectedVoice })
    });

    const data = await response.json();
    if (data.error) {
        alert("Error generating speech.");
        return;
    }

    const audio = new Audio(data.url);
    audio.play();

    audio.onended = () => {
        document.getElementById("answer").disabled = false;
        document.querySelector("button[onclick='checkAnswer()']").disabled = false;
        document.getElementById("answer").focus();
    };
}

function checkAnswer() {
    const userAnswer = document.getElementById("answer").value.trim().toLowerCase();
    if (userAnswer === currentWord) {
        document.getElementById("answer").style.borderColor = "#218838";
        correct++
    } else {
        document.getElementById("answer").style.borderColor = "#C82333";
        wrong++
        wrongWords.push(currentWord)

    }

    setTimeout(() => {
        document.getElementById("answer").style.borderColor = "";
    }, 1000);

    document.getElementById("answer").value = "";
    currentIndex++;

    if (currentIndex >= words.length) {
        const OverlayElement = document.querySelector(".overlay")
        const HiddenLogo = document.querySelector(".hidden_logo")
        const PerformanceStat = document.querySelector(".performance_stat");
        const correctAnswer = document.querySelector(".correct");
        const wrongAnswer = document.querySelector(".wrong");
        const wrongAnswerNumber = document.querySelector(".wrongAnsNumber");
        const wrongAnswerCard = document.querySelector(".wrongAnswerCard");

        HiddenLogo.style.visibility = "hidden"

        document.getElementById("answer").disabled = true;
        document.querySelector("button[onclick='checkAnswer()']").disabled = true;
        PerformanceStat.style.visibility = "visible";

        correctAnswer.textContent = correct
        wrongAnswer.textContent = wrong
        wrongAnswerNumber.textContent = wrong

        if(wrong){
            wrongAnswerCard.style.visibility = "visible"
        }

        // Hide performance_stat after 2 seconds
        setTimeout(() => {
            PerformanceStat.style.visibility = "hidden";
            OverlayElement.style.visibility = "hidden"
            correct = 0
            wrong = 0
        }, 6000);

        return;
    }
    setTimeout(playWord, pauseTime);

}

function checkAnswerOnEnter(event) {
    if (event.key === "Enter") {
        checkAnswer();
    }
}



// Function to fetch words from the API
async function fetchWords(subject) {
    try {
        const response = await fetch(`/api/words/${subject}`);
        if (!response.ok) {
            throw new Error('Subject not found');
        }
        const wordList = await response.json();
        displayWords(wordList);
    } catch (error) {
        alert(error.message);
    }
}

// Function to display words in the textarea
function displayWords(words) {
    const textarea = document.getElementById("words");
    textarea.value = words.join(", ");
}


function showWords(subject) {
    fetchWords(subject);
}

const PracticeAgain = () => {
    const textarea = document.getElementById("words");
    const wrongAnswerCard = document.querySelector(".wrongAnswerCard");

    if (wrongWords.length > 0) {
        textarea.value = wrongWords.join(", ");
        if(textarea.value != ""){
            wrongWords = [];
        }
    }
    wrongAnswerCard.style.visibility = "hidden"
    startPractice()
};





// const PracticeAgain = () => {
//     const textarea = document.getElementById("words")
//     textarea.value = wrongWords.join(", ")

//     wrongWords = []
// }

