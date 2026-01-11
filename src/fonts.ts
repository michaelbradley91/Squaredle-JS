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
 * All the available font sizes for Roboto Regular
 */
const roboto_regular_font_sizes: { [key in number]: string } = {
    12: "roboto-regular-12",
    16: "roboto-regular-16",
    24: "roboto-regular-24",
    32: "roboto-regular-32",
    48: "roboto-regular-48",
    80: "roboto-regular-80",
    128: "roboto-regular-128",
    144: "roboto-regular-144"
}

const available_sizes = Object.keys(roboto_regular_font_sizes).map(s => parseInt(s)).sort((a, b) => a - b);
let em_font_size: number = 0;

export function get_em_font_size(): number
{
    if (em_font_size > 0) return em_font_size;

    const div = document.getElementById("font-em-div");
    if (!div) return 0;
    div.style.height = '12pt';
    // em_font_size = parseFloat(getComputedStyle(div).fontSize);
    em_font_size = div.offsetHeight;
    div.style.height = '0em';
    return em_font_size;
}

/**
 * Load all the fonts for the current scene
 */
export function load_fonts(scene: Phaser.Scene)
{
    for (const size in roboto_regular_font_sizes)
    {
        scene.load.bitmapFont(
            `roboto-regular-${size}`,
            `assets/Roboto-Regular-${size}.png`,
            `assets/Roboto-Regular-${size}.fnt`
        );
    }
}

/**
 * Get an appropriate font-size for the given screen
 */
export function get_font_size(
    canvas_height: number,
    font_size: FontSize): number
{
    switch (font_size)
    {
        case FontSize.TINY:
            return get_em_font_size();
        case FontSize.SMALL:
            return get_em_font_size() * 1.25;
        case FontSize.MEDIUM:
            return get_em_font_size() * 1.75;
        case FontSize.LARGE:
            return get_em_font_size() * 2.5;
        case FontSize.HUGE:
            return get_em_font_size() * 3.5;
        default:
            // Error as we don't know
            throw new Error("Unknown font size");
    }
}

export class MyBitmapText extends Phaser.GameObjects.BitmapText
{
    font_size: FontSize;

    constructor(scene: Phaser.Scene, x: number, y: number, font_size: FontSize, text: string)
    {
        const size = get_font_size(scene.scale.gameSize.height, font_size);
        // A font size about 1.5* bigger than the actual font size tends to look best for some reason
        let chosen_size = available_sizes[available_sizes.length - 1];
        for (const available_size of available_sizes)
        {
            if (size * 1.5 <= available_size)
            {
                chosen_size = available_size;
                break;
            }
        }
        super(scene, x, y, `roboto-regular-${chosen_size}`, text, size);
        this.font_size = font_size;
        this.setOrigin(0, -0.5);
        scene.add.existing(this);
    }

    update(canvas_height: number)
    {
        const target_size = get_font_size(canvas_height, this.font_size);
        this.setFontSize(target_size);
        return this;
    }
}


export function make_text(scene: Phaser.Scene, x: number, y: number, font_size: FontSize, text: string): Phaser.GameObjects.BitmapText
{
    return new MyBitmapText(scene, x, y, font_size, text);
}

export function resize_font(font: Phaser.GameObjects.BitmapText, canvas_height: number): Phaser.GameObjects.BitmapText
{
    const target_size = get_font_size(canvas_height, FontSize.MEDIUM);
    font.setFontSize(target_size);
    return font;
}