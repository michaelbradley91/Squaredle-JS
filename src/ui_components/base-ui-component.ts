/**
 * A base level component that all ui components should respecct
 */

import { GameState } from "~/logic";

export default abstract class BaseUIComponent<S extends Phaser.Scene>
{
    // The scene this component is in
    public scene: S;
    public game_state: GameState;
    public padding: { top: number, bottom: number, left: number, right: number } = { top: 0, bottom: 0, left: 0, right: 0 };
    public bounds: { x: number, y: number, width: number, height: number } = { x: 0, y: 0, width: Infinity, height: Infinity };

    public constructor(scene: S, game_state: GameState)
    {
        this.scene = scene;
        this.game_state = game_state;
    }

    /**
     * Set the bounds of this ui component
     */
    public set_bounds(x: number, y: number, width: number, height: number): void
    {
        this.bounds.x = x;
        this.bounds.y = y;
        this.bounds.width = width;
        this.bounds.height = height;
    }

    /**
     * Set the surrounding padding for this element
     */
    public set_padding(top: number, bottom: number, left: number, right: number): void
    {
        this.padding.top = top;
        this.padding.bottom = bottom;
        this.padding.left = left;
        this.padding.right = right;
    }

    /**
     * Update this component so it recalculates based on current parameters
     */
    abstract update(): void;

    /**
     * Get the calculated size of this component. This should only be used after a call to update
     */
    public abstract get_size(): { width: number, height: number };

    /**
     * Make this component visible
     */
    public abstract show(): void;

    /**
     * Make this component invisible
     */
    public abstract hide(): void;

    public setVisible(visible: boolean): void
    {
        if (visible)
        {
            this.show();
        }
        else
        {
            this.hide();
        }
    }

    /**
     * Redraw this component by updating and showing it
     */
    public redraw(): void
    {
        this.update();
        this.show();
    }
}