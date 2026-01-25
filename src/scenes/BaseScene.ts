/**
 * This module contains the base scene class for the game
 * and handles critical functions that all scenes should have
 */

import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";
import { load_font_sizes } from "~/fonts";
import { GameState, init_game_state } from "~/logic";

export default abstract class BaseScene extends Phaser.Scene
{
    game_state: GameState;

    constructor(key: string)
    {
        super({ key: key });
        this.game_state = init_game_state();
    }

    /* Initialise objects required by this scene */
    abstract init_scene(): void;
    abstract update_layout(): void;
    abstract draw(): void;

    init(data: { game_state: GameState })
    {
        if (!data || !data.game_state)
        {
            this.game_state = init_game_state();
        }
        else
        {
            this.game_state = data.game_state;
        }
    }

    handle_resize(game_size: Phaser.Structs.Size)
    {
        // Re-check the scaling. This helps fix scaling issues when using an emulator in a browser.
        const scale = visualViewport ? visualViewport.scale : 1;
        if (scale >= 1)
        {
            // Force some scaling to improve font rendering
            document.getElementById("app")?.setAttribute("style", "width: 200%; height: 200%; zoom: 0.5; position: relative; top: -25%; left: -25%");
        }
        else
        {
            document.getElementById("app")?.setAttribute("style", "width: 100%; height: 100%; zoom: 1; position: relative; top: 0%; left: 0%");
        }

        console.log("Resizing to:", game_size.width, game_size.height);

        // Update camera viewport to match new size
        this.cameras.main.setViewport(0, 0, game_size.width, game_size.height);

        // Load the font sizes for the new screen size for easy access
        load_font_sizes(this.game_state, this);

        // Update the layout
        this.update_layout();

        // Force a redraw of everything
        this.draw();
    }

    preload()
    {
        this.load.bitmapFont("roboto-bold", "assets/Roboto-Bold.png", "assets/Roboto-Bold.xml");
        this.load.bitmapFont("roboto-bold-big", "assets/Roboto-Bold-Big.png", "assets/Roboto-Bold-Big.xml");
    }

    create()
    {
        // Listen for resize events  
        this.scale.on('resize', this.handle_resize, this);
        this.init_scene();

        // Initial resize (and draw)
        this.handle_resize(this.scale.gameSize);
    }
}

/**
 * A convenience function for updating something like a rectangle on the scene
 * @param coords the coordinates the rectangle should now obey
 * @param rectangle the rectangle to adjust
 */
export function update_rectangle(coords: { x: number, y: number, width: number, height: number }, rectangle: Phaser.GameObjects.Rectangle | RoundRectangle)
{
    rectangle.setPosition(coords.x + (coords.width / 2), coords.y + (coords.height / 2));
    // @ts-expect-error - Rounded rectangle has a bad typing
    rectangle.setSize(coords.width, coords.height);
    rectangle.setVisible(true);
}

