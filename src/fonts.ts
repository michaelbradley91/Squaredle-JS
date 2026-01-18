/**
 * This module contains functions to help us use a sensible font size
 */

export enum FontSize
{
    TINY,
    SMALL,
    MEDIUM,
    LARGE,
    HUGE
}

export enum FontStyle
{
    REGULAR = "regular",
    ITALIC = "italic",
    BOLD = "bold",
    BOLD_ITALIC = "bold-italic"
}

/*
 * When placing text on the screen, this determines how the text must be laid out.
 */
export type TextSpecification = {

}

export

    /**
     * All the available font sizes for each font
     */
    const roboto_regular_font_sizes: { [key in number]: string } = {
        12: "roboto-regular-12",
        16: "roboto-regular-16",
        24: "roboto-regular-24",
        32: "roboto-regular-32",
        48: "roboto-regular-48",
        64: "roboto-regular-64",
        80: "roboto-regular-80",
        128: "roboto-regular-128",
        144: "roboto-regular-144"
    }

const roboto_bold_font_sizes: { [key in number]: string } = {
    12: "roboto-bold-12",
    16: "roboto-bold-16",
    24: "roboto-bold-24",
    32: "roboto-bold-32",
    48: "roboto-bold-48",
    64: "roboto-bold-64",
    80: "roboto-bold-80",
    128: "roboto-bold-128",
    144: "roboto-bold-144"
}

const roboto_italic_font_sizes: { [key in number]: string } = {
    12: "roboto-italic-12",
    16: "roboto-italic-16",
    24: "roboto-italic-24",
    32: "roboto-italic-32",
    48: "roboto-italic-48",
    64: "roboto-italic-64",
    80: "roboto-italic-80",
    128: "roboto-italic-128",
    144: "roboto-italic-144"
}

const roboto_bold_italic_font_sizes: { [key in number]: string } = {
    12: "roboto-bold-italic-12",
    16: "roboto-bold-italic-16",
    24: "roboto-bold-italic-24",
    32: "roboto-bold-italic-32",
    48: "roboto-bold-italic-48",
    64: "roboto-bold-italic-64",
    80: "roboto-bold-italic-80",
    128: "roboto-bold-italic-128",
    144: "roboto-bold-italic-144"
}

const available_sizes = Object.keys(roboto_regular_font_sizes).map(s => parseInt(s)).sort((a, b) => a - b);

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
    for (const size in roboto_bold_font_sizes)
    {
        scene.load.bitmapFont(
            `roboto-bold-${size}`,
            `assets/Roboto-Bold-${size}.png`,
            `assets/Roboto-Bold-${size}.fnt`
        );
    }
    for (const size in roboto_italic_font_sizes)
    {
        scene.load.bitmapFont(
            `roboto-italic-${size}`,
            `assets/Roboto-Italic-${size}.png`,
            `assets/Roboto-Italic-${size}.fnt`
        );
    }
    for (const size in roboto_bold_italic_font_sizes)
    {
        scene.load.bitmapFont(
            `roboto-bold-italic-${size}`,
            `assets/Roboto-Bold-Italic-${size}.png`,
            `assets/Roboto-Bold-Italic-${size}.fnt`
        );
    }
}

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
    console.log("Has visual viewport? ", visualViewport != null, " Zoom:", zoom);
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
    const canvas_scaling = Math.min(canvas_size.width, canvas_size.height);
    const font_size = ((15 * get_view_port_scaling()) + (0.390625 * canvas_scaling / 100))
    console.log("Suggesting font size with zoom:", font_size);
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
        case FontSize.TINY:
            return get_base_font_size(canvas_size) * 0.9;
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

export class MyBitmapText extends Phaser.GameObjects.BitmapText
{
    font_size: FontSize;

    constructor(scene: Phaser.Scene, x: number, y: number, font_size: FontSize, font_style: FontStyle, text: string)
    {
        const size = get_font_size({ width: scene.scale.gameSize.width, height: scene.scale.gameSize.height }, font_size);
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
        super(scene, x, y, `roboto-${font_style}-${chosen_size}`, text, size);
        this.font_size = font_size;
        this.setOrigin(0, -0.5);
        scene.add.existing(this);
    }

    update(canvas_size: { width: number, height: number }): this
    {
        const target_size = get_font_size({ width: canvas_size.width, height: canvas_size.height }, this.font_size);
        this.setFontSize(target_size);
        return this;
    }
}

export function make_text(scene: Phaser.Scene, x: number, y: number, font_size: FontSize, font_style: FontStyle, text: string): MyBitmapText
{
    return new MyBitmapText(scene, x, y, font_size, font_style, text);
}

/**
 * 
 * @param bounds 
 * @param text 
 */
export function fit_text(bounds: { width: number, height: number },): void
{

}
