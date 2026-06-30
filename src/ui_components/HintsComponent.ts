/**
 * This component combines all the hint related components together
 * to show the full hints text
 */

import { GameState } from "~/logic";
import BaseUIComponent from "./base-ui-component";
import HintsHeaderComponent from "./HintsHeaderComponent";
import HintsWordsComponent from "./HintsWordsComponents";
import HintsBonusWordOfTheDayComponent from "./HintsBonusWordOfTheDayComponent";
import HintsBonusWordsFoundComponent from "./HintsBonusWordsFoundComponent";
import { FONT_HINTS_TITLES, get_line_spacing_for_font_size } from "~/fonts";

export default class HintsComponent<S extends Phaser.Scene> extends BaseUIComponent<S>
{
    public header: HintsHeaderComponent<S>;
    public words: HintsWordsComponent<S>[] = [];
    public bonus_word_of_the_day: HintsBonusWordOfTheDayComponent<S>;
    public bonus_words: HintsBonusWordsFoundComponent<S>;

    private total_size: { width: number, height: number } = { width: 0, height: 0 };
    private number_of_words_components = 0;

    public constructor(scene: S, game_state: GameState)
    {
        super(scene, game_state);
        this.header = new HintsHeaderComponent(scene, game_state);
        this.bonus_word_of_the_day = new HintsBonusWordOfTheDayComponent(scene, game_state);
        this.bonus_words = new HintsBonusWordsFoundComponent(scene, game_state);
    }

    /**
     * Create the required words components and return the number needed
     * @returns the number of words components to show
     */
    private update_words_components(): number
    {
        /* Firstly, we need to figure out how many words components we need for all the word lengths */
        if (!this.game_state.square.computation.square)
        {
            return 0;
        }
        const quality = this.game_state.square.computation.square.get_quality(this.game_state.words);
        let word_component_count = 0;

        /* Sort in ascending lengths */
        const lengths = Object.keys(quality.words_by_length).map((length) => parseInt(length)).sort((a, b) => a - b);
        for (const length of lengths)
        {
            if (quality.words_by_length[length].size > 0)
            {
                if (word_component_count >= this.words.length)
                {
                    this.words.push(new HintsWordsComponent(this.scene, this.game_state));
                }
                this.words[word_component_count].set_word_length(length);
                word_component_count++;
            }
        }
        return word_component_count;
    }

    public update(): void
    {
        /* Firstly, we need to figure out how many words components we need for all the word lengths */
        this.number_of_words_components = this.update_words_components();

        /* Now lay out all the components correctly */
        const title_padding = get_line_spacing_for_font_size(this.game_state, FONT_HINTS_TITLES);

        const left_x = this.bounds.x + this.padding.left;
        let current_y = this.bounds.y + this.padding.top;
        const available_width = this.bounds.width - this.padding.left - this.padding.right;

        this.header.set_bounds(left_x, current_y, available_width, Infinity);
        this.header.update();
        const header_size = this.header.get_size();
        current_y += header_size.height + title_padding;

        for (let i = 0; i < this.number_of_words_components; i++)
        {
            this.words[i].set_bounds(left_x, current_y, available_width, Infinity);
            this.words[i].update();
            const words_size = this.words[i].get_size();
            current_y += words_size.height + title_padding;
        }

        this.bonus_word_of_the_day.set_bounds(left_x, current_y, available_width, Infinity);
        this.bonus_word_of_the_day.update();
        const bonus_word_of_the_day_size = this.bonus_word_of_the_day.get_size();
        current_y += bonus_word_of_the_day_size.height + title_padding;

        this.bonus_words.set_bounds(left_x, current_y, available_width, Infinity);
        this.bonus_words.update();
        const bonus_words_size = this.bonus_words.get_size();
        current_y += bonus_words_size.height;

        /* Update our total size */
        this.total_size.width = this.bounds.width;
        this.total_size.height = this.padding.bottom + current_y - this.bounds.y;
    }

    public get_size(): { width: number; height: number; }
    {
        return this.total_size;
    }

    public show(): void
    {
        this.header.show();
        for (let i = 0; i < this.number_of_words_components; i++)
        {
            this.words[i].show();
        }
        this.bonus_word_of_the_day.show();
        this.bonus_words.show();
    }

    public hide(): void
    {
        this.header.hide();
        for (let i = 0; i < this.words.length; i++)
        {
            this.words[i].hide();
        }
        this.bonus_word_of_the_day.hide();
        this.bonus_words.hide();
    }

    public destroy(): void
    {
        this.header.destroy();
        for (let i = 0; i < this.words.length; i++)
        {
            this.words[i].destroy();
        }
        this.bonus_word_of_the_day.destroy();
        this.bonus_words.destroy();
    }
}