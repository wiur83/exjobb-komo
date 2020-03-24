const btn = document.querySelector(".talk");
const content = document.querySelector(".content");

// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onstart = function() {
    console.log("voice is active YO!");
};

recognition.onresult = function(event) {
    const current = event.resultIndex;

    const transcript = event.results[current][0].transcript;

    content.textContent = transcript;
    console.log(transcript);
};

//Add listner to btn
btn.addEventListener("click", () => {
    recognition.start();
});
