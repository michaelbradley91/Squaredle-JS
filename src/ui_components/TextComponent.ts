/**
 * A basic text component
 */

import { blank_text, DEFAULT_TEXT_STYLE, FontSize, get_line_spacing_for_font_size } from "~/fonts";
import BaseUIComponent from "./base-ui-component";
import { Colours } from "~/colours";
import BBCodeText from "phaser4-rex-plugins/plugins/gameobjects/tagtext/bbcodetext/BBCodeText";
import { GameState } from "~/logic";

export default class TextComponent<S extends Phaser.Scene> extends BaseUIComponent<S>
{
    /* Default font settings. These are the top level settings. BBCode can alter them */
    public font_size: FontSize = FontSize.MEDIUM;
    public font_color: Colours = Colours.BLACK;
    public line_spacing: number | "default" = "default";
    public text_string: string = "";

    /* We do expose this publically for convenience, but it should not be used directly */
    public text!: BBCodeText;

    public constructor(scene: S, game_state: GameState)
    {
        super(scene, game_state);
        this.text = blank_text(scene);
        this.text.setVisible(false);
    }

    public set_style(font_size?: FontSize, font_color?: Colours, line_spacing?: number)
    {
        if (font_size !== undefined)
        {
            this.font_size = font_size;
        }
        if (font_color !== undefined)
        {
            this.font_color = font_color;
        }
        if (line_spacing !== undefined)
        {
            this.line_spacing = line_spacing;
        }
    }

    public set_interactive()
    {
        this.text.setInteractive();
    }

    public set_text(text: string)
    {
        this.text_string = text;
    }

    update(): void
    {
        let line_spacing: number;
        if (this.line_spacing === "default")
        {
            line_spacing = get_line_spacing_for_font_size(this.game_state, this.font_size);
        }
        else
        {
            line_spacing = this.line_spacing;
        }
        const default_style = {
            ...DEFAULT_TEXT_STYLE,
            fontSize: `${this.game_state.font_sizes[this.font_size]}px`,
            position: { x: this.bounds.x, y: this.bounds.y },
            color: this.font_color,
            padding: this.padding,
            lineSpacing: line_spacing
        };
        if (this.bounds.width !== Infinity)
        {
            default_style.fixedWidth = this.bounds.width;
            default_style.wrap = { mode: 'word' as const, width: this.bounds.width };
        }
        if (this.bounds.height !== Infinity)
        {
            default_style.fixedHeight = this.bounds.height;
        }

        this.text.setPosition(this.bounds.x, this.bounds.y);

        this.text.setText(this.text_string);
        this.text.setStyle(default_style);
    }

    public get_size(): { width: number; height: number; }
    {
        return {
            width: this.text.width + this.padding.left + this.padding.right,
            height: this.text.height + this.padding.top + this.padding.bottom
        };
    }

    show(): void
    {
        this.text.setVisible(true);
    }

    hide(): void
    {
        this.text.setVisible(false);
    }
}