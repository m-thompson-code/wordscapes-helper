// let words = [
//     'apple',
//     'app',
//     'lap',
//     'pal',
//     'ale',
//     'pale',
// ];
const words = require('./words.json');

module.exports = {
    getPossbileWords: (letters) => {
        const filteredWords = [];

        if (!letters) {
            return [];
        }

        for (const word of words) {
            const filterAry = [];

            for (let i = 0; i < letters.length; i++) {
                const filterMap = {
                    letter: letters.charAt(i),
                    found : false,
                };

                filterAry.push(filterMap);
            }

            // let lettersFound = 0;
            let skip = false;

            for (let i = 0; i < word.length; i++) {
                const letter = word.charAt(i);

                skip = true;

                for (const filterMap of filterAry) {
                    if (filterMap.found) {
                        continue;
                    }

                    if (filterMap.letter === letter) {
                        filterMap.found = true;
                        skip = false;
                        break;
                    }
                }

                if (skip) {
                    break;
                }
            }

            if (skip) {
                continue;
            }

            filteredWords.push(word);
        }

        filteredWords.sort(function(a, b){
            // ASC  -> a.length - b.length
            // DESC -> b.length - a.length
            return b.length - a.length;
        });

        return filteredWords;
    }
}
