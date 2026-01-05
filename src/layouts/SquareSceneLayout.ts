/**
 * This module contains all the logic needed to layout the square scene.
 * 
 * As this requires a fair bit of logic, I decided to break it out into a separate class
 * 
 */

/**
 * There will be three different layouts depending on dimensions.
 * 
 * For a small screen, the layout will be:
 * 
 * ==================
 * Top Menu
 * ==================
 * < Progress Bar >
 * ==================
 * < Previous words >
 * ==================
 * 
 * ╭───┬───┬───┬───╮
 * │ A │ B │ C │ D │
 * ├───┼───┼───┼───┤
 * │ E │ F │ G │ H │
 * ├───┼───┼───┼───┤
 * │ I │ J │ K │ L │
 * ├───┼───┼───┼───┤
 * │ M │ N │ O │ P │
 * ╰───┴───┴───┴───╯
 * 
 * =================
 * Hints carousel
 * =================
 * 
 * In this form, the square will be the adapatable element, taking up all the remaining space.
 * 
 * The hints will be at the bottom and will be at the bottom and take a reasonable
 * amount of space, using up a minumum number of lines. It will use the minimum number
 * of lines always, and then the maximum number of lines that preserve the square aspect ratio.
 * 
 * The previous words line will show a few words entered by the user, and if tapped
 * on will show all the words in a carousel view like on NYT spelling bee:
 * 
 * ==================
 * Top Menu
 * ==================
 * < Progress Bar >
 * ==================
 * < Previous words >
 * 
 * Word 1
 * Word 2
 * 
 * ==================
 * 
 * Words will be laid out in columns of width appropriate to the longest word
 * or a reasonable minimum width, which will be designed to fit large words.
 * (We'll see if the longest word can be reasonably fit into these columns)
 * 
 * The hints carousel will be at the bottom as before. After some thought, making
 * this scrollable is quite complex, so instead it will be a carousel.
 * 
 * ==================
 * 4 letters (3/10)
 * ....
 * ==================
 * 
 * And towards the end bonus words etc
 * ==================
 * Bonus words
 * ....
 * ==================
 * 
 * We'll try to fit all the words in for "4 letters" for example, if possible.
 * If not, the carousel will continue the 4 letter words and then move onto
 * 5 letter words etc.
 * 
 * For the carousel to be usable on a non-touch device, there will be left/right
 * buttons to move the carousel at the bottom with stylish dots
 * (similar again to NYT Spelling Bee) to show where you are.
 * 
 * If we can't fit enough dots (very unlikely) then we'll just let the dots
 * roll over but always show the little arrows. These can be clicked, but
 * left and right buttons on these screens will also move the hints carousel
 * (Or the previous words carousel when it is open)
 */

/**
 * For a wide screen the layout will be:
 * 
 * =====================================================
 * Top Menu        ║ < Progress Bar >  ║  More Menu    
 * =====================================================
 * Previous words  
 * =====================================================
 * Hints Carousel  ║ ╭───┬───┬───┬───╮ ║ Hints Carousel 
 *                 ║ │ A │ B │ C │ D │ ║
 * 4 Letters (3/10)║ ├───┼───┼───┼───┤ ║  6 Letters (1/8)
 * ....            ║ │ E │ F │ G │ H │ ║  ....
 * ....            ║ ├───┼───┼───┼───┤ ║  ....
 * ....            ║ │ I │ J │ K │ L │ ║
 *                 ║ ├───┼───┼───┼───┤ ║
 * 5 Letters (2/5) ║ │ M │ N │ O │ P │ ║
 * ....            ║ ╰───┴───┴───┴───╯ ║
 * 
 * In this layout, previous words are a thin banner across the top and can again
 * be clicked on for a carousel drop down of all the previously found words
 * 
 * The hints carousel is split in two panels each with hints. Swiping across
 * on either will move both panels as if sliding under the square in the middle.
 * 
 * The hints carousel will again have some sensible minimum size and otherwise 
 * grow but allow the square to use the full height if possible.
 * 
 * The hints might roll from one side to the other but I think it may be cleaner
 * to only place hints if they fully fit in one side...? We'll see how it looks.
 */

import Yoga, { Config, Node } from 'yoga-layout';
import { append_child, get_absolute_rect as get_absolute_rectangle_from_node } from './yoga-helpers';
import { GameState } from '~/logic';

/* Constant parameters to adjust the view */
const TOP_MENU_HEIGHT = 36;
const PROGRESS_BAR_HEIGHT = 36;
const PREVIOUS_WORDS_HEIGHT = 36;
const HINTS_CAROUSEL_MIN_HEIGHT = 100;
const TOP_MENU_LEFT_MIN_WIDTH = 20;
const TOP_MENU_RIGHT_MIN_WIDTH = 20;
const PROGRESS_BAR_MIN_WIDTH = 40;
const HINTS_CAROUSEL_MIN_WIDTH = 120;
const TOP_MENU_LEFT_WIDTH = "30%";
const TOP_MENU_RIGHT_WIDTH = "30%";
const TOP_MENU_PROGRESS_BAR_WIDTH = "40%";

/**
 * Used by the screen to request specific positions
 */
export enum OuterScreenNode
{
    TopMenuLeft = "top_menu_left",
    TopMenuRight = "top_menu_right",
    TopMenu = "top_menu",
    ProgressBar = "progress_bar",
    Hints = "hints",
    HintsLeft = "hints_left",
    HintsRight = "hints_right",
    PreviousWords = "previous_words",
    Square = "square"
}

export default class SquareSceneLayout 
{
    // A saved reference to the yoga config used throughout the game
    private yoga_config: Config;

    // The root node for the layout
    private root_node: Node = Yoga.Node.create();

    private is_vertical_layout: boolean = false;

    // The "outer" layout. Due to difficulties positioning the square, we calculate the layout in a few stages
    private outer_layout: { screen: Node, top_menu: Node[], progress_bar: Node, previous_words: Node, square_scaffold: Node, hints_scaffold: Node[], square: Node, hints: Node[] } | undefined;

    // The squares on the grid. Note they are a part of the overall screen layout
    private square_layout: { size: number, grid_nodes: Node[][] } | undefined;

    constructor(yoga_config: Config) 
    {
        this.yoga_config = yoga_config;
    }

    /**
     * Check if the screen is in a vertical orientation
     * @returns true if the screen is in a vertical orientation
     */
    is_vertical(): boolean 
    {
        return this.is_vertical_layout;
    }

    private get_square_container_rectangle(): { x: number, y: number, width: number, height: number } 
    {
        // We need the original square layout to compute the correct adjustment
        return get_absolute_rectangle_from_node(this.outer_layout!.square_scaffold);
    }

    private get_hints_carousel_min_width(screen_size: { width: number, height: number }): number 
    {
        return Math.max(screen_size.width / 4, HINTS_CAROUSEL_MIN_WIDTH)
    }

    private get_rectangle_for_outer_node(node: Node | undefined): { x: number, y: number, width: number, height: number } 
    {
        if (!this.outer_layout) 
        {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        let { x: x, y: y, width: width, height: height } = get_absolute_rectangle_from_node(node);

        if (node == this.outer_layout.square_scaffold) 
        {
            // Due to the madening flow behaviour for squares, I can't figure out a way to correctly squish the square inside
            // its bounding box, so compute this...
            if (width > height) 
            {
                const gap = width - height;
                // The square should be centered width-ways and made to the height
                x += gap / 2;
                width = height;
            }
            else if (height > width) 
            {
                const gap = height - width;

                // If this is a vertical layout, the square should be kept upward to allow more space in the hints
                if (!this.is_vertical_layout) 
                {
                    y += gap / 2;
                }
                height = width;
            }
        }
        else if (node == this.outer_layout.hints_scaffold[0] || (!this.is_vertical_layout && node == this.outer_layout.hints_scaffold[1])) 
        {
            // If this is the hints bars increase their size according to the square...
            const square_coords = this.get_rectangle_for_outer_node(this.outer_layout.square_scaffold);
            const original_square_coords = this.get_square_container_rectangle();

            // Find the adjustment...
            if (original_square_coords.width > square_coords.width) 
            {
                // The square has been squished horizontally, so increase the hints width if in a horizontal layout
                if (!this.is_vertical_layout) 
                {
                    const gap = original_square_coords.width - square_coords.width;
                    width += gap / 2;
                    if (node == this.outer_layout.hints_scaffold[1]) 
                    {
                        x -= gap / 2;
                    }
                }
            }
            if (original_square_coords.height > square_coords.height) 
            {
                // The square has been squished vertically, so increase the hints height if in a vertical layout
                if (this.is_vertical_layout) 
                {
                    const gap = original_square_coords.height - square_coords.height;
                    height += gap;
                    y -= gap;
                }
            }

        }
        return { x: x, y: y, width: width, height: height };
    }

    private update_outer_layout(screen_size: { width: number, height: number }) 
    {
        // Build the layout tree if it doesn't exist yet
        if (this.is_vertical_layout) 
        {
            // The screen node is the outer container holding the menu options
            const screen_node = Yoga.Node.create(this.yoga_config);
            screen_node.setWidth("100%");
            screen_node.setHeight("100%");
            screen_node.setDisplay(Yoga.DISPLAY_FLEX);
            screen_node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
            append_child(this.root_node, screen_node);

            const top_menu_node = Yoga.Node.create(this.yoga_config);
            top_menu_node.setHeight(TOP_MENU_HEIGHT);
            top_menu_node.setWidth("100%");
            append_child(screen_node, top_menu_node);

            const progress_bar_node = Yoga.Node.create(this.yoga_config);
            progress_bar_node.setHeight(PROGRESS_BAR_HEIGHT);
            progress_bar_node.setWidth("100%");
            append_child(screen_node, progress_bar_node);

            const previous_words_node = Yoga.Node.create(this.yoga_config);
            previous_words_node.setHeight(PREVIOUS_WORDS_HEIGHT);
            previous_words_node.setWidth("100%");
            append_child(screen_node, previous_words_node);

            const square_node = Yoga.Node.create(this.yoga_config);
            square_node.setFlexGrow(1);
            square_node.setWidth("100%");
            square_node.setAlignSelf(Yoga.ALIGN_CENTER);
            append_child(screen_node, square_node);

            const hints_carousel_node = Yoga.Node.create(this.yoga_config);
            hints_carousel_node.setMinHeight(HINTS_CAROUSEL_MIN_HEIGHT);
            hints_carousel_node.setWidth("100%");
            append_child(screen_node, hints_carousel_node);

            this.outer_layout = {
                screen: screen_node,
                top_menu: [top_menu_node],
                progress_bar: progress_bar_node,
                previous_words: previous_words_node,
                square_scaffold: square_node,
                hints_scaffold: [hints_carousel_node],
                square: square_node,
                hints: []
            };
        }
        else 
        {
            // The screen node is the outer container holding the menu options
            const screen_node = Yoga.Node.create();
            screen_node.setWidth("100%");
            screen_node.setHeight("100%");
            screen_node.setDisplay(Yoga.DISPLAY_FLEX);
            screen_node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);

            append_child(this.root_node, screen_node);

            const top_row_container = Yoga.Node.create();
            top_row_container.setHeight(TOP_MENU_HEIGHT);
            top_row_container.setWidth("100%");
            top_row_container.setDisplay(Yoga.DISPLAY_FLEX);
            top_row_container.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
            top_row_container.setJustifyContent(Yoga.JUSTIFY_SPACE_BETWEEN);
            append_child(screen_node, top_row_container);

            const menu_left_node = Yoga.Node.create();
            menu_left_node.setWidth(TOP_MENU_LEFT_WIDTH);
            menu_left_node.setMinWidth(TOP_MENU_LEFT_MIN_WIDTH);
            append_child(top_row_container, menu_left_node);

            const progress_bar_node = Yoga.Node.create();
            progress_bar_node.setHeight(PROGRESS_BAR_HEIGHT);
            progress_bar_node.setMinWidth(PROGRESS_BAR_MIN_WIDTH);
            progress_bar_node.setWidth(TOP_MENU_PROGRESS_BAR_WIDTH);
            append_child(top_row_container, progress_bar_node);

            const menu_right_node = Yoga.Node.create();
            menu_right_node.setWidth(TOP_MENU_RIGHT_WIDTH);
            menu_right_node.setMinWidth(TOP_MENU_RIGHT_MIN_WIDTH);
            append_child(top_row_container, menu_right_node);

            const previous_words_node = Yoga.Node.create();
            previous_words_node.setHeight(PREVIOUS_WORDS_HEIGHT);
            previous_words_node.setWidth("100%");
            append_child(screen_node, previous_words_node);

            const middle_row_container = Yoga.Node.create();
            middle_row_container.setFlexGrow(1);
            middle_row_container.setWidth("100%");
            middle_row_container.setDisplay(Yoga.DISPLAY_FLEX);
            middle_row_container.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
            middle_row_container.setJustifyContent(Yoga.JUSTIFY_CENTER);
            append_child(screen_node, middle_row_container);

            const hints_carousel_left_node = Yoga.Node.create();
            hints_carousel_left_node.setMinWidth(this.get_hints_carousel_min_width(screen_size));
            hints_carousel_left_node.setHeight("100%");
            append_child(middle_row_container, hints_carousel_left_node);

            const square_node = Yoga.Node.create();
            square_node.setFlexGrow(1);
            square_node.setWidth("auto");
            square_node.setHeight("100%");
            square_node.setAlignSelf(Yoga.ALIGN_CENTER);
            square_node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
            square_node.setJustifyContent(Yoga.JUSTIFY_CENTER);
            append_child(middle_row_container, square_node);

            const hints_carousel_right_node = Yoga.Node.create();
            hints_carousel_right_node.setMinWidth(this.get_hints_carousel_min_width(screen_size));
            hints_carousel_right_node.setHeight("100%");
            append_child(middle_row_container, hints_carousel_right_node);

            this.outer_layout = {
                screen: screen_node,
                top_menu: [menu_left_node, menu_right_node],
                progress_bar: progress_bar_node,
                previous_words: previous_words_node,
                square_scaffold: square_node,
                hints_scaffold: [hints_carousel_left_node, hints_carousel_right_node],
                square: square_node,
                hints: []
            };
        }

        /* Now we actually change the outer node positions according to the adjustments we make for the hints and square */
        this.root_node.calculateLayout(screen_size.width, screen_size.height, Yoga.DIRECTION_LTR);

        /* Update the inner node rectangles... */
        const square_coordinates = this.get_rectangle_for_outer_node(this.outer_layout.square_scaffold);

        console.log("Square coordinates after layout: ", square_coordinates);

        const square_node = Yoga.Node.create(this.yoga_config);
        square_node.setWidth(square_coordinates.width);
        square_node.setHeight(square_coordinates.height);
        square_node.setPositionType(Yoga.POSITION_TYPE_ABSOLUTE);
        square_node.setPosition(Yoga.EDGE_LEFT, square_coordinates.x);
        square_node.setPosition(Yoga.EDGE_TOP, square_coordinates.y);
        square_node.setJustifyContent(Yoga.JUSTIFY_CENTER);
        square_node.setAlignContent(Yoga.ALIGN_CENTER);

        append_child(this.outer_layout.screen, square_node);
        this.outer_layout.square = square_node;

        const hints_left_node = Yoga.Node.create(this.yoga_config);
        const hints_left_coords = this.get_rectangle_for_outer_node(this.outer_layout.hints_scaffold[0]);
        hints_left_node.setWidth(hints_left_coords.width);
        hints_left_node.setHeight(hints_left_coords.height);
        hints_left_node.setPositionType(Yoga.POSITION_TYPE_ABSOLUTE);
        hints_left_node.setPosition(Yoga.EDGE_LEFT, hints_left_coords.x);
        hints_left_node.setPosition(Yoga.EDGE_TOP, hints_left_coords.y);
        hints_left_node.setJustifyContent(Yoga.JUSTIFY_CENTER);
        hints_left_node.setAlignContent(Yoga.ALIGN_CENTER);

        append_child(this.outer_layout.screen, hints_left_node);
        this.outer_layout.hints = [hints_left_node];

        if (!this.is_vertical_layout)
        {
            const hints_right_node = Yoga.Node.create(this.yoga_config);
            const hints_right_coords = this.get_rectangle_for_outer_node(this.outer_layout.hints_scaffold[1]);
            hints_right_node.setWidth(hints_right_coords.width);
            hints_right_node.setHeight(hints_right_coords.height);
            hints_right_node.setPositionType(Yoga.POSITION_TYPE_ABSOLUTE);
            hints_right_node.setPosition(Yoga.EDGE_LEFT, hints_right_coords.x);
            hints_right_node.setPosition(Yoga.EDGE_TOP, hints_right_coords.y);
            hints_right_node.setJustifyContent(Yoga.JUSTIFY_CENTER);
            hints_right_node.setAlignContent(Yoga.ALIGN_CENTER);

            append_child(this.outer_layout.screen, hints_right_node);
            this.outer_layout.hints = [hints_left_node, hints_right_node];
        }

        // Recalculate all positions
        this.root_node.calculateLayout(screen_size.width, screen_size.height, Yoga.DIRECTION_LTR);
    }

    /**
     * Update the layout details for the given game state
     * @param _game_state - the current game state
     */
    private update_square_layout(_game_state: GameState)
    {
        // TODO: actually use the game state. Assuming it is 4x4 for now
        this
    }

    /**
     * Update the layout of the screen for the given screen size
     * @param screen_size the new screen size
     */
    update_layout(screen_size: { width: number, height: number }, _game_state: GameState) 
    {
        // Free the existing layout
        this.root_node.freeRecursive();
        this.root_node = Yoga.Node.create(this.yoga_config);

        this.is_vertical_layout = screen_size.height > screen_size.width;
        this.update_outer_layout(screen_size);
    }

    /**
     * Get the rectangle for the given outer screen node
     * @param node the "node" you want the rectangle for
     * @returns the rectangle for the given node
     */
    get_layout_rectangle(node: OuterScreenNode): { x: number, y: number, width: number, height: number } 
    {
        if (!this.outer_layout) 
        {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        let outer_node: Node | undefined = undefined;
        switch (node) 
        {
            case OuterScreenNode.TopMenu:
                outer_node = this.outer_layout.top_menu[0];
                break;
            case OuterScreenNode.TopMenuLeft:
                outer_node = this.outer_layout.top_menu[0];
                break;
            case OuterScreenNode.TopMenuRight:
                if (this.outer_layout.top_menu.length > 1) 
                {
                    outer_node = this.outer_layout.top_menu[1];
                }
                break;
            case OuterScreenNode.ProgressBar:
                outer_node = this.outer_layout.progress_bar;
                break;
            case OuterScreenNode.PreviousWords:
                outer_node = this.outer_layout.previous_words;
                break;
            case OuterScreenNode.Square:
                outer_node = this.outer_layout.square;
                break;
            case OuterScreenNode.Hints:
                outer_node = this.outer_layout.hints[0];
                break;
            case OuterScreenNode.HintsLeft:
                outer_node = this.outer_layout.hints[0];
                break;
            case OuterScreenNode.HintsRight:
                if (this.outer_layout.hints.length > 1) 
                {
                    outer_node = this.outer_layout.hints[1];
                }
                break;
        }
        return this.get_rectangle_for_outer_node(outer_node);
    }
}