/**
 * The text grid lays text out in a grid of equal columns.
 * The column size is determined by the longest text item and then the number of columns
 * is maximised for the given width. If the width is infinite, then the grid is a single row
 * 
 * Note: I'm not sure how the text will align within the cells. As all the cells are aligned, hopefully
 *       the text will naturally align with its height. If it doesn't, we need a way to make the text
 *       component align in a more intuitive way.
 * 
 * Note 2: the cells are intended to contain single words. If you have multiple words that can wrap, this could
 *         be very confusing.
 */

import BaseUIComponent from "./base-ui-component";
import TextComponent from "./TextComponent";

export default class TextGridComponent<S extends Phaser.Scene> extends BaseUIComponent<S>
{
    /* Cell padding is only applied between cells and not at the borders. */
    public cell_padding: { horizontal: number, vertical: number } = { horizontal: 0, vertical: 0 };

    /* The text components to display */
    public text_components: Array<TextComponent<S>> = [];

    /* Remember the actual size after the last update */
    private total_size: { width: number, height: number } = { width: 0, height: 0 };

    public set_cell_padding(horizontal: number, vertical: number): void
    {
        this.cell_padding.horizontal = horizontal;
        this.cell_padding.vertical = vertical;
    }

    public add_text_cell(text_component: TextComponent<S>): void
    {
        this.text_components.push(text_component);
    }

    public remove_text_cell(text_component: TextComponent<S>): TextComponent<S>
    {
        const index = this.text_components.indexOf(text_component);
        if (index !== -1)
        {
            this.text_components.splice(index, 1);
        }
        return text_component;
    }

    /**
     * Removes or adds cells to ensure the grid has the specified number of cells.
     * @param count the number of cells this grid should have
     * @param create_cell a function to create a new cell if needed
     * 
     * @returns any cells removed from the grid
     */
    public fix_cell_count(count: number, create_cell: () => TextComponent<S>): TextComponent<S>[]
    {
        const removed_cells: TextComponent<S>[] = [];
        if (this.text_components.length > count)
        {
            while (this.text_components.length > count)
            {
                const text_component = this.text_components.pop();
                if (text_component)
                {
                    removed_cells.push(text_component);
                }
            }
        }
        else if (this.text_components.length < count)
        {
            while (this.text_components.length < count)
            {
                const text_component = create_cell();
                this.add_text_cell(text_component);
            }
        }
        return removed_cells;
    }

    public update(): void
    {
        /* Update all text components first */
        for (const text_component of this.text_components)
        {
            /* Give it infinite space so we can work out how wide the text is */
            text_component.set_bounds(0, 0, Infinity, Infinity);
            text_component.update();
        }

        /* Check which text component is the widest and which is the tallest */
        let widest = 0;
        let tallest = 0;
        for (const text_component of this.text_components)
        {
            const size = text_component.get_size();
            if (size.width > widest)
            {
                widest = size.width;
            }
            if (size.height > tallest)
            {
                tallest = size.height;
            }
        }

        /* The cell size is decided now - how many columns can we fit? */
        let columns = this.text_components.length;
        const available_width = this.bounds.width - this.padding.left - this.padding.right;
        if (this.bounds.width !== Infinity)
        {
            columns = Math.floor((available_width + this.cell_padding.horizontal) / (widest + this.cell_padding.horizontal));
            if (columns < 1)
            {
                columns = 1;
            }
        }

        /* The actual column width is the widest possible space with the padding applied */
        const cell_width = ((available_width + this.cell_padding.horizontal) / columns) - this.cell_padding.horizontal;

        /* How many rows do we need? */
        const rows = Math.ceil(this.text_components.length / columns);

        let cell_height = tallest;
        if (this.bounds.height !== Infinity)
        {
            const available_height = this.bounds.height - this.padding.top - this.padding.bottom;
            /* Spread the rows across the available height */
            cell_height = ((available_height + this.cell_padding.vertical) / rows) - this.cell_padding.vertical;
        }

        /* Set the bounds for each text component and then update them again... */
        for (let i = 0; i < this.text_components.length; i++)
        {
            const text_component = this.text_components[i];
            const row = Math.floor(i / columns);
            const column = i % columns;
            const x = this.bounds.x + this.padding.left + column * (cell_width + this.cell_padding.horizontal);
            const y = this.bounds.y + this.padding.top + row * (cell_height + this.cell_padding.vertical);
            text_component.set_bounds(x, y, cell_width, cell_height);
            text_component.update();
        }

        /* Record the total size used */
        if (this.bounds.width !== Infinity)
        {
            this.total_size.width = this.bounds.width;
        }
        else
        {
            this.total_size.width = this.padding.left + this.padding.right + columns * cell_width + (columns - 1) * this.cell_padding.horizontal;
        }
        if (this.bounds.height !== Infinity)
        {
            this.total_size.height = this.bounds.height;
        }
        else
        {
            this.total_size.height = this.padding.top + this.padding.bottom + rows * cell_height + (rows - 1) * this.cell_padding.vertical;
        }
    }

    public get_size(): { width: number; height: number; }
    {
        return { width: this.total_size.width, height: this.total_size.height };
    }

    public show(): void
    {
        for (const text_component of this.text_components)
        {
            text_component.show();
        }
    }

    public hide(): void
    {
        for (const text_component of this.text_components)
        {
            text_component.hide();
        }
    }

    /**
     * Destroying the grid destroys all the text components within it. If you want to keep them, remove them first.
     */
    public destroy(): void
    {
        this.hide();
        for (const text_component of this.text_components)
        {
            text_component.destroy();
        }
    }
}