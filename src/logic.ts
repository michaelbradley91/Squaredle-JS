/*
 * This module contains all the "thinking" parts of the game
 */

import { MAX_PATH_LENGTH, MAX_SOLUTIONS_CHECKED, MAX_THINKING_TIME_MILLISECONDS, NUMBER_LEVELS } from "./constants";
import { init_grid, number_to_baubles } from "./levels";
import { Action, Bauble, Grid, Level, LevelType, Piece, Position, Step, TestResult } from "./types";

const POSITION_DELTAS: { [id: number] : Position; } = {};
POSITION_DELTAS[0] = { x: 0, y: 1 };
POSITION_DELTAS[90] = { x: -1, y: 0 };
POSITION_DELTAS[180] = { x: 0, y: -1 };
POSITION_DELTAS[270] = { x: 1, y: 0 };

/*
 * Handles all persistent game state
 */
export type GameState = {
    level_solutions: [Grid],
    level_solved: [boolean],
    current_level: number,
    options: {}
}

/*
 * Initialise the game from scratch
 */
export function init_game_state(): GameState
{
    const level_solutions: [Grid] = [{width: 0, height: 0, entries: []}];
    const level_solved: [boolean] = [false];
    level_solutions.pop();
    level_solved.pop
    for (let level = 0; level < NUMBER_LEVELS; level += 1)
    {
        level_solutions.push(init_grid(level));
        level_solved.push(false);
    }
    return {
        level_solutions: level_solutions,
        level_solved: level_solved,
        current_level: 0,
        options: {}
    };
}

/* 
 * Return the location of a piece or undefined if it does not exist.
 */
export function find_piece(grid: Grid, piece: Piece): Position | undefined
{
    for (let x = 0; x < grid.width; x++)
    {
        for (let y = 0; y < grid.height; y++)
        {
            if (grid.entries[x][y].piece == piece)
            {
                return {x: x, y: y};
            }
        }
    }
}

/* 
 * Compute the sequence of steps that should be carried out when moving this present through the grid
 */
export function compute_path(baubles: Bauble[], grid: Grid): {steps: Step[], final_baubles: Bauble[]}
{
    // Refuse to compute the path if no starting point can be identified...
    const current_baubles = Object.assign([], baubles);
    const start_position = find_piece(grid, Piece.Elf);
    if (!start_position) return {steps: [], final_baubles: current_baubles};

    let step: Step = {
        action: Action.None,
        next_position: {x: start_position.x + 1, y: start_position.y}
    };

    const steps = [step];
    while(steps.length < MAX_PATH_LENGTH && step.next_position)
    {
        // What does the next position tell us?
        if (step.next_position.x >= grid.width || step.next_position.y >= grid.height || step.next_position.x < 0 || step.next_position.y < 0)
        {
            step = {action: Action.Reject};
        }
        else
        {
            const entry = grid.entries[step.next_position.x][step.next_position.y];
            if (!entry || entry.piece == Piece.Elf)
            {
                step = {action: Action.Reject};
            }
            else if (entry.piece == Piece.Sleigh)
            {
                step = {action: Action.Accept};
            }
            else if (entry.piece == Piece.Nothing)
            {
                step = {action: Action.Reject};
            }
            else if (entry.piece == Piece.Belt)
            {
                step = {
                    action: Action.None,
                    next_position: {x: step.next_position.x + POSITION_DELTAS[entry.angle].x, y: step.next_position.y + POSITION_DELTAS[entry.angle].y}
                };
            }
            else if (entry.piece == Piece.RedPrinter)
            {
                step = {
                    action: Action.Write_Red,
                    next_position: {x: step.next_position.x + POSITION_DELTAS[entry.angle].x, y: step.next_position.y + POSITION_DELTAS[entry.angle].y}
                };
                current_baubles.push(Bauble.Red);
            }
            else if (entry.piece == Piece.BluePrinter)
            {
                step = {
                    action: Action.Write_Blue,
                    next_position: {x: step.next_position.x + POSITION_DELTAS[entry.angle].x, y: step.next_position.y + POSITION_DELTAS[entry.angle].y}
                };
                current_baubles.push(Bauble.Blue);
            }
            else if (entry.piece == Piece.OrangePrinter)
            {
                step = {
                    action: Action.Write_Orange,
                    next_position: {x: step.next_position.x + POSITION_DELTAS[entry.angle].x, y: step.next_position.y + POSITION_DELTAS[entry.angle].y}
                };
                current_baubles.push(Bauble.Orange);
            }
            else if (entry.piece == Piece.GreenPrinter)
            {
                step = {
                    action: Action.Write_Green,
                    next_position: {x: step.next_position.x + POSITION_DELTAS[entry.angle].x, y: step.next_position.y + POSITION_DELTAS[entry.angle].y}
                };
                current_baubles.push(Bauble.Green);
            }
            else if (entry.piece == Piece.GreenOrangeSwitch || entry.piece == Piece.RedBlueSwitch)
            {
                if (current_baubles.length == 0)
                {
                    step = {
                        action: Action.None,
                        next_position: {x: step.next_position.x + POSITION_DELTAS[entry.angle].x, y: step.next_position.y + POSITION_DELTAS[entry.angle].y}
                    };
                }
                else
                {
                    const next_bauble = current_baubles.at(0);
                    let new_angle = entry.angle;
                    let action = Action.None;
                    // This is where it gets fiddly... which way is everything facing?
                    if (entry.piece == Piece.GreenOrangeSwitch)
                    {
                        if (next_bauble == Bauble.Green)
                        {
                            action = Action.Read;
                            if (entry.flipped)
                            {
                                new_angle -= 90;
                            }
                            else
                            {
                                new_angle += 90;
                            }
                        }
                        else if (next_bauble == Bauble.Orange)
                        {
                            action = Action.Read;
                            if (entry.flipped)
                            {
                                new_angle += 90;
                            }
                            else
                            {
                                new_angle -= 90;
                            }
                        }
                    }
                    else if (entry.piece == Piece.RedBlueSwitch)
                    {
                        if (next_bauble == Bauble.Red)
                        {
                            action = Action.Read;
                            if (entry.flipped)
                            {
                                new_angle -= 90;
                            }
                            else
                            {
                                new_angle += 90;
                            }
                        }
                        else if (next_bauble == Bauble.Blue)
                        {
                            action = Action.Read;
                            if (entry.flipped)
                            {
                                new_angle += 90;
                            }
                            else
                            {
                                new_angle -= 90;
                            }
                        }
                    }
                    new_angle = ((new_angle % 360) + 360) % 360;
                    if (action == Action.Read)
                    {
                        current_baubles.shift();
                    }
                    step = {
                        action: action,
                        next_position: {x: step.next_position.x + POSITION_DELTAS[new_angle].x, y: step.next_position.y + POSITION_DELTAS[new_angle].y}
                    };
                }
            }
        }
        steps.push(step);
    }

    // If the path is too long, give up
    if (steps.length >= MAX_PATH_LENGTH)
    {
        steps.push({action: Action.GiveUp});
    }

    return {steps: steps, final_baubles: current_baubles};
}

export function test_level_solution_case(level: Level, solution: Grid, baubles: Bauble[]): {path: Step[], result: boolean}
{
    if (level.type == LevelType.Accept)
    {
        const expected = level.test(baubles, []);

        const path = compute_path(baubles, solution);
        const last_entry = path.steps.at(-1);
        const actual = last_entry && last_entry.action == Action.Accept;
        return {path: path.steps, result: expected == actual};
    }
    
    // Should always be accepted...
    const path = compute_path(baubles, solution);
    const last_entry = path.steps.at(-1);

    if (!last_entry || last_entry.action != Action.Accept) 
    {
        return {path: path.steps, result: false};
    }
    return {path: path.steps, result: level.test(baubles, path.final_baubles)};
}

/*
 Test against the given condition and grid, trying to find a case that fails
 */
export function test_level_solution(level: Level, solution: Grid, next_test_case: number = 1): TestResult
{
    const start_time = Date.now();
    // Brute force a large number of possible inputs
    for (let i = next_test_case; i < MAX_SOLUTIONS_CHECKED; i += 1)
    {
        const bauble_colour = i % 2 == 0 ? Bauble.Red : Bauble.Blue;
        const baubles = number_to_baubles(Math.floor(i / 2), bauble_colour);
        const baubles_result = test_level_solution_case(level, solution, baubles);
        if (!baubles_result.result)
        {
            return {passed: false, baubles: baubles, path: baubles_result.path, next_test_case: undefined};
        }
        // Check if we have taken too long
        const new_time = Date.now();
        if (new_time - start_time >= MAX_THINKING_TIME_MILLISECONDS)
        {
            return {passed: true, baubles: baubles, path: baubles_result.path, next_test_case: i + 1};
        }
    }

    // Success! Show an interesting case
    const good_case = Object.assign([], level.good_case);
    const path = compute_path(good_case, solution);
    return {passed: true, baubles: good_case, path: path.steps, next_test_case: undefined};
}

