# MIDNIGHT CIRCUIT — 真夜中の修理屋

Original browser platformer: eight distinct nighttime laboratory courses plus a playable fever bonus. Buildless HTML/CSS/ES modules, Canvas 2D and synthesized Web Audio. No downloaded artwork, audio, runtime packages, payment or betting systems.

## Play

Arrow keys / A,D move; Space / Z double-jump; X / Shift pulses; Esc / P pauses. Touch controls and fullscreen are supported. On the rail course, left brakes, right accelerates, and jumping launches the whole flat trolley. Rails have slopes and gaps.

HP starts at six and the adventure starts with three lives. Falling costs one HP and returns to the checkpoint without healing. HP reaching zero consumes a life. Manual checkpoint retry also consumes a life and says so in its button. At zero lives, the adventure must restart at course one; clear flags, parts, chips and the current fever lap reset. Best times and preferences remain. Checkpoints heal once per course attempt. Above-head HP is normally hidden; after damage it shows the previous number, animates to the new number, and fades after 2.2 seconds.

モンエナ gives nine seconds of rainbow glow and 1.55× movement speed. It does not heal or provide invulnerability.

## Courses

1. Workbench — repair two circuit switches to keep light bridges solid.
2. Glass garden — crumbling/regrowing leaf platforms, a tall updraft shaft, and a high canopy.
3. Rail express — metal cargo board, sloped rails, gaps, acceleration/braking and whole-cart jumps.
4. 3D printer — alternating printing/cooling platforms, staircase ascent and moving heated nozzles.
5. Clock ascent — vertical switchback stairs, optional elevators and three repair relays.
6. Solder street — conveyors in opposite directions, telegraphed presses and timed crossing.
7. Oscilloscope ocean — oscillating platforms and a low-gravity traversal zone.
8. Optical constellation — three pulse-activated lens transfers joining different elevations.

Resistors charge then dash; capacitors charge and discharge an area; ICs aim and fire; beakers hop and leave chemical puddles; diode drones target and dive. Every course has students, three optional parts, and checkpoint recovery. Nine user-supplied student quotes are included verbatim.

## Fever

A lap is clearing every distinct normal course once, in any order. Replays do not provide extra draws. `DRAW_CONFIG` in `dist/progress.mjs` sets an 8% base chance, a halfway rescue threshold and increasing late-lap chances. The final eligible clear guarantees entry if no earlier draw won. At most one award per lap; the next distinct-clear lap begins after all rooms have been cleared.

Award and pending normal result are saved before entry. The bonus uses its own simulation instance, leaving normal rules unchanged. Reloading offers to resume the pending bonus; snapshots save every three simulation seconds and on pause/exit. Finishing restores the normal result and clears the pending bonus.

The 15,400-unit bonus has invulnerability, 610-unit/s manual movement, contact destruction, a 0.7-second repeat pulse attack and over 90 enemies. Optional upper lanes reward jumping. Combos expire after four seconds without a kill. Great/Super/Excellent/Fever/大当たり calls appear briefly without pausing play. The end requires physically reaching the exit. “FEVERを遊ぶ” is a separate practice mode and does not affect the lottery or records.

`FEVER_CONFIG` in `dist/fever.mjs` exposes intro/outro duration, speed, attack cooldown/radius, combo window, effect scale and course length. Text is procedurally extruded with multiple metallic outlines, a rainbow face, sheen and sparks. Dedicated uptempo synthesized music and fanfares follow the user's optional audio setting. Reduced effects remove flashes, shaking and speed lines and limit particles. The original lever/777 mechanical presentation remains available as a separate demo.

## Modules

- `levels.mjs`: authored world geometry, course metadata, NPC dialogue and route landmarks
- `engine.mjs`, `rail.mjs`, `enemies.mjs`, `world.mjs`: simulation, collisions, machinery, locomotion and enemy state machines
- `fever.mjs`: bonus course, combat, snapshot serialization and metallic typography
- `progress.mjs`: save migration and lap lottery
- `render.mjs`, `awakening.mjs`: procedural artwork
- `game.mjs`: input, UI states, audio, persistence and transitions

## Validation

Run `node --test tests/engine.test.mjs`. Fifteen tests cover all eight full routes using only physics inputs, individual mechanics, health/lives/falling, save migration, lottery guarantees/repeats, fever full-route combat and snapshot restoration. The route driver does not teleport, set HP or disable enemies. All courses finish without losing a life; courses 1 and 4 each use one fall recovery, while the other six need none. This is a deterministic route-aware test, not evidence of novice difficulty or a manual all-course playthrough.

Browser checks: desktop/390px layouts, world map, touch pulse, help/guide, reduced-effects control, game-over restart, and normal-clear → guaranteed fever → normal-result transitions. Transition checks use a temporary shortened fixture; full fever traversal is covered by the simulation test. Fixed-time renderer fixtures verify extrusion, combat text, rails and head-life display. Fixtures are excluded from deployment.

Limits: no physical mobile device testing, no full manual eight-course run, and no subjective speaker/headphone audio balance assessment. Save data is browser-local; blocked storage limits persistence to the current session.
