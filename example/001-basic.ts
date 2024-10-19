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

import * as keyframe from "@nahara/keyframe";

const timeline = new keyframe.BasicTimeline(0, keyframe.scalarInterpolator);

console.log("Setting keyframes...");
timeline.set(0, 0);
timeline.set(100, 1);
const kf3 = timeline.set(200, 2);
timeline.set(300, 3);

// Timeline: [0, 100, 200, 300]
console.log("Timeline is now ", timeline.keyframes.map(k => k.time));
console.log("timeline.get(50) == ", timeline.get(50));
console.log("timeline.get(150) == ", timeline.get(150));
console.log("timeline.get(250) == ", timeline.get(250));
console.log("timeline.get(400) == ", timeline.get(400));

console.log("Changing keyframe time...");
kf3.time = 800;

// Timeline: [0, 100, 300, 800]
console.log("Timeline is now ", timeline.keyframes.map(k => k.time));
console.log("timeline.get(400) == ", timeline.get(400));