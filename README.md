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

### Examples
- See [Basic example](example/001-basic.ts) for example on how to use this module.
- See [Serialization example](example/002-serialization.ts) for example on how to save the timeline into serializable
object.

## License
MIT license.