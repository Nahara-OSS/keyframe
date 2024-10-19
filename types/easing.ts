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

export type CustomEasing = (x: number) => number;
export type PredefinedEasing = "linear" | "hold"
    | "ease-in-sine" | "ease-out-sine" | "ease-in-out-sine"
    | "ease-in-circ" | "ease-out-circ" | "ease-in-out-circ";
export interface IEasing<T extends string> { type: T; }

/**
 * Step easing: The easing function that divides the value range into steps. Also apply child easing function for each
 * step if provided, otherwise it will apply `hold`.
 */
export interface StepEasing extends IEasing<"step"> {
    steps: number;
    forEachStep?: Easing;
}

/**
 * Cubic bezier: The custom smooth easing function that can be edited by user. All X components of control points must
 * be within `[0.0, 1.0]` range, otherwise the value will be clamped internally.
 */
export interface CubicBezierEasing extends IEasing<"cubic-bezier"> {
    cp1: [number, number];
    cp2: [number, number];
}

export type Easing = PredefinedEasing | StepEasing | CubicBezierEasing | CustomEasing;