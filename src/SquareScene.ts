import { GameState, init_game_state } from "./logic";
import { OuterScreenNode } from "./layouts/SquareSceneLayout";
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';
import { generate_square, Square, SquareQualityAssessment } from "./squares";

const SQUARE_ROUNDING_FACTOR = 8;
const SQUARE_BORDER_ROUNDING_FACTOR = 6;
const SQUARE_BORDER_PERCENTAGE = 0.04;
const SQUARE_TEXT_PERCENTAGE = 0.6;
const SQUARE_TEXT_FONT_FAMILY = 'roboto-bold';
const SQUARE_TEXT_BIG_FONT_FAMILY = 'roboto-bold-big';
const SQUARE_TEXT_BIG_FONT_CUTOFF = 100;
const SQUARE_GENERATION_MAX_MILLISECONDS = 20;

export default class SquareScene extends Phaser.Scene
{
    game_objects: {
        top_menu_left: Phaser.GameObjects.Rectangle;
        top_menu_right: Phaser.GameObjects.Rectangle;
        progress_bar: Phaser.GameObjects.Rectangle;
        previous_words: Phaser.GameObjects.Rectangle;
        square: Phaser.GameObjects.Rectangle;
        hints_left: Phaser.GameObjects.Rectangle;
        hints_right: Phaser.GameObjects.Rectangle;
        squares: {
            background: RoundRectangle,
            border: RoundRectangle,
            text: Phaser.GameObjects.BitmapText,
            text_big: Phaser.GameObjects.BitmapText
        }[][]
    } | undefined = undefined

    game_state!: GameState;

    constructor()
    {
        super('square')
    }

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

        // Set up the Yoga tree for the start scene
        this.update_layout();
    }

    handle_resize(game_size: Phaser.Structs.Size)
    {
        // Update camera viewport to match new size
        this.cameras.main.setViewport(0, 0, game_size.width, game_size.height);

        // Update the layout
        this.update_layout();
    }

    preload()
    {
        this.load.bitmapFont("roboto-bold", "assets/Roboto-Bold.png", "assets/Roboto-Bold.xml");
        this.load.bitmapFont("roboto-bold-big", "assets/Roboto-Bold-Big.png", "assets/Roboto-Bold-Big.xml");
    }

    update_rectangle(coords: { x: number, y: number, width: number, height: number }, rectangle: Phaser.GameObjects.Rectangle | RoundRectangle)
    {
        rectangle.setPosition(coords.x + (coords.width / 2), coords.y + (coords.height / 2));
        // @ts-expect-error - Rounded rectangle has a bad typing
        rectangle.setSize(coords.width, coords.height);
        rectangle.setVisible(true);
    }

    hide_all_objects()
    {
        if (!this.game_objects) return;

        this.game_objects.top_menu_left.visible = false;
        this.game_objects.top_menu_right.visible = false;
        this.game_objects.progress_bar.visible = false;
        this.game_objects.previous_words.visible = false;
        this.game_objects.square.visible = false;
        this.game_objects.hints_left.visible = false;
        this.game_objects.hints_right.visible = false;
        this.hide_square_objects();
    }

    hide_square_objects()
    {
        if (!this.game_objects) return;

        for (const row of this.game_objects.squares)
        {
            for (const square of row)
            {
                square.border.visible = false;
                square.background.visible = false;
                square.text.visible = false;
                square.text_big.visible = false;
            }
        }
    }

    draw_square_letter(row: number, column: number)
    {
        if (!this.game_objects) return;

        const letter = this.game_state.square.letters[row][column];
        if (!letter) return;

        const layout = this.game_state.layout.square_scene_layout;
        const square = this.game_objects.squares[row][column];

        const rectangle = layout.get_square_rectangle(row, column);
        const rounding = rectangle.width / SQUARE_ROUNDING_FACTOR;
        const border_rounding = rectangle.width / SQUARE_BORDER_ROUNDING_FACTOR;

        square.background.setRadius(rounding);
        square.border.setRadius(border_rounding);

        // The border uses up all the space, so shrink the rectangle for the background
        const background_rectangle = {
            x: rectangle.x + (rectangle.width * SQUARE_BORDER_PERCENTAGE),
            y: rectangle.y + (rectangle.height * SQUARE_BORDER_PERCENTAGE),
            width: rectangle.width - (2 * (rectangle.width * SQUARE_BORDER_PERCENTAGE)),
            height: rectangle.height - (2 * (rectangle.height * SQUARE_BORDER_PERCENTAGE))
        };
        this.update_rectangle(rectangle, square.border);
        this.update_rectangle(background_rectangle, square.background);

        const font_size = background_rectangle.height * SQUARE_TEXT_PERCENTAGE;
        let text = square.text;
        if (font_size > SQUARE_TEXT_BIG_FONT_CUTOFF)
        {
            text = square.text_big;
        }
        text.setFontSize(background_rectangle.height * SQUARE_TEXT_PERCENTAGE);
        text.setText(letter.toUpperCase());
        text.setVisible(true);
        text.setPosition(
            background_rectangle.x + (background_rectangle.width / 2),
            background_rectangle.y + (background_rectangle.height / 2)
        );
    }

    draw_square()
    {
        if (!this.game_objects) return;

        for (let row = 0; row < this.game_state.square_parameters.size; row++)
        {
            for (let col = 0; col < this.game_state.square_parameters.size; col++)
            {
                this.draw_square_letter(row, col);
            }
        }
    }

    redraw_square()
    {
        this.hide_square_objects();
        this.draw_square();
    }

    draw()
    {
        if (!this.game_objects || !this.game_state.layout.square_scene_layout) return;

        // Start by hiding everything
        this.hide_all_objects();

        // Draw the basic layout
        const layout = this.game_state.layout.square_scene_layout;
        this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.TopMenu), this.game_objects.top_menu_left);
        if (!layout.is_vertical())
        {
            this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.TopMenuRight), this.game_objects.top_menu_right);
        }
        this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.ProgressBar), this.game_objects.progress_bar);
        this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.PreviousWords), this.game_objects.previous_words);
        this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.Square), this.game_objects.square);
        this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.HintsLeft), this.game_objects.hints_left);

        if (layout.get_layout_rectangle(OuterScreenNode.HintsRight))
        {
            this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.HintsRight), this.game_objects.hints_right);
        }

        this.draw_square();
    }

    update_layout()
    {
        if (!this.game_state.layout.square_scene_layout) return;

        this.game_state.layout.square_scene_layout.update_layout({ width: this.game.canvas.width, height: this.game.canvas.height }, this.game_state);
        this.draw();
    }

    try_generate_square()
    {
        /* If we've already computed the square, there's nothing to do */
        if (this.game_state.square.computation.completed)
        {
            return;
        }

        /* Try generating a square for a short period */
        const start_time = performance.now();
        let last_letter_change: [string, number, number] | undefined = undefined;
        do 
        {
            last_letter_change = generate_square(this.game_state.square_parameters, this.game_state.words, this.game_state.square.computation);
        } while (!this.game_state.square.computation.completed && performance.now() - start_time < SQUARE_GENERATION_MAX_MILLISECONDS);

        /* If we have a square now, update the display */
        const square = this.game_state.square.computation.square;
        if (!square)
        {
            return;
        }

        for (let row = 0; row < this.game_state.square_parameters.size; row++)
        {
            for (let col = 0; col < this.game_state.square_parameters.size; col++)
            {
                this.game_state.square.letters[row][col] = square.get_letter(col, row);
            }
        }

        if (last_letter_change)
        {
            this.game_state.square.letters[last_letter_change[2]][last_letter_change[1]] = last_letter_change[0];
        }

        this.redraw_square();
    }

    create()
    {
        const squares: { background: RoundRectangle, border: RoundRectangle, text: Phaser.GameObjects.BitmapText, text_big: Phaser.GameObjects.BitmapText }[][] = [];
        for (let row = 0; row < this.game_state.square_parameters.size; row++)
        {
            const square_row: { background: RoundRectangle, border: RoundRectangle, text: Phaser.GameObjects.BitmapText, text_big: Phaser.GameObjects.BitmapText }[] = [];
            for (let col = 0; col < this.game_state.square_parameters.size; col++)
            {
                const border = this.add.rexRoundRectangle(400, 300, 800, 800, 20, 0x000000);
                const background = this.add.rexRoundRectangle(400, 300, 800, 800, 20, 0xaa00aa + (256 * ((row * this.game_state.square_parameters.size + col) * 16)));

                // We use a bitmap font as the letters in the middle are especially large and imperfections show
                const text = this.add.bitmapText(400, 300, SQUARE_TEXT_FONT_FAMILY, '').setOrigin(0.5, 0.565);
                const text_big = this.add.bitmapText(400, 300, SQUARE_TEXT_BIG_FONT_FAMILY, '').setOrigin(0.5, 0.565);
                square_row.push({ background: background, border: border, text: text, text_big: text_big });
            }
            squares.push(square_row);
        }
        this.game_objects = {
            top_menu_left: this.add.rectangle(400, 300, 800, 600, 0xff00000),
            top_menu_right: this.add.rectangle(400, 300, 800, 600, 0x00ff00),
            progress_bar: this.add.rectangle(400, 300, 800, 600, 0x0000ff),
            previous_words: this.add.rectangle(400, 300, 800, 600, 0xffff00),
            square: this.add.rectangle(400, 300, 800, 800, 0xff00ff),
            hints_left: this.add.rectangle(455, 325, 755, 725, 0x00ffff),
            hints_right: this.add.rectangle(455, 325, 755, 725, 0xffffff),
            squares: squares
        };

        this.children.sendToBack(this.game_objects.square);

        // Listen for resize events  
        this.scale.on('resize', this.handle_resize, this);

        // TODO: create the square here

        // Trigger initial resize to set positions  
        this.handle_resize(this.scale.gameSize);
    }

    update(_time: number, _delta: number): void
    {
        this.try_generate_square();
    }
}