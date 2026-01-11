/**
 * This module contains functions to help us use a sensible font size
 */

export enum FontSize
{
    /* We scale font sizes to fit a certain percentage of the screen height */
    TINY = 0.020,
    SMALL = 0.025,
    MEDIUM = 0.035,
    LARGE = 0.05,
    HUGE = 0.075
}

/**
 * Get an appropriate font-size for the given screen
 */
export function get_font_size(
    canvas_size: { width: number, height: number },
    font_size: FontSize): number
{
    return Math.ceil(canvas_size.height * font_size);
}
