# Agent sprite generation task (v2 — full body, NO chair)

Read `PROMPTS.md` in this folder for the complete v2 prompt set for all 8 sprites:

- `site-pilot-light.png` (regenerate without the office chair!)
- `site-pilot-dark.png`
- `general-pilot-light.png`
- `general-pilot-dark.png`
- `x-pilot-light.png`
- `x-pilot-dark.png`
- `trading-pilot-light.png`
- `trading-pilot-dark.png`

## Critical rules for all 8 sprites

1. **NO office chair, NO backrest, NO desk, NO monitor, NO shadow.**
   The empty room background (`public/studio/room-light.webp` & `room-dark.webp`) already has all four navy office chairs painted in place, and the frontend overlays the real chair backrest on top of the character. The sprite must contain **ONLY the character's own complete body** (with a smooth, complete, rounded back and bottom — no chair-shaped cutout).
2. **All 4 characters face front-right (3/4 isometric view facing northeast / right)** — because in the empty room background, all 4 chairs sit on the front-left of their desks facing the monitor on the back-right.
3. **Solid flat `#FF00FF` magenta background**, 1024×1024 PNG, saved in `docs/agents-studio/ai/` and pushed to `main`.
