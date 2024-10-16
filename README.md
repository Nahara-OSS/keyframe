# Keyframing Engine
The keyframe engine that will be used across Nahara's Creative Suite for
animations.

In order to use this package, you have to import it as ECMAScript 6 module. The
regular CommonJS module is not available at this moment. One nice feature of ES6
module is [tree shaking][1], which can be used to reduces the bundle size,
although we are expecting all functions exported from this module to be used in
your code, either directly or indirectly from `Timeline`.

## Example usage
```typescript
import * as keyframe from "@nahara/keyframe"

// Use our custom value type
type Vec2 = [number, number]
function interpolateVec2(a: Vec2, b: Vec2, p: number): Vec2 {
    const inverse = 1 - ;
    return [
        a[0] * inverse + b[0] * p,
        a[1] * inverse + b[1] * p
    ]
}

// Using timeline
const tl = new keyframe.Timeline<number>([0, 0], interpolateVec2)
tl.setValue(0, [0, 0])
tl.setValue(1000, [100, 50])
tl.getValue(500) // => [50, 25]

// Changing easing function
tl.getKeyframe(1000).easing = "hold"
tl.getValue(500) // => [0, 0]

// Changing keyframe time
tl.setTime(tl.getKeyframe(1000), 500)
tl.getValue(500) // => [100, 50]

// Interpolate values manually
const progress = 0.5
const easing: keyframe.Easing = {
    type: "cubic-bezier",
    cp1: { x: 1, y: 0.4 },
    cp2: { x: 0.6, y: 1 }
} // cubic-bezier(1, 0.4, 0.6, 1) CSS function
keyframe.applyEasing<Vec2>([0, 0], [100, 50], interpolateVec2, easing, progress)
```

## Contributing
We are trying to keep this as simple as possible, such as not using TypeScript
compiler but opt for JSDoc + TypeScript declaration file instead. We still have
type checking working in text editor, without having to wait for compile time.

`test.js`

## License
[MIT License][2].

[1]: https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking
[2]: ./LICENSE