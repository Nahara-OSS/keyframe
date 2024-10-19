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

import type { Easing } from "../types/easing.ts";
import type { Interpolator } from "../types/interpolate.ts";
import type { ITimeline, IKeyframe, KeyframeFlag } from "../types/timeline.ts";
import { easingTimeToProgress } from "./easing.impl.ts";

export class BasicTimeline<T> implements ITimeline<T> {
    keyframes: BasicKeyframe<T>[] = [];

    constructor(
        public initialValue: T,
        public interpolator: Interpolator<T>
    ) {}

    /**
     * Get the timeline as serializable object. Serializable object can be serialized into different formats, like JSON
     * or binary for example.
     */
    get asSerializable(): SerializableTimeline<T> {
        return {
            initialValue: structuredClone(this.initialValue),
            keyframes: this.keyframes.map(k => k.asSerializable)
        };
    }

    /**
     * Load this timeline from a serializable object.
     * @param serializable The serializable object decoded from deserializer.
     */
    loadFromSerializable(serializable: SerializableTimeline<T>) {
        this.initialValue = serializable.initialValue;
        this.keyframes = serializable.keyframes.map(s => new BasicKeyframe(
            this,
            s.time,
            structuredClone(s.value),
            structuredClone(s.easing),
            s.flags
        )).sort((a, b) => a.time - b.time);
    }

    get(time: number): T {
        const idx = this.searchKeyframeIndex(time);
        if (idx >= 0) return this.keyframes[idx].value;

        const insertAt = -idx - 1;
        const before = this.keyframes[insertAt - 1];
        const after = this.keyframes[insertAt];
    
        if (!before) return this.initialValue;
        if (!after) return before.value;
    
        const progress = (time - before.time) / (after.time - before.time);
        return this.interpolator(before.value, after.value, easingTimeToProgress(after.easing, progress));
    }

    set(time: number, value: T, easing?: Easing): IKeyframe<T> {
        const idx = this.searchKeyframeIndex(time);

        if (idx >= 0) {
            const kf = this.keyframes[idx];
            kf.value = value;
            if (easing) kf.easing = easing;
            return kf;
        }

        return this.add(time, value, easing);
    }

    add(time: number, value: T, easing?: Easing, flags?: KeyframeFlag[]): IKeyframe<T> {
        const search = this.searchKeyframeIndex(time);
        const insertAt = search >= 0 ? search : -search - 1;
        const lastKf = this.keyframes[insertAt - 1];
        const kf = new BasicKeyframe(this, time, value, easing ?? lastKf?.easing ?? "linear", flags);
        this.keyframes.splice(insertAt, 0, kf);
        return kf;
    }

    remove(...keyframes: IKeyframe<T>[]): void {
        for (const kf of keyframes) {
            const search = this.searchKeyframeIndex(kf.time);
            if (search < 0) continue;
            this.keyframes.splice(search, 1);
        }
    }

    getKeyframeAt(time: number): IKeyframe<T> | null {
        const idx = this.searchKeyframeIndex(time);
        return idx >= 0 ? this.keyframes[idx] : null;
    }

    getKeyframesBetween(timeStart: number, timeEnd: number): IKeyframe<T>[] {
        const searchStart = this.searchKeyframeIndex(timeStart);
        const searchEnd = this.searchKeyframeIndex(timeEnd);
        const fromIdx = searchStart >= 0 ? searchStart : -searchStart - 1;
        const toIdx = searchEnd >= 0 ? searchEnd : -searchEnd - 1;
        return this.keyframes.slice(fromIdx, toIdx);
    }

    removeBetween(timeStart: number, timeEnd: number): IKeyframe<T>[] {
        const searchStart = this.searchKeyframeIndex(timeStart);
        const searchEnd = this.searchKeyframeIndex(timeEnd);
        const fromIdx = searchStart >= 0 ? searchStart : -searchStart - 1;
        const toIdx = searchEnd >= 0 ? searchEnd : -searchEnd - 1;
        return this.keyframes.splice(fromIdx, toIdx - fromIdx);
    }

    [Symbol.iterator](): Iterator<IKeyframe<T>> {
        return this.keyframes[Symbol.iterator]();
    }

    /**
     * Search the keyframe index from this timeline, using binary search algorithm.
     * @param time The keyframe time.
     * @returns A non-negative value if there is a keyframe with given time, or `-1 - search` where `search` is the
     * insert position.
     */
    searchKeyframeIndex(time: number): number {
        if (this.keyframes.length == 0) return -1;

        let start = 0;
        let end = this.keyframes.length - 1;

        while (start <= end) {
            const mid = (start + end) >> 1;
            const midValue = this.keyframes[mid];

            if (midValue.time < time) start = mid + 1;
            else if (midValue.time > time) end = mid - 1;
            else return mid;
        }

        return -1 - start;
    }
}

interface SerializableTimeline<T> {
    initialValue: T;
    keyframes: SerializableKeyframe<T>[];
}

class BasicKeyframe<T> implements IKeyframe<T> {
    #time: number;
    #flags: KeyframeFlag[] = [];

    constructor(
        public readonly timeline: BasicTimeline<T>,
        time: number,
        public value: T,
        public easing: Easing,
        flags?: KeyframeFlag[]
    ) {
        this.#time = time;
        if (flags) this.#flags.push(...flags);
    }

    get flags(): KeyframeFlag[] { return [...this.#flags]; }
    get keyframeIndex(): number { return this.timeline.searchKeyframeIndex(this.#time); }
    
    get time(): number { return this.#time; }
    set time(newTime: number) {
        if (newTime == this.#time) return;

        const lastIdx = this.keyframeIndex;
        if (lastIdx < 0) return;
        
        const search = this.timeline.searchKeyframeIndex(newTime);
        const nextIdx = search >= 0 ? search : -search - 1;
        this.#time = newTime;
        if (lastIdx == nextIdx) return;

        this.timeline.keyframes.splice(nextIdx, 0, this);
        this.timeline.keyframes.splice(nextIdx < lastIdx ? lastIdx + 1 : lastIdx, 1);
    }

    /**
     * Get the keyframe as serializable object. Serializable object can be serialized into different formats, like JSON
     * or binary for example.
     */
    get asSerializable(): SerializableKeyframe<T> {
        return {
            time: this.time,
            easing: structuredClone(this.easing),
            value: structuredClone(this.value),
            flags: this.flags
        };
    }

    addFlag(...flags: KeyframeFlag[]): void {
        for (const flag of flags) {
            if (!this.#flags.includes(flag)) this.#flags.push(flag);
        }
    }

    removeFlag(...flags: KeyframeFlag[]): void {
        for (const flag of flags) {
            const idx = this.#flags.indexOf(flag);
            if (idx != -1) this.#flags.splice(idx, 1);
        }
    }
}

interface SerializableKeyframe<T> {
    time: number;
    easing: Easing;
    value: T;
    flags: KeyframeFlag[];
}