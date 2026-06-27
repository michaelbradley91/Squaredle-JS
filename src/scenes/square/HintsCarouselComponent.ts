/**
 * The hints components manages the hints carousel for the user
 * 
 * #################
 * Hint word layout:
 * #################
 * 
 * The real Squardle lays out text using a grid format. This isn't something we can support with pure BBCode out of the box.
 * Squardle calculates the width of every word in the hint block, then figures out based on the longest word how many words
 * can fit in a line with the right spacing between words.
 * 
 * This then forms a grid with every word of the same length being laid out in this grid.
 * 
 * Unfortunately with Phaser it is very hard to set generic styling for headers line gap etc so we'll have to calculate
 * all this ourselves... pretty painful!
 */

import { OuterScreenNode } from "~/layouts/SquareSceneLayout";
import BaseComponent from "../BaseComponent";
import SquareScene from "./SquareScene";
import { update_rectangle } from "../BaseScene";
import { blank_text, fit_text, FONT_HINTS_TITLES, FONT_HINTS_WORDS_LEFT, FontSize, style_bbcode_text } from "~/fonts";
import { get_hint_level, get_inner_rectangle_with_padding, HintLevel } from "~/logic";
import BBCodeText from "phaser4-rex-plugins/plugins/gameobjects/tagtext/bbcodetext/BBCodeText";
import { SquareQuality } from "~/squares";
import { COLOUR_HINTS_TITLES, COLOUR_HINTS_WORDS_LEFT } from "~/colours";

export default class HintsCarouselComponent extends BaseComponent<SquareScene>
{
    game_objects!: {
        hints_left: Phaser.GameObjects.Rectangle;
        hints_right: Phaser.GameObjects.Rectangle;
        text_left: BBCodeText;
        text_right: BBCodeText;
        hints_left_camera: Phaser.Cameras.Scene2D.Camera;
        hints_right_camera: Phaser.Cameras.Scene2D.Camera;
    }

    /**
     * Initialise all the objects needed to display the square
     */
    public init(): void
    {
        this.game_objects = {
            hints_left: this.scene.add.rectangle(455, 325, 755, 725, 0x00ffff),
            hints_right: this.scene.add.rectangle(455, 325, 755, 725, 0xffffff),
            text_left: blank_text(this.scene),
            text_right: blank_text(this.scene),
            hints_left_camera: this.scene.cameras.add(0, 0, 755, 725),
            hints_right_camera: this.scene.cameras.add(0, 0, 755, 725),
        };
    }

    /**
     * Shortcut to get the quality assessment of a square
     */
    private square_quality(): SquareQuality
    {
        return this.game_state.square.computation.square!.get_quality(this.game_state.words);
    }

    /**
     * Hide everything on the hints carousel
     */
    public hide_hints_carousel_objects(): void
    {
        this.game_objects.hints_left.setVisible(false);
        this.game_objects.hints_right.setVisible(false);
        this.game_objects.hints_left_camera.setVisible(false);
        this.game_objects.hints_right_camera.setVisible(false);
    }

    private get_hints_text_without_letters(): string[]
    {
        const text: string[] = [];
        const quality = this.square_quality();
        for (const length in quality.words_by_length)
        {
            /* Check how many words are left to find */
            let remaining_words_of_length = quality.words_by_length[length].size;
            if (remaining_words_of_length <= 0)
            {
                continue
            }
            const words_found_at_length: string[] = []
            for (const word in this.game_state.square.words_found)
            {
                if (word.length.toString() === length)
                {
                    remaining_words_of_length--;
                    words_found_at_length.push(word);
                }
            }
            words_found_at_length.sort();

            /* The title must be accompanied by something to be shown on the hints
             * carousel */
            const title_font_size = this.game_state.font_sizes[FONT_HINTS_TITLES];
            const words_left_font_size = this.game_state.font_sizes[FONT_HINTS_WORDS_LEFT];

            let title_text = style_bbcode_text(`${length} letters\n`, COLOUR_HINTS_TITLES, title_font_size, false, true);
            if (words_found_at_length.length == 0)
            {
                title_text += style_bbcode_text(`${remaining_words_of_length} words left \n`, COLOUR_HINTS_WORDS_LEFT, words_left_font_size, true);
                text.push(title_text);
                continue;
            }
            title_text += `${words_found_at_length[0]} `;
            text.push(title_text);
            /* Add the remaining words as individual segments */
            for (let i = 1; i < words_found_at_length.length; i++)
            {
                text.push(`${words_found_at_length[i]} `);
            }
            text.push(style_bbcode_text(`${remaining_words_of_length} words left \n`, COLOUR_HINTS_WORDS_LEFT, words_left_font_size, true));
        }
        return text;
    }

    /**
     * Get the hinted version of a word with some letters revealed
     * @param word the word to get the hinted text for
     * @returns the word in its hint form
     */
    private get_word_with_letter_hints(word: string): string
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

    /**
     * @returns the hints carousel text when letter hints are shown
     */
    private get_hints_text_with_letters(): string[]
    {
        const text: string[] = [];
        const quality = this.square_quality();

        for (const length in quality.words_by_length)
        {
            if (quality.words_by_length[length].size <= 0)
            {
                continue;
            }

            /* The title must be accompanied by something to be shown on the hints
             * carousel */
            const title_font_size = this.game_state.font_sizes[FONT_HINTS_TITLES];
            const words_font_size = this.game_state.font_sizes[FONT_HINTS_WORDS_LEFT];
            let title_text = style_bbcode_text(`${length} letters\n`, COLOUR_HINTS_TITLES, title_font_size, false, true);

            const words_of_length = Array.from(quality.words_by_length[length]);
            words_of_length.sort();

            if (this.game_state.square.words_found.has(words_of_length[0]))
            {
                title_text += style_bbcode_text(`${words_of_length[0]} `, COLOUR_HINTS_WORDS_LEFT, words_font_size, false);
            }
            else
            {
                title_text += style_bbcode_text(`${this.get_word_with_letter_hints(words_of_length[0])} `, COLOUR_HINTS_WORDS_LEFT, words_font_size, false);
            }
            text.push(title_text);

            /* Now for the remaining words */
            for (let i = 1; i < words_of_length.length; i++)
            {
                const word = words_of_length[i];
                if (this.game_state.square.words_found.has(word))
                {
                    text.push(style_bbcode_text(`${word} `, COLOUR_HINTS_WORDS_LEFT, words_font_size, false));
                }
                else
                {
                    text.push(style_bbcode_text(`${this.get_word_with_letter_hints(word)} `, COLOUR_HINTS_WORDS_LEFT, words_font_size, false));
                }
            }
            text.push(style_bbcode_text(`\n`, COLOUR_HINTS_WORDS_LEFT, words_font_size, false));
        }
        return text;
    }

    /**
     * Okay, I think I'm abandoning the idea of using multiple columns in a vertical layout. It'll look too weird
     * and be a pain to program correctly. We'll increase the font size. Sooo...
     */

    /**
     * @returns the text for the hints carousel
     */
    private get_hints_text_for_carousel(): string[]
    {
        if (!this.game_state.square.computation.square)
        {
            console.log("No square available, no hints to show");
            return [];
        }
        /**
         * Figuring out the hints text is tricky. We have to assume both portions of the hints
         * carousel are the same size (which they should be). Then we simulate the hints
         * text to fit inside each rectangle and figure what eventually appears on the hints
         * carousel whereever the user has scrolled to.
         * 
         * What's tricky is that the hints carousel can show a bit more than just the two
         * hints rectangles while it scrolls... we'll worry about that later.
         */

        /* Firstly, figure out the entire hints text to display */

        const hint_level = get_hint_level(this.game_state);

        switch (hint_level)
        {
            case HintLevel.WORD_HINTS:
                return this.get_hints_text_with_letters();
            case HintLevel.NONE:
            case HintLevel.START_LETTERS:
            case HintLevel.USED_LETTERS:
            default:
                return this.get_hints_text_without_letters();
        }
    }

    public draw_hints_carousel(): void
    {
        const left_rectangle = this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsLeft)!;

        /* Focus the camera on the correct rectangles */
        this.game_objects.hints_left_camera.setBounds(left_rectangle.x, left_rectangle.y, left_rectangle.width, left_rectangle.height * 2);
        this.game_objects.hints_left_camera.setScroll(left_rectangle.x, left_rectangle.y + 350);
        this.game_objects.hints_left_camera.setPosition(left_rectangle.x, left_rectangle.y);
        this.game_objects.hints_left_camera.setSize(left_rectangle.width, left_rectangle.height);
        this.game_objects.hints_left_camera.setBackgroundColor(0xff0000);
        const padding = this.game_state.font_sizes[FontSize.TINY] / 2;
        const inner_rectangle = get_inner_rectangle_with_padding(left_rectangle, padding);
        fit_text(this.game_objects.text_left,
            inner_rectangle,
            this.get_hints_text_for_carousel()
        );
        this.game_objects.text_left.setVisible(true);
        this.game_objects.text_right.setVisible(true);
        this.game_objects.hints_left_camera.setVisible(true);

        /* And the right hand camera... */
        if (!this.game_state.layout.square_scene_layout.is_vertical())
        {
            const right_rectangle = this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsRight)!;
            this.game_objects.hints_right_camera.setBounds(left_rectangle.x, left_rectangle.y, left_rectangle.width, left_rectangle.height * 2);
            this.game_objects.hints_right_camera.setScroll(left_rectangle.x, left_rectangle.y + 500);
            this.game_objects.hints_right_camera.setPosition(right_rectangle.x, right_rectangle.y);
            this.game_objects.hints_right_camera.setSize(right_rectangle.width, right_rectangle.height);
            this.game_objects.hints_right_camera.setBackgroundColor(0x00ff00);
            this.game_objects.hints_right_camera.setVisible(true);
        }
    }

    public draw(): void
    {
        this.hide_hints_carousel_objects();

        const layout = this.game_state.layout.square_scene_layout;
        update_rectangle(layout.get_layout_rectangle(OuterScreenNode.HintsLeft), this.game_objects.hints_left);

        if (layout.get_layout_rectangle(OuterScreenNode.HintsRight))
        {
            update_rectangle(layout.get_layout_rectangle(OuterScreenNode.HintsRight), this.game_objects.hints_right);
        }

        this.draw_hints_carousel();
    }

    update(): void
    {
        this.draw();
    }
}