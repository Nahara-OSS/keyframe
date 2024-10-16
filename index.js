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

/**
 * @type {Record<import(".").PredefinedEasing, import(".").CustomEasing>}
 */
export const predefinedEasingFunctions = {
    "hold": () => 0,
    "linear": x => Math.max(Math.min(x)),

    // easing functions from https://easings.net/
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
 * @template TValue
 * @param {TValue} from 
 * @param {TValue} to 
 * @param {import(".").ValueInterpolator<TValue>} interpolator 
 * @param {import(".").Easing} easing 
 * @param {number} progress 
 */
export function applyEasing(from, to, interpolator, easing, progress) {
    if (typeof easing == "string") {
        const predefinedFunc = predefinedEasingFunctions[easing];
        if (!predefinedFunc) throw new Error(`Unknown predefined easing function: ${easing}`);
        return interpolator(from, to, predefinedFunc(progress));
    }

    if (typeof easing == "function") {
        return interpolator(from, to, easing(progress));
    }

    switch (easing.type) {
        case "cubic-bezier": return applyCubicBezier(from, to, interpolator, easing.cp1, easing.cp2, progress);
        case "power": return applyPowerEasing(from, to, interpolator, easing.degree, easing.mode, progress);
        default: throw new Error(`Unknown parameterized easing type: ${easing.type}`);
    }
}

/**
 * @template TValue
 * @param {TValue} from 
 * @param {TValue} to 
 * @param {import(".").ValueInterpolator<TValue>} interpolator 
 * @param {import(".").BezierControlPoint} cp1 
 * @param {import(".").BezierControlPoint} cp2 
 * @param {number} progress 
 */
export function applyCubicBezier(from, to, interpolator, cp1, cp2, progress) {
    if (cp1.x < 0 || cp1.x > 1) throw new Error(`cp1: x is outside [0.0, 1.0] range (cp1.x = ${cp1.x})`);
    if (cp2.x < 0 || cp2.x > 1) throw new Error(`cp2: x is outside [0.0, 1.0] range (cp2.x = ${cp2.x})`);

    let start = 0, end = 1;

    while ((end - start) > 1e-6) {
        const mid = (start + end) / 2;
        const xr = parametricCubicBezier1D(cp1.x, cp2.x, mid);
        if (progress > xr) start = mid;
        else if (progress < xr) end = mid;
        else return interpolator(from, to, parametricCubicBezier1D(cp1.y, cp2.y, mid));
    }

    return interpolator(from, to, parametricCubicBezier1D(cp1.y, cp2.y, (start + end) / 2));
}

/**
 * @template TValue
 * @param {TValue} from 
 * @param {TValue} to 
 * @param {import(".").ValueInterpolator<TValue>} interpolator 
 * @param {number} degree 
 * @param {import(".").PowerEasing["mode"]} mode
 * @param {number} x 
 */
export function applyPowerEasing(from, to, interpolator, degree, mode, x) {
    switch (mode) {
        case "in": return interpolator(from, to, x**degree);
        case "out": return interpolator(from, to, 1 - (1 - x)**degree);
        case "in-out":
            return interpolator(from, to, x < 0.5 ? 2**(degree - 1) * x**degree : 1 - (-2 * x + 2)**degree) / 2;
        default: throw new Error(`Unknown mode: ${mode}`);
    }
}

/**
 * @param {number} cp1 
 * @param {number} cp2 
 * @param {number} p 
 */
function parametricCubicBezier1D(cp1, cp2, p) {
    const invP = 1 - p;
    return 3 * invP**2 * p * cp1 + 3 * invP * p**2 * cp2 + p**3;
}

/**
 * @template TValue
 * @implements {import(".").ITimeline<TValue>}
 */
export class Timeline {
    /** @type {import(".").Keyframe<TValue>[]} */
    #keyframes;

    /** @type {import(".").ValueInterpolator<TValue>} */
    #interpolator;

    /** @type {import(".").SerializableTimeline<TValue>} */
    get asSerializable() {
        return {
            defaultValue: structuredClone(this.defaultValue),
            keyframes: structuredClone(this.#keyframes)
        };
    }

    get interpolator() {
        return this.#interpolator;
    }

    /** @type {TValue} */
    defaultValue;

    /** @type {number | undefined} */
    get startTime() { return this.#keyframes[0]?.time; }

    /** @type {number | undefined} */
    get endTime() { return this.#keyframes[this.#keyframes.length - 1]?.time; }

    /**
     * @param {TValue} initialDefaultValue 
     * @param {import(".").ValueInterpolator<TValue>} interpolator 
     */
    constructor(initialDefaultValue, interpolator) {
        this.#keyframes = [];
        this.#interpolator = interpolator;
        this.defaultValue = initialDefaultValue;
    }

    /**
     * @param {number} time 
     * @returns {number}
     */
    #searchIndex(time) {
        if (this.#keyframes.length == 0) return -1;

        let start = 0;
        let end = this.#keyframes.length - 1;

        while (start <= end) {
            const mid = (start + end) >> 1;
            const midValue = this.#keyframes[mid];

            if (midValue.time < time) start = mid + 1;
            else if (midValue.time > time) end = mid - 1;
            else return mid;
        }

        return -1 - start;
    }

    /**
     * @param {import(".").SerializableTimeline<TValue>} serializable 
     */
    loadFromSerializable(serializable) {
        this.#keyframes = structuredClone(serializable.keyframes).sort((a, b) => a.time - b.time);
        this.defaultValue = structuredClone(serializable.defaultValue);
    }

    /**
     * @param {number} time 
     * @returns {import(".").Keyframe<TValue> | undefined}
     */
    getKeyframe(time) {
        const idx = this.#searchIndex(time);
        return idx >= 0 ? this.#keyframes[idx] : undefined;
    }

    /**
     * @param {number} fromTime 
     * @param {number} toTime 
     * @returns {import(".").Keyframe<TValue>[]}
     */
    getKeyframes(fromTime, toTime) {
        const searchStart = this.#searchIndex(fromTime);
        const searchEnd = this.#searchIndex(toTime);
        const fromIdx = searchStart >= 0 ? searchStart : -searchStart - 1;
        const toIdx = searchEnd >= 0 ? searchEnd : -searchEnd - 1;
        return this.#keyframes.slice(fromIdx, toIdx);
    }

    /**
     * @param {number} time 
     * @returns {TValue}
     */
    getValue(time) {
        const idx = this.#searchIndex(time);
        if (idx >= 0) return this.#keyframes[idx].value;

        const insertAt = -idx - 1;
        const before = this.#keyframes[insertAt - 1];
        const after = this.#keyframes[insertAt];
    
        if (!before) return this.defaultValue;
        if (!after) return before.value;
    
        const progress = (time - before.time) / (after.time - before.time);
        return applyEasing(before.value, after.value, this.#interpolator, after.easing, progress);
    }

    /**
     * @param {number} time 
     * @param {TValue} value 
     * @param {import(".").Easing} easing 
     * @returns {import(".").Keyframe<TValue>}
     */
    setValue(time, value, easing) {
        const idx = this.#searchIndex(time);

        if (idx >= 0) {
            const k = this.#keyframes[idx];
            k.value = value;
            if (easing) k.easing = easing;
            return k;
        }

        const insertAt = -idx - 1;
        const before = this.#keyframes[insertAt - 1];
        const after = this.#keyframes[insertAt];

        /** @type {import(".").Easing} */
        const useEasing = easing ?? after?.easing ?? before?.easing ?? "linear";

        /** @type {import(".").Keyframe} */
        const k = {
            time,
            value,
            easing: useEasing
        };

        this.#keyframes.splice(insertAt, 0, k);
        return k;
    }

    /**
     * @param {import(".").Keyframe<TValue>[]} keyframes 
     */
    setKeyframes(keyframes) {
        for (const k of keyframes) {
            this.setValue(k.time, k.value, k.easing);
        }
    }

    /**
     * @param {import(".").Keyframe<TValue>} keyframe 
     * @param {number} newTime 
     * @returns {import(".").Keyframe<TValue>}
     */
    setTime(keyframe, newTime) {
        let moveFrom = this.#searchIndex(keyframe.time);

        if (moveFrom < 0) {
            moveFrom = this.#keyframes.findIndex(k => k == keyframe);
            if (moveFrom == -1) throw new Error(`Keyframe does not exists in timeline`);
        }

        const searchTo = this.#searchIndex(newTime);
        const moveTo = searchTo >= 0 ? searchTo : -searchTo - 1;
        const k = this.#keyframes[moveFrom];
        k.time = newTime;
        this.#keyframes.splice(moveTo, 0, k);
        this.#keyframes.splice(moveTo < moveFrom ? moveFrom + 1 : moveFrom, 1);
        return k;
    }

    /**
     * @param {import(".").Keyframe<TValue>} keyframe 
     */
    delete(keyframe) {
        let idx = this.#searchIndex(keyframe.time);

        if (idx < 0) {
            idx = this.#keyframes.findIndex(k => k == keyframe);
            if (idx == -1) throw new Error(`Keyframe does not exists in timeline`);
        }

        this.#keyframes.splice(idx, 1);
    }

    /**
     * @param {number} fromTime 
     * @param {number} toTime 
     * @returns {import(".").Keyframe<TValue>[]}
     */
    clearKeyframes(fromTime, toTime) {
        const searchStart = this.#searchIndex(fromTime);
        const searchEnd = this.#searchIndex(toTime);
        const fromIdx = searchStart >= 0 ? searchStart : -searchStart - 1;
        const toIdx = searchEnd >= 0 ? searchEnd : -searchEnd - 1;
        return this.#keyframes.splice(fromIdx, toIdx - fromIdx);
    }
}