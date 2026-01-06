/**
 * This module manages the word list
 */
import word_list from '../assets/word_list.csv';
import bonus_word_list from '../assets/word_list_all.csv';
import bad_word_list from '../assets/word_list_bad.csv';
import word_frequencies from '../assets/word_list_with_frequency.csv';
import { random_choice, random_weighted_choice } from "./random";

const RARE_LETTER_FREQUENCIES: { [letter: string]: number } = {
    'b': 0.392,
    'j': 0.653,
    'k': 0.772,
    'p': 0.929, 'q': 0.295,
    'v': 0.978, 'x': 0.550, 'y': 1.074,
    'z': 0.274
};

const LETTER_FREQUENCIES: { [letter: string]: number } = {
    'a': 6.167, 'b': 1.492, 'c': 2.782, 'd': 4.253, 'e': 8.702,
    'f': 2.228, 'g': 2.015, 'h': 6.094, 'i': 6.966, 'j': 0.453,
    'k': 0.772, 'l': 4.025, 'm': 2.406, 'n': 6.749, 'o': 5.507,
    'p': 1.929, 'q': 0.395, 'r': 5.987, 's': 2.327, 't': 7.056,
    'u': 2.758, 'v': 0.978, 'w': 2.360, 'x': 0.450, 'y': 1.974,
    'z': 0.374
};

/**
 * @returns a randomly chosen letter
 */
export function choose_random_letter(): string
{
    const letters = Object.keys(LETTER_FREQUENCIES);
    const frequencies = Object.values(LETTER_FREQUENCIES);
    return random_weighted_choice(letters, frequencies);
}

/**
 * @returns a randomly chosen rare letter
 */
export function choose_random_rare_letter(): string
{
    const letters = Object.keys(RARE_LETTER_FREQUENCIES);
    const frequencies = Object.values(RARE_LETTER_FREQUENCIES);
    return random_weighted_choice(letters, frequencies);
}

export class Words
{
    private bad_words: Set<string>;
    private words: string[];
    private bonus_words: string[];
    private frequency_by_words: { [word: string]: number };
    private words_by_length: { [length: number]: string[] };

    constructor()
    {
        const start_time = performance.now();
        console.log("loading words...");
        this.bad_words = new Set(bad_word_list.map(entry => entry.word.toLowerCase()));
        this.words = word_list.map(entry => entry.word.toLowerCase()).filter(word => word.length > 0 && !this.bad_words.has(word));
        this.bonus_words = bonus_word_list.map(entry => entry.word.toLowerCase()).filter(word => word.length > 0 && !this.bad_words.has(word));
        this.frequency_by_words = {};

        for (const entry of word_frequencies)
        {
            if (entry.word.length === 0) continue;
            if (this.bad_words.has(entry.word.toLowerCase())) continue;

            const word = entry.word.toLowerCase();
            this.frequency_by_words[word] = parseInt(entry.frequency);
        }

        this.words_by_length = {};
        for (const word of this.words)
        {
            if (word.length === 0) continue;
            if (this.bad_words.has(word)) continue;

            if (!(word.length in this.words_by_length))
            {
                this.words_by_length[word.length] = [];
            }
            this.words_by_length[word.length].push(word);
        }

        console.log(`Loading words took this many milliseconds: ${performance.now() - start_time}`);
    }

    get_words(): string[]
    {
        return this.words;
    }

    get_bonus_words(): string[]
    {
        return this.bonus_words;
    }

    get_words_by_length(length: number): string[]
    {
        return this.words_by_length[length] || [];
    }

    get_freuqnecy_of_word(word: string): number
    {
        return this.frequency_by_words[word.toLowerCase()] || 0;
    }

    /**
     * Choose a random word within the length range provided
     */
    get_random_word_of_length(min_length: number, max_length: number): string
    {
        const all_words_within_length: string[] = [];
        for (let length = min_length; length <= max_length; length++)
        {
            const words_of_length = this.get_words_by_length(length);
            all_words_within_length.push(...words_of_length);
        }
        if (all_words_within_length.length === 0) return "";

        return random_choice(all_words_within_length);
    }
}
