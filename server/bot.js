console.clear();

/*

!!!!!

For MAC this project won't work due a bug found in iohook:
https://github.com/wilix-team/iohook/issues/124#issuecomment-513026388

The link above shows how to fix the problem.

Steps:

1. clone iohook: git clone https://github.com/wilix-team/iohook.git iohook
2. find file: iohook/libuiohook/src/darwin/input_nook.c
3. Comment out line 380: (*dispatch_sync_f_f)(dispatch_main_queue_s, tis_message, &keycode_to_lookup); (source: https://github.com/wilix-team/iohook/blob/master/libuiohook/src/darwin/input_hook.c#L380)
4. install cmake: brew install cmake // Wasn't included on my platform
5. (optional?) install cmake-js globally: npm install -g cmake-js // Wasn't included on my platform, this step might not be needed
6. install automake: brew install automake // source: https://github.com/kwhat/uiohook/issues/43#issuecomment-475479906
7. install autoconf: brew install autoconf // source: https://github.com/kwhat/uiohook/issues/43#issuecomment-475479906
7. install libtool: brew install libtool // source: https://github.com/kwhat/uiohook/issues/43#issuecomment-475479906
7. install pkg-config: brew install pkg-config // source: https://github.com/kwhat/uiohook/issues/43#issuecomment-475479906
4. Build iohook: npx cmake-js compile -r node -v x.x.x // Where x.x.x is your current node version
5. Move build (build/Release/iohook.node) to <your_real_project>/node_modules/iohook/builds/<node-v folders>/iohook.node (replace it)

*/

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
    console.log(event);
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
