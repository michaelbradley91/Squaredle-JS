/**
 * This module supports scrolling in a natural fashion.
 * Surprisingly this is not built into Phaser, so we have to implement it ourselves.
 * 
 */

/* How long to consider touch points for when doing calculations */
export const MAX_TOUCH_POINT_AGE = 1000; /* milliseconds */
export const TOUCH_POINT_VELOCITY_CALCULATION_DELAY = 200; /* milliseconds */
export const SCROLL_VELOCITY_DECAY = 0.95; /* How much to decay the scroll velocity each update */

export type TouchPoint = {
    x: number,
    y: number,
    time_milliseconds: number
}

export type ScrollParameters = {
    /* How long to wait on a mouse press before starting to scroll */
    scroll_delay_milliseconds: number
    /* How far the mouse must move over the scrollable area before it is considered to be scrolling */
    scroll_min_distance: number
    /* The bounds should be "real" pixel bounds */
    scroll_bounds: { min: number, max: number },
    /* The direction of the scroll, either horizontal or vertical */
    scroll_direction: "vertical" | "horizontal",
}

export const SCROLL_PARAMETERS_DEFAULTS: ScrollParameters = {
    scroll_delay_milliseconds: 200,
    scroll_min_distance: 5,
    scroll_bounds: { min: 0, max: 0 },
    scroll_direction: "vertical",
}

/* Only supports scrolling in one direction */
export type ScrollState = {
    scroll_position: number,
    touch_points: TouchPoint[],
    last_dragged_time_milliseconds: number,
    is_scrolling: boolean,
    is_dragging: boolean,
    scroll_velocity: number,
}

export class ScrollManager
{
    public scroll_state: ScrollState;
    public scroll_parameters: ScrollParameters;

    public constructor(scroll_parameters: ScrollParameters = SCROLL_PARAMETERS_DEFAULTS)
    {
        this.scroll_state = {
            scroll_position: 0,
            touch_points: [],
            is_scrolling: false,
            is_dragging: false,
            scroll_velocity: 0,
            last_dragged_time_milliseconds: 0,
        }
        this.scroll_parameters = scroll_parameters;
    }

    public reset(): void
    {
        this.scroll_state.scroll_position = 0;
        this.scroll_state.touch_points = [];
        this.scroll_state.is_scrolling = false;
        this.scroll_state.is_dragging = false;
        this.scroll_state.scroll_velocity = 0;
        this.scroll_state.last_dragged_time_milliseconds = 0;
    }

    /**
     * If the parameters need changing, stop scroll immediately and reset the scroll
     * position to zero.
     * @param scroll_parameters the new parameters to use
     */
    public update_parameters(scroll_parameters: ScrollParameters): void
    {
        this.scroll_parameters = scroll_parameters;
        this.reset();
    }

    /**
     * Indicate that the screen or scrollable area has been touched (or is still being touched)
     *
     * If the user has already touched the screen, the scroll will be dragged accordingly.
     * While touched the drag is instant and follows the user.
     */
    public touched(touch_point: TouchPoint): void
    {
        /* If the mouse was previously released, then clear out the touch points so we're
         * only considering touch points from this drag */
        if (!this.scroll_state.is_scrolling)
        {
            this.scroll_state.touch_points = [];
            this.scroll_state.is_dragging = false;
        }
        this.scroll_state.touch_points.push(touch_point);
        this.scroll_state.is_scrolling = true;
    }

    /**
     * Indicate that the screen or scrollable area has been released.
     *
     * If the user was dragging the scrollable area, it will continue
     * to scroll with a velocity based on the last few touch points, and will gradually slow down.
     * 
     * @param touch_point the point where the user released the screen
     */
    public released(touch_point: TouchPoint): void
    {
        this.scroll_state.touch_points.push(touch_point);
        this.scroll_state.is_scrolling = false;

        /* On release, if the user was dragging, apply an initial velocity */
        if (this.scroll_state.is_dragging)
        {
            /* If there is only one touch point, we can't determine a velocity */
            if (this.scroll_state.touch_points.length < 2)
            {
                this.scroll_state.scroll_velocity = 0;
                return;
            }

            /* Calculate the average speed of the last few touch points and apply that as the initial velocity */
            const recent_touch_points = this.scroll_state.touch_points.filter(tp => touch_point.time_milliseconds - tp.time_milliseconds <= TOUCH_POINT_VELOCITY_CALCULATION_DELAY);

            /* If there are not enough recent touch points, the touch events are coming in too slowly so ignore */
            if (recent_touch_points.length < 2)
            {
                this.scroll_state.scroll_velocity = 0;
                return;
            }

            const first_touch_point = recent_touch_points[0];
            const last_touch_point = recent_touch_points[recent_touch_points.length - 1];
            const time_difference = last_touch_point.time_milliseconds - first_touch_point.time_milliseconds;
            const distance_difference = last_touch_point[this.scroll_parameters.scroll_direction === "horizontal" ? "x" : "y"] - first_touch_point[this.scroll_parameters.scroll_direction === "horizontal" ? "x" : "y"];
            this.scroll_state.scroll_velocity = distance_difference / time_difference;
        }
    }

    /* Register an update in the mouse / touch position */
    public pointer_update(touch_point: TouchPoint): void
    {
        /* If the user is not actively scrolling, ignore */
        if (!this.scroll_state.is_scrolling)
        {
            return;
        }
        this.scroll_state.touch_points.push(touch_point);
    }

    /**
     * Update the scrollable area based on the current time. If the area is moving
     * on its own it will slow down slowly.
     * 
     * @param time_milliseconds the current time in milliseconds
     */
    public update(time_milliseconds: number): void
    {
        /* Clear out all the old touch points */
        this.scroll_state.touch_points = this.scroll_state.touch_points.filter(tp => time_milliseconds - tp.time_milliseconds <= MAX_TOUCH_POINT_AGE);

        /* If the user was not dragging, are they dragging now? */
        if (!this.scroll_state.is_dragging && this.scroll_state.is_scrolling)
        {
            /* If there is only one touch point, we can't determine if the user is dragging yet */
            if (this.scroll_state.touch_points.length < 2)
            {
                return;
            }

            /* Check if the user has moved enough to start dragging or held
             * the mouse down long enough to start dragging */
            const first_touch_point = this.scroll_state.touch_points[0];
            const last_touch_point = this.scroll_state.touch_points[this.scroll_state.touch_points.length - 1];
            const time_difference = last_touch_point.time_milliseconds - first_touch_point.time_milliseconds;
            const distance_difference = Math.abs(last_touch_point[this.scroll_parameters.scroll_direction === "horizontal" ? "x" : "y"] - first_touch_point[this.scroll_parameters.scroll_direction === "horizontal" ? "x" : "y"]);
            if (time_difference >= this.scroll_parameters.scroll_delay_milliseconds || distance_difference >= this.scroll_parameters.scroll_min_distance)
            {
                this.scroll_state.is_dragging = true;
            }

            /* Adjust the scroll position according to the last and first points immediately */
            const scroll_distance = last_touch_point[this.scroll_parameters.scroll_direction === "horizontal" ? "x" : "y"] - first_touch_point[this.scroll_parameters.scroll_direction === "horizontal" ? "x" : "y"];
            this.scroll_state.scroll_position += scroll_distance;
            this.scroll_state.last_dragged_time_milliseconds = Math.max(last_touch_point.time_milliseconds, time_milliseconds);
            return;
        }

        /* If the user is actively scrolling and we're dragging, adjust the scroll position based on any new touch points */
        if (this.scroll_state.is_dragging && this.scroll_state.is_scrolling)
        {
            /* If we don't have any touch points after the last time we dragged, nothing happens */
            const new_touch_points = this.scroll_state.touch_points.filter(tp => tp.time_milliseconds > this.scroll_state.last_dragged_time_milliseconds);
            if (new_touch_points.length === 0)
            {
                return;
            }
            /* Adjust the scroll position according to the change from the last considered touch point and the latest one */
            const last_touch_point = new_touch_points[new_touch_points.length - 1];
            const last_considered_touch_point = this.scroll_state.touch_points.filter(tp => tp.time_milliseconds <= this.scroll_state.last_dragged_time_milliseconds).slice(-1)[0];
            const scroll_distance = last_touch_point[this.scroll_parameters.scroll_direction === "horizontal" ? "x" : "y"] - last_considered_touch_point[this.scroll_parameters.scroll_direction === "horizontal" ? "x" : "y"];
            this.scroll_state.scroll_position += scroll_distance;
            this.scroll_state.last_dragged_time_milliseconds = Math.max(last_touch_point.time_milliseconds, time_milliseconds);
            return;
        }

        /* Finally, if the user is not actively scrolling, we can apply a velocity to the scroll position and slow it down over time */
        if (!this.scroll_state.is_scrolling && this.scroll_state.is_dragging)
        {
            /* Apply a change in velocity based on how much time has passed */
            const time_difference = time_milliseconds - this.scroll_state.last_dragged_time_milliseconds;
            this.scroll_state.scroll_position += this.scroll_state.scroll_velocity * time_difference;
            this.scroll_state.scroll_velocity *= Math.pow(SCROLL_VELOCITY_DECAY, time_difference / 16.6667);

            /* If the velocity is very small, stop scrolling */
            if (Math.abs(this.scroll_state.scroll_velocity) < 0.01)
            {
                this.scroll_state.is_dragging = false;
                this.scroll_state.scroll_velocity = 0;
            }
        }
    }
}