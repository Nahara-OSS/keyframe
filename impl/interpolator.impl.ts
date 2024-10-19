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

import type { Interpolator } from "../types/interpolate.ts";

/**
 * The scalar interpolator, which is the linear interpolation that interpolates between 2 numbers.
 */
export const scalarInterpolator: Interpolator<number> = (from, to, p) => from * (1 - p) + to * p;

/**
 * The vector interpolator, which is the interpolator that applies linear interpolation on each component of the vector.
 * 2 of the input vectors must have the same number of components, otherwise it will return the first vector.
 */
export const vectorInterpolator: Interpolator<number[]> = (from, to, p) => {
    if (from.length != to.length) return from;
    if (p <= 0) return from;
    if (p >= 1) return to;
    return from.map((v, i) => scalarInterpolator(v, to[i], p));
};

/**
 * TypeScript-friendly version of `vectorInterpolator`.
 * @returns `vectorInterpolator` casted as `Interpolator<T>`.
 */
export function vectorInterpolatorOf<T extends number[]>(): Interpolator<T> {
    return vectorInterpolator as unknown as Interpolator<T>;
}

/**
 * The struct interpolator, which is the interpolator that applies linear interpolation on each value of the record.
 */
export const structInterpolator: Interpolator<Record<string, number>> = (from, to, p) => {
    if (p <= 0) return from;
    if (p >= 1) return to;
    const out = structuredClone(from);
    for (const key in out) out[key] = scalarInterpolator(from[key], to[key], p);
    return out;
};

/**
 * TypeScript-friendly version of `structInterpolator`.
 * @returns `structInterpolator` casted as `Interpolator<T>`.
 */
export function structInterpolatorOf<T extends Record<string, number>>(): Interpolator<T> {
    return structInterpolator as unknown as Interpolator<T>;
}