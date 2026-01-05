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
    square_size: number
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
    return {
        layout: {
            yoga_config: yoga_config,
            square_scene_layout: new SquareSceneLayout(yoga_config),
            start_scene_root_node: undefined
        },
        square: {
            square_size: 4
        }
    };
}

