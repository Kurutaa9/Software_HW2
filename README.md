# My Mario Game

A Mario-style platformer built with Cocos Creator.
Assignment 02 — Software Studio (CS2410), National Tsing Hua University

## Scripts
- `Player.ts` — Player movement, jumping, lives, grow/shrink
- `Enemy.ts` — Enemy movement and stomp detection
- `GameManager.ts` — Enemy and question block reset on player death
- `QuestionBlock.ts` — Spawns mushroom when bumped
- `Mushroom.ts` — Moves and triggers player growth on contact
- `CameraFollow.ts` — Camera follows player on X axis
- `BGMManager.ts` — Background music

## Controls
| Key | Action |
|-----|--------|
| A / ← | Move left |
| D / → | Move right |
| W / ↑ / Space | Jump |

## Features Completed
- [ ] Complete Game Process (start menu, level select, game view, game over)
- [V] World Map with correct physics (gravity, collision)
- [V] Background & camera follow player
- [V] At least 1 world map
- [V] Static walls in scene
- [V] Question blocks that interact with player
- [V] Player physics, movement, jump
- [V] Player takes damage / loses life from enemies
- [V] Player loses life when out of bounds
- [V] Player respawns at initial position
- [V] Enemies with correct physics
- [V] At least 1 enemy type
- [V] Enemies can only be killed by stomping
- [V] Super mushroom from question block (makes Mario bigger)
- [V] Player walk & jump animations
- [V] Enemy animations
- [V] BGM
- [V] Player jump & die sound effects
- [ ] Additional sound effects
- [ ] Player life UI
- [ ] Player score UI
- [ ] Timer UI
- [V] Git version control with regular commits

## Bonus
- [ ] Firebase deployment
- [ ] Membership (sign up / login / save progress)
- [ ] Leaderboard
- [ ] Multiplayer

## Grading Criteria
| Item | Score |
|------|-------|
| Complete Game Process | 5% |
| Basic Rules | 50% |
| &nbsp;&nbsp;World Map (physics, camera, at least 1 map) | 10% |
| &nbsp;&nbsp;Level Design (static walls, question blocks) | 5% |
| &nbsp;&nbsp;Player (physics, controls, damage, respawn) | 15% |
| &nbsp;&nbsp;Enemies (physics, stomp kill, question blocks) | 15% |
| &nbsp;&nbsp;Question Blocks (super mushroom) | 5% |
| Animations | 10% |
| Sound Effects | 10% |
| UI (life, score, timer) | 10% |
| Appearance (subjective) | 10% |
| Bonus (Firebase, Leaderboard, Multiplayer) | up to 10% |
| Git | 5% |
| **Total** | **up to 110%** |

## AI Usage
This project was developed with AI assistance. See `AI_reference.pdf` for full details including tools used, prompts, responses, and code explanations as required by the assignment.