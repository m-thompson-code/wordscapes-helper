import { Component } from '@angular/core';

import * as words from './words.json';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public words: string[] = [];

    public filteredWords: string[] = [];

    public sortedFilteredWords: {
        [len: number]: string[],
    } = {};
    public _sortedFilteredWords: {
        [len: number]: string[],
    } = {};

    public min: number = 0;
    public max: number = 0;
    public lengths: number[] = [];
    public filterValues: {
        [len: number]: string[];
    } = {};
    public filterIndexes: {
        [len: number]: number[];
    } = {};

    public filter?: string;
    private _filterTimeout?: number;

    constructor() {

    }

    public ngOnInit(): void {
        this.min = 3;
        this.max = 8;
        
        for (let i = this.min; i < this.max + 1; i++) {
            this.lengths.unshift(i);
            this.filterValues[i] = [];
            this.filterIndexes[i] = [];

            for (let j = 0; j < i; j++) {
                this.filterValues[i].push('');
                this.filterIndexes[i].push(j);
            }
        }

        const _w = words as any;
        this.words =_w?.default ||_w || [];
        this.getFilterWords();
    }

    public getFilterWords(): void {
        this.filteredWords = [];

        this.sortedFilteredWords = {};
        this._sortedFilteredWords = {};

        for (let i = this.min; i < this.max + 1; i++) {
            this.sortedFilteredWords[i] = [];
            this._sortedFilteredWords[i] = [];
        }

        if (!this.filter) {
            return;
        }

        for (const word of this.words) {
            const filterAry = [];

            for (let i = 0; i < this.filter.length; i++) {
                const filterMap: {
                    letter: string;
                    found: boolean;
                } = {
                    letter: this.filter.charAt(i),
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

            this.filteredWords.push(word);
        }
        
        for (const word of this.filteredWords) {
            // this.sortedFilteredWords[word.length].push(word);
            this._sortedFilteredWords[word.length].push(word);
        }
        
        for (let len = this.min; len < this.max + 1; len++) {
            
            for (const word of this._sortedFilteredWords[len]) {
                let skip = false;

                for (let i = 0;  i < this.filterValues[len].length; i++) {
                    const filterLetter = this.filterValues[len][i];

                    if (!filterLetter) {
                        continue;
                    }

                    if (word.charAt(i) !== filterLetter) {
                        skip = true;
                        break;
                    }
                }

                if (skip) {
                    continue;
                }

                this.sortedFilteredWords[len].push(word);
            }
        }
    }

    public handleInput(len: number, index: number, event: any): void {
        console.log(event);
        const _t: string = event.target.value;

        if (!_t) {
            this.filterValues[len][index] = "";
        } else {
            this.filterValues[len][index] = _t.charAt(_t.length - 1);
        }

        this.sortedFilteredWords[len] = [];

        for (const word of this._sortedFilteredWords[len]) {
            let skip = false;

            for (let i = 0;  i < this.filterValues[len].length; i++) {
                const filterLetter = this.filterValues[len][i];

                if (!filterLetter) {
                    continue;
                }

                if (word.charAt(i) !== filterLetter) {
                    skip = true;
                    break;
                }
            }

            if (skip) {
                continue;
            }

            this.sortedFilteredWords[len].push(word);
        }
    }

    public handleFilterInput(event: any): void {
        this.filter = event.target.value || '';

        clearTimeout(this._filterTimeout);
        this._filterTimeout = window.setTimeout(() => {
            this.getFilterWords();
        }, 500);
    }

    public clear(): void {
        this.filter = "";

        this.filterValues = {};

        for (let i = this.min; i < this.max + 1; i++) {
            this.filterValues[i] = [];

            for (let j = 0; j < i; j++) {
                this.filterValues[i].push('');
            }
        }

        this.getFilterWords();
    }

    public ngOnDestroy(): void {
        clearTimeout(this._filterTimeout);
    }
}
