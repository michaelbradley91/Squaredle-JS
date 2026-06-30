/**
 * Used on the hints screen to display the number of words and the hints
 * for words remaining on the square.
 */

import { GameState, SquareState } from "~/logic";
import BaseUIComponent from "./base-ui-component";
import TextComponent from "./TextComponent";
import TextGridComponent from "./TextGridComponent";
import { FONT_HINTS_TITLES, FONT_HINTS_WORD_HINT, FONT_HINTS_WORDS_LEFT, get_line_spacing_for_font_size } from "~/fonts";
import { COLOUR_HINTS_REVEAL_LINK, COLOUR_HINTS_TITLES, COLOUR_HINTS_WORD_HINT, COLOUR_HINTS_WORDS_LEFT } from "~/colours";

export default class HintsWordsComponent<S extends Phaser.Scene> extends BaseUIComponent<S>
{
    public title_text: TextComponent<S>;
    public words_grid: TextGridComponent<S>;
    public words_grid_text_cells: Array<TextComponent<S>> = [];
    public words_left_text: TextComponent<S>;
    public word_length: number = 0;

    private words_left = 0;
    private total_size: { width: number, height: number } = { width: 0, height: 0 };

    public constructor(scene: S, game_state: GameState)
    {
        super(scene, game_state);

        this.title_text = new TextComponent(scene, game_state);
        this.words_grid = new TextGridComponent(scene, game_state);
        this.words_left_text = new TextComponent(scene, game_state);

        this.words_left_text.set_style(FONT_HINTS_WORDS_LEFT, COLOUR_HINTS_WORDS_LEFT);
        this.title_text.set_style(FONT_HINTS_TITLES, COLOUR_HINTS_TITLES);
    }

    private get_words(): { word: string, found: boolean }[]
    {
        if (!this.game_state.square.computation.square)
        {
            return [];
        }
        const quality = this.game_state.square.computation.square.get_quality(this.game_state.words);
        const words = quality.words_by_length[this.word_length];
        const words_found: { word: string, found: boolean }[] = [];
        for (const word of words) 
        {
            // Do something with each found word
            words_found.push({ word: word, found: this.game_state.square.words_found.has(word) });
        }

        // Sort the words alphabetically
        words_found.sort((a, b) => a.word.localeCompare(b.word));
        return words_found;
    }

    /**
     * Choose the word length that is shown by this component.
     */
    public set_word_length(length: number)
    {
        this.word_length = length;
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

    /**
     * Generate some letters for the given word according to the rules based on the length of the word.
     * @param word the word to show some letters from
     * @returns the starred version of the word. I.e.: a****, ab******cd
     */
    private get_some_letters_for_word(word: string): string
    {
        if (word.length <= 4)
        {
            return "*".repeat(word.length);
        }
        if (word.length == 5)
        {
            return word[0] + "*".repeat(word.length - 1);
        }
        if (word.length == 6)
        {
            return word[0] + word[1] + "*".repeat(word.length - 2);
        }
        if (word.length == 7)
        {
            return word[0] + word[1] + "*".repeat(word.length - 3) + word[word.length - 1];
        }
        return word[0] + word[1] + "*".repeat(word.length - 4) + word[word.length - 2] + word[word.length - 1];
    }

    update(): void
    {
        /* Fix the text first */
        const words_found = this.get_words();

        /* How many words are left to find? */
        this.words_left = words_found.filter(word => !word.found).length;

        let words_text = `[i]+ ${this.words_left}`;
        if (this.words_left === 1)
        {
            words_text += " word left";
        }
        else 
        {
            words_text += " words left";
        }

        words_text += "[/i] ";

        /* Do we show the reveal text? */
        if (this.game_state.square.reveals_remaining > 0 && this.word_length < 7)
        {
            words_text += `[u]- [color=${COLOUR_HINTS_REVEAL_LINK}]Reveal a random word[/color][/u]`;
        }
        else
        {
            words_text += `[/i]`;
        }
        this.words_left_text.set_text(words_text);

        /* Title */
        this.title_text.set_text(`${this.word_length} letter${this.word_length === 1 ? "" : "s"}`);

        /* Text grid */
        const number_of_words_found = words_found.filter(word => word.found).length;

        /* Correct the number of cells in the grid */
        let number_of_words_to_put_in_grid = number_of_words_found;
        if (this.game_state.square.show_some_letters)
        {
            number_of_words_to_put_in_grid = words_found.length;
        }
        this.words_grid.fix_cell_count(number_of_words_to_put_in_grid, this.make_text_cell);

        /* Now show each word */
        for (let i = 0; i < words_found.length; i++)
        {
            const { word, found } = words_found[i];
            if (found)
            {
                this.words_grid_text_cells[i].set_text(word);
            }
            else if (this.game_state.square.show_some_letters)
            {
                this.words_grid_text_cells[i].set_text(this.get_some_letters_for_word(word));
            }
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

        if (this.words_left > 0)
        {
            this.words_left_text.set_bounds(left_x, current_y, available_width, Infinity);
            this.words_left_text.update();
            const words_left_size = this.words_left_text.get_size();
            current_y += words_left_size.height;
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

        if (this.words_left > 0)
        {
            this.words_left_text.show();
        }
    }

    public hide(): void
    {
        this.title_text.hide();
        this.words_grid.hide();
        this.words_left_text.hide();
    }

    public destroy(): void
    {
        this.title_text.destroy();
        this.words_left_text.destroy();

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
