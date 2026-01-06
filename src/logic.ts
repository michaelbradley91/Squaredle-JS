/*
 * This module contains all the "thinking" parts of the game
 */
import Yoga, { Config, Node } from 'yoga-layout';
import SquareSceneLayout from './layouts/SquareSceneLayout';
import { Words } from './words';

export type LayoutState = {
    yoga_config: Config
    square_scene_layout: SquareSceneLayout
    start_scene_root_node: Node | undefined
}

/*
 * Parameters that influence how the square is generated
 */
export type SquareParameters = {
    square_size: number
    square_template: boolean[][]
    words_count_range: [number, number]
    min_word_lengths: { [word_length: string]: number }
}

/*
 * The state of the square scene (where you play!)
 */
export type SquareState = {
    letters: string[][]
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
            letters: square_letters
        },
        square_parameters: {
            square_size: 4,
            square_template: [true, true, true, true].map(() => [true, true, true, true]),
            words_count_range: [20, 40],
            min_word_lengths: {
                "4": 6,
                "5": 6,
                "6": 5,
                "7,8": 3,
                "8,9": 2,
                "10,11,12,13,14,15,16,17,18,19,20,21": 1
            }
        }
    };
}

