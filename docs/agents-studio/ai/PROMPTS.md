# Agent 角色贴片生成 prompt

目标:为四只 bot 生成**干净全身立绘**(无遮挡、无影子、纯色背景),用于替换
现在从概念图上裁下来的贴片。生成后放进 `docs/agents-studio/ai/`,命名
`{id}-pilot-{theme}.png`(如 `site-pilot-light.png`),抠图和接线我来。

通用要求(每条 prompt 都已包含,不用额外加):

- 参考**概念图**(角色+风格)+ **空房间图**(桌椅透视)两张图
- 单角色、居中、完整可见(头顶到椅垫,无任何遮挡)
- 纯洋红 `#FF00FF` 背景,无影子/无地面/无文字/无边框
- 方形画布,PNG 输出

建议顺序:先只生成 **site-pilot-light**,验收风格后我再给/你批量其余的。

---

## 1. site bot — 奶白色圆机器人(左桌)

参考图:`docs/agents-studio/concept-light.jpg` + `public/studio/room-light-1280.webp`

```text
Character sprite, hand-painted gouache illustration style matching the first
attached image (cozy studio room concept art). From that first image, take
the small round cream-white robot with two dark oval eyes who sits at the
left desk. Paint him alone as a single isolated sprite: seated on a small
office chair, arms raised forward in a typing pose, full body visible from
the top of his head down to the seat cushion — nothing cut off, nothing
occluding him. Match the perspective, proportions and seat height of the
empty desk on the left side of the second attached image, so he fits
sitting behind that desk. Same warm cream body color, same simple friendly
face with two dark oval eyes, same painterly gouache texture as the concept.
One character only, centered, on a completely plain solid bright magenta
#FF00FF background. No shadow, no desk, no chair back covering him, no
floor, no text, no border. Square canvas.
```

暗色版:参考图换成 `concept-dark.jpg` + `room-dark-1280.webp`,prompt 结尾加一句:

```text
Use the dimmer moonlit palette of the dark room version: slightly muted
cream body, cool low-key lighting, same character and pose.
```

---

## 2. general bot — 蓝色机器人(中左桌)

参考图:同上(亮/暗各一套)

```text
Character sprite, hand-painted gouache illustration style matching the first
attached image (cozy studio room concept art). From that first image, take
the small sky-blue robot who sits at the middle desk. Paint him alone as a
single isolated sprite: seated on a small office chair, arms raised forward
in a typing pose, full body visible from the top of his head down to the
seat cushion — nothing cut off, nothing occluding him. Match the
perspective, proportions and seat height of the empty desk in the middle of
the second attached image, so he fits sitting behind that desk. Same soft
blue body with lighter face panel, same simple friendly face with two dark
eyes, same painterly gouache texture as the concept. One character only,
centered, on a completely plain solid bright magenta #FF00FF background. No
shadow, no desk, no chair back covering him, no floor, no text, no border.
Square canvas.
```

## 3. x bot — 黑色机器人(中右,靠窗)

```text
Character sprite, hand-painted gouache illustration style matching the first
attached image (cozy studio room concept art). From that first image, take
the short dark charcoal-black robot near the window. Paint him alone as a
single isolated sprite: seated on a small office chair, arms raised forward
in a typing pose, full body visible from the top of his head down to the
seat cushion — nothing cut off, nothing occluding him. Match the
perspective, proportions and seat height of the empty desk on the
center-right of the second attached image, so he fits sitting behind that
desk. Same matte black body with two small light-white eyes, same painterly
gouache texture as the concept. One character only, centered, on a
completely plain solid bright magenta #FF00FF background. No shadow, no
desk, no chair back covering him, no floor, no text, no border. Square
canvas.
```

## 4. trading bot — 薄荷绿机器人(右桌,朝左)

```text
Character sprite, hand-painted gouache illustration style matching the first
attached image (cozy studio room concept art). From that first image, take
the mint-green robot at the right desk. Paint him alone as a single isolated
sprite: seated on a small office chair, body turned slightly to face LEFT,
arms raised forward in a typing pose, full body visible from the top of his
head down to the seat cushion — nothing cut off, nothing occluding him.
Match the perspective, proportions and seat height of the empty desk on the
right side of the second attached image, so he fits sitting behind that
desk. Same fresh mint-green body, same simple friendly face with two dark
eyes, same painterly gouache texture as the concept. One character only,
centered, on a completely plain solid bright magenta #FF00FF background. No
shadow, no desk, no chair back covering him, no floor, no text, no border.
Square canvas.
```
