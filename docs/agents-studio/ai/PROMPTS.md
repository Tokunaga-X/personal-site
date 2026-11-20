# Agent 角色贴片生成 Prompt（v2 · 无椅子完整身体版）

## 为什么更新为 v2（关键 Double-Check 结论）

1. **空房间底图 (`public/studio/room-light-1280.webp`) 里已经画好了 4 把深蓝色办公椅**，而且 **4 个工位的朝向完全一致**：椅子全部在左下方（西南侧），显示器全部在右上方（东北侧）。
2. 如果生成的贴片里带了椅子：
   - 贴片里的椅子会和底图的椅子重影，小人一动整把椅子连轮子一起跳；
   - 如果把贴片里的椅子抠掉，小人被椅背挡住的后背和屁股就是空的（大缺口），一动就穿帮。
3. **正确做法**：
   - AI 只画 **100% 完整、无遮挡的小人本体**（坐姿，像坐在隐形的空中坐垫上，**完整的圆润后背 + 完整的底部/小短腿 + 伸向前的双手**，**绝对不画任何椅子**）；
   - 前端已经从底图原封不动裁出了 4 把深蓝色椅子的**原生椅背遮挡层**盖在小人前面；
   - 完整的小人夹在“底图坐垫”和“前景椅背”之间，怎么呼吸、打字、跳跃都严丝合缝，椅子稳如泰山！

---

## 通用要求（每条 Prompt 均已包含）

- **参考图**：只传 `docs/agents-studio/concept-light.jpg`（暗色版传 `concept-dark.jpg`）作为**角色长相与手绘水粉质感**参考即可（不要让模型照抄里面的椅子或桌子）
- **朝向统一**：全部 4 只角色均为 **等距视角 3/4 朝向画面右上方（facing front-right / northeast, 45° isometric angle）**，双手向前右方伸出作敲键盘姿势，对齐空房间里右上方的显示器
- **完整无遮挡**：头顶（含绿芽/天线）到圆润的后背、臀部、小短腿**全部完整画出**，没有任何椅子、桌子挡住身体，没有任何裁剪缺口
- **纯洋红背景**：`#FF00FF` 纯平背景，无阴影、无家具、无地面、无文字，1024×1024 PNG

保存到 `docs/agents-studio/ai/`，文件名见各节标题。

---

## 1. `site-pilot-light.png` & `site-pilot-dark.png` — 奶白萌芽小人（左一工位）

### Light (`site-pilot-light.png`)
参考图：`docs/agents-studio/concept-light.jpg`

```text
Isolated full-body character sprite in the exact hand-painted gouache illustration style of the attached concept art. Paint ONLY the cute round cream-white bean-shaped mascot (with the small green two-leaf sprout on top of his head, two dark oval eyes with white highlights, pink rosy cheeks, and tiny smile). Pose and angle: 3/4 isometric view facing RIGHT (front-right / northeast, matching the angle of the leftmost character in the reference), in a cute seated typing pose as if sitting on an invisible cushion — both stubby arms reaching forward-right to type, short stubby legs tucked in a sitting posture, and a COMPLETE, smooth, rounded back and bottom contour with NOTHING cut out and NOTHING covering him. CRITICAL: Draw ONLY the character's body — NO office chair, NO backrest, NO wheels, NO desk, NO keyboard, NO shadow, NO floor. The entire rounded back and lower body of the character must be fully painted and completely visible. Centered on a flat solid bright magenta #FF00FF background, square 1024x1024 PNG.
```

### Dark (`site-pilot-dark.png`)
参考图：`docs/agents-studio/concept-dark.jpg` + 刚生成的 `site-pilot-light.png`

```text
Keep the exact same character, exact same outline, pose, proportions, and camera angle as the attached light sprite, with NO chair and a completely visible rounded back and bottom. Re-light him to match the moonlit night palette of the attached dark room concept art: slightly cooler, dimmer cream body shading and soft night ambient lighting. Flat solid bright magenta #FF00FF background, no chair, no shadow, square 1024x1024 PNG.
```

---

## 2. `general-pilot-light.png` & `general-pilot-dark.png` — 天蓝方块机器人（左二工位）

### Light (`general-pilot-light.png`)
参考图：`docs/agents-studio/concept-light.jpg`

```text
Isolated full-body character sprite in the exact hand-painted gouache illustration style of the attached concept art. Take the cute sky-blue cube-headed robot (with the small ball antenna on top, two dark oval eyes with white highlights, pink rosy cheeks, and tiny smile) from the reference image, and rotate his pose to a 3/4 isometric view facing RIGHT (front-right / northeast, the exact same facing angle as the cream sprout character on the left desk). He is in a cute seated typing pose on an invisible cushion: rounded cube head and compact chubby blue body, both stubby blue arms reaching forward-right as if typing on a keyboard, short stubby seated legs/base, and a COMPLETE, unobstructed back and bottom contour. CRITICAL: Draw ONLY the character — NO office chair, NO backrest, NO desk, NO keyboard, NO monitor, NO shadow. Centered on a flat solid bright magenta #FF00FF background, square 1024x1024 PNG.
```

### Dark (`general-pilot-dark.png`)
参考图：`docs/agents-studio/concept-dark.jpg` + `general-pilot-light.png`

```text
Keep the exact same sky-blue cube robot, exact same outline, pose, proportions, and front-right facing angle as the attached light sprite, with NO chair and a completely visible back and bottom. Re-light him to match the moonlit night palette of the attached dark room concept art: cooler muted blue shading and soft night ambient lighting. Flat solid bright magenta #FF00FF background, no chair, no shadow, square 1024x1024 PNG.
```

---

## 3. `x-pilot-light.png` & `x-pilot-dark.png` — 炭黑圆球小人（右二工位）

### Light (`x-pilot-light.png`)
参考图：`docs/agents-studio/concept-light.jpg`

```text
Isolated full-body character sprite in the exact hand-painted gouache illustration style of the attached concept art. Take the cute round matte charcoal-black blob character (with two bright white oval eyes and tiny white mouth line) from the reference image, and orient him in a 3/4 isometric view facing RIGHT (front-right / northeast, the exact same facing angle as the cream sprout character on the left desk). He is in a cute seated typing pose on an invisible cushion: round matte dark charcoal-black body, both stubby dark arms reaching forward-right as if typing on a keyboard, short rounded seated lower body/legs, and a COMPLETE, smooth, unobstructed back and bottom contour. CRITICAL: Draw ONLY the character — NO office chair, NO backrest, NO desk, NO monitor, NO keyboard, NO shadow. Centered on a flat solid bright magenta #FF00FF background, square 1024x1024 PNG.
```

### Dark (`x-pilot-dark.png`)
参考图：`docs/agents-studio/concept-dark.jpg` + `x-pilot-light.png`

```text
Keep the exact same round charcoal-black character, exact same outline, pose, proportions, and front-right facing angle as the attached light sprite, with NO chair and a completely visible back and bottom. Adjust his shading to match the moonlit night palette of the attached dark room concept art while keeping a subtle cool rim highlight so his round silhouette reads clearly. Flat solid bright magenta #FF00FF background, no chair, no shadow, square 1024x1024 PNG.
```

---

## 4. `trading-pilot-light.png` & `trading-pilot-dark.png` — 薄荷绿水滴小人（右一工位）

### Light (`trading-pilot-light.png`)
参考图：`docs/agents-studio/concept-light.jpg`

```text
Isolated full-body character sprite in the exact hand-painted gouache illustration style of the attached concept art. Take the cute mint-green teardrop/dumpling-shaped mascot (with the pointed droplet top, two dark oval eyes with white highlights, pink rosy cheeks, and tiny smile) from the reference image, and orient him in a 3/4 isometric view facing RIGHT (front-right / northeast, the exact same facing angle as the cream sprout character on the left desk — NOT facing left). He is in a cute seated typing pose on an invisible cushion: plump mint-green droplet body, both stubby mint arms reaching forward-right as if typing on a keyboard, rounded seated lower body/stubby legs, and a COMPLETE, smooth, unobstructed back and bottom contour. CRITICAL: Draw ONLY the character — NO office chair, NO backrest, NO desk, NO monitor, NO keyboard, NO shadow. Centered on a flat solid bright magenta #FF00FF background, square 1024x1024 PNG.
```

### Dark (`trading-pilot-dark.png`)
参考图：`docs/agents-studio/concept-dark.jpg` + `trading-pilot-light.png`

```text
Keep the exact same mint-green droplet character, exact same outline, pose, proportions, and front-right facing angle as the attached light sprite, with NO chair and a completely visible back and bottom. Re-light him to match the moonlit night palette of the attached dark room concept art: slightly muted cool mint shading and night ambient lighting. Flat solid bright magenta #FF00FF background, no chair, no shadow, square 1024x1024 PNG.
```
