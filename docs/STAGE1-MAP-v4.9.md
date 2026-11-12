# Stage 1: workbench ridge and service basements

2026-11-11 / work/v4.9-pcb-factory / runtime URL version 4.9f

## Reference and implementation

The supplied level-map image informed the long surface route, changing heights,
and deep optional branches. No reference-image pixels are used. Terrain is an
original lab design: steel workbench panels, circuit traces, bolts, cable trays,
and recessed service cabinets. Bright mint top edges mark colliding surfaces;
muted conduits and cabinet silhouettes are background only.

Stage 1 keeps its 8,400px width, tutorial opening, repair stations, dialogue,
checkpoints and normal goal. Later surface spans become stepped workbenches
(y=430–510), rather than introducing new slope physics. Existing upper shelves
remain. The main route still works without entering the basements.

| Branch | Entry | Bottom | Return | Reward |
|---|---|---|---|---|
| Power archive | x3210 shaft | y1380 | horizontal trays under the ceiling, then x4535 shaft | existing second collectible, funds, drink |
| Cable gallery | x5930 shaft | y1100 | horizontal trays under the ceiling, then x6970 shaft | existing third collectible, funds, drink |

Both entrances occupy existing gaps and have visible service markers. Basement
return rises are at most 120px. Ordinary gaps outside these rooms retain fall
damage and checkpoint recovery. Underground checkpoints were not added.
The vertical camera now accepts a level-level maxY fallback, used only here.

## Files and compatibility

- `dist/bench-level.mjs`: Stage 1 layout and object height remapping.
- `dist/bench-art.mjs`: original Canvas terrain and basement art.
- `dist/levels.mjs`: Stage 1-only post-expansion layout hook.
- `dist/render.mjs`: Stage 1 terrain/background drawing.
- `dist/engine.mjs`: vertical camera bound fallback.
- `tests/bench.test.mjs`: return paths, fall distinction, camera and scope checks.
- Runtime entry/import URLs: 4.9e → 4.9f to prevent mixed cached modules.

Stage IDs/order, RULES, save keys, core movement, repair IDs and total of three
collectibles are unchanged. Other stages receive only cache URL updates.

## Validation and limits

- `npm run check`: 59 modules, HTML references and imports pass.
- `npm test`: 191/191 pass (188 existing plus 3 new tests).
- `node tests/routes.mjs`: all eight main routes finish with zero deaths;
  includes the printer and PCB route drivers. No driver expectations weakened.
- Basement return tests begin from explicit bottom-of-room fixtures and use
  movement/jump/pulse inputs to reach the surface, without equipment or death.
  They are not human exploration tests or full start-to-basement recordings.
- A ceiling trap found during testing was corrected: players first move out
  from under the workbench, then ascend through the open shaft.
- Chromium browser: Stage 1 loaded with new steel/circuit textures; movement,
  jumping and item acquisition observed near the start. Screenshot captured.
- NOT verified: human full-stage exploration, both basement routes in the
  browser, mobile touch/real devices, audio quality, first-play completion time.

This is a working-branch/private-test update, not a GitHub Pages release.

## 2026-11-12: floor-button wiring (4.9g)

The user's revised specification supersedes the earlier preservation of the
three required repair IDs. Stage 1 now has exactly one required world repair,
`bench-wire`, on the final upper deck. Three physical floor buttons use the
symbols triangle, circle, square; the server logs in both optional basements
show their startup order. An incorrect contact resets progress with feedback.
Holding a button does not repeat it. A jump can skip a button on the way across.
Pulse and purchased assistance cannot solve this repair. Completion powers both
existing light bridges and grants the standard repair reward once.

Removed the x260/y400 introductory overhead tray and its pickup, together with
obsolete repair-menu-generated ghost stairs. Added eight enemies across surface
and basement routes. Server-room structural side walls now have actual solid
geometry and thick floors. Decorative background outlines no longer masquerade
as colliding walls; return shafts stay open.

Validation: 193 tests pass; all eight input-driven main routes finish with zero
deaths. Both basement return paths still pass. New tests cover wrong order,
repeat contact, pulse bypass, single reward, actual wall collision, hint presence
and enemy density. Existing menu-repair tests retain their assertions against
an explicit legacy wiring fixture because that menu was intentionally removed
from live Stage 1. The route driver now physically walks and jumps onto buttons;
it does not set repair flags. Browser and real-device checks of this revision
have not been performed. Human puzzle readability remains to be playtested.

## 2026-11-12: material continuity and distinct basements (v4.9.1)

The Stage 1 wall, window, conduit and panel patterns now use one world-coordinate
grid and follow both camera axes. They no longer restart per screen or terrain
slab. Surface workbenches share y=690 undersides and integer slab boundaries;
only exposed step faces have trim. Intersecting shelves within a 12px top band
are merged into a single collision/render surface. Generic per-platform prop
boxes were removed from this stage. Vendors, the surface students and pickups
are moved clear of risers, laptops and other collectibles. Existing dialogue is
retained. Stage 1 chat is wrapped, kept inside the camera and drawn in front of
world objects; only the nearest student speaks at a time.

| Underground branch | Visual treatment | Optional purpose |
|---|---|---|
| Server archive | cool blue metal, detailed rack bays, patch field, perimeter conduit | the only startup-sequence monitor, with the same symbols/order as the floor buttons |
| Service workshop | warm lamps, tool pegboard, drawers, extractor and occupied desk | new night-shift research student and a supply box |

The second duplicate hint was intentionally removed. Both branches remain
optional for main-route completion, retain the existing collectible parts and
return paths, and have different entrance signs. The workshop supply box opens
on proximity like ordinary pickups: ¥50 once plus one drink. If inventory is
full, its can remains available in the open box. Its flags persist through
ordinary falls/retries within the attempt; no new save format is introduced.

Art is original procedural Canvas drawing, sized in world pixels, with no new
external image assets or permissions required. `bench-art` owns visual work;
`bench-level` owns placement; new `bench-room` handles the one-time supply pickup
through the existing money/inventory APIs. Global physics/RULES are unchanged;
Stage 1 ground depth and redundant shelf geometry intentionally change. URL
references and package version advance together to 4.9.1.

Validation: check passes for 61 runtime modules; 196/196 tests pass. All eight
main input routes finish with zero deaths; dedicated printer/PCB routes still
finish. Basement return fixtures use movement/jump/pulse to reach the surface
without equipment or death. New coverage checks distinct room roles, the single
hint, supply capacity/retry/reward flags, common undersides, duplicate shelf
removal and furniture/pickup clearances. The earlier two-hint assertion changes
because this request explicitly gives only one room the hint role; wall and
return-path expectations are retained.

Chromium visual review uses `tools/bench-review.html`, which explicitly labels
its fixed-position fixtures. Start, surface steps, both underground rooms,
opened supply box and narrow logical canvas are reviewable. This is a renderer
inspection, not a start-to-finish manual play or actual mobile-device test.
The normal local game was also launched through its stage card; movement, jump,
pulse ACTIVE and pause/resume were observed separately from these fixtures. No claim
of human first-play clarity, device touch QA, audio QA or performance gain is
made. The public entry remains the ordinary index.html; the review page is not
required for gameplay.
