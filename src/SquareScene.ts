import { GameState, init_game_state } from "./logic";

export default class SquareScene extends Phaser.Scene {

    game_state!: GameState;

    // Layout logic
    layout_nodes: {screen: Node, start: Node, quit: Node} | undefined;

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
    }

    create() {
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