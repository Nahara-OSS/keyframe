/*
 * The MIT License (MIT)
 *
 * Copyright © 2024 The Nahara's Creative Suite contributors
 *
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/

import type { Easing } from "./easing.ts";

export interface ITimeline<T> extends Iterable<IKeyframe<T>> {
    /**
     * The initial value of this keyframe timeline. The timeline value getter will return this value until it went past
     * the first keyframe.
     */
    initialValue: T;

    /**
     * Get the value at given time in this timeline. If there is a keyframe with exact time, that keyframe's value will
     * be returned, otherwise it will interpolate between 2 nearest keyframes at specified time.
     * @param time The time to get value.
     */
    get(time: number): T;

    /**
     * Set the value at given time. If there is no keyframe at given time, it will create a new one. If there is one, it
     * will modify the keyframe. Unlike `add()`, which always add a new keyframe.
     * @param time The time where the keyframe will be obtained or created.
     * @param value The value at given time.
     * @param easing The optional easing function to set.
     */
    set(time: number, value: T, easing?: Easing): IKeyframe<T>;

    /**
     * Create a new keyframe.
     * @param time The time where the new keyframe will be placed.
     * @param value The value for the new keyframe.
     * @param easing The optional easing function for the new keyframe, or leave it `undefined` for the timeline to
     * derive easing function by itself.
     * @param flags The flags to add to new keyframe.
     * @returns The new keyframe.
     */
    add(time: number, value: T, easing?: Easing, flags?: KeyframeFlag[]): IKeyframe<T>;

    /**
     * Remove one or more keyframes from this timeline. Keyframes that aren't belong to this timeline will be silently
     * ignored.
     * @param keyframes A varargs collection of keyframe to remove.
     */
    remove(...keyframes: IKeyframe<T>[]): void;

    /**
     * Get the keyframe with exact time.
     * @param time The time to get the keyframe.
     * @returns A keyframe, or `null` if there is no keyframes with the exact time from parameter.
     */
    getKeyframeAt(time: number): IKeyframe<T> | null;

    /**
     * Get a list of keyframes whose time is within the specified time range.
     * @param timeStart The start time.
     * @param timeEnd The end time.
     */
    getKeyframesBetween(timeStart: number, timeEnd: number): IKeyframe<T>[];

    /**
     * Remove keyframes whose time is within the specified time range.
     * @param timeStart The start time.
     * @param timeEnd The end time.
     * @returns A list of keyframes removed from this timeline. Changing the keyframes' time will not affect the
     * timeline.
     */
    removeBetween(timeStart: number, timeEnd: number): IKeyframe<T>[];
}

/**
 * An interface to access the keyframe on the timeline.
 */
export interface IKeyframe<T> {
    /**
     * The time of this keyframe. Changing this will also re-insert the keyframe in the timeline so that all keyframes
     * are sorted by its time.
     */
    time: number;

    /**
     * The value of this keyframe. Underlying keyframe implementation should have checks to make sure the value of the
     * keyframe is correct.
     */
    value: T;

    /**
     * Easing function to ease between value of previous keyframe and value of current keyframe. If there is no previous
     * keyframe (a.k.a this keyframe is the first in timeline), the easing will have no effect.
     */
    easing: Easing;

    /**
     * Return a _copy_ of keyframe flags array. To add or remove flags, use `addFlag()` or `removeFlag()`.
     */
    readonly flags: KeyframeFlag[];

    addFlag(...flags: KeyframeFlag[]): void;
    removeFlag(...flags: KeyframeFlag[]): void;
}

export enum KeyframeFlag {
    /**
     * Locked flag - if the keyframe is locked, it can't be modified in keyframe editor.
     */
    LOCKED = "locked",
}