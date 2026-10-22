import Phaser from 'phaser';
import { NPCS } from '../../../data/npcs';
import { ITEMS } from '../../../data/items';
import { closeModal, inputLocked, openModal, ui, uiBlocking } from '../../../stores/ui';
import * as actions from '../../sim/actions';
import { STAMINA } from '../../sim/actions';
import { isShopOpen } from '../../sim/economy';
import { EV, bus, toast } from '../../sim/events';
import { farmCellBlocks, isMature } from '../../sim/farming';
import { npcPose } from '../../sim/schedule';
import { G, cellKey, getCell } from '../../sim/state';
import { TIME, darkness } from '../../sim/time';
import { isWet } from '../../sim/weather';
import { SHOPS } from '../../../data/shops';
import { cropFrame } from '../../rendering/generate';
import { CHARS, CH, GEN, SHEET, T } from '../../rendering/kenney';
import { getMap } from '../../world/maps';
import { EMPTY, idx, inBounds } from '../../world/mapTypes';
import type { Facing, MapData, Warp } from '../../world/mapTypes';
import { actionFor, clearHeld, isHeld } from '../input';
import { interactWith, shopHoursText, talkTo } from '../interact';
import { playSfx } from '../../audio/sfx';
import { loadSettings } from '../../save/save';
import { facingVec } from '../../sim/tools';
import { t } from '../../../i18n';
import { cropName, itemName, npcText } from '../../../i18n/data';
import { DEBRIS } from '../../sim/farming';

const TILE = 16;
const SPEED = 72; // px per second
const SPEED_TIRED = 46;
const HIT_W = 10, HIT_H = 6;
const DEPTH = { ground: 0, deco: 1, deco2: 2, soil: 3, cropTop: 4, cursor: 5, sprite: 100, overhead: 50000, light: 60000, weather: 60001, debug: 70000 };
const DEBRIS_FRAMES = { weed: T.weed, rock: T.rock, stump: T.stump, boulder: T.boulder, bigstump: T.bigStump } as const;

interface NpcActor {
  id: string;
  sprite: Phaser.GameObjects.Sprite;
  shade: Phaser.GameObjects.Image;
}

export class WorldScene extends Phaser.Scene {
  private m!: MapData;
  private player!: Phaser.GameObjects.Sprite;
  private shadow!: Phaser.GameObjects.Image;
  private toolIcon!: Phaser.GameObjects.Image;
  private cursor!: Phaser.GameObjects.Graphics;
  private light!: Phaser.GameObjects.Rectangle;
  private weatherGfx!: Phaser.GameObjects.Graphics;
  private debugGfx?: Phaser.GameObjects.Graphics;
  private debugText?: Phaser.GameObjects.Text;
  private farmObjs = new Map<string, { soil?: Phaser.GameObjects.Image; top?: Phaser.GameObjects.Image }>();
  private mailbox?: Phaser.GameObjects.Image;
  private npcs: NpcActor[] = [];
  private px = 0;
  private py = 0;
  private facing: Facing = 'down';
  private clockAcc = 0;
  private busyUntil = 0;
  private transitioning = false;
  private walkPhase = 0;
  private drops: { x: number; y: number; s: number }[] = [];
  private debug = new URLSearchParams(location.search).has('debug');
  private unsub: (() => void)[] = [];
  private showHints = true;

  constructor() {
    super('World');
  }

  create() {
    this.transitioning = false;
    this.showHints = loadSettings().showHints;
    this.lastHintKey = '';
    this.busyUntil = 0;
    this.clockAcc = 0;
    this.farmObjs.clear();
    this.npcs = [];
    this.m = getMap(G.pos.map);
    this.buildTilemap();
    this.buildProps();
    if (this.m.id === 'farm') this.refreshFarm();

    this.px = G.pos.x * TILE + TILE / 2;
    this.py = G.pos.y * TILE + TILE - 2;
    this.facing = G.pos.facing;
    this.shadow = this.add.image(0, 0, GEN, 'shadow').setOrigin(0.5, 1);
    this.player = this.add.sprite(0, 0, CHARS, CH.player).setOrigin(0.5, 1);
    this.toolIcon = this.add.image(0, 0, GEN, 'icon_hoe').setVisible(false).setDepth(DEPTH.overhead - 1);
    this.cursor = this.add.graphics().setDepth(DEPTH.cursor);
    this.spawnNpcs();

    this.light = this.add.rectangle(0, 0, 8000, 8000, 0x000000, 0).setScrollFactor(0).setDepth(DEPTH.light);
    this.weatherGfx = this.add.graphics().setDepth(DEPTH.weather);
    this.drops = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 0.6 }));
    if (this.debug) {
      this.debugGfx = this.add.graphics().setDepth(DEPTH.debug);
      this.debugText = this.add.text(0, 0, '', { fontSize: '8px', color: '#fff', backgroundColor: '#000a' }).setDepth(DEPTH.debug + 1);
    }

    this.setupCamera();
    this.syncPlayer();
    this.updateLight();

    const onKey = (e: KeyboardEvent) => this.onKey(e);
    window.addEventListener('keydown', onKey);
    const onFarm = (keys?: string[]) => this.refreshFarm(keys);
    const onSfx = (name: string) => playSfx(name);
    const onPassOut = () => this.endDay(true);
    const onChanged = () => this.mailbox?.setFrame(G.mail.length ? 'mailbox_flag' : 'mailbox');
    bus.on(EV.FARM, onFarm);
    bus.on(EV.SFX, onSfx);
    bus.on(EV.PASS_OUT, onPassOut);
    bus.on(EV.CHANGED, onChanged);
    this.scale.on('resize', this.setupCamera, this);
    this.unsub = [
      () => window.removeEventListener('keydown', onKey),
      () => bus.off(EV.FARM, onFarm),
      () => bus.off(EV.SFX, onSfx),
      () => bus.off(EV.PASS_OUT, onPassOut),
      () => bus.off(EV.CHANGED, onChanged),
      () => this.scale.off('resize', this.setupCamera, this),
    ];
    this.events.once('shutdown', () => this.unsub.forEach((f) => f()));
    this.cameras.main.fadeIn(250, 0, 0, 0);
    (window as any).__hm = { G, actions, scene: this };
  }

  // ------------------------------------------------------------------ building

  private buildTilemap() {
    const m = this.m;
    const tm = this.make.tilemap({ tileWidth: TILE, tileHeight: TILE, width: m.w, height: m.h });
    const ts = tm.addTilesetImage(SHEET, SHEET, TILE, TILE, 0, 1)!;
    const layer = (name: string, data: number[], depth: number) => {
      const l = tm.createBlankLayer(name, ts)!;
      for (let y = 0; y < m.h; y++)
        for (let x = 0; x < m.w; x++) {
          const f = data[idx(m, x, y)];
          if (f !== EMPTY) l.putTileAt(f, x, y);
        }
      l.setDepth(depth);
    };
    layer('ground', m.ground, DEPTH.ground);
    layer('deco', m.deco, DEPTH.deco);
    layer('deco2', m.deco2, DEPTH.deco2);
    layer('overhead', m.overhead, DEPTH.overhead);
  }

  /** interactables drawn from the generated sheet (bin, mailbox, TV, calendar) */
  private buildProps() {
    this.mailbox = undefined;
    for (const it of this.m.interactables) {
      const x = it.x * TILE + 8, y = it.y * TILE + 16;
      const frame = it.kind === 'mailbox' ? (G.mail.length ? 'mailbox_flag' : 'mailbox')
        : it.kind === 'bin' || it.kind === 'tv' || it.kind === 'calendar' ? it.kind : null;
      if (!frame) continue;
      const img = this.add.image(x, y, GEN, frame).setOrigin(0.5, 1).setDepth(it.kind === 'calendar' ? DEPTH.deco2 + 0.5 : DEPTH.sprite + y);
      if (it.kind === 'mailbox') this.mailbox = img;
    }
  }

  /** sync soil/crop/debris images with GameState; `keys` limits the work to changed cells */
  private refreshFarm(keys?: string[]) {
    if (this.m.id !== 'farm') return;
    const all = keys ?? [...new Set([...Object.keys(G.farm), ...this.farmObjs.keys()])];
    for (const k of all) {
      const [x, y] = k.split(',').map(Number);
      const cell = G.farm[k];
      let o = this.farmObjs.get(k);
      if (!o) {
        o = {};
        this.farmObjs.set(k, o);
      }
      const cx = x * TILE + 8, cy = y * TILE + 8;
      // soil
      if (cell?.tilled) {
        const f = cell.watered ? 'soil_wet' : 'soil_dry';
        if (!o.soil) o.soil = this.add.image(cx, cy, GEN, f).setDepth(DEPTH.soil);
        else o.soil.setFrame(f);
      } else if (o.soil) {
        o.soil.destroy();
        o.soil = undefined;
      }
      // crop or debris on top
      let tex: string | null = null;
      let frame: string | number = 0;
      if (cell?.debris) {
        tex = SHEET;
        frame = DEBRIS_FRAMES[cell.debris];
      } else if (cell?.crop) {
        tex = GEN;
        frame = cell.crop.withered ? 'crop_withered' : cropFrame(cell.crop.id, cell.crop.stage);
      }
      if (tex) {
        if (!o.top || o.top.texture.key !== tex) {
          o.top?.destroy();
          o.top = this.add.image(cx, cy, tex, frame).setDepth(DEPTH.cropTop);
        } else o.top.setFrame(frame);
      } else if (o.top) {
        o.top.destroy();
        o.top = undefined;
      }
      if (!o.soil && !o.top) this.farmObjs.delete(k);
    }
  }

  private spawnNpcs() {
    for (const def of Object.values(NPCS)) {
      if (def.map !== this.m.id) continue;
      const shade = this.add.image(0, 0, GEN, 'shadow').setOrigin(0.5, 1).setVisible(false);
      const sprite = this.add.sprite(0, 0, CHARS, def.frame).setOrigin(0.5, 1).setVisible(false);
      this.npcs.push({ id: def.id, sprite, shade });
    }
    this.updateNpcs();
  }

  private setupCamera() {
    const cam = this.cameras.main;
    const w = this.scale.width, h = this.scale.height;
    // integer zoom so pixels stay crisp; aim for ~20 tiles across
    const zoom = Math.max(2, Math.min(5, Math.round(Math.min(w / (TILE * 20), h / (TILE * 12)))));
    cam.setZoom(zoom);
    const mw = this.m.w * TILE, mh = this.m.h * TILE;
    if (mw * zoom <= w && mh * zoom <= h) {
      cam.removeBounds();
      cam.stopFollow();
      cam.centerOn(mw / 2, mh / 2);
    } else {
      cam.setBounds(0, 0, mw, mh);
      cam.startFollow(this.player, true, 0.2, 0.2);
    }
  }

  // ------------------------------------------------------------------ input

  private onKey(e: KeyboardEvent) {
    const a = actionFor(e.code);
    if (a && ['use', 'cycle', 'inventory', 'pause', 'up', 'down', 'left', 'right'].includes(a)) e.preventDefault();
    if (this.debug && this.debugKey(e.code)) return;
    if (uiBlocking() || inputLocked() || this.transitioning || e.repeat) return;
    if (/^Digit[1-9]$/.test(e.code)) {
      actions.select(Number(e.code.slice(5)) - 1);
      return;
    }
    switch (a) {
      case 'use':
        this.useSelected();
        break;
      case 'interact':
        this.interact();
        break;
      case 'cycle':
        actions.cycleSelected(e.shiftKey ? -1 : 1);
        break;
      case 'inventory':
        openModal({ kind: 'inventory' });
        break;
      case 'journal':
        openModal({ kind: 'journal' });
        break;
      case 'pause':
        openModal({ kind: 'pause' });
        break;
    }
  }

  private debugKey(code: string): boolean {
    switch (code) {
      case 'F6':
        G.timeMin += 60;
        actions.tickMinute();
        return true;
      case 'F7':
        this.endDay(false);
        return true;
      case 'F8':
        G.gold += 1000;
        bus.emit(EV.CHANGED);
        return true;
    }
    return false;
  }

  /** tile the player is standing on and the one in front */
  private feetTile() {
    return { x: Math.floor(this.px / TILE), y: Math.floor((this.py - 1) / TILE) };
  }

  private targetTile() {
    const f = this.feetTile();
    const [dx, dy] = facingVec(this.facing);
    return { x: f.x + dx, y: f.y + dy };
  }

  private useSelected() {
    if (this.time.now < this.busyUntil) return;
    const tt = this.targetTile();
    const slot = G.inventory[G.selected];
    if (!slot) return;
    const r = actions.useSelected(tt.x, tt.y, this.facing);
    if (!r.ok) return;
    this.busyUntil = this.time.now + 260;
    // swing feedback: show the item in front of the player
    const [dx, dy] = facingVec(this.facing);
    this.toolIcon.setTexture(GEN, ITEMS[slot.id].icon).setVisible(true)
      .setPosition(this.px + dx * 10, this.py - 8 + dy * 8).setAngle(dx < 0 ? 30 : -30).setFlipX(dx < 0);
    this.tweens.add({
      targets: this.toolIcon, angle: dx < 0 ? -40 : 40, duration: 200, ease: 'Quad.easeIn',
      onComplete: () => this.toolIcon.setVisible(false),
    });
  }

  private interact() {
    const tt = this.targetTile();
    // villagers first
    const npc = this.npcAt(tt.x, tt.y);
    if (npc) {
      talkTo(npc);
      return;
    }
    const it = this.m.interactables.find((i) => i.x === tt.x && i.y === tt.y);
    if (it) {
      interactWith(it, { sleep: () => this.endDay(false) });
      return;
    }
    if (this.m.id === 'farm') {
      const cell = getCell(tt.x, tt.y);
      if (cell?.crop) {
        if (isMature(cell.crop) || cell.crop.withered) actions.harvest(tt.x, tt.y);
        else toast(t('msg.growingStage', { crop: cropName(cell.crop.id).toLowerCase(), n: cell.crop.stage + 1 }));
        return;
      }
      if (this.m.water[idx(this.m, tt.x, tt.y)]) toast(t('msg.useCanHere'));
    }
  }

  private npcAt(tx: number, ty: number): string | null {
    const cx = tx * TILE + 8, cy = ty * TILE + 14;
    for (const n of this.npcs) {
      if (!n.sprite.visible) continue;
      if (Math.abs(n.sprite.x - cx) < 12 && Math.abs(n.sprite.y - cy) < 12) return n.id;
    }
    return null;
  }

  // ------------------------------------------------------------------ simulation hooks

  /** sleep or collapse: fade out, run the overnight transition, reload in the house */
  endDay(passedOut: boolean) {
    if (this.transitioning) return;
    this.transitioning = true;
    ui.fading = true;
    if (ui.modal) closeModal();
    ui.dialogue = null;
    clearHeld();
    if (passedOut) toast(t('msg.tooExhausted'));
    this.cameras.main.fadeOut(passedOut ? 1200 : 700, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      actions.sleep(passedOut);
      ui.fading = false;
      if (G.morningReport) openModal({ kind: 'morning' });
      this.scene.restart();
    });
  }

  private warp(w: Warp) {
    if (this.transitioning) return;
    if (w.shop && !isShopOpen(SHOPS[w.shop])) {
      toast(shopHoursText(w.shop));
      // step back onto the tile we came from
      const [dx, dy] = facingVec(this.facing);
      const f = this.feetTile();
      this.px = (f.x - dx) * TILE + TILE / 2;
      this.py = (f.y - dy) * TILE + TILE - 2;
      return;
    }
    this.transitioning = true;
    playSfx('door');
    this.cameras.main.fadeOut(180, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      actions.setPosition(w.to, w.tx, w.ty, w.facing);
      this.scene.restart();
    });
  }

  // ------------------------------------------------------------------ per frame

  update(_time: number, delta: number) {
    const blocked = uiBlocking() || this.transitioning;
    if (!blocked) {
      this.movePlayer(delta);
      this.runClock(delta);
    }
    this.syncPlayer();
    this.updateNpcs();
    this.updateCursor(blocked);
    this.updateLight();
    this.updateWeather(delta);
    if (this.debug) this.drawDebug();
  }

  private runClock(delta: number) {
    if (this.m.indoor && TIME.pauseIndoors) return;
    this.clockAcc += delta;
    while (this.clockAcc >= TIME.msPerMinute) {
      this.clockAcc -= TIME.msPerMinute;
      if (actions.tickMinute()) break;
    }
  }

  private movePlayer(delta: number) {
    if (this.time.now < this.busyUntil) return;
    let dx = 0, dy = 0;
    if (isHeld('left')) dx -= 1;
    if (isHeld('right')) dx += 1;
    if (isHeld('up')) dy -= 1;
    if (isHeld('down')) dy += 1;
    if (!dx && !dy) {
      this.walkPhase = 0;
      return;
    }
    // facing follows the most recent axis; prefer horizontal when both
    if (dx) this.facing = dx > 0 ? 'right' : 'left';
    else this.facing = dy > 0 ? 'down' : 'up';
    if (dx && dy) {
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }
    const speed = (G.stamina <= STAMINA.exhausted ? SPEED_TIRED : SPEED) * (delta / 1000);
    const nx = this.px + dx * speed;
    if (!this.collides(nx, this.py)) this.px = nx;
    const ny = this.py + dy * speed;
    if (!this.collides(this.px, ny)) this.py = ny;
    this.walkPhase += delta;
    actions.setPosition(this.m.id, Math.floor(this.px / TILE), Math.floor((this.py - 1) / TILE), this.facing);

    const f = this.feetTile();
    const w = this.m.warps.find((w) => w.x === f.x && w.y === f.y);
    if (w) this.warp(w);
  }

  private solidAt(tx: number, ty: number): boolean {
    if (!inBounds(this.m, tx, ty)) return true;
    if (this.m.solid[idx(this.m, tx, ty)]) return true;
    return this.m.id === 'farm' && farmCellBlocks(tx, ty);
  }

  private collides(x: number, y: number): boolean {
    const l = x - HIT_W / 2, r = x + HIT_W / 2 - 0.01, t = y - HIT_H, b = y - 0.01;
    for (const [cx, cy] of [[l, t], [r, t], [l, b], [r, b]])
      if (this.solidAt(Math.floor(cx / TILE), Math.floor(cy / TILE))) return true;
    for (const n of this.npcs)
      if (n.sprite.visible && Math.abs(n.sprite.x - x) < 9 && Math.abs(n.sprite.y - y) < 5) return true;
    return false;
  }

  private syncPlayer() {
    const bob = this.walkPhase ? Math.floor(this.walkPhase / 140) % 2 : 0;
    this.player.setPosition(Math.round(this.px), Math.round(this.py) + 1 - bob).setFlipX(this.facing === 'left');
    this.player.setDepth(DEPTH.sprite + this.py);
    this.shadow.setPosition(Math.round(this.px), Math.round(this.py) + 2).setDepth(DEPTH.sprite + this.py - 1);
    // exhausted: a slow blue pulse on the player
    if (G.stamina <= STAMINA.exhausted) this.player.setTint(Math.floor(this.time.now / 400) % 2 ? 0xb0c4ff : 0xffffff);
    else this.player.clearTint();
  }

  private updateNpcs() {
    const minute = G.timeMin + this.clockAcc / TIME.msPerMinute;
    for (const n of this.npcs) {
      const pose = npcPose(NPCS[n.id], minute);
      n.sprite.setVisible(!!pose);
      n.shade.setVisible(!!pose);
      if (!pose) continue;
      const x = pose.x * TILE + 8, y = pose.y * TILE + 15;
      const bob = pose.moving ? Math.floor(this.time.now / 160) % 2 : 0;
      n.sprite.setPosition(Math.round(x), Math.round(y) - bob).setFlipX(pose.facing === 'left').setDepth(DEPTH.sprite + y);
      n.shade.setPosition(Math.round(x), Math.round(y) + 1).setDepth(DEPTH.sprite + y - 1);
    }
  }

  private hintFor(tx: number, ty: number): string {
    const npc = this.npcAt(tx, ty);
    if (npc) return t('hint.talk', { name: npcText(npc, 'name') });
    const it = this.m.interactables.find((i) => i.x === tx && i.y === ty);
    if (it) return it.kind === 'mailbox' ? t(G.mail.length ? 'hint.mail' : 'hint.mailbox') : t(`hint.${it.kind}`);
    const sel = G.inventory[G.selected];
    const selDef = sel ? ITEMS[sel.id] : undefined;
    if (inBounds(this.m, tx, ty) && this.m.water[idx(this.m, tx, ty)] && sel?.id === 'can') return t('hint.refill');
    if (this.m.id !== 'farm') return '';
    const cell = getCell(tx, ty);
    if (cell?.crop) {
      if (cell.crop.withered) return t('hint.withered');
      if (isMature(cell.crop)) return t('hint.harvest');
      if (sel?.id === 'can' && !cell.watered) return t('hint.water');
      return t(cell.watered ? 'hint.growingWet' : 'hint.growingDry');
    }
    if (cell?.debris) {
      const d = DEBRIS[cell.debris];
      return t(d.tier > 0 ? 'hint.debrisUpgrade' : 'hint.debris', { debris: t(`debris.${cell.debris}`), tool: itemName(d.tool).toLowerCase() });
    }
    if (cell?.tilled && selDef?.kind === 'seed') return t('hint.sow');
    if (cell?.tilled && sel?.id === 'can' && !cell.watered) return t('hint.water');
    return '';
  }

  private lastHintKey = '';
  private updateHint(hidden: boolean) {
    const tt = this.targetTile();
    const cell = getCell(tt.x, tt.y);
    const key = hidden ? 'hidden' : `${tt.x},${tt.y},${G.selected},${G.inventory[G.selected]?.id},${cell?.crop?.stage},${cell?.debris},${cell?.tilled},${cell?.watered},${this.npcAt(tt.x, tt.y)}`;
    if (key === this.lastHintKey) return;
    this.lastHintKey = key;
    ui.hint = hidden || !this.showHints ? '' : this.hintFor(tt.x, tt.y);
  }

  private updateCursor(hidden: boolean) {
    this.updateHint(hidden);
    this.cursor.clear();
    if (hidden) return;
    const tt = this.targetTile();
    if (!inBounds(this.m, tt.x, tt.y)) return;
    const pulse = 0.55 + 0.25 * Math.sin(this.time.now / 180);
    this.cursor.lineStyle(1, 0xffffff, pulse).strokeRect(tt.x * TILE + 0.5, tt.y * TILE + 0.5, TILE - 1, TILE - 1);
    // seed bags show their 3x3 footprint
    const sel = G.inventory[G.selected];
    if (sel && ITEMS[sel.id].kind === 'seed' && this.m.id === 'farm')
      this.cursor.lineStyle(1, 0xfff59d, pulse * 0.6).strokeRect((tt.x - 1) * TILE + 0.5, (tt.y - 1) * TILE + 0.5, TILE * 3 - 1, TILE * 3 - 1);
  }

  private updateLight() {
    const d = darkness(G.timeMin);
    let alpha = d.alpha, color = d.color;
    if (!this.m.indoor) {
      if (G.weather === 'rain' || G.weather === 'storm' || G.weather === 'cloudy') {
        const extra = G.weather === 'storm' ? 0.28 : G.weather === 'rain' ? 0.18 : 0.1;
        if (alpha < extra) {
          alpha = extra;
          color = 0x334455;
        }
      }
    } else alpha *= 0.4;
    this.light.setFillStyle(color, alpha);
  }

  private updateWeather(delta: number) {
    const g = this.weatherGfx;
    g.clear();
    if (this.m.indoor) return;
    const wet = isWet(G.weather), snow = G.weather === 'snow';
    if (!wet && !snow) return;
    const v = this.cameras.main.worldView;
    const n = G.weather === 'storm' ? this.drops.length : wet ? 90 : 70;
    for (let i = 0; i < n; i++) {
      const d = this.drops[i];
      if (wet) {
        d.y += (delta / 1000) * 1.6 * d.s;
        d.x -= (delta / 1000) * 0.15 * d.s;
      } else {
        d.y += (delta / 1000) * 0.18 * d.s;
        d.x += Math.sin((this.time.now / 600) + i) * 0.0004;
      }
      if (d.y > 1) d.y -= 1;
      if (d.x < 0) d.x += 1;
      if (d.x > 1) d.x -= 1;
      const x = v.x + d.x * v.width, y = v.y + d.y * v.height;
      if (wet) g.lineStyle(1, 0xaecbea, 0.55).lineBetween(x, y, x - 1.5, y + 5);
      else g.fillStyle(0xffffff, 0.85).fillRect(x, y, 1.5, 1.5);
    }
  }

  private drawDebug() {
    const g = this.debugGfx!;
    g.clear();
    const v = this.cameras.main.worldView;
    const x0 = Math.max(0, Math.floor(v.x / TILE)), y0 = Math.max(0, Math.floor(v.y / TILE));
    const x1 = Math.min(this.m.w, Math.ceil(v.right / TILE)), y1 = Math.min(this.m.h, Math.ceil(v.bottom / TILE));
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        g.lineStyle(1, 0xffffff, 0.08).strokeRect(x * TILE, y * TILE, TILE, TILE);
        if (this.solidAt(x, y)) g.fillStyle(0xff0000, 0.18).fillRect(x * TILE, y * TILE, TILE, TILE);
        if (this.m.warps.some((w) => w.x === x && w.y === y)) g.fillStyle(0x00aaff, 0.35).fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    g.lineStyle(1, 0x00ff00, 1).strokeRect(this.px - HIT_W / 2, this.py - HIT_H, HIT_W, HIT_H);
    const tt = this.targetTile();
    const cell = getCell(tt.x, tt.y);
    const crop = cell?.crop ? ` crop=${cell.crop.id} st=${cell.crop.stage} d=${cell.crop.daysInStage}${cell.crop.withered ? ' W' : ''}` : '';
    this.debugText!.setPosition(v.x + 2, v.y + 2).setText(
      `${this.m.id} feet=${this.feetTile().x},${this.feetTile().y} target=${tt.x},${tt.y} key=${cellKey(tt.x, tt.y)}` +
        `\ntime=${G.timeMin} stamina=${G.stamina} can=${G.canWater}${cell ? ` tilled=${cell.tilled} wet=${cell.watered} debris=${cell.debris ?? '-'}` : ''}${crop}` +
        `\nF6 +1h  F7 sleep  F8 +1000G`,
    );
  }
}
