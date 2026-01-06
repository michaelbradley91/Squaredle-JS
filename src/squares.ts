/**
 * This module contains functions to identify 
 * playable squares
 */

import { clone_square_parameters, new_square_parameters, SquareParameters } from "./logic";
import { random_choice } from "./random";
import { choose_random_letter, choose_random_rare_letter, MAX_WORD_LENGTH, Words } from "./words";

/* When generating a square, how many times should we try adjusting the same square? */
const MAX_SQUARE_ADJUSTMENTS = 100;
const SEED_WORD_MIN_LENGTH = 9;
const SEED_WORD_MAX_LENGTH = 14;

/*
 * Useful types for square solving. A position
 * is a number encoding x and y coordinates
 */
type Position = number;
type Path = Position[];
type Paths = Path[];
type Solution = { [key: string]: Paths };

/* How good is a square to play? */
export enum SquareQualityAssessment
{
    TooManyWords = 1,
    NotEnoughWords = 2,
    NotCovered = 3,
    Good = 4,
    NotUniqueLetters = 5,
    LongWordsTooSimilar = 6
};

/**
 * Evaluates the quality of a square to play with several
 * heuristics
 */
export class SquareQuality
{
    square: Square;
    words: Words;
    solution: Solution;
    unique_coverage: { [id: Position]: string[] };
    words_by_length: { [id: number]: Set<string> };
    word_count: number;
    assessment: SquareQualityAssessment;

    constructor(square: Square, words: Words)
    {
        this.square = square;
        this.words = words;
        this.words_by_length = {};
        this.solution = this.square.solve(this.words);
        this.unique_coverage = this.square.get_unique_word_coverage(this.solution);

        /* Construct the words by length mapping */
        for (const word in this.solution)
        {
            if (!Object.keys(this.words_by_length).includes(word.length.toString()))
            {
                this.words_by_length[word.length] = new Set<string>();
            }
            this.words_by_length[word.length].add(word);
        }

        for (let length = 0; length <= MAX_WORD_LENGTH; length++)
        {
            if (!Object.keys(this.words_by_length).includes(length.toString()))
            {
                this.words_by_length[length] = new Set<string>();
            }
        }

        /* Get the total number words in the square */
        this.word_count = 0;
        for (const length in this.words_by_length)
        {
            this.word_count += this.words_by_length[length].size;
        }

        /* Finally assess the quality of the square */

        /* Do the words cover all letters in the square? */
        if (!this.square.do_words_cover_all_letters(this.solution))
        {
            this.assessment = SquareQualityAssessment.NotCovered;
            return;
        }

        /* Are there enough words in the square in general? */
        if (this.word_count < square.parameters.words_count_range[0])
        {
            this.assessment = SquareQualityAssessment.NotEnoughWords;
            return;
        }

        /* Are there enough words of each length? */
        for (const length_description in square.parameters.min_word_lengths)
        {
            const included_word_lengths = length_description.split(',').map(str => parseInt(str));
            let total_words_of_length = 0;
            for (const word_length of included_word_lengths)
            {
                total_words_of_length += this.words_by_length[word_length].size;
            }
            if (total_words_of_length < square.parameters.min_word_lengths[length_description])
            {
                this.assessment = SquareQualityAssessment.NotEnoughWords;
                return;
            }
        }

        /* Check the long words are not too similar */
        const long_words: string[] = [];
        for (let length = square.parameters.min_unique_long_word_length; length <= MAX_WORD_LENGTH; length++)
        {
            const words_of_length = this.words_by_length[length];
            const words_array = Array.from(words_of_length);
            long_words.push(...words_array);
        }

        const unique_long_words = new Set<string>();
        for (const long_word of long_words)
        {
            let is_unique = true;
            for (const other_long_word of long_words)
            {
                if (long_word === other_long_word) continue;

                // If this word is inside a longer word, it is not unique enough
                if (other_long_word.includes(long_word))
                {
                    is_unique = false;
                    break;
                }
            }
            if (is_unique)
            {
                unique_long_words.add(long_word);
            }
        }

        if (unique_long_words.size < square.parameters.min_unique_long_words)
        {
            console.log("Long words too similar:", JSON.stringify(long_words), JSON.stringify(Array.from(unique_long_words)));
            this.assessment = SquareQualityAssessment.LongWordsTooSimilar;
            return;
        }

        /* Are there too many words? */
        if (this.word_count > square.parameters.words_count_range[1])
        {
            this.assessment = SquareQualityAssessment.TooManyWords;
            return;
        }

        /* Check the square is using its letters uniquely enough */
        for (const position of this.square.all_filled_positions())
        {
            const unique_covered_words = this.unique_coverage[position];
            if (unique_covered_words.length === 0)
            {
                this.assessment = SquareQualityAssessment.NotUniqueLetters;
                return;
            }
        }

        this.assessment = SquareQualityAssessment.Good;
        return;
    }
}

export class Square 
{
    private letters: string[][];

    /* Private caches used for solution finding */
    private prefixes: { [prefix: string]: Paths };
    private neighbouring_letters: { [position: Position]: Position[] };
    private quality: SquareQuality | undefined;
    private filled_positions: Position[];

    /* Visible for evaluation */
    public parameters: SquareParameters;

    constructor()
    {
        this.letters = [];
        this.parameters = new_square_parameters();
        this.prefixes = {};
        this.neighbouring_letters = {};
        this.filled_positions = [];
        this.quality = undefined;
    }

    private invalidate_caches()
    {
        this.prefixes = {};
        this.neighbouring_letters = {};
        this.filled_positions = [];
        this.quality = undefined;
    }

    position_to_coordinates(position: Position): { x: number, y: number }
    {
        const x = position % this.parameters.size;
        const y = Math.floor(position / this.parameters.size);
        return { x: x, y: y };
    }

    coordinates_to_position(x: number, y: number): Position
    {
        return y * this.parameters.size + x;
    }

    get_letter(x: number, y: number): string
    {
        if (x < 0 || x >= this.parameters.size) return '';
        if (y < 0 || y >= this.parameters.size) return '';
        if (this.parameters.template[y][x] === false) return '';
        return this.letters[y][x];
    }

    add_letter(x: number, y: number, letter: string)
    {
        if (x < 0 || x >= this.parameters.size) return;
        if (y < 0 || y >= this.parameters.size) return;
        if (this.parameters.template[y][x] === false) return;
        this.invalidate_caches();
        this.letters[y][x] = letter;
    }

    remove_letter(x: number, y: number)
    {
        if (x < 0 || x >= this.parameters.size) return;
        if (y < 0 || y >= this.parameters.size) return;
        if (this.parameters.template[y][x] === false) return;
        this.invalidate_caches();
        this.letters[y][x] = '';
    }

    /* Add a normal random letter to the square */
    add_random_letter(x: number, y: number)
    {
        this.add_letter(x, y, choose_random_letter());
    }

    /* Add a rare random letter to the square */
    add_random_rare_letter(x: number, y: number)
    {
        this.add_letter(x, y, choose_random_rare_letter());
    }

    /* Choose a random position in the square that has a letter */
    get_random_position(): Position
    {
        return random_choice(this.all_filled_positions());
    }

    /* Fill the square with very random letters */
    fill_with_random_letters()
    {
        for (let y = 0; y < this.parameters.size; y++)
        {
            for (let x = 0; x < this.parameters.size; x++)
            {
                if (this.parameters.template[y][x])
                {
                    this.add_random_letter(x, y);
                }
            }
        }
    }

    /**
     * Add a word randomly to the square, trying up to the maximum number of attempts
     */
    add_word_randomly(word: string, max_attempts: number = 1000): boolean
    {
        if (word.length === 0) return true;

        const letters_copy: string[][] = [];
        for (let x = 0; x < this.parameters.size; x++)
        {
            letters_copy[x] = [];
            for (let y = 0; y < this.parameters.size; y++)
            {
                letters_copy[x][y] = this.letters[y][x];
            }
        }

        let attempts = 0;
        while (attempts < max_attempts)
        {
            attempts += 1
            let current_position = this.get_random_position();
            const current_path = [current_position];
            for (let i = 0; i < word.length; i++)
            {
                const coordinates = this.position_to_coordinates(current_position);
                this.add_letter(coordinates.x, coordinates.y, word[i]);

                if (current_path.length === word.length)
                {
                    break;
                }

                const neighbours = Array.from(this.get_neighbouring_letters(current_position, current_path));

                /* If we've boxed ourselves out, just try again. Likely to work fairly quickly */
                if (neighbours.length === 0) 
                {
                    for (let x = 0; x < this.parameters.size; x++)
                    {
                        for (let y = 0; y < this.parameters.size; y++)
                        {
                            this.add_letter(x, y, letters_copy[y][x]);
                        }
                    }
                    break;
                }

                const next_position = random_choice(neighbours);
                current_path.push(next_position);
                current_position = next_position;
            }
            if (current_path.length === word.length)
            {
                return true;
            }
        }
        return false;
    }

    /* Get every position in the square that has a letter */
    all_filled_positions(): Position[]
    {
        if (this.filled_positions.length > 0) 
        {
            return this.filled_positions;
        }
        this.filled_positions = [];
        for (let y = 0; y < this.parameters.size; y++)
        {
            for (let x = 0; x < this.parameters.size; x++)
            {
                if (this.letters[y][x] !== '')
                {
                    this.filled_positions.push(this.coordinates_to_position(x, y));
                }
            }
        }
        return this.filled_positions;
    }

    /**
     * Get all the neighbouring letters for the given position, ignoring the cache
     */
    private get_all_neighbouring_letters(position: Position): Position[]
    {
        const coordinates = this.position_to_coordinates(position);
        const neighbours: Position[] = [];
        for (let dy = -1; dy <= 1; dy++)
        {
            for (let dx = -1; dx <= 1; dx++)
            {
                if (dx === 0 && dy === 0) continue;
                const neighbour_x = coordinates.x + dx;
                const neighbour_y = coordinates.y + dy;
                if (neighbour_x < 0 || neighbour_x >= this.parameters.size) continue;
                if (neighbour_y < 0 || neighbour_y >= this.parameters.size) continue;
                if (this.letters[neighbour_y][neighbour_x] === '') continue;
                const neighbour_position = this.coordinates_to_position(neighbour_x, neighbour_y);
                neighbours.push(neighbour_position);
            }
        }
        return neighbours;
    }

    private load_neighrbouring_letters()
    {
        this.neighbouring_letters = {};
        for (let y = 0; y < this.parameters.size; y++)
        {
            for (let x = 0; x < this.parameters.size; x++)
            {
                const position = this.coordinates_to_position(x, y);
                this.neighbouring_letters[position] = this.get_all_neighbouring_letters(position);
            }
        }
    }

    /**
     * @param position the current position
     * @param current_path the current path
     * @returns the neighbours excluding those in the current path or at the current position
     */
    private * get_neighbouring_letters(position: Position, current_path: Path): Generator<Position>
    {
        if (Object.keys(this.neighbouring_letters).length === 0)
        {
            this.load_neighrbouring_letters();
        }
        for (const neighbour of this.neighbouring_letters[position])
        {
            if (!current_path.includes(neighbour))
            {
                yield neighbour;
            }
        }
    }

    /**
     * Load all prefixes so we can quickly look up where words
     * might start when searching for solutions
     */
    private load_prefixes()
    {
        this.prefixes = {};
        for (let y = 0; y < this.parameters.size; y++)
        {
            for (let x = 0; x < this.parameters.size; x++)
            {
                if (this.letters[y][x] === '') continue;
                const position = this.coordinates_to_position(x, y)
                const prefix = this.letters[y][x];
                for (const neighbour of this.get_neighbouring_letters(position, []))
                {
                    const neighbour_coordinates = this.position_to_coordinates(neighbour);
                    const neighbour_letter = this.letters[neighbour_coordinates.y][neighbour_coordinates.x];
                    const whole_prefix = prefix + neighbour_letter;

                    if (!Object.keys(this.prefixes).includes(whole_prefix))
                    {
                        this.prefixes[whole_prefix] = []
                    }
                    this.prefixes[whole_prefix].push([position, neighbour]);
                }
            }
        }
    }

    /* Recursively find all paths for the remaining letters of the word */
    private find_remaining_word(word: string, current_position: Position, current_word: string, current_path: Path): Paths
    {
        if (word.length === current_word.length)
        {
            return [[current_position]];
        }

        const all_paths: Paths = [];
        for (const neighbour of this.get_neighbouring_letters(current_position, current_path))
        {
            const neighbour_coordinates = this.position_to_coordinates(neighbour);
            const neighbour_letter = this.letters[neighbour_coordinates.y][neighbour_coordinates.x];
            if (neighbour_letter === word[current_word.length])
            {
                const new_position = neighbour;
                const new_path = current_path.slice();
                new_path.push(neighbour);
                const new_word = current_word + neighbour_letter;
                const new_paths = this.find_remaining_word(word, new_position, new_word, new_path);
                for (const new_path of new_paths)
                {
                    const full_path = [current_position].concat(new_path);
                    all_paths.push(full_path);
                }
            }
        }
        return all_paths;
    }

    /* Find all paths for the given word in the square */
    find_word(word: string): Paths
    {
        if (Object.keys(this.prefixes).length === 0)
        {
            this.load_prefixes();
        }
        const all_paths: Paths = [];
        if (word.length === 0) return all_paths;

        /* Check the word can be started anywhere */
        const prefix = word.slice(0, 2);
        if (!Object.keys(this.prefixes).includes(prefix))
        {
            return all_paths;
        }

        /* Check all two letter combinations are also prefixes in the square */
        for (let i = 1; i < word.length - 1; i++)
        {
            const sub_prefix = word.slice(i, i + 2);
            if (!Object.keys(this.prefixes).includes(sub_prefix))
            {
                return all_paths;
            }
        }

        /* Check all the possible start locations for paths */
        const start_positions = this.prefixes[prefix];
        for (const start_position_path of start_positions)
        {
            const current_position = start_position_path[1];
            const current_word = prefix;
            const current_path = start_position_path.slice();
            const new_paths = this.find_remaining_word(word, current_position, current_word, current_path);
            for (const new_path of new_paths)
            {
                const full_path = start_position_path.slice(0, 1).concat(new_path);
                all_paths.push(full_path);
            }
        }
        return all_paths;
    }

    /* "Solve" the square by finding all words that can be formed */
    solve(words: Words): Solution
    {
        const solution: Solution = {};
        for (const word of words.get_words())
        {
            const paths = this.find_word(word);
            if (paths.length > 0)
            {
                solution[word] = paths;
            }
        }
        return solution;
    }

    private get_words_by_position(solution: Solution): { [position: Position]: Set<string> }
    {
        /* Calculate all the words covering a position */
        const words_by_position: { [position: Position]: Set<string> } = {};
        for (const position of this.all_filled_positions())
        {
            words_by_position[position] = new Set<string>();
        }
        for (const word in solution)
        {
            const paths = solution[word];
            for (const path of paths)
            {
                for (const position of path)
                {
                    if (position in words_by_position)
                    {
                        words_by_position[position].add(word);
                    }
                }
            }
        }
        return words_by_position;
    }

    /* Get all words that require the given position to be formed */
    private * get_unique_word_coverage_for_position(position: Position, words_by_position: { [position: Position]: Set<string> }, solution: Solution): Generator<string>
    {
        for (const word of words_by_position[position])
        {
            for (const path of solution[word])
            {
                // If this path does not include our position, then the position is not required for this word
                if (!path.includes(position))
                {
                    break;
                }
            }
            yield word
        }
    }

    /* Get all words that require each position to be formed */
    get_unique_word_coverage(solution: Solution): { [position: Position]: string[] }
    {
        const words_by_position = this.get_words_by_position(solution);
        const unique_word_coverage: { [position: Position]: string[] } = {};
        for (const position of this.all_filled_positions())
        {
            unique_word_coverage[position] = Array.from(this.get_unique_word_coverage_for_position(position, words_by_position, solution));
        }
        return unique_word_coverage;
    }

    /* Check the solution uses all letters in the square */
    do_words_cover_all_letters(solution: Solution): boolean
    {
        const all_positions = new Set<Position>();
        for (const word in solution)
        {
            for (const path of solution[word])
            {
                for (const position of path)
                {
                    all_positions.add(position);
                }
            }
        }

        for (const position of this.all_filled_positions())
        {
            if (!all_positions.has(position))
            {
                return false;
            }
        }
        return true;
    }

    /**
     * Initialise an empty square. Should be called
     * before doing further operations
     */
    init_empty_square(square_parameters: SquareParameters)
    {
        this.invalidate_caches();
        this.parameters = clone_square_parameters(square_parameters);

        this.letters = [];
        for (let y = 0; y < this.parameters.size; y++)
        {
            const row: string[] = [];
            for (let x = 0; x < this.parameters.size; x++)
            {
                row.push('');
            }
            this.letters.push(row);
        }
    }

    /* Get this square's quality, using a previous assessment if available */
    get_quality(words: Words): SquareQuality
    {
        if (!this.quality)
        {
            return this.reassess_quality(words);
        }
        return this.quality;
    }

    /* Assess the square quality again */
    reassess_quality(words: Words): SquareQuality
    {
        this.quality = new SquareQuality(this, words);
        return this.quality;
    }

    set_quality(quality: SquareQuality)
    {
        this.quality = quality;
    }
}

function should_try_adjusting_square(quality: SquareQualityAssessment): boolean
{
    switch (quality)
    {
        case SquareQualityAssessment.TooManyWords:
            return true;
        case SquareQualityAssessment.NotUniqueLetters:
            return true;
        default:
            return false;
    }
}

/**
 * Print the given square to the console for debugging purposes
 */
export function print_square_to_console(square: Square, words: Words)
{
    /* Ensure quality was assessed */
    const quality: SquareQuality = square.reassess_quality(words);
    console.log(`Solution: ${JSON.stringify(quality.solution)}`);
    for (const word in quality.solution)
    {
        console.log(`Found word: ${word} at paths: ${JSON.stringify(quality.solution[word])}`);
    }

    for (const position in quality.unique_coverage)
    {
        console.log(`Unique words at position ${position}: ${JSON.stringify(quality.unique_coverage[position])}`);
    }

    for (const length of Object.keys(quality.words_by_length))
    {
        if (quality.words_by_length[length].size === 0) continue;
        console.log(`Words of length ${length}: ${Array.from(quality.words_by_length[length]).join(', ')}`);
    }

    console.log("Total words: {}", quality.word_count);

    let text = "+" + ("-".repeat(square.parameters.size)) + "+\n";
    for (let y = 0; y < square.parameters.size; y++)
    {
        text += "|";
        for (let x = 0; x < square.parameters.size; x++)
        {
            text += square.get_letter(x, y).toUpperCase() || " ";
        }
        text += "|\n";
    }
    text += "+" + ("-".repeat(square.parameters.size)) + "+";
    console.log(text);

    console.log("Square quality assessment: ", SquareQualityAssessment[quality.assessment]);

    if (quality.assessment === SquareQualityAssessment.NotCovered)
    {
        let found_missing_square = false;
        for (const position in quality.unique_coverage)
        {
            if (quality.unique_coverage[position].length === 0)
            {
                found_missing_square = true;
                break;
            }
        }
        if (!found_missing_square)
        {
            console.log("All positions have coverage! ERROR!");
        }
    }
    else
    {
        console.log("Square passes coverage test.");
    }
}

/**
 * Try generating a square with the given parameters..
 * 
 * Warning: this can take a while depending on the parameters!
 * @param square_parameters criteria for the generated square
 * @param words the current word list
 */
export function generate_square(square_parameters: SquareParameters, words: Words, max_attempts: number = 100): Square
{
    const square = new Square();
    square.init_empty_square(square_parameters);

    let total_squares_generated = 0;
    const start_time = performance.now();

    while (total_squares_generated < max_attempts)
    {
        if (total_squares_generated > 0 && total_squares_generated % 10 === 0)
        {
            console.log(`Generated ${total_squares_generated} squares so far, still trying... (${performance.now() - start_time}ms)`);
        }

        total_squares_generated += 1;
        square.fill_with_random_letters();

        /* We can't let the seed word be bigger than the square..!! */
        const number_letters = square.all_filled_positions().length;
        const seed_min_length = Math.min(SEED_WORD_MIN_LENGTH, number_letters - 3);
        const seed_max_length = Math.min(SEED_WORD_MAX_LENGTH, number_letters - 2);

        /* Don't use a seed word if the square is too small */
        if (seed_min_length > 4 && seed_max_length > 4)
        {
            let seed_word = choose_random_rare_letter();
            seed_word += words.get_random_word_of_length(seed_min_length, seed_max_length);
            seed_word += choose_random_rare_letter();
            if (!square.add_word_randomly(seed_word))
            {
                continue;
            }
        }

        let quality = square.reassess_quality(words);
        // print_square_to_console(square, words);
        if (quality.assessment === SquareQualityAssessment.Good)
        {
            console.log("Found good quality square without adjustment!")
            break;
        }

        /* Should we attempt to tweak this square? */
        if (!should_try_adjusting_square(quality.assessment))
        {
            if (quality.assessment !== SquareQualityAssessment.NotCovered)
            {
                console.log("Square rejected due to quality assessment: ", SquareQualityAssessment[quality.assessment]);
            }
            continue;
        }

        const square_filled_positions = square.all_filled_positions();
        let adjustments_made = 0;
        while (square.get_quality(words).assessment !== SquareQualityAssessment.Good && adjustments_made < MAX_SQUARE_ADJUSTMENTS)
        {
            quality = square.get_quality(words)
            console.log("Square adjustment due to quality assessment: ", SquareQualityAssessment[quality.assessment]);
            switch (quality.assessment)
            {
                case SquareQualityAssessment.TooManyWords:
                    {
                        const random_position = random_choice(square_filled_positions);
                        const random_coordinates = square.position_to_coordinates(random_position);

                        const original_letter = square.get_letter(random_coordinates.x, random_coordinates.y);
                        const original_quality = quality;

                        adjustments_made += 1;
                        square.add_random_letter(random_coordinates.x, random_coordinates.y);
                        const new_quality = square.reassess_quality(words);
                        if ((new_quality.assessment !== SquareQualityAssessment.Good &&
                            new_quality.assessment !== SquareQualityAssessment.NotUniqueLetters &&
                            new_quality.assessment !== SquareQualityAssessment.TooManyWords) || (
                                new_quality.assessment === SquareQualityAssessment.TooManyWords &&
                                new_quality.word_count >= original_quality.word_count
                            ))
                        {
                            console.log("Reverting change to square letter as quality did not improve. Quality now: ", SquareQualityAssessment[new_quality.assessment]);
                            console.log("Adjusted square, old word count and new word count: ", original_quality.word_count, new_quality.word_count);
                            // This was a mistake - revert the change
                            square.add_letter(random_coordinates.x, random_coordinates.y, original_letter);
                            square.set_quality(original_quality);
                            quality = original_quality;
                        }
                        else
                        {
                            quality = new_quality;
                            square.set_quality(new_quality);

                            console.log("Kept change to square letter");
                            console.log("Adjusted square, old word count and new word count: ", original_quality.word_count, new_quality.word_count);
                        }

                        break;
                    }
                case SquareQualityAssessment.NotUniqueLetters:
                    {
                        console.log("Adjusting square: changing a random letter to improve unique letter coverage");
                        const positions_to_change: Position[] = []
                        for (const position of square_filled_positions)
                        {
                            const unique_covered_words = quality.unique_coverage[position];
                            if (unique_covered_words.length === 0)
                            {
                                positions_to_change.push(position);
                            }
                        }
                        const position_to_change = random_choice(positions_to_change);
                        const coordinates_to_change = square.position_to_coordinates(position_to_change);

                        const original_letter = square.get_letter(coordinates_to_change.x, coordinates_to_change.y);
                        const original_quality = quality;
                        adjustments_made += 1;
                        square.add_random_letter(coordinates_to_change.x, coordinates_to_change.y);
                        const new_quality = square.reassess_quality(words);

                        if (new_quality.assessment === SquareQualityAssessment.Good)
                        {
                            break;
                        }
                        if (new_quality.assessment === SquareQualityAssessment.TooManyWords ||
                            new_quality.assessment === SquareQualityAssessment.NotUniqueLetters)
                        {
                            // Check the number of unique letters has gone up
                            const new_failing_positions: Position[] = [];
                            for (const position of square_filled_positions)
                            {
                                const unique_covered_words = new_quality.unique_coverage[position];
                                if (unique_covered_words.length === 0)
                                {
                                    new_failing_positions.push(position);
                                }
                            }
                            if (new_failing_positions.length < positions_to_change.length)
                            {
                                // This is an improvement, keep the change
                                break;
                            }

                            // Still not good enough, revert the change
                            square.add_letter(coordinates_to_change.x, coordinates_to_change.y, original_letter);
                            square.set_quality(original_quality);
                            quality = original_quality;
                            break;
                        }
                        break;
                    }
                default:
                    {
                        console.log("ERROR: Stopping adjustments to square");
                        adjustments_made = MAX_SQUARE_ADJUSTMENTS;
                        break;
                    }
            }
        }

        if (quality.assessment === SquareQualityAssessment.Good)
        {
            console.log("Found a good square!");
            break;
        }
        else
        {
            if (quality.assessment !== SquareQualityAssessment.NotCovered)
            {
                console.log("Square rejected due to quality assessment: ", SquareQualityAssessment[quality.assessment]);
            }
        }
    }
    if (square.get_quality(words).assessment === SquareQualityAssessment.Good)
    {
        print_square_to_console(square, words);
    }
    else
    {
        console.log("Failed to generate a good square...");
    }
    return square;
}
