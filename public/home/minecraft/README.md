# Minecraft world assets

Texture artwork: Minecraft Java Edition 1.21.1, Mojang / Microsoft.
The user's requested reconstruction uses 29 original block textures, extracted
from Mojang's client archive. `sources.json` records the exact download URL,
archive SHA-1, individual PNG SHA-256 values and atlas indices.
The atlas keeps the original 16×16 pixel images, with 8px edge padding and the
first frame of animated textures. It is not an AI-generated texture pack.

The user identified Complementary Shaders as the screenshot's shader.
Complementary shader code is not bundled or executed here. The homepage uses
its own inexpensive offline lighting approximation of the supplied image.
Foliage uses biome-style tint and opaque leaves; water uses a still original
frame. No screenshot can determine the hidden backs of buildings: those are
reconstructed from the visible architectural vocabulary.

Regenerate from the isolated project root:

1. `node scripts/import-minecraft-textures.mjs` (requires system bsdtar with ZIP support).
2. `node scripts/build-minecraft-atlas.mjs`
3. `node scripts/build-settlement.mjs`
4. Start the production preview, then `node scripts/capture-settlement-poster.mjs`.

The full client archive and loose source PNGs remain in ignored scratch storage.
`settlement.bin.gz` contains a two-uint32 header (magic and face count), then
20 bytes per visible face: int16 center XYZ, uint16 size XYZ (1/1000 scene unit),
uint8 tile, uint8 linear RGB, uint8 light (1/100), uint8 direction and uint16 block ID.
The client expands this bounded array into GPU vertices once; all occlusion and
shadow tracing stay offline. This cuts transfer to ~69KB with the same geometry.
`settlement.json` records the geometry/transfer budget. The poster is captured
from the actual browser-rendered model, rather than from the reference photo.
