/**
 * This module contains functions to help us use a sensible font size
 */

import BBCodeText from "phaser4-rex-plugins/plugins/gameobjects/tagtext/bbcodetext/BBCodeText";
import { GameState } from "./logic";
import { COLOUR_HINTS_REVEAL_LINK } from "./colours";

export const SQUARE_TEXT_FONT_FAMILY = 'roboto-bold';
export const SQUARE_TEXT_BIG_FONT_FAMILY = 'roboto-bold-big';

export enum FontSize
{
    MINISCULE = 0,
    TINY,
    SMALLER,
    SMALL,
    MEDIUM,
    LARGE,
    HUGE
}

export const FONT_HINTS_TITLES = FontSize.MEDIUM;
export const FONT_HINTS_REGULAR = FontSize.SMALL;
export const FONT_HINTS_WORDS_LEFT = FontSize.SMALLER;
export const FONT_HINTS_WORD_HINT = FontSize.SMALL;

/* We artificially scale the canvas to force better resolution of text on high DPI displays */
export function get_forced_scaling(): number
{
    // For very high DPI displays, we want to scale up more
    const zoom = visualViewport ? visualViewport.scale : 1;
    if (zoom >= 1)
    {
        return 2;
    }
    return 1;
}

export function get_view_port_scaling(): number
{
    const zoom = visualViewport ? visualViewport.scale : 1;
    return (1 / zoom) * get_forced_scaling();
}

/**
 * Get a reasonable base font size as suggested here:
 * https://matthewjamestaylor.com/responsive-font-size
 */
export function get_base_font_size(canvas_size: { width: number, height: number }): number
{
    // Take whichever is the narrower of width and height so on extremely long displays
    // the font is not excessively large
    let canvas_scaling = Math.min(canvas_size.width, canvas_size.height);
    canvas_scaling += 0.5 * Math.max(canvas_size.width, canvas_size.height);
    const font_size = ((11 * get_view_port_scaling()) + (0.390625 * canvas_scaling / 80));
    return font_size;
}

/**
 * Get an appropriate font-size for the given screen
 */
export function get_font_size(
    canvas_size: { width: number, height: number },
    font_size: FontSize): number
{
    switch (font_size)
    {
        case FontSize.MINISCULE:
            return get_base_font_size(canvas_size) * 0.7;
        case FontSize.TINY:
            return get_base_font_size(canvas_size) * 0.9;
        case FontSize.SMALLER:
            return get_base_font_size(canvas_size) * 1.1;
        case FontSize.SMALL:
            return get_base_font_size(canvas_size) * 1.2;
        case FontSize.MEDIUM:
            return get_base_font_size(canvas_size) * 1.5;
        case FontSize.LARGE:
            return get_base_font_size(canvas_size) * 2.5;
        case FontSize.HUGE:
            return get_base_font_size(canvas_size) * 3.5;
        default:
            // Error as we don't know
            throw new Error("Unknown font size");
    }
}

export function load_font_sizes(game_state: GameState, scene: Phaser.Scene): void
{
    const canvas_size = { width: scene.scale.gameSize.width, height: scene.scale.gameSize.height };
    game_state.font_sizes = {
        [FontSize.MINISCULE]: get_font_size(canvas_size, FontSize.MINISCULE),
        [FontSize.TINY]: get_font_size(canvas_size, FontSize.TINY),
        [FontSize.SMALL]: get_font_size(canvas_size, FontSize.SMALL),
        [FontSize.SMALLER]: get_font_size(canvas_size, FontSize.SMALLER),
        [FontSize.MEDIUM]: get_font_size(canvas_size, FontSize.MEDIUM),
        [FontSize.LARGE]: get_font_size(canvas_size, FontSize.LARGE),
        [FontSize.HUGE]: get_font_size(canvas_size, FontSize.HUGE),
    };
}

/**
 * Try to fit the given text segments into the given bounds. The text segments
 * should be written in BB code and each segment must be placed in whole or not at all.
 * 
 * At least one segment will be placed, so if that cannot fit, it may overlap whatever is on-screen.
 * @param bounds - the space for the text segments
 * @param text_segments - the segments to fit in this space
 * @returns The number of text segments that were able to fit
 */
export function fit_text(text: BBCodeText, bounds: { x: number, y: number, width: number, height: number }, text_segments: string[]):
    { segments: number, text: BBCodeText }
{
    if (text_segments.length <= 0)
    {
        return { segments: 0, text };
    }
    const base_font_size = get_font_size({ width: text.scene.scale.gameSize.width, height: text.scene.scale.gameSize.height }, FontSize.MEDIUM);
    const default_style = {
        valign: 'top' as const,
        halign: 'left' as const,
        wrap: { mode: 'word' as const, width: bounds.width },
        fontFamily: 'roboto',
        fontSize: `${base_font_size}px`,
        color: '#000000',
        lineSpacing: base_font_size * 0.5,
    }
    text.setStyle(default_style);
    text.setPosition(bounds.x, bounds.y);
    let number_of_segments = text_segments.length;
    while (number_of_segments > 0)
    {
        text.setText(text_segments.slice(0, number_of_segments).join(''));
        if (text.height <= bounds.height || number_of_segments === 1)
        {
            text.setStyle(default_style);
            return { segments: number_of_segments, text };
        }
        number_of_segments--;
    }

    text.setStyle(default_style);
    return { segments: 0, text };
}

/**
 * Place text within the given bounds
 * @param bb_text - the text object to place
 * @param bounds - the bounds to place the text within
 * 
 * Note: the text width and height is not actually fixed so it will overlap space if not positioned
 *       somewhere appropriate. You can calculate the size of the text yourself to check it by looking
 *       at the text.width and text.height properties after setting the text and style.
 */
export function place_text(bb_text: BBCodeText, bounds: { x: number, y: number, width: number, height: number }): void
{
    bb_text.setPosition(bounds.x, bounds.y);
    bb_text.setWrapWidth(bounds.width);
}

export const DEFAULT_TEXT_STYLE = {
    fixedWidth: 0,
    fixedHeight: 0,
    valign: 'top' as const,
    halign: 'left' as const,
    wrap: { mode: 'word' as const, width: 0 },
    fontFamily: 'roboto',
    fontSize: '16px',
    color: '#000000',
    underline: {
        color: COLOUR_HINTS_REVEAL_LINK,
        thickness: 2,
        offset: 7
    },
};

/**
 * Create a blank text object which is useful for typing when making a scene
 * @param scene add a blank text object to the current scene
 * @returns the text object created
 */
export function blank_text(scene: Phaser.Scene): BBCodeText
{
    const default_style = {
        ...DEFAULT_TEXT_STYLE,
        fontSize: `${get_base_font_size({ width: scene.scale.gameSize.width, height: scene.scale.gameSize.height })}px`
    };
    const empty_text = new BBCodeText(scene, 0, 0, "", default_style);
    empty_text.setVisible(false);
    scene.add.existing(empty_text);
    return empty_text;
}

/**
 * Style some text with bbcode styling.
 * 
 * @param text the text to style
 * @param colour the colour of the text (foreground)
 * @param size the size of the text in this font
 * @param italic whether this should appear italic
 * @param bold whether this should appear bold
 * @returns a new bb code compliant string stylign as required
 */
export function style_bbcode_text(text: string, colour: string, size: number, italic: boolean = false, bold: boolean = false): string
{
    let style = `[color=${colour}][size=${size}]${text}[/size][/color]`;
    if (italic)
    {
        style = `[i]${style}[/i]`;
    }
    if (bold)
    {
        style = `[b]${style}[/b]`;
    }
    return style;
}

/**
 * Get the standard line spacing for the given font size.
 */
export function get_line_spacing_for_font_size(game_state: GameState, font_size: FontSize): number
{
    return game_state.font_sizes[font_size] * 0.5;
}
