/*
 * This module contains all the "thinking" parts of the game
 */
import Yoga, { Config, Node } from 'yoga-layout';
import SquareSceneLayout from './layouts/SquareSceneLayout';
import { Words } from './words';
import { Square } from './squares';
import { Position } from './types';

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
}

/*
 * Handles all persistent game state
 */
export type GameState = {
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
    square_letters.push(['A', 'B', 'C', 'D']);
    square_letters.push(['E', 'F', 'G', 'H']);
    square_letters.push(['I', 'J', 'K', 'L']);
    square_letters.push(['M', 'N', 'O', 'Z']);

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
            line_in_progress: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }]
        },
        square_parameters: new_square_parameters()
    };
}

