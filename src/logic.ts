/*
 * This module contains all the "thinking" parts of the game
 */
import Yoga, { Config, Node } from 'yoga-layout';
import SquareSceneLayout from './layouts/SquareSceneLayout';
import { Words } from './words';
import { Square } from './squares';
import { Position } from './types';
import { FontSize } from './fonts';

export type LayoutState = {
    yoga_config: Config
    square_scene_layout: SquareSceneLayout
    start_scene_root_node: Node | undefined
}

/*
 * Parameters that influence how the square is generated
 */
export type SquareParameters = {
    size: number
    template: boolean[][]
    words_count_range: [number, number]
    min_word_lengths: { [word_length: string]: number }
    min_unique_long_word_length: number
    min_unique_long_words: number
}

export function new_square_parameters(): SquareParameters
{
    return {
        size: 4,
        template: [true, true, true, true].map(() => [true, true, true, true]),
        words_count_range: [20, 60],
        min_word_lengths: {
            "4": 6,
            "5": 6,
            "6": 5,
            "7,8": 3,
            "8,9": 2,
            "10,11,12,13,14,15,16,17,18,19,20,21": 1
        },
        min_unique_long_word_length: 8,
        min_unique_long_words: 4
    };
}

/** Create an identical copy of the square parameters */
export function clone_square_parameters(params: SquareParameters): SquareParameters
{
    return {
        size: params.size,
        template: params.template.map(row => row.slice()),
        words_count_range: [params.words_count_range[0], params.words_count_range[1]],
        min_word_lengths: { ...params.min_word_lengths },
        min_unique_long_word_length: params.min_unique_long_word_length,
        min_unique_long_words: params.min_unique_long_words
    }
}

/*
 * Records progress while computing a square
 */
export type SquareComputationState = {
    square: Square | undefined,
    start_time: number,
    total_attempts: number
    adjusting: boolean,
    // This number is misleading due to the algorithm resetting it when making progress. Used internally only
    adjustments_made: number,
    completed: boolean
}

/*
 * The state of the square scene (where you play!)
 */
export type SquareState = {
    letters: string[][]
    computation: SquareComputationState
    line_in_progress: Position[]
    line_end: Position | undefined,
    words_found: Set<string>
    words_found_expanded: boolean,
    words_found_carousel_index: number,
    hints_carousel_index: number
    reveals_remaining: number
}

/*
 * Handles all persistent game state
 */
export type GameState = {
    font_sizes: {
        [FontSize.MINISCULE]: number;
        [FontSize.TINY]: number;
        [FontSize.SMALL]: number;
        [FontSize.MEDIUM]: number;
        [FontSize.LARGE]: number;
        [FontSize.HUGE]: number;
    };
    words: Words
    layout: LayoutState
    square: SquareState
    square_parameters: SquareParameters
}

/*
 * Initialise the game from scratch
 */
export function init_game_state(): GameState
{
    const yoga_config = Yoga.Config.create();
    const square_letters: string[][] = [];
    square_letters.push(['I', 'N', 'G', 'U']);
    square_letters.push(['A', 'E', 'I', 'F']);
    square_letters.push(['T', 'D', 'S', 'N']);
    square_letters.push(['D', 'E', 'D', 'I']);

    // Pretty weird scoring system.
    // 4 = 5
    // 5 = 8
    // 6 = 12
    // 7 = 16
    // 8 = 22
    // 9 = 30
    // 10 = 38
    // 11 = 48
    // 12 = 58
    // 13 = 70
    // 14 = 82
    // 15 = 96
    // 16 = 110
    // 17 = 120
    // 18 = 135
    // 19 = 153
    return {
        words: new Words(),
        layout: {
            yoga_config: yoga_config,
            square_scene_layout: new SquareSceneLayout(yoga_config),
            start_scene_root_node: undefined
        },
        square: {
            letters: square_letters,
            computation: {
                square: undefined,
                start_time: 0,
                total_attempts: 0,
                adjusting: false,
                adjustments_made: 0,
                completed: false
            },
            line_end: undefined,
            line_in_progress: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
            words_found: new Set<string>(),
            words_found_expanded: false,
            words_found_carousel_index: 0,
            hints_carousel_index: 0,
            reveals_remaining: 1
        },
        font_sizes: {
            [FontSize.MINISCULE]: 10,
            [FontSize.TINY]: 12,
            [FontSize.SMALL]: 14,
            [FontSize.MEDIUM]: 18,
            [FontSize.LARGE]: 24,
            [FontSize.HUGE]: 36
        },
        square_parameters: new_square_parameters()
    };
}

export function get_inner_rectangle_with_padding(rect: { x: number, y: number, width: number, height: number }, padding: number):
    { x: number, y: number, width: number, height: number }
{
    return {
        x: rect.x + padding,
        y: rect.y + padding,
        width: rect.width - (2 * padding),
        height: rect.height - (2 * padding)
    };
}

/**
 * How many points is a word worth?
 */
export function get_word_points(length: number): number
{
    // These scores are loosely based off the scores I've seen words score in Squaredle
    switch (length)
    {
        case 4: return 5;
        case 5: return 8;
        case 6: return 12;
        case 7: return 16;
        case 8: return 22;
        case 9: return 30;
        case 10: return 38;
        case 11: return 48;
        case 12: return 58;
        case 13: return 70;
        case 14: return 82;
        case 15: return 96;
        case 16: return 110;
        case 17: return 120;
        case 18: return 135;
        default:
            // For anything longer use this formula (same as Squaredle's real formula)
            // This will be a whole number since either length - 1 or length - 2 is even
            return (length - 1) * (length - 2) / 2;
    }
}

/**
 * Get the current square from the current game state.
 * @param game_state the game state right now
 * @returns the current square, if any
 */
export function get_current_square(game_state: GameState): Square | undefined
{
    return game_state.square.computation.square;
}

/**
 * @param game_state the current game state
 * @returns the total number of points available for the current square
 */
export function get_total_points(game_state: GameState): number
{
    const square = get_current_square(game_state);
    if (!square)
    {
        return 0;
    }

    let total_score = 0;
    const words_by_length = square.get_quality(game_state.words).words_by_length;
    for (const length in words_by_length)
    {
        const words_at_length = words_by_length[length].size;
        total_score += words_at_length * get_word_points(parseInt(length));
    }
    return total_score;
}

/**
 * @param game_state the current game state
 * @returns the number of points the player has earned so far
 */
export function get_points_earned(game_state: GameState): number
{
    const square = get_current_square(game_state);
    if (!square)
    {
        return 0;
    }
    let earned_score = 0;
    for (const word of game_state.square.words_found)
    {
        earned_score += get_word_points(word.length);
    }
    return earned_score;
}

/**
 * The different hint levels for a given puzzle
 * 
 * The value represents the percentage progress required to unlock that hint level
 */
export enum HintLevel
{
    NONE = 0,
    START_LETTERS = 0.25,
    USED_LETTERS = 0.5,
    WORD_HINTS = 0.75
}

/**
 * Get the current hint level for the user given their progress with this square
 * @param game_state the current state of the game
 * @returns the hint level to show the user
 */
export function get_hint_level(game_state: GameState): HintLevel
{
    const square = get_current_square(game_state);
    if (!square)
    {
        return HintLevel.NONE;
    }

    const total_points = get_total_points(game_state);
    const earned_points = get_points_earned(game_state);
    const percent_complete = (earned_points / total_points);

    /* Boundaries are evenly split over hint levels */
    if (percent_complete >= HintLevel.WORD_HINTS)
    {
        return HintLevel.WORD_HINTS;
    }
    if (percent_complete >= HintLevel.USED_LETTERS)
    {
        return HintLevel.USED_LETTERS;
    }
    if (percent_complete >= HintLevel.START_LETTERS)
    {
        return HintLevel.START_LETTERS;
    }
    return HintLevel.NONE;
}
