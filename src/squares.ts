/**
 * This module contains functions to identify 
 * playable squares
 */

import { clone_square_parameters, GameState, new_square_parameters, SquareParameters } from "./logic";
import { LONG_WORD_LENGTH, MAX_WORD_LENGTH, Words } from "./words";

/*
 * Useful types for square solving. A position
 * is a number encoding x and y coordinates
 */
type Position = number;
type Path = Position[];
type Paths = Path[];
type Solution = { [prefix: string]: Paths };

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
    unique_coverage: { [position: Position]: string[] };
    words_by_length: { [length: number]: Set<string> };
    word_count: number;
    quality: SquareQualityAssessment;

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
            this.quality = SquareQualityAssessment.NotCovered;
            return;
        }

        /* Are there enough words in the square in general? */
        if (this.word_count < square.parameters.words_count_range[0])
        {
            this.quality = SquareQualityAssessment.NotEnoughWords;
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
                this.quality = SquareQualityAssessment.NotEnoughWords;
                return;
            }
        }

        /* Check the long words are not too similar */
        const long_words: string[] = [];
        for (let length = LONG_WORD_LENGTH; length <= MAX_WORD_LENGTH; length++)
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
                if (other_long_word.indexOf(long_word) !== 0)
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
            this.quality = SquareQualityAssessment.LongWordsTooSimilar;
            return;
        }

        /* Are there too many words? */
        if (this.word_count > square.parameters.words_count_range[1])
        {
            this.quality = SquareQualityAssessment.TooManyWords;
            return;
        }

        /* Check the square is using its letters uniquely enough */
        for (const position of this.square.all_filled_positions())
        {
            const unique_covered_words = this.unique_coverage[position];
            if (unique_covered_words.length === 0)
            {
                this.quality = SquareQualityAssessment.NotUniqueLetters;
                return;
            }
        }

        this.quality = SquareQualityAssessment.Good;
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

    /* Visible for evaluation */
    public parameters: SquareParameters;

    constructor()
    {
        this.letters = [];
        this.parameters = new_square_parameters();
        this.prefixes = {};
        this.neighbouring_letters = {};
        this.quality = undefined;
    }

    private invalidate_caches()
    {
        this.prefixes = {};
        this.neighbouring_letters = {};
        this.quality = undefined;
    }

    private position_to_coordinates(position: Position): { x: number, y: number }
    {
        const x = position % this.parameters.size;
        const y = Math.floor(position / this.parameters.size);
        return { x: x, y: y };
    }

    private coordinates_to_position(x: number, y: number): Position
    {
        return y * this.parameters.size + x;
    }

    get_letter(x: number, y: number): string
    {
        if (x < 0 || x >= this.parameters.size) return '';
        if (y < 0 || y >= this.parameters.size) return '';
        return this.letters[y][x];
    }

    add_letter(x: number, y: number, letter: string)
    {
        if (x < 0 || x >= this.parameters.size) return;
        if (y < 0 || y >= this.parameters.size) return;
        this.invalidate_caches();
        this.letters[y][x] = letter;
    }

    remove_letter(x: number, y: number)
    {
        if (x < 0 || x >= this.parameters.size) return;
        if (y < 0 || y >= this.parameters.size) return;
        this.invalidate_caches();
        this.letters[y][x] = '';
    }

    /* Get every position in the square that has a letter */
    private * all_filled_positions(): Generator<Position>
    {
        for (let y = 0; y < this.parameters.size; y++)
        {
            for (let x = 0; x < this.parameters.size; x++)
            {
                if (this.letters[y][x] !== '')
                {
                    yield this.coordinates_to_position(x, y);
                }
            }
        }
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
                let prefix = this.letters[y][x];
                for (const neighbour of this.get_neighbouring_letters(position, []))
                {
                    const neighbour_coordinates = this.position_to_coordinates(neighbour);
                    const neighbour_letter = this.letters[neighbour_coordinates.y][neighbour_coordinates.x];
                    prefix += neighbour_letter;

                    if (!Object.keys(this.prefixes).includes(prefix))
                    {
                        this.prefixes[prefix] = []
                    }
                    this.prefixes[prefix].push([position, neighbour]);
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
    init_empty_square(game_state: GameState)
    {
        this.invalidate_caches();
        this.parameters = clone_square_parameters(game_state.square_parameters);

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
}
