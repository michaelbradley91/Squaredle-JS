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
 * Handles all persistent game state
 */
export type GameState = {
    layout: LayoutState
}

/*
 * Initialise the game from scratch
 */
export function init_game_state(): GameState
{
    return {
        layout: {
            yoga_config: Yoga.Config.create(),
            start_scene_root_node: undefined
        }
    };
}

