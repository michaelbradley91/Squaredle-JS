/**
 * This module contains functions to identify 
 * playable squares
 */

import { GameState } from "./logic";

/* Useful types for square solving */
type Position = [number, number];
type Path = Position[];
type Paths = Path[];
type Solution = { [prefix: string]: Paths };

/* How good is a square to play? */
export enum SquareQualityAssessment
{
    TooManyWords = 1,
    NotEnoughWords = 2,
    NotCovered = 3,
    Good = 4,
    NotUniqueLetters = 5,
    LongWordsTooSimilar = 6
};

/**
 * Evaluates the quality of a square to play with several
 * heuristics
 */
export class SquareQuality
{

}

export class Square 
{
    private letters: string[][];

    /* Private caches used for solution finding */
    private prefixes: { [prefix: string]: boolean };
    private neighbouring_letters: { [position: Pair]: Position[] };

    constructor()
    {
        this.letters = [];
    }

    private invalidate_caches()
    {
        this.prefixes = {};
    }

    /**
     * Initialise an empty square. Should be called
     * before doing further operations
     */
    init_empty_square(game_state: GameState)
    {
        const size = game_state.square_parameters.square_size;

        this.letters = [];
        for (let y = 0; y < size; y++)
        {
            const row: string[] = [];
            for (let x = 0; x < size; x++)
            {
                row.push('');
            }
            this.letters.push(row);
        }
    }

}