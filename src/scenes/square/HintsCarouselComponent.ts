/**
 * The hints components manages the hints carousel for the user
 */

import { OuterScreenNode } from "~/layouts/SquareSceneLayout";
import BaseComponent from "../BaseComponent";
import SquareScene from "./SquareScene";
import { update_rectangle } from "../BaseScene";
import { blank_text, fit_text, FontSize } from "~/fonts";
import { get_hint_level, get_inner_rectangle_with_padding, HintLevel } from "~/logic";
import BBCodeText from "phaser3-rex-plugins/plugins/gameobjects/tagtext/bbcodetext/BBCodeText";
import { SquareQuality } from "~/squares";

export default class HintsCarouselComponent extends BaseComponent<SquareScene>
{
    game_objects!: {
        hints_left: Phaser.GameObjects.Rectangle;
        hints_right: Phaser.GameObjects.Rectangle;
        text_left: BBCodeText;
        text_right: BBCodeText
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
            let title_text = `[b]${length} letters[/b]\n`;
            if (words_found_at_length.length == 0)
            {
                title_text += `${remaining_words_of_length} words left\n`;
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
            text.push(`${remaining_words_of_length} words left\n`);
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
            /* The title must be accompanied by something to be shown on the hints
             * carousel */
            let title_text = `[b]${length} letters[/b]\n`;

            const first_word = quality.words_by_length[length].values().next().value;
            if (!first_word)
            {
                continue;
            }

            if (this.game_state.square.words_found.has(first_word))
            {
                title_text += `${first_word} `;
            }
            else
            {
                title_text += `${this.get_word_with_letter_hints(first_word)} `;
            }
            text.push(title_text);

            /* Now for the remaining words */
            for (let i = 1; i < quality.words_by_length[length].size; i++)
            {
                const word = quality.words_by_length[length][i];
                if (this.game_state.square.words_found.has(word))
                {
                    text.push(`${word} `);
                }
                else
                {
                    text.push(`${this.get_word_with_letter_hints(word)} `);
                }
            }
            text.push(`\n`);
        }
        return text;
    }

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
        const rectangle = this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsLeft)!;
        const padding = this.game_state.font_sizes[FontSize.TINY] / 2;
        const inner_rectangle = get_inner_rectangle_with_padding(rectangle, padding);
        fit_text(this.game_objects.text_left,
            inner_rectangle,
            this.get_hints_text_for_carousel()
        );

        this.game_objects.text_left.setVisible(true);
        this.game_objects.text_right.setVisible(true);
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