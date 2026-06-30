/**
 * A lot of different colours to use!
 */

export enum Colours
{
    WHITE = "#ffffff",
    BLACK = "#000000",
    RED_PRIMARY = "#b82828",
    LIGHT_GRAY = "#3b3b3b"
}

export const COLOUR_HINTS_TITLES = Colours.RED_PRIMARY;
export const COLOUR_HINTS_WORDS_LEFT = Colours.LIGHT_GRAY;
export const COLOUR_LINK = Colours.RED_PRIMARY
export const COLOUR_HINTS_REGULAR = Colours.BLACK;
export const COLOUR_HINTS_WORD_HINT = Colours.BLACK;
export const COLOUR_HINTS_REVEAL_LINK = Colours.RED_PRIMARY;
export const COLOUR_HINTS_BONUS_REVEAL_EXPLANATION = Colours.LIGHT_GRAY;

/* Default checkbox colours */
export const CHECKBOX_BORDER_COLOR = Colours.LIGHT_GRAY;
export const CHECKBOX_FILL_COLOR = Colours.RED_PRIMARY;
export const CHECKBOX_CLEARED_COLOR = Colours.WHITE;
export const CHECKBOX_TICK_COLOR = Colours.WHITE;

export function colour_to_hex(colour: Colours): number
{
    return parseInt(colour.replace("#", ""), 16);
}