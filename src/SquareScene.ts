import { GameState, init_game_state } from "./logic";
import { OuterScreenNode } from "./layouts/SquareSceneLayout";
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';
import { generate_square } from "./squares";
import { graphics_add_circle } from "./textures";

const SQUARE_ROUNDING_FACTOR = 8;
const SQUARE_BORDER_ROUNDING_FACTOR = 6;
const SQUARE_BORDER_PERCENTAGE = 0.04;
const SQUARE_TEXT_PERCENTAGE = 0.6;
const SQUARE_TEXT_FONT_FAMILY = 'roboto-bold';
const SQUARE_TEXT_BIG_FONT_FAMILY = 'roboto-bold-big';
const SQUARE_TEXT_BIG_FONT_CUTOFF = 100;
const SQUARE_GENERATION_MAX_MILLISECONDS = 1;
const SQUARE_CONNECTING_LINE_COLOR = 0x00ff00;
const SQUARE_CONNECTING_LINE_ALPHA = 0.5;
const SQUARE_CONNECTING_LINE_WIDTH_THRESHOLD = 2.5;
const SQUARE_CONNECTING_LINE_BIG_CIRCLE_FACTOR = 3;
const SQUARE_CONNECTING_LINE_SMALL_CIRCLE_FACTOR = 7;

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
        }[][],
        square_connecting_line_texture: Phaser.GameObjects.Image | undefined
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
        if (this.game_objects.square_connecting_line_texture)
        {
            this.game_objects.square_connecting_line_texture.visible = false;
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

        this.draw_lines_between_squares();
    }

    draw_lines_between_squares()
    {
        if (!this.game_objects) return;
        if (!this.game_state.layout.square_scene_layout) return;
        if (this.game_state.square_parameters.size <= 0) return;

        /* Draw any active line connecting the squares */
        if (this.game_state.square.line_in_progress.length > 0)
        {
            // Destroy the current line texture
            if (this.game_objects.square_connecting_line_texture)
            {
                if (this.textures.exists('square-connecting-line'))
                {
                    this.textures.remove('square-connecting-line');
                }
                this.game_objects.square_connecting_line_texture.destroy();
            }

            const line_graphics = this.add.graphics();

            /* The line is made up of circles on each square and a line between them */
            const standard_rectangle = this.game_state.layout.square_scene_layout.get_square_rectangle(0, 0);
            const standard_radius = standard_rectangle.width / SQUARE_CONNECTING_LINE_SMALL_CIRCLE_FACTOR;
            for (let i = 0; i < this.game_state.square.line_in_progress.length; i++)
            {
                const position = this.game_state.square.line_in_progress[i];
                const rectangle = this.game_state.layout.square_scene_layout.get_square_rectangle(position.y, position.x);

                const circle_centre = {
                    x: rectangle.x + (rectangle.width / 2),
                    y: rectangle.y + (rectangle.height / 2)
                };

                let circle_radius = standard_radius;
                if (i == 0)
                {
                    circle_radius = rectangle.width / SQUARE_CONNECTING_LINE_BIG_CIRCLE_FACTOR;
                }
                graphics_add_circle(line_graphics, circle_centre.x, circle_centre.y, circle_radius, SQUARE_CONNECTING_LINE_COLOR, 1.0);
            }

            if (this.game_state.square.line_end)
            {
                // Clamp the line end to the square
                const square_rectangle = this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.Square);
                const line_end = this.game_state.square.line_end;
                if (line_end.x < square_rectangle.x)
                {
                    line_end.x = square_rectangle.x;
                }
                if (line_end.x > square_rectangle.x + square_rectangle.width)
                {
                    line_end.x = square_rectangle.x + square_rectangle.width;
                }
                if (line_end.y < square_rectangle.y)
                {
                    line_end.y = square_rectangle.y;
                }
                if (line_end.y > square_rectangle.y + square_rectangle.height)
                {
                    line_end.y = square_rectangle.y + square_rectangle.height;
                }
                graphics_add_circle(line_graphics, this.game_state.square.line_end.x, this.game_state.square.line_end.y,
                    standard_radius, SQUARE_CONNECTING_LINE_COLOR, 1.0);
            }

            /* Now add lines between each circle */
            if (this.game_state.square.line_in_progress.length > 1)
            {
                for (let i = 0; i < this.game_state.square.line_in_progress.length - 1; i++)
                {
                    const position_start = this.game_state.square.line_in_progress[i];
                    const rectangle_start = this.game_state.layout.square_scene_layout.get_square_rectangle(position_start.y, position_start.x);

                    const line_start = {
                        x: rectangle_start.x + (rectangle_start.width / 2),
                        y: rectangle_start.y + (rectangle_start.height / 2)
                    };

                    const position_end = this.game_state.square.line_in_progress[i + 1];
                    const rectangle_end = this.game_state.layout.square_scene_layout.get_square_rectangle(position_end.y, position_end.x);
                    const line_end = {
                        x: rectangle_end.x + (rectangle_end.width / 2),
                        y: rectangle_end.y + (rectangle_end.height / 2)
                    };

                    line_graphics.lineStyle(standard_radius * 2, SQUARE_CONNECTING_LINE_COLOR, 1.0);
                    line_graphics.lineBetween(line_start.x, line_start.y, line_end.x, line_end.y);
                }
            }

            if (this.game_state.square.line_end && this.game_state.square.line_in_progress.length > 0)
            {
                const position_start = this.game_state.square.line_in_progress[this.game_state.square.line_in_progress.length - 1];
                const rectangle_start = this.game_state.layout.square_scene_layout.get_square_rectangle(position_start.y, position_start.x);

                const line_start = {
                    x: rectangle_start.x + (rectangle_start.width / 2),
                    y: rectangle_start.y + (rectangle_start.height / 2)
                };

                const line_end = {
                    x: this.game_state.square.line_end.x,
                    y: this.game_state.square.line_end.y
                };

                // Clamp the line end to the square
                const square_rectangle = this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.Square);
                if (line_end.x < square_rectangle.x)
                {
                    line_end.x = square_rectangle.x;
                }
                if (line_end.x > square_rectangle.x + square_rectangle.width)
                {
                    line_end.x = square_rectangle.x + square_rectangle.width;
                }
                if (line_end.y < square_rectangle.y)
                {
                    line_end.y = square_rectangle.y;
                }
                if (line_end.y > square_rectangle.y + square_rectangle.height)
                {
                    line_end.y = square_rectangle.y + square_rectangle.height;
                }
                line_graphics.lineStyle(standard_radius * 2, SQUARE_CONNECTING_LINE_COLOR, 1.0);
                line_graphics.lineBetween(line_start.x, line_start.y, line_end.x, line_end.y);
            }
            line_graphics.generateTexture('square-connecting-line', this.game.canvas.width, this.game.canvas.height);
            line_graphics.destroy();

            this.game_objects.square_connecting_line_texture = this.add.image(0, 0, 'square-connecting-line')
                .setOrigin(0, 0).setAlpha(SQUARE_CONNECTING_LINE_ALPHA);
        }
        else
        {
            if (this.textures.exists('square-connecting-line'))
            {
                this.textures.remove('square-connecting-line');
            }
            this.game_objects.square_connecting_line_texture?.destroy();
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
            squares: squares,
            square_connecting_line_texture: undefined
        };

        this.children.sendToBack(this.game_objects.square);

        // Listen for resize events  
        this.scale.on('resize', this.handle_resize, this);
        this.input.on('pointerdown', this.handle_pointer_down, this);
        this.input.on('pointerup', this.handle_pointer_up, this);

        // TODO: create the square here

        // Trigger initial resize to set positions  
        this.handle_resize(this.scale.gameSize);
    }

    handle_pointer_down(pointer: Phaser.Input.Pointer)
    {
        const square_touched = this.game_state.layout.square_scene_layout.get_square_at_position(pointer.x, pointer.y);
        if (square_touched)
        {
            this.game_state.square.line_in_progress = [{ x: square_touched.col, y: square_touched.row }];
        }
    }

    handle_pointer_up(_: Phaser.Input.Pointer)
    {
        // TODO: see if the player found a word

        // Stop drawing any current line
        this.game_state.square.line_end = undefined;
        this.game_state.square.line_in_progress = [];
    }

    update(_time: number, _delta: number): void
    {
        if (!this.game_objects) return;

        this.try_generate_square();

        if (!this.game.input.activePointer.isDown)
        {
            this.game_state.square.line_end = undefined;
            this.game_state.square.line_in_progress = [];
        }

        /* Should we support line drawing? */
        if (this.game_state.square.computation.completed && this.game_state.square.line_in_progress.length > 0)
        {
            const x = this.game.input.activePointer.x;
            const y = this.game.input.activePointer.y;

            if (this.game.input.activePointer.isDown)
            {
                const square_touched = this.game_state.layout.square_scene_layout.get_square_at_position(x, y);
                if (square_touched)
                {
                    /* Is it close enough to the centre of a square? */
                    const rectangle = this.game_state.layout.square_scene_layout.get_square_rectangle(square_touched.row, square_touched.col);
                    const centre = {
                        x: rectangle.x + (rectangle.width / 2),
                        y: rectangle.y + (rectangle.height / 2)
                    };
                    const distance_squared = (centre.x - x) * (centre.x - x) + (centre.y - y) * (centre.y - y);
                    const threshold = rectangle.width / SQUARE_CONNECTING_LINE_WIDTH_THRESHOLD;
                    if (distance_squared <= threshold * threshold)
                    {
                        /* Is it a new square? */
                        let new_square = true;
                        const line_in_progress = this.game_state.square.line_in_progress;
                        for (let i = 0; i < line_in_progress.length; i++)
                        {
                            const line_position = line_in_progress[i];
                            if (line_position.x == square_touched.col && line_position.y == square_touched.row)
                            {
                                new_square = false;
                                /* Have we backed up to the previous square? */
                                if (i == line_in_progress.length - 2)
                                {
                                    this.game_state.square.line_in_progress.pop();
                                }
                            }
                        }

                        if (new_square)
                        {
                            /* It needs to be adjacent to the last square */
                            const last_square = line_in_progress[line_in_progress.length - 1];
                            const col_diff = Math.abs(last_square.x - square_touched.col);
                            const row_diff = Math.abs(last_square.y - square_touched.row);
                            if (col_diff <= 1 && row_diff <= 1 && (col_diff + row_diff) > 0)
                            {
                                line_in_progress.push({ x: square_touched.col, y: square_touched.row });
                            }
                        }
                    }
                }
            }
            this.game_state.square.line_end = { x: this.input.activePointer.x, y: this.input.activePointer.y }
        }
        this.redraw_square();
    }
}