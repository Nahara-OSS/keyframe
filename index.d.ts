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

export interface ITimeline<TValue> {
    /**
     * Getter to get the object that can be serialized to JSON or any format that supports regular JavaScript object.
     * Load the timeline by using `loadFromSerializable()`.
     */
    readonly asSerializable: SerializableTimeline<TValue>;

    /**
     * The interpolator that interpolated between 2 values.
     */
    readonly interpolator: ValueInterpolator<TValue>;

    /**
     * The default value of this timeline, in case there is no keyframes.
     */
    defaultValue: TValue;

    /**
     * Get the time of the first keyframe in this timeline.
     */
    readonly startTime?: number;

    /**
     * Get the time of the last keyframe in this timeline.
     */
    readonly endTime?: number;

    loadFromSerializable(serializable: SerializableTimeline<TValue>): void;

    /**
     * Get the keyframe at exact time point. Returns `null` if there is no keyframe at given time. This is not the same
     * as `getValue`, which interpolates between 2 nearest keyframes.
     * @param time The time.
     */
    getKeyframe(time: number): Keyframe<TValue> | undefined;

    /**
     * Get an list of keyframes whose time is inside the specified time range. Returned keyframes are sorted by its
     * `time`.
     * @param fromTime The start time.
     * @param toTime Tne end time.
     */
    getKeyframes(fromTime: number, toTime: number): Keyframe<TValue>[];

    /**
     * Interpolates between 2 nearest keyframes, or return default value if there is no keyframes.
     * @param time The time.
     */
    getValue(time: number): TValue;

    /**
     * Set value at specified time. If there is a keyframe at specified time, that keyframe will be modified with new
     * value, otherwise make a new keyframe with new value. If there are nearby keyframes, the keyframe will derive
     * a easing function from them.
     * @param time The time.
     * @param value The value to set.
     * @param easing Optional easing function to use instead of deriving from nearby keyframes.
     */
    setValue(time: number, value: TValue, easing?: Easing): Keyframe<TValue>;

    setKeyframes(keyframes: Iterable<Keyframe<TValue>>): Keyframe<TValue>[];

    delete(keyframe: Keyframe<TValue>): void;

    clearKeyframes(fromTime: number, toTime: number): Keyframe<TValue>[];

    setTime(keyframe: Keyframe<number>, newTime: number): Keyframe<number>;
}

export interface SerializableTimeline<TValue> {
    defaultValue: TValue;
    keyframes: Keyframe<TValue>[];
}

export type ValueInterpolator<TValue> = (from: TValue, to: TValue, progress: number) => TValue;

export interface Keyframe<TValue> {
    time: number;
    value: TValue;
    easing: Easing;
}

export type Easing =
    | PredefinedEasing
    | CubicBezierEasing
    | PowerEasing
    | CustomEasing;

export type PredefinedEasing =
    | "linear" | "hold"
    | "ease-in-sine" | "ease-out-sine" | "ease-in-out-sine"
    | "ease-in-expo" | "ease-out-expo" | "ease-in-out-expo"
    | "ease-in-circ" | "ease-out-circ" | "ease-in-out-circ";

export interface ParameterizedEasing<TEasing extends string> { type: TEasing; }

export interface CubicBezierEasing extends ParameterizedEasing<"cubic-bezier"> {
    cp1: BezierControlPoint;
    cp2: BezierControlPoint;
}

/**
 * A single control point for cubic bezier curve.
 */
export interface BezierControlPoint {
    /**
     * The X value of the point for time influence. This value must always be within `[0.0, 1.0]` range, otherwise the
     * apply function will throw an error.
     */
    x: number;

    /**
     * The Y value of the point for value influence.
     */
    y: number;
}

export interface PowerEasing extends ParameterizedEasing<"power"> {
    degree: number;
    mode: "in" | "out" | "in-out";
}

export type CustomEasing = (x: number) => number;

/**
 * Interpolates between 2 values, using the easing function and progress.
 * @param from The start value, a.k.a the value if progress is `0.0`.
 * @param to The end value, a.k.a the value if progress is `1.0`.
 * @param interpolator The value interpolator to interpolates between values.
 * @param easing The easing function to use.
 * @param progress The progress value from `0.0` to `1.0`.
 */
export function applyEasing<TValue>(
    from: TValue,
    to: TValue,
    interpolator: ValueInterpolator<TValue>,
    easing: Easing,
    progress: number
): TValue;

export function applyPowerEasing<TValue>(
    from: TValue,
    to: TValue,
    interpolator: ValueInterpolator<TValue>,
    degree: number,
    mode: PowerEasing["mode"],
    progress: number
): TValue;

export function applyCubicBezier<TValue>(
    from: TValue,
    to: TValue,
    interpolator: ValueInterpolator<TValue>,
    cp1: BezierControlPoint,
    cp2: BezierControlPoint,
    progress: number
): TValue;

/**
 * A dictonary of predefined easing functions. You can also add more predefined function to this dictonary, but
 * TypeScript may nag you about the type error.
 */
export const predefinedEasingFunctions: Record<PredefinedEasing, CustomEasing>;

/**
 * The default implementation of `ITimeline`.
 */
export class Timeline<TValue> implements ITimeline<TValue> {
    get asSerializable(): SerializableTimeline<TValue>;
    get interpolator(): ValueInterpolator<TValue>;
    defaultValue: TValue;
    get startTime(): number | undefined;
    get endTime(): number | undefined;

    constructor(
        initialDefaultValue: TValue,
        interpolator: ValueInterpolator<TValue>
    );

    loadFromSerializable(serializable: SerializableTimeline<TValue>): void;
    getKeyframe(time: number): Keyframe<TValue> | undefined;
    getKeyframes(fromTime: number, toTime: number): Keyframe<TValue>[];
    getValue(time: number): TValue;

    setValue(time: number, value: TValue, easing?: Easing): Keyframe<TValue>;
    setKeyframes(keyframes: Iterable<Keyframe<TValue>>): Keyframe<TValue>[];
    setTime(keyframe: Keyframe<number>, newTime: number): Keyframe<number>;

    delete(keyframe: Keyframe<TValue>): void;
    clearKeyframes(fromTime: number, toTime: number): Keyframe<TValue>[];
}