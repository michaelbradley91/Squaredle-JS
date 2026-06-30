/**
 * This component shows the bonus words found by the player.
 * 
 * The grid is kind of awkward but this isn't that interesting to the player so we just roll with it.
 * Long words can dramatically reduce the number of columns in the grid.
 */

import { FONT_HINTS_TITLES, FONT_HINTS_WORD_HINT, FONT_HINTS_WORDS_LEFT, get_line_spacing_for_font_size } from "~/fonts";
import BaseUIComponent from "./base-ui-component";
import TextComponent from "./TextComponent";
import TextGridComponent from "./TextGridComponent";
import { COLOUR_HINTS_TITLES, COLOUR_HINTS_WORD_HINT } from "~/colours";
import { GameState } from "~/logic";

export default class HintsBonusWordsFoundComponent<S extends Phaser.Scene> extends BaseUIComponent<S>
{
    public title_text: TextComponent<S>;
    public words_grid: TextGridComponent<S>;
    public words_grid_text_cells: Array<TextComponent<S>> = [];

    private total_size: { width: number, height: number } = { width: 0, height: 0 };

    public constructor(scene: S, game_state: GameState)
    {
        super(scene, game_state);

        this.title_text = new TextComponent(scene, game_state);
        this.words_grid = new TextGridComponent(scene, game_state);

        this.title_text.set_style(FONT_HINTS_TITLES, COLOUR_HINTS_TITLES);
        this.title_text.set_text("Bonus words found");

        this.game_state.square.bonus_words_found.add("hello");
        this.game_state.square.bonus_words_found.add("world");
        this.game_state.square.bonus_words_found.add("this");
        this.game_state.square.bonus_words_found.add("orange");
        this.game_state.square.bonus_words_found.add("banana");
        this.game_state.square.bonus_words_found.add("grape");
        this.game_state.square.bonus_words_found.add("kiwi");
    }

    /**
     * @returns a blank text cell with the correct style for the text grid
     */
    private make_text_cell(): TextComponent<S>
    {
        const text_cell = new TextComponent(this.scene, this.game_state);
        text_cell.set_style(FONT_HINTS_WORD_HINT, COLOUR_HINTS_WORD_HINT);
        this.words_grid_text_cells.push(text_cell);
        return text_cell;
    }

    update(): void
    {
        /* Text grid */
        const bonus_words_found = [...this.game_state.square.bonus_words_found];

        /* Convert the bonus words to a list ordered alphabetically */
        bonus_words_found.sort((a, b) => a.localeCompare(b));

        /* Correct the number of cells in the grid */
        this.words_grid.fix_cell_count(bonus_words_found.length, () => this.make_text_cell());

        /* Now show each word */
        for (let i = 0; i < bonus_words_found.length; i++)
        {
            const word = bonus_words_found[i];
            this.words_grid_text_cells[i].set_text(word);
        }

        /* Fix the cell spacing in the grid */
        const grid_line_spacing = get_line_spacing_for_font_size(this.game_state, FONT_HINTS_WORDS_LEFT);
        this.words_grid.set_cell_padding(grid_line_spacing, grid_line_spacing);

        // Now finally lay them out correctly
        const title_line_spacing = get_line_spacing_for_font_size(this.game_state, FONT_HINTS_TITLES);

        const left_x = this.bounds.x + this.padding.left;
        let current_y = this.bounds.y + this.padding.top;
        const available_width = this.bounds.width - this.padding.left - this.padding.right;

        this.title_text.set_bounds(left_x, current_y, available_width, Infinity);
        this.title_text.update();
        const title_size = this.title_text.get_size();
        current_y += title_size.height + title_line_spacing;

        /* Don't place the component if nothing is there */
        if (this.words_grid.text_components.length > 0)
        {
            this.words_grid.set_bounds(left_x, current_y, available_width, Infinity);
            this.words_grid.update();
            const grid_size = this.words_grid.get_size();
            current_y += grid_size.height + title_line_spacing;
        }

        /* Finally update our size */
        this.total_size.width = this.bounds.width;
        this.total_size.height = this.padding.bottom + current_y - this.bounds.y;
    }

    public get_size(): { width: number; height: number; }
    {
        return this.total_size;
    }

    public show(): void
    {
        this.title_text.show();

        /* Do not show the words grid if nothing is in it */
        if (this.words_grid.text_components.length > 0)
        {
            this.words_grid.show();
        }
    }

    public hide(): void
    {
        this.title_text.hide();
        this.words_grid.hide();
    }

    public destroy(): void
    {
        this.title_text.destroy();

        /* Remove and destroy all the text cells in the grid */
        for (const text_cell of this.words_grid_text_cells)
        {
            /* This will remove the cell if it exists. If it doesn't it does nothing */
            this.words_grid.remove_text_cell(text_cell);
            text_cell.destroy();
        }
        this.words_grid.destroy();
    }
}