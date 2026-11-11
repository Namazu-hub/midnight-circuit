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
