import * as keyframe from "./index.js";

function equals(a, b) {
    if (a == b) return true;
    if (a == null && b != null) return false;
    if (a != null && b == null) return false;
    if (typeof a != typeof b) return false;

    if (a instanceof Array) {
        if (!(b instanceof Array)) return false;
        if (a.length != b.length) return false;

        for (let i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) return false;
        }

        return true;
    }

    if (typeof a == "object") {
        for (const [key, value] of Object.entries(a)) {
            if (!equals(value, b[key])) return false;
        }

        for (const [key, value] of Object.entries(b)) {
            if (!equals(value, a[key])) return false;
        }

        return true;
    }

    return false;
}

function assert(expected, result) {
    if (!equals(expected, result)) {
        console.error("\x1b[101m x \x1b[0m Assertion failure: Expected", expected, "but found", result);
        process.exit(1);
    }
}

const timeline = new keyframe.Timeline(0, (a, b, p) => (a * (1 - p)) + (b * p));

timeline.setKeyframes([
    { time: 5, easing: "linear", value: 0 },
    { time: 2, easing: "linear", value: 1 },
    { time: 7, easing: "linear", value: 2 },
    { time: 6, easing: "linear", value: 3 },
    { time: 8, easing: "linear", value: 4 }
]);
assert({
    defaultValue: 0,
    keyframes: [
        { time: 2, easing: "linear", value: 1 },
        { time: 5, easing: "linear", value: 0 },
        { time: 6, easing: "linear", value: 3 },
        { time: 7, easing: "linear", value: 2 },
        { time: 8, easing: "linear", value: 4 }
    ]
}, timeline.asSerializable);

assert({ time: 1.2, easing: "linear", value: 0 }, timeline.setTime(timeline.getKeyframe(5), 1.2));
assert({
    defaultValue: 0,
    keyframes: [
        { time: 1.2, easing: "linear", value: 0 },
        { time: 2, easing: "linear", value: 1 },
        { time: 6, easing: "linear", value: 3 },
        { time: 7, easing: "linear", value: 2 },
        { time: 8, easing: "linear", value: 4 }
    ]
}, timeline.asSerializable);

assert({ time: 7.5, easing: "linear", value: 0 }, timeline.setTime(timeline.getKeyframe(1.2), 7.5));
assert({
    defaultValue: 0,
    keyframes: [
        { time: 2, easing: "linear", value: 1 },
        { time: 6, easing: "linear", value: 3 },
        { time: 7, easing: "linear", value: 2 },
        { time: 7.5, easing: "linear", value: 0 },
        { time: 8, easing: "linear", value: 4 }
    ]
}, timeline.asSerializable);

assert({ time: 8.3, easing: "linear", value: 0 }, timeline.setTime(timeline.getKeyframe(7.5), 8.3));
assert({
    defaultValue: 0,
    keyframes: [
        { time: 2, easing: "linear", value: 1 },
        { time: 6, easing: "linear", value: 3 },
        { time: 7, easing: "linear", value: 2 },
        { time: 8, easing: "linear", value: 4 },
        { time: 8.3, easing: "linear", value: 0 }
    ]
}, timeline.asSerializable);

assert([
    { time: 2, easing: "linear", value: 1 },
    { time: 6, easing: "linear", value: 3 },
    { time: 7, easing: "linear", value: 2 }
], timeline.getKeyframes(2, 8));

const timeline2 = new keyframe.Timeline(0, timeline.interpolator);
timeline2.loadFromSerializable(timeline.asSerializable);
assert({
    defaultValue: 0,
    keyframes: [
        { time: 2, easing: "linear", value: 1 },
        { time: 6, easing: "linear", value: 3 },
        { time: 7, easing: "linear", value: 2 },
        { time: 8, easing: "linear", value: 4 },
        { time: 8.3, easing: "linear", value: 0 }
    ]
}, timeline2.asSerializable);

console.log("\x1b[102m v \x1b[0m Test success!");