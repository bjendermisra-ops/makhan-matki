# Makhan Matki visual assets

Generated with the built-in image generation tool, using the user's supplied UI reference as visual guidance. The original uploaded reference is not shipped as a fake interactive screen.

- `vrindavan-night.webp`: moonlit Vrindavan environment; temple skyline, Yamuna, dark garden clearing, cow, peacock and edge lamps. No text or board tiles. Source prompt requested the reference's rich painterly palette and a clear central garden for code-rendered tiles.
- `characters-items.webp`: transparent illustrated atlas; orange, blue, pink and green village companions, butter pot, monkey, flute, peacock feather and shield. Source prompt requested isolated, fully contained assets with the reference's warm, polished 2.5D style. SVG viewBoxes select each object without altering source pixels.

Board geometry, numbers, pathways, dice pips, player progress and controls are generated in code. Rules are in `engine.js`; presentation and event handling are in `game.js`. `test-engine.cjs` validates the deterministic rules.

Delivery assets are WebP-encoded at quality 84. Original generated PNGs are preserved in source-art.
