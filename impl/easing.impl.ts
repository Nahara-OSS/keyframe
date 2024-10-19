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

import type { Easing, CustomEasing, PredefinedEasing } from "../types/easing.ts";

/**
 * A map of predefined easing functions. Each function name is corresponding to a function `f(t) = p`, where `t` is the
 * time scaled down to `[0.0, 1.0]` range, and `p` is the display progress, which can overshoots outside the
 * `[0.0, 1.0]` range.
 */
export const predefinedEasings: Record<PredefinedEasing, CustomEasing> = {
    "hold": () => 0,
    "linear": x => Math.max(Math.min(x, 1), 0),
    "ease-in-sine": x => 1 - Math.cos((x * Math.PI) / 2),
    "ease-out-sine": x => Math.sin((x * Math.PI) / 2),
    "ease-in-out-sine": x => -(Math.cos(Math.PI * x) - 1) / 2,
    "ease-in-circ": x => 1 - Math.sqrt(1 - Math.pow(x, 2)),
    "ease-out-circ": x => Math.sqrt(1 - Math.pow(x - 1, 2)),
    "ease-in-out-circ": x => x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2
};

/**
 * Apply easing function from time to progress.
 * @param easing The easing function.
 * @param time The time value in `[0.0, 1.0]` range.
 * @returns The progress value.
 */
export function easingTimeToProgress(easing: Easing, time: number): number {
    if (typeof easing == "string") {
        const predefined = predefinedEasings[easing];
        if (predefined == null) throw new Error(`Unknown predefined easing function: ${easing}`);
        return predefined(time);
    }

    if (typeof easing == "function") return easing(time);
    if (easing.type == "step") return stepEasingTimeToProgress(time, easing.steps, easing.forEachStep);
    if (easing.type == "cubic-bezier") return cubicBezierEasingTimeToProgress(time, easing.cp1, easing.cp2);

    // You are likely using old version of @nahara/keyframe
    throw new Error(`Unknown easing: ${easing}`);
}

/**
 * Apply step easing function from time to progress. Step easing function may be used to achieve the "low framerate"
 * feel.
 * @param time The time value in `[0.0, 1.0]` range.
 * @param steps The number of steps.
 * @param forEachStep The optional easing function to use on each step. Leave it undefined to use `hold`.
 * @returns The progress value.
 */
export function stepEasingTimeToProgress(time: number, steps: number, forEachStep?: Easing): number {
    const currentStep = Math.floor(time * steps);
    const currentStepValue = currentStep / steps;
    if (!forEachStep) return currentStepValue;

    const nextStep = currentStep + 1;
    const nextStepValue = nextStep / steps;
    const timeInStep = (time - currentStepValue) / (nextStepValue - currentStepValue);
    const progressInStep = easingTimeToProgress(forEachStep, timeInStep);
    return currentStepValue + progressInStep * (nextStepValue - currentStepValue);
}

/**
 * Apply cubic bezier easing function from time to progress. The X components of control points will always be clamped
 * to `[0.0, 1.0]` range, while the Y components aren't so that the value can overshoot, creating some kind of elastic
 * animation. Cubic bezier allows animators to have more controls on the easing function, at a cost of computation time.
 * @param time The time value in `[0.0, 1.0]` range.
 * @param param1 The first control point.
 * @param param2 The second control point.
 * @returns The progress value.
 */
export function cubicBezierEasingTimeToProgress(
    time: number,
    [cp1x, cp1y]: [number, number],
    [cp2x, cp2y]: [number, number]
): number {
    if (cp1x < 0) cp1x = 0;
    if (cp1x > 1) cp1x = 1;
    if (cp2x < 0) cp2x = 0;
    if (cp2x > 1) cp2x = 1;

    let start = 0, end = 1;

    while ((end - start) > 1e-6) {
        const mid = (start + end) / 2;
        const xr = parametricCubicBezier1D(cp1x, cp2x, mid);
        if (time > xr) start = mid;
        else if (time < xr) end = mid;
        else return parametricCubicBezier1D(cp1y, cp2y, mid);
    }

    return parametricCubicBezier1D(cp1y, cp2y, (start + end) / 2)
}

function parametricCubicBezier1D(cp1: number, cp2: number, p: number) {
    const invP = 1 - p;
    return 3 * invP**2 * p * cp1 + 3 * invP * p**2 * cp2 + p**3;
}