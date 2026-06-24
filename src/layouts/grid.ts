/**
 * This module contains logic to help layout text in a grid
 * 
 * This is used by the hints carousel to layout the hint words in a grid format
 */

/**
 * @param items the items to layout
 * @param bounds the bounds of the grid
 * @param outer_padding the padding around the entire grid
 * @param cell_padding the padding around each cell
 * @param fixed_cell_height if provided, this is the height of each cell, otherwise the height of each cell is determined by the tallest item in the grid.
 *                          Padding is applied to the height of each cell, so the actual height of each cell is fixed_cell_height + cell_padding.top + cell_padding.bottom
 * 
 * Items are spread horizontally across the grid and wrapped from left to right and then top to bottom.
 * All items are aligned horizontally consistently across each row so they line up.
 * Items use as little height as possible and do not spread out. Where items do not fit in bounds,
 * coordinates are not returned for them.
 * 
 * @returns the x,y coordinates for each item in the grid
 */
export function layout_grid(items: { width: number, height: number }[], bounds: { x: number, y: number, width: number, height: number },
    outer_padding: { left: number, right: number, top: number, bottom: number },
    cell_padding: { left: number, right: number, top: number, bottom: number }, fixed_cell_height: number | undefined = undefined): { items: { x: number, y: number }[], bounds: { x: number, y: number, width: number, height: number } }
{
    /*
     * Every cell in a grid must occupy the same amount of space, so find the biggest cell we have.
     * First look for the tallest cell if applicable
     */
    let cell_height = fixed_cell_height;
    if (cell_height === undefined)
    {
        for (const item of items)
        {
            if (cell_height === undefined || item.height > cell_height)
            {
                cell_height = item.height;
            }
        }
    }
    if (cell_height === undefined)
    {
        /* No items */
        return {
            items: [], bounds: {
                x: bounds.x, y: bounds.y,
                width: outer_padding.left + outer_padding.right,
                height: outer_padding.top + outer_padding.bottom
            }
        };
    }

    /*
     * Get the cell width
     */
    let cell_width = 0;
    for (const item of items)
    {
        if (item.width > cell_width)
        {
            cell_width = item.width;
        }
    }

    /*
     * Now the "actual" cell width is determined by:
     * 
     * 1. Work out the maximum number of items with the cell width that respects the padding rules
     * 2. Extend the cell width to fill the space evenly.
     * 
     * The layout looks like this:
     * 
     * ===============================================================================================================================================================
     * | outer_padding.left  | cell_padding.left | cell_width | cell_padding.right | cell_padding.left | cell_width | cell_padding.right | ... | outer_padding.right |
     * ===============================================================================================================================================================
     * 
     * So deduct the outer padding, then divide the space by cell width + padding, and round down
     */
    const available_width = bounds.width - outer_padding.left - outer_padding.right;
    const cell_total_width = cell_width + cell_padding.left + cell_padding.right;
    const items_per_row = Math.floor(available_width / cell_total_width);

    /*
     * Now return each item location
     */
    let row = 0;
    let column = 0;
    const item_coordinates: { x: number, y: number }[] = [];
    for (const _ of items)
    {
        const y = bounds.y + outer_padding.top + row * (cell_height + cell_padding.top + cell_padding.bottom) + cell_padding.top;

        /* Check we are not out of bounds vertically */
        if (y + cell_height + cell_padding.bottom > bounds.y + bounds.height - outer_padding.bottom)
        {
            break;
        }

        const x = bounds.x + outer_padding.left + column * cell_total_width + cell_padding.left;
        item_coordinates.push({ x, y });
        column++;
        if (column >= items_per_row)
        {
            column = 0;
            row++;
        }
    }
    const total_height = outer_padding.top + outer_padding.bottom + (row + 1) * (cell_height + cell_padding.top + cell_padding.bottom);
    return {
        items: item_coordinates,
        bounds: {
            x: bounds.x, y: bounds.y,
            width: bounds.width,
            height: total_height
        }
    };
}