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

## Out of Scope (cho Phase 1 này)

- Character sprite (nông dân đứng/đi cạnh plot) → brainstorm Phase 2
- UI skin (HUD frame gỗ, button có icon + text, HP/MP bar) → brainstorm Phase 3
- Nhiều plot, nhiều loại cây, watering, shop, inventory, NPC, weather → các brainstorm gameplay sau
- Animation phức tạp (gió lay lúa, nước chảy, mây)
- Pan/zoom camera (trừ khi cần thiết cho hit-test isometric)

## Open Questions

- Kích thước tile chuẩn: 32×32, 64×64, hay 128×64 (isometric diamond)?
- Plot trong Phase 1 vẫn là 1 ô duy nhất, hay nền tileset chuẩn bị grid nhiều ô (chưa kích hoạt
  gameplay nhiều plot)?
- Có cần pan/zoom camera không, hay cố định 1 góc nhìn?
- Strategy depth-sort khi sau này thêm character đứng trước/sau plot?
- Nếu mix asset từ nhiều pack (Kenney + 0x72), có rủi ro style không khớp không — có cần
  chuẩn hoá palette/tile-size không?
