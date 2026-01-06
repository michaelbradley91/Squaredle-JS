import Phaser from 'phaser'

/**
 * This module helps in handling textures
 * 
 * Functions borrowed from this live demo:
 * https://codepen.io/rexrainbow/pen/PoYewoW
 */

/**
 * Add a rectangle to the graphics object
 */
export function graphics_add_rectangle(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, color: number, alpha: number): Phaser.GameObjects.Graphics
{
    graphics.fillStyle(color, alpha);
    graphics.fillRect(x, y, width, height);
    return graphics
}

/**
 * Add a circle to the graphics object. The circle's centre will be x, y
 */
export function graphics_add_circle(graphics: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, color: number, alpha: number): Phaser.GameObjects.Graphics
{
    graphics.fillStyle(color, alpha);
    graphics.fillCircle(x, y, radius);
    return graphics;
}

/**
 * Create a rectangle texture and add it to the scene's texture manager 
 * @param scene the scene to add the rectangle texture to
 * @param key the key to use when referring to the rectangle texture
 * @param width the width of the rectangle
 * @param color the fill colour of the rectangle
 * @param height the height of the rectangle
 */
export function add_rectangle_texture(scene: Phaser.Scene, key: string, width: number, color: number, height: number)
{
    scene.add.graphics()
        .fillStyle(color)
        .fillRect(0, 0, width, height)
        .generateTexture(key, width, height)
        .destroy();
}

/**
 * Create a dashed rectangle texture and add it to the scene's texture manager
 * @param scene the scene to add the dashed rectangle texture to
 * @param key the key to use when referring to the dashed rectangle texture
 * @param width the width of the rectangle
 * @param dash_percent the percentage of the width that should be filled to create the dashed effect
 * @param color the fill colour of the rectangle
 * @param height the height of the rectangle
 */
export function create_dashed_rectangle_texture(scene: Phaser.Scene, key: string, width: number, dash_percent: number, color: number, height: number)
{
    scene.add.graphics()
        .fillStyle(color)
        .fillRect(0, 0, width * dash_percent, height)
        .generateTexture(key, width, height)
        .destroy();
}

/**
 * Create a circle texture and add it to the scene's texture manager
 * @param scene the scene to add the circle texture to
 * @param key the key to use when referring to the circle texture
 * @param diameter the diameter of the circle
 * @param color the fill colour of the circle
 * @param alpha the alpha (transparency) of the circle
 */
export function create_circle_texture(scene: Phaser.Scene, key: string, diameter: number, color: number, alpha: number)
{
    const r = diameter / 2;
    scene.add.graphics()
        .fillStyle(color, alpha)
        .fillCircle(r, r, r)
        .generateTexture(key, diameter, diameter)
        .destroy();
}