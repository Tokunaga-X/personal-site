# Agent sprite generation task

You are generating character sprites for the studio room section of this
site. Read `PROMPTS.md` in this folder for the full prompt set.

## This task: pilot only

Generate **one image**: the site bot, light theme — prompt #1 in
`PROMPTS.md`.

Reference images to attach (in this order):

1. `docs/agents-studio/concept-light.jpg` — hand-painted concept art
   (character design + style reference)
2. `public/studio/room-light-1280.webp` — the empty room actually used by
   the site (desk perspective to match)

## Output requirements

- Single character, fully visible (head to seat cushion), seated, arms in a
  typing pose, nothing occluding him
- Completely plain solid bright magenta `#FF00FF` background — this is a
  keying color, the background must be flat and uniform, no gradient, no
  texture, no magenta tint on the character itself
- No shadow, no desk, no floor, no text, no border, square canvas
- PNG, save as `docs/agents-studio/ai/site-pilot-light.png`
- Commit and push to `main`

After the pilot is approved by the site owner, the remaining seven sprites
(general / x / trading, each in light + dark) will use the same pattern
with prompts #2–#4 in `PROMPTS.md`; dark versions reference
`concept-dark.jpg` + `public/studio/room-dark-1280.webp` and are named
`{id}-pilot-dark.png`.
