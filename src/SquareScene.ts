import Yoga, { Node } from "yoga-layout";
import { GameState, init_game_state } from "./logic";

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

export default class SquareScene extends Phaser.Scene {
    top_menu_left: Phaser.GameObjects.Rectangle | undefined;
    top_menu_right: Phaser.GameObjects.Rectangle | undefined;
    progress_bar: Phaser.GameObjects.Rectangle | undefined;
    previous_words: Phaser.GameObjects.Rectangle | undefined;
    square: Phaser.GameObjects.Rectangle | undefined;
    hints_carousel_left: Phaser.GameObjects.Rectangle | undefined;
    hints_carousel_right: Phaser.GameObjects.Rectangle | undefined;
    game_state!: GameState;

    // Layout logic
    layout_nodes: {screen: Node, top_menu: Node[], progress_bar: Node, previous_words: Node, square: Node, hints_carousel: Node[], is_vertical: boolean} | undefined;

    constructor() {
        super('square')
    }

    init(data: {game_state: GameState})
    {
        if (!data || !data.game_state)
        {
            this.game_state = init_game_state();
        }
        else
        {
            this.game_state = data.game_state;
        }

        // Set up the Yoga tree for the start scene
        this.update_layout();
    }

    handle_resize(game_size: Phaser.Structs.Size)
    {
        // Update camera viewport to match new size  
        this.cameras.main.setViewport(0, 0, game_size.width, game_size.height);
        
        // Update the layout
        this.update_layout();
    }

    preload(){
        // this.load.image("present", "assets/Present.png");
    }

    get_original_square_rectangle()
    {
        if (!this.layout_nodes) {
            return {x: 0, y: 0, width: 0, height: 0};
        }
        let node = this.layout_nodes.square
        let width = node.getComputedWidth();
        let height = node.getComputedHeight();
        let x = node.getComputedLeft();
        let y = node.getComputedTop();
        let parent = node.getParent();
        while (parent) {
            x += parent.getComputedLeft();
            y += parent.getComputedTop();
            parent = parent.getParent();
        }
        return {x: x, y: y, width: width, height: height};
    }

    get_rectangle_from_node(node: Node)
    {
        // Get the absolute position of this node first...
        let width = node.getComputedWidth();
        let height = node.getComputedHeight();
        let x = node.getComputedLeft();
        let y = node.getComputedTop();
        let parent = node.getParent();
        while (parent) {
            x += parent.getComputedLeft();
            y += parent.getComputedTop();
            parent = parent.getParent();
        }
        
        if (!this.layout_nodes) {
            return {x: x, y: y, width: width, height: height};
        }

        if (node == this.layout_nodes?.square)
        {
            // Due to the madening flow behaviour for squares, I can't figure out a way to correctly squish the square inside
            // its bounding box, so compute this...
            console.log("Adjusting square...")
            if (width > height)
            {
                let gap = width - height;
                // The square should be centered width-ways and made to the height
                x += gap / 2;
                width = height;
            }
            else if (height > width)
            {
                let gap = height - width;

                // If this is a vertical layout, the square should be kept upward to allow more space in the hints
                if (!this.layout_nodes.is_vertical)
                {
                    y += gap / 2;
                }
                height = width;
            }
        }
        else if (this.layout_nodes?.hints_carousel && (node == this.layout_nodes.hints_carousel[0] || (this.layout_nodes.hints_carousel.length > 1 && node == this.layout_nodes.hints_carousel[1])))
        {
            // If this is the hints bars increase their size according to the square...
            let square_coords = this.get_rectangle_from_node(this.layout_nodes.square);
            let original_square_coords = this.get_original_square_rectangle();
            
            // Find the adjustment...
            if (original_square_coords.width > square_coords.width)
            {
                // The square has been squished horizontally, so increase the hints width if in a horizontal layout
                if (!this.layout_nodes.is_vertical)
                {
                    let gap = original_square_coords.width - square_coords.width;
                    width += gap / 2;
                    if (node == this.layout_nodes.hints_carousel[1])
                    {
                        x -= gap / 2;
                    }
                }
            }
            if (original_square_coords.height > square_coords.height)
            {
                // The square has been squished vertically, so increase the hints height if in a vertical layout
                if (this.layout_nodes.is_vertical)
                {                    
                    let gap = original_square_coords.height - square_coords.height;
                    height += gap;
                    y -= gap;
                }
            }

        }
        return {x: x, y: y, width: width, height: height};
    }

    update_rectangle(node: Node, rectangle: Phaser.GameObjects.Rectangle | undefined)
    {
        let coords = this.get_rectangle_from_node(node)
        if (!rectangle) {
            return;
        }

        if (node == this.layout_nodes?.square)
        {
            console.log("Drawing square at " + (coords.x + (coords.width / 2)) + "," +  (coords.y + (coords.height / 2)) + " (" + coords.width + "," + coords.height + ")");
        }
        rectangle.setPosition(coords.x + (coords.width / 2), coords.y + (coords.height / 2));
        rectangle.setSize(coords.width, coords.height);
        rectangle.setVisible(true);
    }
    hide_rectangle(node: Node, rectangle: Phaser.GameObjects.Rectangle | undefined)
    {
        if (rectangle) {
            rectangle.setVisible(false);
            rectangle.width = 0;
            rectangle.height = 0;
            rectangle.setPosition(-1000, -1000);
        }
    }

    draw()
    {
        if (!this.layout_nodes) {
            return;
        }

        if (!this.top_menu_left || !this.top_menu_right || !this.progress_bar || !this.previous_words || !this.square || !this.hints_carousel_left || !this.hints_carousel_right) {
            return;
        }
        this.top_menu_left.visible = false;
        this.top_menu_right.visible = false;
        this.progress_bar.visible = false;
        this.previous_words.visible = false;
        this.square.visible = false;  
        this.hints_carousel_left.visible = false;
        this.hints_carousel_right.visible = false;

        this.update_rectangle(this.layout_nodes.top_menu[0], this.top_menu_left);
        if (this.layout_nodes.top_menu.length > 1)
        {
            this.update_rectangle(this.layout_nodes.top_menu[1], this.top_menu_right);
        }
        this.update_rectangle(this.layout_nodes.progress_bar, this.progress_bar);
        this.update_rectangle(this.layout_nodes.previous_words, this.previous_words);
        this.update_rectangle(this.layout_nodes.square, this.square);
        this.update_rectangle(this.layout_nodes.hints_carousel[0], this.hints_carousel_left);
        if (this.layout_nodes.hints_carousel.length > 1)
        {
            this.update_rectangle(this.layout_nodes.hints_carousel[1], this.hints_carousel_right);
        }


        console.log("Drawn layout with rectangle at: " + this.square?.x + ", " + this.square?.y + " size " + this.square?.width + "x" + this.square?.height);
    }

    get_hints_carousel_min_width()
    {
        return Math.max(this.game.canvas.width / 4, HINTS_CAROUSEL_MIN_WIDTH)
    }

    update_layout() {
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

        // Is the screen horizontal or vertical?
        let is_vertical = true;
        if (this.game.canvas.width > this.game.canvas.height) {
            // Horizontal layout
            is_vertical = false
        }

        console.log(`Layout is vertical: ${is_vertical}`);

        // Easier to just reset each time
        if (this.game_state.layout.square_scene_root_node)
        {
            this.game_state.layout.square_scene_root_node.freeRecursive();
            this.game_state.layout.square_scene_root_node = undefined;
        }

        let node = Yoga.Node.create();
        this.game_state.layout.square_scene_root_node = node;

        // Build the layout tree if it doesn't exist yet
        if (is_vertical)
        {
            // The screen node is the outer container holding the menu options
            let screen_node = Yoga.Node.create();
            screen_node.setWidth("100%");
            screen_node.setHeight("100%");
            screen_node.setDisplay(Yoga.DISPLAY_FLEX);
            screen_node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
            
            node.insertChild(screen_node, 0);

            let top_menu_node = Yoga.Node.create();
            top_menu_node.setHeight(TOP_MENU_HEIGHT);
            top_menu_node.setWidth("100%");
            screen_node.insertChild(top_menu_node, 0);

            let progress_bar_node = Yoga.Node.create();
            progress_bar_node.setHeight(PROGRESS_BAR_HEIGHT);
            progress_bar_node.setWidth("100%");
            screen_node.insertChild(progress_bar_node, 1);

            let previous_words_node = Yoga.Node.create();
            previous_words_node.setHeight(PREVIOUS_WORDS_HEIGHT);
            previous_words_node.setWidth("100%");
            screen_node.insertChild(previous_words_node, 2);

            let square_node = Yoga.Node.create();
            square_node.setFlexGrow(1);
            square_node.setWidth("100%");
            square_node.setAlignSelf(Yoga.ALIGN_CENTER);
            screen_node.insertChild(square_node, 3);

            let hints_carousel_node = Yoga.Node.create();
            hints_carousel_node.setMinHeight(HINTS_CAROUSEL_MIN_HEIGHT);
            hints_carousel_node.setWidth("100%");
            screen_node.insertChild(hints_carousel_node, 4);

            this.layout_nodes = {
                screen: screen_node,
                top_menu: [top_menu_node],
                progress_bar: progress_bar_node,
                previous_words: previous_words_node,
                square: square_node,
                hints_carousel: [hints_carousel_node],
                is_vertical: is_vertical
            };
        }
        else
        {
            // The screen node is the outer container holding the menu options
            let screen_node = Yoga.Node.create();
            screen_node.setWidth("100%");
            screen_node.setHeight("100%");
            screen_node.setDisplay(Yoga.DISPLAY_FLEX);
            screen_node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
            
            node.insertChild(screen_node, 0);

            let top_row_container = Yoga.Node.create();
            top_row_container.setHeight(TOP_MENU_HEIGHT);
            top_row_container.setWidth("100%");
            top_row_container.setDisplay(Yoga.DISPLAY_FLEX);
            top_row_container.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
            top_row_container.setJustifyContent(Yoga.JUSTIFY_SPACE_BETWEEN);
            screen_node.insertChild(top_row_container, 0);

            let menu_left_node = Yoga.Node.create();
            menu_left_node.setWidth(TOP_MENU_LEFT_WIDTH);
            menu_left_node.setMinWidth(TOP_MENU_LEFT_MIN_WIDTH);
            top_row_container.insertChild(menu_left_node, 0);

            let progress_bar_node = Yoga.Node.create();
            progress_bar_node.setHeight(PROGRESS_BAR_HEIGHT);
            progress_bar_node.setMinWidth(PROGRESS_BAR_MIN_WIDTH);
            progress_bar_node.setWidth(TOP_MENU_PROGRESS_BAR_WIDTH);
            top_row_container.insertChild(progress_bar_node, 1);

            let menu_right_node = Yoga.Node.create();
            menu_right_node.setWidth(TOP_MENU_RIGHT_WIDTH);
            menu_right_node.setMinWidth(TOP_MENU_RIGHT_MIN_WIDTH);
            top_row_container.insertChild(menu_right_node, 2);

            let previous_words_node = Yoga.Node.create();
            previous_words_node.setHeight(PREVIOUS_WORDS_HEIGHT);
            previous_words_node.setWidth("100%");
            screen_node.insertChild(previous_words_node, 1);

            let middle_row_container = Yoga.Node.create();
            middle_row_container.setFlexGrow(1);
            middle_row_container.setWidth("100%");
            middle_row_container.setDisplay(Yoga.DISPLAY_FLEX);
            middle_row_container.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
            middle_row_container.setJustifyContent(Yoga.JUSTIFY_CENTER);
            screen_node.insertChild(middle_row_container, 2);

            let hints_carousel_left_node = Yoga.Node.create();
            hints_carousel_left_node.setMinWidth(this.get_hints_carousel_min_width());
            hints_carousel_left_node.setHeight("100%");
            middle_row_container.insertChild(hints_carousel_left_node, 0);

            let square_node = Yoga.Node.create();
            square_node.setFlexGrow(1);
            square_node.setWidth("auto");
            square_node.setHeight("100%");
            square_node.setAlignSelf(Yoga.ALIGN_CENTER);
            square_node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
            square_node.setJustifyContent(Yoga.JUSTIFY_CENTER);
            middle_row_container.insertChild(square_node, 1);

            let hints_carousel_right_node = Yoga.Node.create();
            hints_carousel_right_node.setMinWidth(this.get_hints_carousel_min_width());
            hints_carousel_right_node.setHeight("100%");
            middle_row_container.insertChild(hints_carousel_right_node, 2);

            this.layout_nodes = {
                screen: screen_node,
                top_menu: [menu_left_node, menu_right_node],
                progress_bar: progress_bar_node,
                previous_words: previous_words_node,
                square: square_node,
                hints_carousel: [hints_carousel_left_node, hints_carousel_right_node],
                is_vertical: is_vertical
            };
        }
		
        console.log("Calculating layout for size: " + this.game.canvas.width + "x" + this.game.canvas.height);

		this.game_state.layout.square_scene_root_node.calculateLayout(this.game.canvas.width, this.game.canvas.height, Yoga.DIRECTION_LTR);
        this.draw()
    }

    create() {
        this.top_menu_left = this.add.rectangle(400, 300, 800, 600, 0xff00000);
        this.top_menu_right = this.add.rectangle(400, 300, 800, 600, 0x00ff00);
        this.progress_bar = this.add.rectangle(400, 300, 800, 600, 0x0000ff);
        this.previous_words = this.add.rectangle(400, 300, 800, 600, 0xffff00);
        this.square = this.add.rectangle(400, 300, 800, 800, 0xff00ff);
        this.hints_carousel_left = this.add.rectangle(455, 325, 755, 725, 0x00ffff);
        this.hints_carousel_right = this.add.rectangle(455, 325, 755, 725, 0xffffff);

        this.top_menu_left.visible = false;
        this.top_menu_right.visible = false;
        this.progress_bar.visible = false;
        this.previous_words.visible = false;
        this.square.visible = false;  
        this.hints_carousel_left.visible = false;  
        this.hints_carousel_right.visible = false;

        // Listen for resize events  
        this.scale.on('resize', this.handle_resize, this);
    
        // TODO: create the square here

        // Trigger initial resize to set positions  
        this.handle_resize(this.scale.gameSize);
    }

    update(time: number, delta: number): void {
        // update logic here
    }
}