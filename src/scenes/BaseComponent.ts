/**
 * Loosely based on React components, this is a base class for components
 * that make up a scene to help break up the logic
 */

import { GameState } from "~/logic";

export default abstract class BaseComponent<S extends Phaser.Scene>
{
    // The scene this component is in
    scene: S;

    // The game state for this component
    game_state: GameState;

    public constructor(scene: S, game_state: GameState)
    {
        this.scene = scene;
        this.game_state = game_state;
    }
}