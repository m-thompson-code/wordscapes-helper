const fs = require('fs');
const lineByLine = require('n-readlines');

const liner = new lineByLine('words_alpha.txt');

let line;

let wordCount = 0;

const map = {};

const words = [];

 
while (line = liner.next()) {
    let word = line.toString('ascii');

    if (word.charAt(word.length - 1) === '\r') {
        word = word.slice(0, word.length - 1);
    }

    const exceptions = [
        'pssh',
        'shh',
        'cwm',
        'crwth',
        'hmm',
    ];

    if (!exceptions.includes(word)) {
        const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];

        let hasVowel = false;

        for (const vowel of vowels) {
            if (word.includes(vowel)) {
                hasVowel = true;
                break;
            }
        }

        if (!hasVowel) {
            continue;
        }
    }
    
    if (!word || word.length < 3 || word.length > 8) {
        continue;
    }

    words.push(word.toLowerCase());

    wordCount += 1;
}

// Fill in for words_alpha.txt
words.push('duh');
words.push('blog');
words.push('mega');
words.push('carb');
words.push('camo');
words.push('repo');
words.push('rehab');
words.push('merlot');

// console.log(JSON.stringify(map, null, 4));
console.log(wordCount);
fs.writeFileSync('words.json', JSON.stringify(words));
console.log("Done");
