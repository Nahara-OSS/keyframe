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