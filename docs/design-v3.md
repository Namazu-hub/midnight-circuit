# Version 3 design: distinct rooms and readable action

## Player contract
- Eight selectable stages retain their existing indices, progress and optional audio. No forced music.
- Normal movement keeps coyote time, buffered double jumps and variable jump height.
- Head-up life is absent normally. Damage shows the previous number briefly, animates to the current value, then fades after 2.2 seconds. Respawn and healing clear the notice. The corner HUD remains available.
- Monster cans give 9 seconds of rainbow movement boost. Invulnerability is a separate damage timer.
- Pulse stops enemies/projectiles and ordinary machinery, reveals holograms, and activates nearby circuit controls. Cargo movement continues during pulse.

## Room identities
1. Workbench: circuit controls permanently connect bridge segments; introductory enemy tells and optional high routes.
2. Greenhouse: fan-driven vertical greenhouse shaft and fragile leaves which regrow; safe rest landings.
3. Rail cargo: flat metal deck with wheels, slopes and actual gaps in rails; player and deck jump as one. Left brakes, right accelerates. Checkpoints restore both rail position and rider.
4. Printer: repeating deposition/cooling cycle creates solid printed platforms, with traveling heated nozzles and an elevated exit.
5. Clock tower: a genuine vertical route with opposing stairs and clock lifts; relay repair on different floors, camera follows height.
6. Solder street: opposing conveyor belts, telegraphed presses and rest bays; speed has consequences but recovery stays fair.
7. Oscilloscope: wave-driven platforms and bounded low-gravity fields; use pulse to hold a landing.
8. Optical bench: pulse-operated paired lens portals, light bridges and receiver repairs across vertically separated optical benches.

## Enemy rules
- Resistor: patrol -> visible charge-up -> directed dash -> recovery.
- Capacitor: charge -> visible radial discharge -> safe cooldown; jumping or pulse avoids the field.
- IC: stationary turret with aim tell and a traveling bolt; stomp or pulse, no instant hits.
- Beaker: repeated hop -> acid spill that expires; stomp during flight or avoid the marked puddle.
- Diode: flying patrol -> marked downward dive -> return; used in vertical/rail rooms.
All attacks activate near the player, remain deterministic, stop under pulse, and respect one shared invulnerability timer.

## State and integration
Simulation owns collision, entity states, timers, rail coordinates, projectiles, checkpoint snapshots and camera targets. Renderer only reads state. UI owns menus, audio and saved progress. Level data owns geometry and routes. Rail riding is an explicit locomotion mode, separate from normal platform physics, so the player never slides off an airborne vehicle accidentally.

Two-axis camera uses world-space bounds and an upward look-ahead. NPCs, particles, hazards, flags and signs share the same world transform. Room-specific scenery remains parallax behind it. Respawn clears temporary hazards and restores moving geometry and machinery safely while retaining collected rewards and repaired circuits.

## Validation gates
- Unit/integration checks: damage visibility/number transition/fade, every enemy tell/attack/pulse interaction, projectile immunity, conveyors/presses, regrowing leaves, printed-platform solidity, portals and two-axis camera.
- Rail tests: slope adhesion, entire vehicle jump, gap crossing/failure, acceleration/braking, safe checkpoint retry, endpoint completion.
- Full-route simulation uses actual inputs for all eight stages; isolated fixtures do not count as complete playthroughs.
- Browser QA: desktop + narrow layout, all stage navigation, sample real gameplay, rail visuals/input, head-up life states, audio and bonus transitions; report exact limits.

## Fever integration
A lap is a distinct clear of each of the eight rooms, in any order. Replays do not draw. Base probability 8%, rising after half the rooms, guaranteed on final unique clear. At most one award per lap. Record award and pending normal result atomically before the introduction; reloading resumes the award without rerolling. A new lap begins on the next clear after all distinct rooms have cleared.

Fever is a separate simulation instance; preserve the finished normal instance/result, and restore it on completion. Never modify global rules. The route remains controlled by the player, has a continuous safety floor, upper reward lanes, streamed enemy packs, a fast pulse attack and invulnerable contact attacks. Combo decays after four seconds without a kill; best combo persists. The finish requires physically reaching the exit. Pause stops intro/outro and simulation. A snapshot of the pending bonus is saved periodically and when leaving. No external assets: procedural Canvas extrusion and layered metallic text, Web Audio original fanfares and music. Effects reduction removes flashes/shake/speed lines and limits particles; sound stays opt-in.

## Final life and dialogue revision
Six HP and three adventure lives. Fall recovery costs one HP (even during damage immunity), preserves the reduced HP and shows the loss at the checkpoint. At zero HP, spend one life and restore HP. Manual retries spend one life. At zero lives the simulation stops and the game-over screen requires a new adventure from room one, resetting clears/parts/chips/lap while retaining historical best times and sound/effects preferences. Fever remains invulnerable and has a continuous safety floor. All nine requested student lines are present verbatim, placed first in each assigned NPC's rotation.

## Validation outcomes
15 Node tests pass; all 8 authored routes traverse with real inputs. The vertical tower final floor originally obstructed the last staircase jump; moving its left boundary right fixed the underside collision. Tests found and corrected a fixture that started embedded in the floor (which correctly triggered fall damage). Browser rendering inspected metallic logos, combat text placement, rail slopes/gaps, head life, desktop map and 390px map/play controls. Browser integration used shortened goals to exercise final rescue draw, bonus exit, normal result, three manual life losses, game over, and full adventure reset. Read-only page evidence confirmed playing / gameover / result modes and the restored HP6/lives3/course1/0-cleared UI. Full normal and fever runs are simulation checks, not claimed as manual clears.
