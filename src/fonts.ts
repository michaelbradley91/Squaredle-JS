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
    const canvas_scaling = Math.min(canvas_size.width, canvas_size.height);
    const font_size = ((15 * get_view_port_scaling()) + (0.390625 * canvas_scaling / 100))
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

export class MyBitmapText extends Phaser.GameObjects.Text
{
    font_size: FontSize;

    constructor(scene: Phaser.Scene, x: number, y: number, font_size: FontSize, text: string)
    {
        const size = get_font_size({ width: scene.scale.gameSize.width, height: scene.scale.gameSize.height }, font_size);
        super(scene, x, y, text, { fontFamily: `roboto`, fontSize: `${size}px`, color: '#000000' });
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

export function make_text(scene: Phaser.Scene, x: number, y: number, font_size: FontSize, text: string): MyBitmapText
{
    return new MyBitmapText(scene, x, y, font_size, text);
}

/**
 * 
 * @param bounds 
 * @param text 
 */
export function fit_text(bounds: { width: number, height: number },): void
{

}
