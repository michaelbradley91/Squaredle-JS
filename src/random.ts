/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export function random_number(min: number, max: number): number
{
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export function random_int(min: number, max: number): number
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Choose a random element from the given array
 * @param choices the possible values to return
 * @returns a random element from the choices array
 */
export function random_choice<T>(choices: T[]): T
{
    const index = random_int(0, choices.length - 1);
    return choices[index];
}

/**
 * Choose a random element from the given array, weighted by the given weights
 * @param choices the possible values to return
 * @param weights the weight of probability associated to each element
 * @returns the element chosen
 */
export function random_weighted_choice<T>(choices: T[], weights: number[]): T
{
    const weights_total = weights.reduce((total, current) => total + current, 0);
    let random_weight = Math.random() * weights_total;
    for (let i = 0; i < choices.length; i++)
    {
        random_weight -= weights[i];
        if (random_weight < 0)
        {
            return choices[i];
        }
    }
    return choices[choices.length - 1];
}
