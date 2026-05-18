# Brainstorm: Isometric Foundation + Terrain + Plot Lúa (Real Assets)

**Date:** 2026-05-18
**Status:** active

## Problem Framing

Sau khi hoàn thành 2 feature (project skeleton ở #01, crop system MVP ở #02), game đã có
vòng lặp gameplay tối thiểu: plant → sleep → harvest → money. Tuy nhiên hiển thị hiện tại
vẫn dùng **placeholder SVG** (4 file `empty/planted/growing/ready` ở `public/assets/crops/rice/`),
render theo style top-down đơn sprite ở giữa màn hình. Game chưa "ra dáng" game thật:
chưa có nền (terrain), chưa có không gian, chưa có hồn.

Mục tiêu giai đoạn này: **làm game trông như game thật, đủ để demo**, không thêm gameplay mới.
User đã tham chiếu `public/assets/thumb.png` (isometric pixel-art 2.5D: terrain ruộng, nhà gỗ,
nhân vật, UI khung gỗ) làm style đích.

Vì chuyển sang isometric + thêm terrain + character + UI skin là **3-4 thay đổi nền tảng độc lập**,
brainstorm này chỉ giải quyết **Phase 1** (foundation): chuyển render sang isometric, có terrain
tileset thật, và plot lúa pixel-art thay placeholder. Character sprite và UI skin tách thành các
brainstorm/feature riêng (Phase 2, 3) sau khi nền móng ổn định.

## Approaches Considered

### A: Isometric foundation từ free pack (CC0 ưu tiên) — **Đã chọn**
- **Pros:**
  - Foundation đúng style đích (`thumb.png`), không phải redo render khi thêm character/UI sau
  - Free pack CC0 (Kenney) loại bỏ rủi ro license khi share/demo
  - Tách riêng khỏi character/UI giúp scope nhỏ, rủi ro thấp, dễ rollback nếu Phaser isometric khó
- **Cons:**
  - Phải viết lại logic render plot (toạ độ isometric, depth sort)
  - Asset free style hơi "chung", có thể kém "có hồn" hơn `thumb.png`
  - Camera/click hit-test cần điều chỉnh cho isometric

### B: Giữ top-down, chỉ thay sprite bằng pixel-art real
- **Pros:**
  - Nhỏ nhất, chỉ thay 4 file, không đổi code render
  - Nhanh nhất ship được
- **Cons:**
  - Không đạt style `thumb.png` user mong muốn — sau này vẫn phải làm isometric
  - "Lãng phí công" theo đúng định nghĩa: thay asset 2 lần

### C: Full pass 1 lần (isometric + character + UI cùng brainstorm/feature)
- **Pros:**
  - Một lần xong tất cả, game đẹp ngay
- **Cons:**
  - Scope quá lớn cho 1 spec, rủi ro cao
  - Trộn rủi ro render với rủi ro asset/UI — khó debug
  - Vi phạm tinh thần "iterative playtesting" của constitution

## Decision

**Chọn A.** Brainstorm này tập trung Phase 1: isometric render + terrain + plot lúa pixel-art.
Character (Phase 2) và UI skin (Phase 3) tách thành brainstorm riêng sau.

## Key Requirements

- **Render mode:** Chuyển `MainScene` từ top-down (sprite center) sang isometric 2.5D
- **Terrain:** Có tileset đất/cỏ làm nền cho khu farm; plot lúa đặt lên tile đất ruộng
- **Plot sprites:** Thay 4 file SVG hiện tại (`empty/planted/growing/ready.svg`) bằng pixel-art
  isometric tương ứng từ free pack
- **Gameplay không đổi:** Logic plant/sleep/harvest/money giữ nguyên (`cropSystem`, `timeSystem`,
  `economy`, `saveSystem` không cần sửa)
- **Click hit-test:** Plot vẫn click được khi render isometric
- **Asset source ưu tiên theo thứ tự:**
  1. Kenney Isometric Tilemaps (kenney.nl, CC0)
  2. 0x72 Isometric (itch.io, CC0/CC-BY tuỳ pack)
  3. OpenGameArt Isometric 64x64 Outside (opengameart.org, CC-BY-SA 3.0 — nếu cần style đậm hơn,
     chấp nhận attribution + share-alike)
- **License compliance:** Lưu file `LICENSES.md` (hoặc tương đương) ghi nguồn + license từng asset
- **Save schema:** Không thay đổi (state vẫn là `empty/planted/growing/ready`)

## Asset Specification (chi tiết cho spec phase)

### Tile size mặc định

**128×64 isometric diamond** (chuẩn phổ biến nhất của Kenney/0x72). Có thể override khi spec
nếu pack đã chọn dùng size khác.

### Cấu trúc file PNG cần có (tối thiểu)

```
public/assets/
├── terrain/
│   ├── grass.png         # 128×64 — tile cỏ làm nền
│   └── soil.png          # 128×64 — tile đất ruộng, chỗ đặt plot
└── crops/
    └── rice/
        ├── empty.png     # ~128×80 — plot trống / đất đã cày
        ├── planted.png   # ~128×96 — vừa gieo, mầm nhỏ
        ├── growing.png   # ~128×112 — đang lớn
        └── ready.png     # ~128×128 — lúa chín, sẵn thu hoạch
```

**Format yêu cầu:**
- PNG-32, alpha transparent
- Background trong suốt (không phải nền trắng/đen)
- Anchor point: tâm đáy của sprite (để khớp với toạ độ tile isometric)
- Style đồng nhất: chọn 1 pack chính cho toàn bộ Phase 1, không mix nhiều pack

### Tilemap (Tiled .tmx/.json)

**Không cần cho Phase 1.** Grid nhỏ (ví dụ 5×5 tile cỏ + 1 ô soil đặt plot) → vẽ bằng code
dùng công thức isometric `screenX = (col - row) * tileW/2`, `screenY = (col + row) * tileH/2`.
Cân nhắc Tiled sau khi sang Phase mở rộng map (>50 tile, cần designer kéo thả).

### Asset workflow (đã chốt)

**Placeholder-first**: sinh 6 PNG placeholder isometric (diamond đơn sắc đúng size) trước,
code render Phase 1 dựa trên đó. User thay PNG thật vào đúng path sau, không cần đụng code.
Lợi: tách rủi ro render khỏi rủi ro asset; ai cũng có thể swap asset độc lập.

### License file

Tạo `public/assets/LICENSES.md` ghi với mỗi asset: tên pack, tác giả, URL nguồn, license
(CC0/CC-BY/CC-BY-SA), attribution string nếu cần. Khi chỉ dùng placeholder tự sinh: ghi
"Internal placeholder, no third-party license".

## Out of Scope (cho Phase 1 này)

- Character sprite (nông dân đứng/đi cạnh plot) → brainstorm Phase 2
- UI skin (HUD frame gỗ, button có icon + text, HP/MP bar) → brainstorm Phase 3
- Nhiều plot, nhiều loại cây, watering, shop, inventory, NPC, weather → các brainstorm gameplay sau
- Animation phức tạp (gió lay lúa, nước chảy, mây)
- Pan/zoom camera (trừ khi cần thiết cho hit-test isometric)

## Open Questions

- Kích thước tile: mặc định 128×64 (xem Asset Specification ở trên); confirm khi chọn pack thật.
- Plot trong Phase 1 vẫn là 1 ô duy nhất, hay nền tileset chuẩn bị grid nhiều ô (chưa kích hoạt
  gameplay nhiều plot)? Nếu grid: bao nhiêu × bao nhiêu (gợi ý 5×5)?
- Có cần pan/zoom camera không, hay cố định 1 góc nhìn?
- Strategy depth-sort khi sau này thêm character đứng trước/sau plot?
- Generator placeholder PNG dùng công cụ nào (ImageMagick / Python PIL / Node canvas)? — câu hỏi
  triển khai, để spec/plan quyết.
- Có cần ghi nguồn thumb.png reference vào LICENSES.md không (nó chỉ là moodboard, không ship)?
