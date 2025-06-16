const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const commands = [
"faster", "Faster.",
"slower", "Slower.", "more", "More.", "less", "Less."/* … */,
];
const grammar = `#JSGF V1.0; grammar commands; public <command> = ${commands.join(
" | ",
)};`;

const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();

speechRecognitionList.addFromString(grammar, 1);

recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;


//speech results
recognition.onresult = (event) => {
    const command = event.results[event.results.length-1][0].transcript;

  // alert(command)
    if (command.toLowerCase().includes("faster"))
        SorterGame.IncreaseSpeed();
    else if  (command.toLowerCase().includes("slower"))
        SorterGame.DecreaseSpeed();
    else if (command.toLowerCase().includes("more"))
        SorterGame.IncreaseDensity();
    else if (command.toLowerCase().includes("less"))
        SorterGame.DecreaseDensity();
    else
        console.log(`Unrecognized command: ${command}`);


    //console.log(`Confidence: ${event.results[0][0].confidence}`);
  };

  recognition.onspeechend = () => {
    recognition.stop();
  };
