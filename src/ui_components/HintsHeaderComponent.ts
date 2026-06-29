/**
 * The hints header on the square scene. This looks like:
 * 
 * Hints
 * 
 * ? Sort words
 * ? Show letters
 * 
 * Reveals remaining: 1
 * 
 * Or alternatively if hints are not available yet:
 * 
 * Hints
 * 
 * Earn more hints by completing the puzzle!
 * 
 * Reveals remaining: 1
 */

import { GameState } from "~/logic";
import BaseUIComponent from "./base-ui-component";
import CheckboxComponent from "./CheckboxComponent";
import TextComponent from "./TextComponent";
import { FONT_HINTS_REGULAR, FONT_HINTS_TITLES, get_line_spacing_for_font_size } from "~/fonts";
import { COLOUR_HINTS_REGULAR, COLOUR_HINTS_TITLES } from "~/colours";

export default class HintsHeaderComponent<S extends Phaser.Scene> extends BaseUIComponent<S>
{
    public title_text: TextComponent<S>;
    public sort_words_text: TextComponent<S>;
    public sort_words_checkbox: CheckboxComponent<S>;
    public show_letters_text: TextComponent<S>;
    public show_letters_checkbox: CheckboxComponent<S>;
    public reveals_remaining_text: TextComponent<S>;
    public earn_hints_text: TextComponent<S>;
    public fixed_height_text: TextComponent<S>;

    private total_size: { width: number, height: number } = { width: 0, height: 0 };

    public constructor(scene: S, game_state: GameState)
    {
        super(scene, game_state);
        this.title_text = new TextComponent(scene, game_state);
        this.sort_words_text = new TextComponent(scene, game_state);
        this.sort_words_checkbox = new CheckboxComponent(scene, game_state);
        this.show_letters_text = new TextComponent(scene, game_state);
        this.show_letters_checkbox = new CheckboxComponent(scene, game_state);
        this.reveals_remaining_text = new TextComponent(scene, game_state);
        this.earn_hints_text = new TextComponent(scene, game_state);
        this.fixed_height_text = new TextComponent(scene, game_state);

        // Set default text
        this.title_text.set_text("Hints");
        this.sort_words_text.set_text("Sort words");
        this.show_letters_text.set_text("Reveal some letters");
        this.earn_hints_text.set_text("Earn more hints by completing the puzzle!");
        this.fixed_height_text.set_text("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
        this.fixed_height_text.set_bounds(0, 0, Infinity, Infinity);

        // Set default styles
        this.title_text.set_style(FONT_HINTS_TITLES, COLOUR_HINTS_TITLES);
        this.sort_words_text.set_style(FONT_HINTS_REGULAR, COLOUR_HINTS_REGULAR);
        this.show_letters_text.set_style(FONT_HINTS_REGULAR, COLOUR_HINTS_REGULAR);
        this.earn_hints_text.set_style(FONT_HINTS_REGULAR, COLOUR_HINTS_REGULAR);
        this.reveals_remaining_text.set_style(FONT_HINTS_REGULAR, COLOUR_HINTS_REGULAR);
        this.fixed_height_text.set_style(FONT_HINTS_REGULAR, COLOUR_HINTS_REGULAR);

        this.sort_words_checkbox.set_alignment("middle", "left");
        this.show_letters_checkbox.set_alignment("middle", "left");
    }

    update(): void
    {
        // Update the text of each text component first
        this.reveals_remaining_text.set_text(`Reveals remaining: ${this.game_state.square.reveals_remaining}`);

        const title_padding = get_line_spacing_for_font_size(this.game_state, FONT_HINTS_TITLES);
        const regular_padding = get_line_spacing_for_font_size(this.game_state, FONT_HINTS_REGULAR);

        // Update the padding and line spacing
        this.title_text.set_padding(0, title_padding, 0, 0);
        this.sort_words_checkbox.set_padding(0, 0, 0, regular_padding / 2);
        this.sort_words_text.set_padding(0, regular_padding, 0, 0);
        this.show_letters_checkbox.set_padding(0, 0, 0, regular_padding / 2);
        this.show_letters_text.set_padding(0, regular_padding, 0, 0);
        this.earn_hints_text.set_padding(0, regular_padding, 0, 0);
        this.reveals_remaining_text.set_padding(0, 0, 0, 0);

        // Lay out each component one by one
        let current_y = this.bounds.y + this.padding.top;
        const left_x = this.bounds.x + this.padding.left;
        const actual_width = this.bounds.width - this.padding.left - this.padding.right;
        this.title_text.set_bounds(left_x, current_y, actual_width, Infinity);

        this.title_text.update();
        const title_size = this.title_text.get_size();
        current_y += title_size.height;

        // TODO do not always show hints

        /* The checkboxes should be the height of a single line, so calculate that quickly */
        this.fixed_height_text.update();
        const single_line_height = this.fixed_height_text.get_size().height;

        this.sort_words_checkbox.set_bounds(left_x, current_y, Infinity, single_line_height);
        this.sort_words_checkbox.update();
        const sort_words_checkbox_size = this.sort_words_checkbox.get_size();

        this.sort_words_text.set_bounds(left_x + sort_words_checkbox_size.width, current_y, actual_width - sort_words_checkbox_size.width, Infinity);
        this.sort_words_text.update();
        const sort_words_text_size = this.sort_words_text.get_size();
        current_y += Math.max(sort_words_checkbox_size.height, sort_words_text_size.height);

        /* Repeat for the show letters checkbox and text */
        this.show_letters_checkbox.set_bounds(left_x, current_y, Infinity, single_line_height);
        this.show_letters_checkbox.update();
        const show_letters_checkbox_size = this.show_letters_checkbox.get_size();

        this.show_letters_text.set_bounds(left_x + show_letters_checkbox_size.width, current_y, actual_width - show_letters_checkbox_size.width, Infinity);
        this.show_letters_text.update();
        const show_letters_text_size = this.show_letters_text.get_size();
        current_y += Math.max(show_letters_checkbox_size.height, show_letters_text_size.height);

        /* Now show the lives remaining text */
        this.reveals_remaining_text.set_bounds(left_x, current_y, actual_width, Infinity);
        this.reveals_remaining_text.update();
        const reveals_remaining_text_size = this.reveals_remaining_text.get_size();
        current_y += reveals_remaining_text_size.height;

        /* 
         * The hints text always occupies the full width and is infinitely tall so we
         * don't need to adjust the height based on its content.
         */
        this.total_size.height = (current_y - this.bounds.y) + this.padding.bottom;
        this.total_size.width = this.bounds.width;
    }
    public get_size(): { width: number; height: number; }
    {
        return this.total_size;
    }
    public show(): void
    {
        this.title_text.show();
        this.sort_words_text.show();
        this.sort_words_checkbox.show();
        this.show_letters_text.show();
        this.show_letters_checkbox.show();
        this.reveals_remaining_text.show();

        // TODO: show this when appropriate
        // this.earn_hints_text.show();
    }
    public hide(): void
    {
        this.title_text.hide();
        this.sort_words_text.hide();
        this.sort_words_checkbox.hide();
        this.show_letters_text.hide();
        this.show_letters_checkbox.hide();
        this.reveals_remaining_text.hide();
        this.earn_hints_text.hide();
    }
}