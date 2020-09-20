console.clear();

var robot = require("robotjs");
const ioHook = require('iohook');
const wordsGenerator = require('./get-list-of-words');

let recordingMode = false;
let letterPositionFound = false;
let letterValueFound = false;

let botMode = false;

let letterMetadatas = [];

let currentLetterMetadata = {
    x: 0,
    y: 0,
    letter: '',
};

let resetPointFound = false;

console.log(" ~ Ctrl + C or Ctrl + Q to quit server");
console.log(" ~ Click in the center of the letters. This will act as a reset point");

ioHook.on('mouseclick', event => {
    if (!resetPointFound) {
        resetPointFound = true;
        resetX = event.x;
        resetY = event.y;
        console.log(event);
        console.log(" ~ 1 to record letters. 2 to start bot");
    }

    if (!recordingMode) {
        return;
    }

    // console.log(event);

    currentLetterMetadata.x = event.x;
    currentLetterMetadata.y = event.y;

    letterPositionFound = true;
    console.log(" ~ Waiting for keypress for letter value...");
});

ioHook.on('keydown', event => {
    if (event.ctrlKey && (event.rawcode === 81 || event.rawcode === 67)) {
        console.log(" ~ Terminating");
        process.exit();
    }

    // console.log(event);

    if (!resetPointFound) {
        return;
    }
    
    if (event.rawcode === 49) {
        console.clear();
        toggleRecordMode();
    }

    if (event.rawcode === 50) {
        console.clear();
        toggleBotMode();
    }

    if (!recordingMode) {
        return;
    }

    if (!letterPositionFound) {
        return;
    }

    if (event.ctrlKey) {
        return;
    }

    // console.log(String.fromCharCode(event.rawcode));
    currentLetterMetadata.letter = String.fromCharCode(event.rawcode).toLowerCase();

    letterPositionFound = false;

    letterMetadatas.push(currentLetterMetadata);
    currentLetterMetadata = {
        x: 0,
        y: 0,
        letter: '',
    };
    console.log(letterMetadatas);
    console.log(" ~ Waiting for mouse click for letter position...");
});

let words = [];

let timeout;

const toggleBotMode = () => {
    if (botMode) {
        console.log(" ~ BotMode: OFF");
        if (mouseDown) {
            robot.mouseToggle("up");
            mouseDown = false;
        }
        clearTimeout(timeout);
        botMode = false;
        return;
    }

    let filter = '';

    for (const _l of letterMetadatas) {
        filter += _l.letter;
    }

    if (recordingMode) {
        toggleRecordMode();
    }

    if (!/^[a-z]+$/.test(filter)) {
        console.log(` ~ letters contain something that isn't a lowercase letter: ${filter}`);
        return;
    }

    console.log(` ~ BOT MODE: ON - ${filter}`);
    botMode = true;

    words = wordsGenerator.getPossbileWords(filter);
    console.log(words);

    handleWord();
}

const toggleRecordMode = () => {
    if (recordingMode) {
        console.log(" ~ RecordMode: OFF");
        recordingMode = false;
        return;
    }

    if (botMode) {
        toggleBotMode();
    }

    console.log(" ~ RecordMode: ON");
    recordingMode = true;

    letterMetadatas = [];

    console.log(" ~ Click the position of a letter, then press that letter on the keyboard. Press Ctrl + R to stop recording or press Ctrl + S to stop recording and run bot");
    console.log(" ~ Waiting for mouse click for letter position...");
}

// Register and start hook
ioHook.start();

let mouseDown = false;

let usedLetterMetadatas = [];

const handleWord = () => {
    const currentWord = words.shift();

    if (!currentWord) {
        console.log(" ~ BOT: FINISHED");
        if (botMode) {
            toggleBotMode();
        }
        return;
    }

    console.log(" ~ BOT:", currentWord);

    const ary = currentWord.split('');

    usedLetterMetadatas = [];

    handleLetter(ary);
}

const delay = 30;

const handleLetter = (letters) => {
    const letter = letters.shift();

    let _l;

    for (const letterMetadata of letterMetadatas) {
        if (usedLetterMetadatas.includes(letterMetadata)) {
            continue;
        }

        if (letterMetadata.letter === letter) {
            _l = letterMetadata;
            usedLetterMetadatas.push(letterMetadata);
            break;
        }
    }

    if (!mouseDown) {
        robot.moveMouse(_l.x, _l.y);
    } else {
        robot.dragMouse(_l.x, _l.y);
    }

    if (!mouseDown) {
        robot.mouseToggle("down");
        mouseDown = true;
    }

    if (!letters.length) {
        if (mouseDown) {
            robot.mouseToggle("up");
            mouseDown = false;
        }
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        if (letters.length) {
            resetPosition(letters);
        } else {
            handleWord();
        }
    }, delay);
}

const resetPosition = (letters) => {
    robot.moveMouse(resetX, resetY);

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        if (letters.length) {
            handleLetter(letters);
        } else {
            handleWord();
        }
    }, delay);
}
