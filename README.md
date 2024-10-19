# Nahara's Keyframe
Keyframing engine for JavaScript.

## Usage (Deno)
### Modules
Nahara's Keyframe is consists of 3 modules:

- `@nahara/keyframe`: The main module, which contains both types and implementations.
- `@nahara/keyframe/types`: The types module, which only contains the types. Useful if you want to write keyframe editor
but don't want to be tied to default implementations.
- `@nahara/keyframe/impl`: The default implementations module, which contains the basic implementations. This is the
module you probably want.

### Quick example
```typescript
// Assuming you are using Deno + TypeScript
import * as keyframe from "jsr:@nahara/keyframe";

// Let's make a new timeline for our keyframes.
// We'll use our custom vector structure.
type vec2 = { x: number, y: number };
const timeline = new keyframe.BasicTimeline<vec2>({ x: 0, y: 0 }, keyframe.structInterpolatorOf());

// Let's place some keyframes in our timeline
// Additionlly, you can use timeline.add() to forcefully add a new keyframe without changing the existing one
timeline.set(0, { x: 0, y: 0 });
timeline.set(1000, { x: 100, y: 50 });
timeline.set(2000, { x: -500, y: 100 });

// Now we'll get the value at specified time
timeline.get(1000); // => { x: 100, y: 50 }
timeline.get(500); // => { x: 50, y: 25 }

// You can also move the keyframes around along its time axis
const keyframe = timeline.getKeyframeAt(1000);
keyframe.time += 500; // Move 2nd keyframe's time by +500
timeline.get(1500); // => { x: 100, y: 50 }

// Let's save our timeline...
const serializable = timeline.asSerializable;
const json = JSON.stringify(serializable);

// ...and now we load it
const newTimeline = new keyframe.BasicTimeline<vec2>({ x: 0, y: 0 }, keyframe.structInterpolatorOf());
newTimeline.loadFromSerializable(JSON.parse(json));
```

### More examples
- See [Basic example](example/001-basic.ts) for example on how to use this module.
- See [Serialization example](example/002-serialization.ts) for example on how to save the timeline into serializable
object.

## License
MIT license.