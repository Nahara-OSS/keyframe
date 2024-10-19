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

import { assertEquals } from "jsr:@std/assert";
import { BasicTimeline, scalarInterpolator } from "./mod.ts";

Deno.test("BasicKeyframe time change", () => {
    const timeline = new BasicTimeline<number>(0, scalarInterpolator);
    const kf1 = timeline.add(0, 1);
    const kf2 = timeline.add(500, 2);
    const kf3 = timeline.add(1000, 3);
    assertEquals([[0, 1], [500, 2], [1000, 3]], timeline.keyframes.map(k => [k.time, k.value]));

    kf2.time = 1500;
    assertEquals([[0, 1], [1000, 3], [1500, 2]], timeline.keyframes.map(k => [k.time, k.value]));

    kf1.time = 1250;
    assertEquals([[1000, 3], [1250, 1], [1500, 2]], timeline.keyframes.map(k => [k.time, k.value]));

    kf3.time = 0;
    assertEquals([[0, 3], [1250, 1], [1500, 2]], timeline.keyframes.map(k => [k.time, k.value]));
});

// GitHub Issues
// New tests derived from GH issues should be created with the following name:
// #<issue id>: <test name>