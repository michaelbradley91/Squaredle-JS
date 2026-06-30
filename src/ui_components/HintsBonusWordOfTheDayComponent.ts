/**
 * Shows the bonus word of the day
 */

import { GameState, get_some_letters_for_word } from "~/logic";
import BaseUIComponent from "./base-ui-component";
import TextComponent from "./TextComponent";
import { FONT_HINTS_BONUS_REVEAL_EXPLANATION, FONT_HINTS_REGULAR, FONT_HINTS_TITLES, get_line_spacing_for_font_size } from "~/fonts";
import { COLOUR_HINTS_BONUS_REVEAL_EXPLANATION, COLOUR_HINTS_REGULAR, COLOUR_HINTS_TITLES } from "~/colours";

export default class HintsBonusWordsFoundComponent<S extends Phaser.Scene> extends BaseUIComponent<S>
{
    public title_text: TextComponent<S>;
    public bonus_word: TextComponent<S>;
    public bonus_word_explanation: TextComponent<S>;

    private total_size: { width: number, height: number } = { width: 0, height: 0 };

    public constructor(scene: S, game_state: GameState)
    {
        super(scene, game_state);

        this.title_text = new TextComponent(scene, game_state);
        this.bonus_word = new TextComponent(scene, game_state);
        this.bonus_word_explanation = new TextComponent(scene, game_state);

        this.title_text.set_text("Bonus word of the day");
        this.bonus_word_explanation.set_text("[i]Find for a bonus reveal![i]");

        // Set default styles
        this.title_text.set_style(FONT_HINTS_TITLES, COLOUR_HINTS_TITLES);
        this.bonus_word.set_style(FONT_HINTS_REGULAR, COLOUR_HINTS_REGULAR);
        this.bonus_word_explanation.set_style(FONT_HINTS_BONUS_REVEAL_EXPLANATION, COLOUR_HINTS_BONUS_REVEAL_EXPLANATION);
    }

    update(): void
    {
        /* Set the bonus word text */
        const bonus_word_found = this.game_state.square.words_found.has(this.game_state.square.bonus_word_of_the_day);
        if (bonus_word_found)
        {
            this.bonus_word.set_text(this.game_state.square.bonus_word_of_the_day);
        }
        else
        {
            this.bonus_word.set_text(get_some_letters_for_word(this.game_state.square.bonus_word_of_the_day));
        }

        /* Lay everything out */
        const title_line_spacing = get_line_spacing_for_font_size(this.game_state, FONT_HINTS_TITLES);

        const left_x = this.bounds.x + this.padding.left;
        let current_y = this.bounds.y + this.padding.top;
        const available_width = this.bounds.width - this.padding.left - this.padding.right;

        /* Title */
        this.title_text.set_bounds(left_x, current_y, available_width, Infinity);
        this.title_text.update();
        const title_size = this.title_text.get_size();
        current_y += title_size.height + title_line_spacing;

        /* Bonus word */
        this.bonus_word.set_bounds(left_x, current_y, available_width, Infinity);
        this.bonus_word.update();
        const bonus_word_size = this.bonus_word.get_size();
        current_y += bonus_word_size.height;

        /* Explanation if the word hasn't already been found */
        if (!bonus_word_found)
        {
            current_y += title_line_spacing;
            this.bonus_word_explanation.set_bounds(left_x, current_y, available_width, Infinity);
            this.bonus_word_explanation.update();
            const bonus_word_explanation_size = this.bonus_word_explanation.get_size();
            current_y += bonus_word_explanation_size.height;
        }

        /* Record the total size we used */
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
        this.bonus_word.show();
        if (!this.game_state.square.words_found.has(this.game_state.square.bonus_word_of_the_day))
        {
            this.bonus_word_explanation.show();
        }
    }

    public hide(): void
    {
        this.title_text.hide();
        this.bonus_word.hide();
        this.bonus_word_explanation.hide();
    }

    public destroy(): void
    {
        this.title_text.destroy();
        this.bonus_word.destroy();
        this.bonus_word_explanation.destroy();
    }
}