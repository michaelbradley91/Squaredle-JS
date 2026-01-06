/*
 * This module contains all the "thinking" parts of the game
 */
import Yoga, { Config, Node } from 'yoga-layout';
import SquareSceneLayout from './layouts/SquareSceneLayout';

export type LayoutState = {
    yoga_config: Config,
    square_scene_layout: SquareSceneLayout
    start_scene_root_node: Node | undefined
}

/*
 * The state of the square scene (where you play!)
 */
export type SquareState = {
    square_size: number,
    letters: string[][]
}

/*
 * Handles all persistent game state
 */
export type GameState = {
    layout: LayoutState
    square: SquareState
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
        layout: {
            yoga_config: yoga_config,
            square_scene_layout: new SquareSceneLayout(yoga_config),
            start_scene_root_node: undefined
        },
        square: {
            square_size: 4,
            letters: square_letters
        }
    };
}

