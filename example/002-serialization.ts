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
 * This example show you how to save the timeline into serializable object.
 */

import * as keyframe from "@nahara/keyframe";

type Vec2 = { x: number, y: number };
const timeline = new keyframe.BasicTimeline<Vec2>({ x: 0, y: 0 }, keyframe.structInterpolatorOf());
timeline.set(0, { x: 0, y: 0 });
timeline.set(100, { x: 100, y: 50 });
timeline.set(200, { x: 200, y: -80 });
timeline.set(300, { x: 50, y: 100 });

const serializable = timeline.asSerializable;
console.log(serializable);

const newTimeline = new keyframe.BasicTimeline<Vec2>({ x: 0, y: 0 }, keyframe.structInterpolatorOf());
newTimeline.loadFromSerializable(serializable);
console.log("newTimeline.get(50) == ", newTimeline.get(50));
console.log("newTimeline.get(150) == ", newTimeline.get(150));
console.log("newTimeline.get(250) == ", newTimeline.get(250));
console.log("newTimeline.get(350) == ", newTimeline.get(350));