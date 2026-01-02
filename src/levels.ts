/*
 * Definitions for all the levels
 */

import { BINARY_REPAIR_TITLE, BINARY_TEST_TITLE, GRID_HEIGHT, GRID_WIDTH, REPAIR_TITLE, TEST_TITLE, TILE_SIZE } from "./constants";
import { Bauble, Grid, Level, LevelType, Piece } from "./types";

// Note that all tests and conversions assume Red and Blue baubles are the only input colours
export function baubles_to_number(binary_baubles: Bauble[], one_bauble: Bauble): number
{
    if (binary_baubles.length == 0) return 0;
    let bauble_number = 0;
    for (let i = binary_baubles.length - 1; i >= 0; i -= 1)
    {
        bauble_number *= 2;
        bauble_number += (binary_baubles[i] == one_bauble) ? 1 : 0;
    }
    return bauble_number;
}

export function number_to_baubles(number: number, one_bauble: Bauble): Bauble[]
{
    let current_number = number;
    const baubles: Bauble[] = [];
    const zero_bauble = one_bauble == Bauble.Red ? Bauble.Blue : Bauble.Red;
    while (current_number != 0)
    {
        baubles.push((current_number % 2) == 1 ? one_bauble : zero_bauble);
        current_number = Math.floor(current_number / 2);
    }
    return baubles;
}

export function are_bauble_sequences_identical(baubles_1: Bauble[], baubles_2: Bauble[]): boolean
{
    return baubles_1.length == baubles_2.length && baubles_1.every((b, i) => b == baubles_2[i]);
}

export function are_bauble_binary_numbers_equal(baubles_1: Bauble[], baubles_2: Bauble[], one_bauble: Bauble): boolean
{
    return baubles_to_number(baubles_1, one_bauble) == baubles_to_number(baubles_2, one_bauble);
}

export const LEVELS: Level[] = [
    {
        type: LevelType.Accept,
        title: "FIRST STEPS",
        text: "Accept all the presents!",
        grid_scale: 2,
        good_case: [Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Red],
        test: (_) => true
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept all presents starting with a blue bauble.",
        grid_scale: 2,
        good_case: [Bauble.Blue, Bauble.Red, Bauble.Red],
        test: (baubles: Bauble[]) => baubles.length > 0 && baubles[0] == Bauble.Blue
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept all presents with two or more baubles.",
        grid_scale: 2,
        good_case: [Bauble.Red, Bauble.Blue],
        test: (baubles: Bauble[]) => baubles.length >= 2
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept all presents with only red baubles.",
        grid_scale: 2,
        good_case: [Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Red],
        test: (baubles: Bauble[]) => baubles.every(bauble => bauble == Bauble.Red)
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept all presents with alternating red and blue baubles.",
        grid_scale: 2,
        good_case: [Bauble.Blue, Bauble.Red, Bauble.Blue, Bauble.Red, Bauble.Blue],
        test: (baubles: Bauble[]) => {
            if (baubles.length == 0) return true;
            for (let i = 1; i < baubles.length; i += 1)
            {
                if (baubles[i - 1] == baubles[i]) return false;
            }
            return true;
        },
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept all presents where the last bauble is red.",
        grid_scale: 2,
        good_case: [Bauble.Blue, Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Red],
        test: (baubles: Bauble[]) => baubles.length > 0 && baubles.at(-1) == Bauble.Red
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept all presents which begin and end with the same colour bauble.",
        grid_scale: 2,
        good_case: [Bauble.Blue, Bauble.Red, Bauble.Blue, Bauble.Blue],
        test: (baubles: Bauble[]) => baubles.length == 0 || baubles.at(-1) == baubles[0]
    },
    {
        type: LevelType.Output,
        title: REPAIR_TITLE,
        text: "Output the present with the first bauble at the end.",
        grid_scale: 2,
        good_case: [Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Blue, Bauble.Red, Bauble.Blue],
        test: (baubles_original: Bauble[], baubles_solution: Bauble[]) => {
            if (baubles_original.length == 0) return baubles_solution.length == 0;
            const baubles = Object.assign([], baubles_original);
            const first_bauble: Bauble = baubles[0];
            baubles.shift();
            baubles.push(first_bauble);
            return are_bauble_sequences_identical(baubles, baubles_solution);
        }
    },
    {
        type: LevelType.Output,
        title: REPAIR_TITLE,
        text: "Replace blue baubles with green baubles, and red baubles with orange baubles.",
        grid_scale: 2,
        good_case: [Bauble.Blue, Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Blue],
        test: (baubles_original: Bauble[], baubles_solution: Bauble[]) => {
            const baubles: Bauble[] = [];
            for (let i = 0; i < baubles_original.length; i++)
            {
                baubles.push((baubles_original[i] == Bauble.Red) ? Bauble.Orange : Bauble.Green);
            }
            return are_bauble_sequences_identical(baubles, baubles_solution);
        }
    },
    {
        type: LevelType.Output,
        title: REPAIR_TITLE,
        text: "Remove all red baubles!",
        grid_scale: 2,
        good_case: [Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Blue],
        test: (baubles_original: Bauble[], baubles_solution: Bauble[]) => {
            return are_bauble_sequences_identical(baubles_original.filter(b => b == Bauble.Blue), baubles_solution);
        }
    },
    {
        type: LevelType.Output,
        title: REPAIR_TITLE,
        text: "Put a green bauble at the beginning and an orange bauble at the end.",
        grid_scale: 2,
        good_case: [Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Blue],
        test: (baubles_original: Bauble[], baubles_solution: Bauble[]) => {
            const baubles = Object.assign([], baubles_original);
            baubles.push(Bauble.Orange);
            baubles.unshift(Bauble.Green);
            return are_bauble_sequences_identical(baubles, baubles_solution);
        }
    },
    {
        type: LevelType.Accept,
        title: BINARY_TEST_TITLE,
        text: "With blue as one and red as zero, accept odd binary strings.",
        grid_scale: 2,
        good_case: [Bauble.Blue, Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Red],
        test: (baubles: Bauble[]) => (baubles_to_number(baubles, Bauble.Blue) % 2) == 1
    },
    {
        type: LevelType.Output,
        title: BINARY_REPAIR_TITLE,
        text: "With blue as one and red as zero, multiply by 8!",
        grid_scale: 2,
        good_case: [Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Red],
        test: (baubles_original: Bauble[], baubles_solution: Bauble[]) => {
            const baubles = number_to_baubles(baubles_to_number(baubles_original, Bauble.Blue) * 8, Bauble.Blue);
            return are_bauble_binary_numbers_equal(baubles, baubles_solution, Bauble.Blue);
        }
    },
    {
        type: LevelType.Output,
        title: REPAIR_TITLE,
        text: "Swap the blue baubles for red baubles.",
        grid_scale: 2,
        good_case: [Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Blue],
        test: (baubles_original: Bauble[], baubles_solution: Bauble[]) => {
            const baubles: Bauble[] = [];
            for (let i = 0; i < baubles_original.length; i++)
            {
                baubles.push(baubles_original[i] == Bauble.Red ? Bauble.Blue : Bauble.Red);
            }
            return are_bauble_sequences_identical(baubles, baubles_solution);
        }
    },
    {
        type: LevelType.Output,
        title: REPAIR_TITLE,
        text: "Move the last bauble to the front.",
        grid_scale: 2,
        good_case: [Bauble.Blue, Bauble.Red, Bauble.Blue, Bauble.Red, Bauble.Red],
        test: (baubles_original: Bauble[], baubles_solution: Bauble[]) =>
        {
            if (baubles_original.length == 0) return baubles_solution.length == 0;
            const baubles: Bauble[] = Object.assign([], baubles_original);
            baubles.unshift(baubles.at(-1) ?? Bauble.Red);
            baubles.pop();
            return are_bauble_sequences_identical(baubles, baubles_solution);
        }
    },
    {
        type: LevelType.Output,
        title: REPAIR_TITLE,
        text: "Remove all but one of any consecutive sequence of baubles of the same colour.",
        grid_scale: 2,
        good_case: [Bauble.Blue, Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Blue, Bauble.Red, Bauble.Red],
        test: (baubles_original: Bauble[], baubles_solution: Bauble[]) =>
        {
            if (baubles_original.length == 0) return baubles_solution.length == 0;
            const baubles: Bauble[] = [baubles_original[0]];
            for (let i = 1; i < baubles_original.length; i += 1)
            {
                if (baubles_original[i] != baubles.at(-1))
                {
                    baubles.push(baubles_original[i]);
                }
            }
            return are_bauble_sequences_identical(baubles, baubles_solution);
        }
    },
    {
        type: LevelType.Output,
        title: REPAIR_TITLE,
        text: "Move all red baubles to the front.",
        grid_scale: 1,
        good_case: [Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Blue, Bauble.Red],
        test: (baubles_original: Bauble[], baubles_solution: Bauble[]) => 
        {
            const baubles: Bauble[] = [];
            baubles.push(...baubles_original.filter(b => b == Bauble.Red));
            baubles.push(...baubles_original.filter(b => b == Bauble.Blue));
            return are_bauble_sequences_identical(baubles, baubles_solution);
        }
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept all presents with the same number of red and blue baubles.",
        grid_scale: 1,
        good_case: [Bauble.Blue, Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Blue],
        test: (baubles: Bauble[]) => baubles.filter(b => b == Bauble.Red).length == baubles.filter(b => b == Bauble.Blue).length
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept all presents with some number of blue baubles, followed by the same number of red baubles.",
        grid_scale: 1,
        good_case: [Bauble.Blue, Bauble.Blue, Bauble.Blue, Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Red],
        test: (baubles: Bauble[]) => {
            if (baubles.length == 0) return true;
            if (baubles[0] != Bauble.Blue) return false;
            let blue_bauble_count = 0;
            while(baubles[blue_bauble_count] == Bauble.Blue) blue_bauble_count++;

            if (blue_bauble_count == baubles.length) return false;
            let red_bauble_count = 0;
            while(baubles[red_bauble_count + blue_bauble_count] == Bauble.Red) red_bauble_count++;

            if (red_bauble_count + blue_bauble_count != baubles.length) return false;
            return red_bauble_count == blue_bauble_count;
        }
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept all presents with X blue baubles, then X red baubles, then X blue baubles again, for any X.",
        grid_scale: 1,
        good_case: [Bauble.Blue, Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Blue],
        test: (baubles: Bauble[]) => {
            if (baubles.length == 0) return true;
            if (baubles[0] != Bauble.Blue) return false;
            let blue_bauble_count = 0;
            while(baubles[blue_bauble_count] == Bauble.Blue) blue_bauble_count++;

            if (blue_bauble_count == baubles.length) return false;
            let red_bauble_count = 0;
            while(baubles[red_bauble_count + blue_bauble_count] == Bauble.Red) red_bauble_count++;

            if (red_bauble_count != blue_bauble_count) return false;
            if (red_bauble_count + blue_bauble_count == baubles.length) return false;

            let blue_bauble_count_2 = 0;
            while(baubles[blue_bauble_count_2 + red_bauble_count + blue_bauble_count] == Bauble.Blue) blue_bauble_count_2++;
            if (red_bauble_count != blue_bauble_count_2) return false;

            return blue_bauble_count + red_bauble_count + blue_bauble_count_2 == baubles.length;
        }
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept all presents with a sequence of baubles that repeats midway through! (Should have even length)",
        grid_scale: 1,
        good_case: [Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Blue, Bauble.Blue],
        test: (baubles: Bauble[]) => {
            if (baubles.length % 2 != 0) return false;
            for (let i = 0; i < baubles.length / 2; i++)
            {
                if (baubles[i] != baubles[Math.floor(baubles.length / 2) + i]) return false;
            }
            return true;
        }
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept the presents where every sequence of blue baubles is followed by a longer sequence of red baubles.",
        grid_scale: 1,
        good_case: [Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Blue, Bauble.Red, Bauble.Red],
        test: (baubles: Bauble[]) => {
            let red_count = 0;
            let blue_count = 0;
            for (let i = 0; i < baubles.length; i+=1)
            {
                if (baubles[i] == Bauble.Blue)
                {
                    if (red_count > 0)
                    {
                        // Check the red count became larger than the blue count. If so, reset it
                        if (blue_count >= red_count)
                        {
                            return false;
                        }
                        red_count = 0;
                    }
                    blue_count += 1;
                }
                else
                {
                    red_count += 1;
                }
            }
            if (blue_count > 0 && blue_count >= red_count)
            {
                return false;
            }
            return true;
        }
    },
    {
        type: LevelType.Output,
        title: REPAIR_TITLE,
        text: "Reverse the sequence of baubles.",
        grid_scale: 1,
        good_case: [Bauble.Red, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Blue],
        test: (baubles_original: Bauble[], baubles_solution: Bauble[]) => {
            const baubles = Object.assign([], baubles_original);
            baubles.reverse();
            return are_bauble_sequences_identical(baubles, baubles_solution);
        }
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept all presents with perfectly symmetrical sequences of baubles.",
        grid_scale: 1,
        good_case: [Bauble.Red, Bauble.Red, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Blue, Bauble.Red, Bauble.Red],
        test: (baubles: Bauble[]) => {
            for (let i = 0; i < Math.floor(baubles.length / 2); i++)
            {
                if (baubles[i] != baubles[baubles.length - (Math.floor(baubles.length / 2) + i)]) return false;
            }
            return true;
        }
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept all presents with an odd number of blue baubles and an even number of red baubles.",
        grid_scale: 1,
        good_case: [Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Blue, Bauble.Red, Bauble.Blue],
        test: (baubles: Bauble[]) =>
        {
            let count_red = 0;
            let count_blue = 0;
            for (let i = 0; i < baubles.length; i++)
            {
                if (baubles[i] == Bauble.Red)
                {
                    count_red++;
                }
                else
                {
                    count_blue++;
                }
            }
            return count_red % 2 == 0 && count_blue % 2 == 1;
        }
    },
    {
        type: LevelType.Accept,
        title: REPAIR_TITLE,
        text: "Put a green bauble after every sequence of blue baubles, and an orange bauble after every sequence of red baubles.",
        grid_scale: 1,
        good_case: [Bauble.Red, Bauble.Blue, Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Red],
        test: (baubles_original: Bauble[], baubles_solution: Bauble[]) => {
            if (baubles_original.length == 0) return baubles_solution.length == 0;
            const baubles: Bauble[] = [baubles_original[0]];
            for (let i = 1; i < baubles_original.length; i += 1)
            {
                if (baubles_original[i] != baubles_original[i - 1])
                {
                    if (baubles_original[i - 1] == Bauble.Blue)
                    {
                        baubles.push(Bauble.Green);
                    }
                    else
                    {
                        baubles.push(Bauble.Orange);
                    }
                }
                baubles.push(baubles_original[i]);
            }
            if (baubles.at(-1) == Bauble.Blue)
            {
                baubles.push(Bauble.Green);
            }
            else
            {
                baubles.push(Bauble.Orange);
            }
            return are_bauble_sequences_identical(baubles, baubles_solution);
        }
    },
    {
        type: LevelType.Accept,
        title: TEST_TITLE,
        text: "Accept all presents with exactly twice as many blue baubles as red baubles.",
        grid_scale: 1,
        good_case: [Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Blue, Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Blue],
        test: (baubles: Bauble[]) => baubles.filter(b => b == Bauble.Blue).length == baubles.filter(b => b == Bauble.Red).length * 2
    },
    {
        type: LevelType.Accept,
        title: BINARY_TEST_TITLE,
        text: "With blue as one and red as zero, accept any number greater than fifteen.",
        grid_scale: 1,
        good_case: [Bauble.Red, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Red, Bauble.Blue],
        test: (baubles: Bauble[]) => baubles_to_number(baubles, Bauble.Blue) > 15
    },
    {
        type: LevelType.Accept,
        title: BINARY_TEST_TITLE,
        text: "With blue as one and red as zero, accept natural powers of four.",
        grid_scale: 1,
        good_case: [Bauble.Red, Bauble.Red, Bauble.Red ,Bauble.Red, Bauble.Blue],
        test: (baubles: Bauble[]) => {
            // It is a power of 4 so long as there is exactly a single 1 and an even number of 0s before it.
            if (baubles.filter(b => b == Bauble.Blue).length != 1) return false;
            return baubles.indexOf(Bauble.Blue) % 2 == 0;
        }
    },
    {
        type: LevelType.Output,
        title: BINARY_REPAIR_TITLE,
        text: "With blue as one and red as zero, add one to the binary string.",
        grid_scale: 1,
        good_case: [Bauble.Blue, Bauble.Blue, Bauble.Blue, Bauble.Red, Bauble.Red, Bauble.Blue],
        test: (baubles_original: Bauble[], baubles_solution: Bauble[]) => {
            const baubles: Bauble[] = number_to_baubles(baubles_to_number(baubles_original, Bauble.Blue) + 1, Bauble.Blue);
            return are_bauble_binary_numbers_equal(baubles, baubles_solution, Bauble.Blue);
        }
    },
]

export function get_level_grid_scale(level: number): number
{
    return LEVELS[level].grid_scale;
}

export function init_grid(level: number): Grid
{
    const grid: Grid = {
        width: Math.floor(GRID_WIDTH / (TILE_SIZE * get_level_grid_scale(level))),
        height: Math.floor(GRID_HEIGHT / (TILE_SIZE * get_level_grid_scale(level))),
        entries: []
    };

    for (let x = 0; x < grid.width; x += 1)
    {
        grid.entries.push([]);
        for (let y = 0; y < grid.height; y += 1)
        {
            grid.entries[x][y] = { angle: 0, flipped: false, piece: Piece.Nothing };
        }
    }

    // Place the elf and sleigh
    const y_coord = Math.floor((grid.height / 2) - 0.5);
    
    grid.entries[0][y_coord].piece = Piece.Elf;
    grid.entries[grid.width - 1][y_coord].piece = Piece.Sleigh;
    return grid;
}