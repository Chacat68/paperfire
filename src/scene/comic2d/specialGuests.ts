import type { ComicPatterns } from './textures';
import {
  CINNABAR,
  INK,
  drawComicSfx,
  drawInkWashBlot,
  drawRedSeal,
  inkLine,
  inkPoly,
  inkRect
} from './textures';

/** D6 顶格诡异 · 无轿纸新娘（凤冠珠翠、织金云肩、双层宽袖、合卺红绳与金穗红盖头） */
export function drawPaperBrideGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  armRaised: boolean,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const sway = slow ? 0 : Math.sin(seconds * 1.1) * 3;
  const veilSway = slow ? 0 : Math.sin(seconds * 1.6) * 4.5;
  ctx.save();
  ctx.translate(sway * 0.35, breath * 0.6);

  drawInkWashBlot(ctx, 0, -148, 138, 182, 0.56, '145, 24, 20');

  // 宽大双层喜袍水袖（后层垂袖）
  for (const side of [-1, 1]) {
    inkPoly(
      ctx,
      [
        [side * 34, -178],
        [side * 72, -142],
        [side * 80 + sway * 0.4, -56],
        [side * 44, -64],
        [side * 36, -124]
      ],
      '#7a1613',
      2.4,
      INK,
      patterns.woodcutV
    );
    // 素金滚边袖口
    inkLine(ctx, side * 44, -64, side * 78 + sway * 0.4, -58, 3.2, '#e8d49c');
    inkLine(ctx, side * 44, -69, side * 77 + sway * 0.4, -63, 1.4, INK);
  }

  // 朱砂绫罗嫁衣主体 + 褶皱喜裙
  const grad = ctx.createLinearGradient(-56, -198, 56, 0);
  grad.addColorStop(0, '#b5261e');
  grad.addColorStop(0.5, '#861915');
  grad.addColorStop(1, '#3a0c0d');
  inkPoly(
    ctx,
    [[-20, -196], [20, -196], [52, -166], [42, -96], [66, 0], [-66, 0], [-42, -96], [-52, -166]],
    grad,
    2.6,
    INK,
    patterns.woodcutV
  );
  // 嫁衣百褶与底摆织金镶边
  for (const px of [-36, -18, 0, 18, 36]) {
    inkLine(ctx, px * 0.72, -92, px * 1.32, -4, 1.3, 'rgba(18, 10, 10, 0.55)');
  }
  inkPoly(ctx, [[-64, -16], [64, -16], [66, 0], [-66, 0]], '#1f1615', 2.0);
  inkLine(ctx, -64, -16, 64, -16, 2.2, '#ebd8a4');

  // 织金莲瓣云肩（四叶如意云肩）
  inkPoly(
    ctx,
    [
      [-52, -168],
      [-26, -152],
      [0, -134],
      [26, -152],
      [52, -168],
      [34, -188],
      [18, -196],
      [-18, -196],
      [-34, -188]
    ],
    '#e4cfa0',
    2.1,
    INK,
    patterns.hatchLight
  );
  inkLine(ctx, -40, -166, 0, -142, 1.8, CINNABAR);
  inkLine(ctx, 40, -166, 0, -142, 1.8, CINNABAR);
  drawRedSeal(ctx, 0, -162, 14, '囍');

  // 垂坠赤红腰带与双玉佩丝绦
  inkRect(ctx, -40, -104, 80, 12, '#d12f24', 2.0);
  inkPoly(ctx, [[-14, -92], [-4, -92], [-10, -28], [-22, -34]], '#c6281e', 1.8);
  inkPoly(ctx, [[4, -92], [14, -92], [22, -34], [10, -28]], '#c6281e', 1.8);
  inkLine(ctx, -12, -32, -14, -12, 1.8, '#ebd8a4');
  inkLine(ctx, 12, -32, 14, -12, 1.8, '#ebd8a4');

  // 纤细惨白纸手轻挽「合卺同心红绳结」
  const hy = armRaised ? -114 : -94;
  for (const side of [-1, 1]) {
    inkPoly(
      ctx,
      [
        [side * 12, hy - 8],
        [side * 28, hy - 6],
        [side * 26, hy + 16],
        [side * 14, hy + 18],
        [side * 10, hy + 6]
      ],
      '#f6f0e2',
      1.9
    );
    inkLine(ctx, side * 18, hy + 4, side * 18, hy + 16, 1.0, INK);
    inkLine(ctx, side * 22, hy + 4, side * 22, hy + 15, 1.0, INK);
  }
  inkLine(ctx, -18, hy + 6, 18, hy + 6, 3.4, CINNABAR);
  ctx.fillStyle = CINNABAR;
  ctx.strokeStyle = '#efe0b4';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, hy + 6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  inkLine(ctx, -3, hy + 13, -7, hy + 52, 2.2, CINNABAR);
  inkLine(ctx, 3, hy + 13, 7, hy + 52, 2.2, CINNABAR);

  // 凤冠霞帔珠翠冠饰 + 摇曳步摇
  inkPoly(
    ctx,
    [[-24, -248], [-32, -264], [-14, -274], [0, -282], [14, -274], [32, -264], [24, -248]],
    '#1b1817',
    2.3
  );
  for (const [bx, by] of [
    [-20, -262],
    [-10, -270],
    [0, -274],
    [10, -270],
    [20, -262]
  ]) {
    ctx.fillStyle = by === -274 ? CINNABAR : '#f2e6c8';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(bx, by, by === -274 ? 5.2 : 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // 两侧垂坠珠串步摇
  for (const side of [-1, 1]) {
    inkLine(ctx, side * 30, -252, side * 36 + veilSway * 0.5, -214, 1.5, '#ebd8a4');
    ctx.fillStyle = CINNABAR;
    ctx.beginPath();
    ctx.arc(side * 36 + veilSway * 0.5, -210, 3.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 垂落摇曳的朱砂红盖头（配织金角纹与垂穗）
  inkPoly(
    ctx,
    [
      [-34, -248],
      [34, -248],
      [44 + veilSway, -172],
      [0 + veilSway * 0.65, -154],
      [-44 + veilSway, -172]
    ],
    '#c8261d',
    2.6,
    INK,
    patterns.hatchLight
  );
  inkLine(ctx, -16, -244, -22 + veilSway * 0.7, -168, 1.3, 'rgba(38, 8, 8, 0.45)');
  inkLine(ctx, 16, -244, 22 + veilSway * 0.7, -168, 1.3, 'rgba(38, 8, 8, 0.45)');
  inkLine(ctx, -42 + veilSway, -172, 0 + veilSway * 0.65, -154, 2.8, '#efe0b4');
  inkLine(ctx, 0 + veilSway * 0.65, -154, 42 + veilSway, -172, 2.8, '#efe0b4');
  // 盖头金穗流苏
  for (let i = -3; i <= 3; i++) {
    const tx = i * 11 + veilSway * 0.7;
    const ty = -156 - Math.abs(i) * 4.5;
    inkLine(ctx, tx, ty, tx + veilSway * 0.2, ty + 11, 1.5, '#ebd8a4');
  }

  drawComicSfx(ctx, '唢…', -88, -238, 19, 0.68, 'crimson', -0.12);
  ctx.restore();
}

/** D10 庙会顶格 · 百戏游神（展脚高冠、双朱砂靠旗、威严长髯神面与执笏神袍） */
export function drawTempleDeityGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const wave = slow ? 0 : Math.sin(seconds * 1.45) * 6;
  ctx.save();
  ctx.translate(0, breath * 0.5);

  drawInkWashBlot(ctx, 0, -170, 155, 200, 0.58, '10, 11, 13');

  // 背后双朱砂靠旗（含竹框、白边与飘带）
  for (const side of [-1, 1]) {
    inkLine(ctx, side * 34, -182, side * 94, -304, 3.6, '#241c18');
    inkPoly(
      ctx,
      [
        [side * 94, -304],
        [side * 138 + wave, -276],
        [side * 116 + wave * 0.6, -214],
        [side * 68, -244]
      ],
      CINNABAR,
      2.3,
      INK,
      patterns.woodcutV
    );
    inkLine(ctx, side * 94, -296, side * 128 + wave * 0.85, -274, 1.8, '#f0e4c6');
    inkLine(ctx, side * 128 + wave * 0.85, -274, side * 112 + wave * 0.55, -226, 1.8, '#f0e4c6');
    // 旗尾飘带
    inkLine(ctx, side * 134 + wave, -272, side * 150 + wave * 1.3, -248, 2.2, '#f0e4c6');
  }

  // 巍峨玄墨团纹神袍 + 护肩云甲
  inkPoly(
    ctx,
    [[-28, -222], [28, -222], [72, -188], [78, 0], [-78, 0], [-72, -188]],
    '#1a1c1e',
    2.8,
    INK,
    patterns.hatchDense
  );
  // 宽阔护肩甲片
  for (const side of [-1, 1]) {
    inkPoly(
      ctx,
      [
        [side * 24, -220],
        [side * 76, -196],
        [side * 86, -158],
        [side * 48, -152],
        [side * 34, -184]
      ],
      '#282b2e',
      2.3,
      INK,
      patterns.woodcutH
    );
    inkLine(ctx, side * 30, -210, side * 76, -186, 1.8, '#e8dcc0');
  }
  // 胸前白骨朱砂云纹大领与团寿补子
  inkPoly(ctx, [[-44, -218], [0, -142], [44, -218]], '#ece5d4', 2.2);
  inkPoly(ctx, [[-30, -214], [0, -158], [30, -214]], CINNABAR, 1.9);
  inkRect(ctx, -32, -124, 64, 52, '#24272a', 2.2);
  ctx.strokeStyle = '#e8dcc0';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(-26, -118, 52, 40);
  drawRedSeal(ctx, 0, -98, 22, '遊');
  // 宽玉带与下摆垂绦
  inkRect(ctx, -56, -72, 112, 14, '#e5d9bc', 2.2);
  inkRect(ctx, -14, -74, 28, 18, CINNABAR, 2.0);

  // 双手拱持白玉朝笏（威仪仪式感）
  for (const side of [-1, 1]) {
    inkPoly(
      ctx,
      [
        [side * 54, -162],
        [side * 72, -118],
        [side * 22, -104],
        [side * 16, -132]
      ],
      '#222528',
      2.3
    );
    inkLine(ctx, side * 22, -104, side * 16, -132, 3.0, '#efe6d2');
  }
  inkPoly(ctx, [[-11, -182], [11, -182], [15, -98], [-15, -98]], '#f2ead8', 2.2);
  inkLine(ctx, 0, -172, 0, -110, 1.8, CINNABAR);

  // 展脚高冠（左右翼翅 + 珠额）
  inkPoly(ctx, [[-64, -296], [-24, -288], [-24, -298], [-60, -308]], '#161718', 2.1);
  inkPoly(ctx, [[64, -296], [24, -288], [24, -298], [60, -308]], '#161718', 2.1);
  inkRect(ctx, -24, -318, 48, 42, '#181819', 2.5);
  inkLine(ctx, -22, -292, 22, -292, 3.0, '#ece2c6');
  drawRedSeal(ctx, 0, -304, 14, '令');

  // 古纸神将面具（眉心朱砂焰、浓墨剑眉、朱砂神目、三缕长髯）
  inkPoly(
    ctx,
    [[-30, -276], [30, -276], [26, -224], [0, -212], [-26, -224]],
    '#f4ede0',
    2.6,
    INK,
    patterns.woodcutV
  );
  inkPoly(ctx, [[0, -272], [9, -256], [0, -246], [-9, -256]], CINNABAR, 1.5);
  inkLine(ctx, -22, -250, -5, -242, 3.2, INK);
  inkLine(ctx, 5, -242, 22, -250, 3.2, INK);
  for (const ex of [-12, 12]) {
    ctx.fillStyle = '#0e0c0c';
    ctx.beginPath();
    ctx.ellipse(ex, -238, 6.2, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CINNABAR;
    ctx.beginPath();
    ctx.arc(ex, -238, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  // 三缕飘逸黑墨长髯
  inkPoly(ctx, [[-18, -222], [18, -222], [24, -184], [10, -196], [0, -172], [-10, -196], [-24, -184]], '#121314', 2.0);

  drawComicSfx(ctx, '咚…', -104, -258, 22, 0.74, 'crimson', -0.08);
  ctx.restore();
}

/** D13 顶格 · 空椅听戏诡（雕花空太师椅、点翠双翎戏冠、花旦朱砂眼妆、兰花指与翻飞白水袖） */
export function drawOperaGhostGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const sleeveWave = slow ? 0 : Math.sin(seconds * 1.5) * 10;
  ctx.save();
  ctx.translate(0, breath * 0.5);

  drawInkWashBlot(ctx, 0, -148, 148, 178, 0.52, '12, 14, 16');

  // 雕花老太师椅剪影（搭脑、镂空背板、扶手与四柱）
  inkRect(ctx, -78, -184, 156, 16, '#262321', 2.3);
  inkRect(ctx, -68, -168, 12, 168, '#1d1b1a', 2.2);
  inkRect(ctx, 56, -168, 12, 168, '#1d1b1a', 2.2);
  inkRect(ctx, -56, -168, 112, 142, 'rgba(18, 16, 16, 0.62)', 1.8, patterns.woodcutV);
  // 椅背雕花如意纹框
  ctx.strokeStyle = 'rgba(218, 206, 182, 0.28)';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(-44, -156, 88, 92);
  ctx.beginPath();
  ctx.arc(0, -110, 22, 0, Math.PI * 2);
  ctx.stroke();
  // 太师椅左右扶手
  inkRect(ctx, -84, -92, 24, 12, '#2b2825', 2.0);
  inkRect(ctx, 60, -92, 24, 12, '#2b2825', 2.0);

  // 翻飞素白长水袖（双层褶皱 + 轻烟水墨边）
  inkPoly(
    ctx,
    [
      [-44, -166],
      [-98 + sleeveWave, -124],
      [-114 + sleeveWave * 1.1, -68],
      [-82 - sleeveWave * 0.4, -22],
      [-52, -52],
      [-56, -114]
    ],
    '#f2ecde',
    2.1,
    INK,
    patterns.hatchLight
  );
  inkLine(ctx, -68 + sleeveWave * 0.4, -126, -86 - sleeveWave * 0.2, -38, 1.3, 'rgba(16,15,15,0.45)');

  inkPoly(
    ctx,
    [
      [44, -166],
      [98 - sleeveWave, -124],
      [114 - sleeveWave * 1.1, -68],
      [82 + sleeveWave * 0.4, -22],
      [52, -52],
      [56, -114]
    ],
    '#f2ecde',
    2.1,
    INK,
    patterns.hatchLight
  );
  inkLine(ctx, 68 - sleeveWave * 0.4, -126, 86 + sleeveWave * 0.2, -38, 1.3, 'rgba(16,15,15,0.45)');

  // 织纹墨灰戏袍 + 素金云肩 + 朱砂斜襟
  inkPoly(
    ctx,
    [[-20, -188], [20, -188], [50, -158], [54, 0], [-54, 0], [-50, -158]],
    '#232629',
    2.5,
    INK,
    patterns.woodcutV
  );
  inkPoly(ctx, [[-42, -164], [0, -138], [42, -164], [20, -188], [-20, -188]], '#dcd3be', 2.0);
  inkLine(ctx, -20, -184, 24, -42, 2.6, CINNABAR);
  inkLine(ctx, -28, -160, 0, -144, 1.5, CINNABAR);
  inkLine(ctx, 28, -160, 0, -144, 1.5, CINNABAR);

  // 兰花指纤细纸手（从水袖间轻探而出）
  for (const side of [-1, 1]) {
    const hx = side * 66 + (side < 0 ? sleeveWave * 0.45 : -sleeveWave * 0.45);
    const hy = -126;
    ctx.fillStyle = '#f6f0e2';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(hx, hy, 7, 10, side * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 双雉尾翎子 + 点翠戏冠绒球额饰
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(-12, -254);
  ctx.quadraticCurveTo(-48, -290, -68 + sleeveWave * 0.6, -314);
  ctx.moveTo(12, -254);
  ctx.quadraticCurveTo(48, -290, 68 - sleeveWave * 0.6, -314);
  ctx.stroke();

  // 戏冠额饰与朱砂双绒球
  inkPoly(ctx, [[-26, -242], [-22, -264], [0, -270], [22, -264], [26, -242]], '#171718', 2.2);
  for (const rx of [-24, 24]) {
    ctx.fillStyle = CINNABAR;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(rx, -248, 6.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  for (const px of [-14, -7, 0, 7, 14]) {
    ctx.fillStyle = '#f4ecd8';
    ctx.beginPath();
    ctx.arc(px, -244, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 惨白戏妆花旦鹅蛋脸 + 飞扬朱砂眼尾 + 樱唇
  ctx.fillStyle = '#f6f1e4';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, -218, 22, 29, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  inkPoly(ctx, [[-20, -228], [-6, -221], [-19, -216]], CINNABAR, 1.1);
  inkPoly(ctx, [[20, -228], [6, -221], [19, -216]], CINNABAR, 1.1);
  inkLine(ctx, -18, -231, -5, -226, 1.9, INK);
  inkLine(ctx, 5, -226, 18, -231, 1.9, INK);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(-10, -221, 2.2, 0, Math.PI * 2);
  ctx.arc(10, -221, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = CINNABAR;
  ctx.beginPath();
  ctx.ellipse(0, -200, 6.5, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  drawComicSfx(ctx, '咿呀…', 84, -260, 19, 0.7, 'crimson', 0.1);
  ctx.restore();
}

/** D12 渡口湿衣诡 / 水诡（破旧竹斗笠、滴水黑蓑衣、腐水草与绿锈湿铜钱） */
export function drawFerryGhostGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  armRaised: boolean,
  seconds: number,
  slow: boolean,
  threat: number,
  patterns: ComicPatterns
) {
  const dripPhase = slow ? 0.35 : (seconds * 0.95) % 1;
  ctx.save();
  ctx.translate(0, breath * 0.6);

  drawInkWashBlot(ctx, 0, -145, 134, 174, 0.56, '9, 13, 16');

  // 湿透暗黑草蓑衣（多层锯齿蓑草摆）
  inkPoly(
    ctx,
    [[-24, -196], [24, -196], [62, -162], [74, -84], [58, -94], [66, 0], [-66, 0], [-58, -94], [-74, -84], [-62, -162]],
    '#171c1e',
    2.5,
    INK,
    patterns.hatchDense
  );
  // 蓑衣层次草纹与腐水草
  for (let i = -4; i <= 4; i++) {
    inkLine(ctx, i * 11, -168, i * 15, -94, 1.5, 'rgba(205, 214, 210, 0.22)');
    inkLine(ctx, i * 12, -88, i * 14, -8, 1.4, 'rgba(205, 214, 210, 0.16)');
  }
  // 挂在衣领与肩头的湿冷腐水草
  inkLine(ctx, -28, -184, -36, -138, 2.4, '#2d3b32');
  inkLine(ctx, 22, -182, 34, -144, 2.2, '#2d3b32');

  // 伸出的浮肿惨白手掌 + 绿锈古铜钱
  const lift = armRaised ? -28 : 0;
  inkPoly(ctx, [[42, -144], [68, -110 + lift], [52, -96 + lift], [34, -124]], '#1b2022', 2.2);
  ctx.fillStyle = '#cdd4ce';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.ellipse(62, -100 + lift, 10, 11, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 绿锈方孔古铜钱
  ctx.fillStyle = '#5c7869';
  ctx.beginPath();
  ctx.arc(76, -106 + lift, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  inkRect(ctx, 73, -109 + lift, 6, 6, '#141718', 1.1);

  // 阴影笼罩的面庞 + 破旧宽檐竹斗笠
  ctx.fillStyle = '#181d1f';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.ellipse(0, -214, 21, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (threat >= 1) {
    ctx.fillStyle = 'rgba(220, 236, 230, 0.72)';
    ctx.beginPath();
    ctx.arc(-8, -212, 2.1, 0, Math.PI * 2);
    ctx.arc(8, -212, 2.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // 破旧竹斗笠（宽大尖顶剪影 + 留白月光高光）
  inkPoly(
    ctx,
    [[-88, -220], [-42, -244], [0, -268], [42, -244], [88, -220], [32, -214], [-32, -214]],
    '#2a2c29',
    2.6,
    INK,
    patterns.woodcutH
  );
  inkLine(ctx, -84, -221, 0, -266, 1.5, 'rgba(232, 232, 222, 0.36)');
  for (const rx of [-52, -24, 0, 24, 52]) {
    inkLine(ctx, 0, -266, rx, -218, 1.2, 'rgba(12,12,12,0.55)');
  }

  // 持续滴落的腥冷江水滴
  ctx.fillStyle = 'rgba(205, 224, 222, 0.75)';
  for (let i = 0; i < 4; i++) {
    const dx = -64 + i * 44;
    const dy = -212 + ((dripPhase + i * 0.23) % 1) * 195;
    ctx.beginPath();
    ctx.ellipse(dx, dy, 1.8, 5.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawComicSfx(ctx, '滴答…', -92, -238, 17, 0.65, 'jade', -0.08);
  ctx.restore();
}

/** D8 断线裁缝诡（肩线崩裂纸袍、枯白长指、木线轴与垂坠朱砂红线） */
export function drawTailorGhostGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  armRaised: boolean,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const threadSway = slow ? 0 : Math.sin(seconds * 1.8) * 6;
  ctx.save();
  ctx.translate(0, breath * 0.6);

  drawInkWashBlot(ctx, 0, -155, 128, 176, 0.5, '10, 12, 14');

  // 枯瘦民国长袍（肩缝与袖缝崩裂露出白纸里衬与黑缝线）
  inkPoly(
    ctx,
    [[-16, -202], [16, -202], [44, -184], [48, 0], [-48, 0], [-44, -184]],
    '#222528',
    2.5,
    INK,
    patterns.woodcutV
  );
  // 崩裂的右肩缝 + 素白纸衬
  inkPoly(ctx, [[16, -196], [42, -182], [36, -156], [12, -172]], '#efe7d5', 1.8);
  for (let i = 0; i < 4; i++) {
    inkLine(ctx, 16 + i * 5, -188 + i * 5, 34 + i * 2, -176 + i * 6, 1.7, CINNABAR);
  }
  // 立领与斜襟盘扣
  inkPoly(ctx, [[-13, -208], [13, -208], [15, -194], [-15, -194]], '#f0e9d9', 1.9);
  inkLine(ctx, -10, -194, 22, -162, 2.0, CINNABAR);
  inkLine(ctx, 22, -162, 24, -10, 1.8, '#cfc7b6');

  // 细长枯白纸手捧着朱砂木线轴，悬垂数缕红线
  const lift = armRaised ? -24 : 0;
  inkPoly(ctx, [[36, -162], [62, -118 + lift], [46, -106 + lift], [28, -142]], '#26292c', 2.2);
  inkPoly(
    ctx,
    [[48, -112 + lift], [64, -112 + lift], [60, -86 + lift], [50, -86 + lift]],
    '#f4ede0',
    1.8
  );
  // 木线轴 + 缠绕朱砂线 + 悬垂断线
  inkRect(ctx, 56, -124 + lift, 18, 28, CINNABAR, 1.9);
  inkRect(ctx, 53, -128 + lift, 24, 5, '#594b3e', 1.6);
  inkRect(ctx, 53, -97 + lift, 24, 5, '#594b3e', 1.6);
  ctx.strokeStyle = CINNABAR;
  ctx.lineWidth = 1.9;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(62 + i * 4, -92 + lift);
    ctx.quadraticCurveTo(68 + threadSway * (0.7 + i * 0.25), -56 + lift, 58 + threadSway, -24 + i * 10);
    ctx.stroke();
  }

  // 枯瘦惨白长脸 + 额前阴翳 + 颊侧浅缝痕
  ctx.fillStyle = '#ece5d6';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, -234, 20, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  inkPoly(ctx, [[-21, -242], [-18, -264], [0, -268], [18, -264], [21, -242], [12, -252], [-12, -252]], '#121213', 2.0);
  inkLine(ctx, -14, -236, -4, -234, 1.8, INK);
  inkLine(ctx, 4, -234, 14, -236, 1.8, INK);
  for (const ex of [-9, 9]) {
    ctx.fillStyle = '#0c0b0b';
    ctx.beginPath();
    ctx.arc(ex, -230, 1.9, 0, Math.PI * 2);
    ctx.fill();
  }
  // 颊侧微细黑线缝痕
  inkLine(ctx, 11, -222, 16, -214, 1.3, INK);
  inkLine(ctx, 10, -216, 17, -219, 1.2, CINNABAR);
  inkLine(ctx, -6, -214, 6, -214, 1.5, INK);

  ctx.restore();
}

/** D11 收灰炉头诡（灰黑兜帽长袍、双手捧冷黑陶香灰钵与袅袅灰烟） */
export function drawAshCollectorGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  ctx.save();
  ctx.translate(0, breath * 0.55);

  drawInkWashBlot(ctx, 0, -146, 134, 172, 0.52, '18, 20, 22');

  // 宽大灰墨兜帽长袍（袖摆落满灰白香灰）
  inkPoly(
    ctx,
    [[-30, -206], [30, -206], [62, -162], [68, 0], [-68, 0], [-62, -162]],
    '#2a2c2e',
    2.6,
    INK,
    patterns.woodcutV
  );
  // 兜帽罩头剪影
  inkPoly(
    ctx,
    [[-34, -202], [-30, -258], [0, -276], [30, -258], [34, -202], [22, -212], [18, -248], [0, -258], [-18, -248], [-22, -212]],
    '#1d1f21',
    2.4,
    INK,
    patterns.hatchDense
  );
  // 兜帽深暗面容与温和微白眼瞳
  ctx.fillStyle = '#151718';
  ctx.beginPath();
  ctx.ellipse(0, -230, 18, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(232, 232, 224, 0.68)';
  ctx.beginPath();
  ctx.ellipse(-7, -232, 3.6, 1.6, 0, 0, Math.PI * 2);
  ctx.ellipse(7, -232, 3.6, 1.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 双手稳捧冷黑陶香灰钵
  for (const side of [-1, 1]) {
    inkPoly(
      ctx,
      [
        [side * 46, -158],
        [side * 60, -110],
        [side * 28, -94],
        [side * 22, -124]
      ],
      '#35383a',
      2.2
    );
  }
  // 黑陶钵 + 钵内浅白香灰堆 + 浮起冷灰烟
  inkPoly(ctx, [[-34, -124], [34, -124], [26, -86], [-26, -86]], '#1c1d1f', 2.4);
  ctx.fillStyle = '#d8d4c8';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, -124, 32, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  for (let i = 0; i < 3; i++) {
    const p = slow ? 0.35 + i * 0.22 : (seconds * 0.28 + i * 0.33) % 1;
    const sy = -132 - p * 54;
    const sx = (i - 1) * 14 + Math.sin(p * 6 + i) * 6;
    ctx.save();
    ctx.globalAlpha = Math.sin(p * Math.PI) * 0.55;
    ctx.strokeStyle = '#d4d8d4';
    ctx.lineWidth = 2.4 + p * 3;
    ctx.beginPath();
    ctx.moveTo(sx, sy + 14);
    ctx.quadraticCurveTo(sx + 8, sy + 4, sx - 4, sy - 10);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/** D9 无影提灯童（矮小童身、脚下无影、手提散发青白火苗的六角纸灯笼） */
export function drawLanternChildGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const lanternSway = slow ? 0 : Math.sin(seconds * 1.9) * 5;
  ctx.save();
  ctx.translate(0, breath * 0.55);

  // 童身马甲（朱砂滚边）
  inkPoly(ctx, [[-14, -162], [14, -162], [38, -142], [40, 0], [-40, 0], [-38, -142]], '#323538', 2.4, INK, patterns.woodcutV);
  inkPoly(ctx, [[-13, -166], [13, -166], [15, -154], [-15, -154]], '#f2ecdc', 1.9);
  inkLine(ctx, -16, -154, -18, -12, 2.3, CINNABAR);
  inkLine(ctx, 16, -154, 18, -12, 2.3, CINNABAR);
  inkLine(ctx, 0, -154, 0, -12, 1.8, INK);

  // 右手举竹竿提着一盏青白火苗六角纸灯笼
  inkPoly(ctx, [[30, -146], [56, -126], [48, -112], [26, -126]], '#383b3e', 2.1);
  inkLine(ctx, 48, -120, 88, -138, 2.6, '#8c7e64');
  // 悬绳 + 青白纸灯
  const lx = 88 + lanternSway;
  const ly = -96;
  inkLine(ctx, 88, -138, lx, ly - 24, 1.6, INK);
  drawInkWashBlot(ctx, lx, ly, 46, 46, 0.44, '196, 232, 224');
  inkPoly(
    ctx,
    [[lx - 14, ly - 22], [lx + 14, ly - 22], [lx + 20, ly], [lx + 14, ly + 22], [lx - 14, ly + 22], [lx - 20, ly]],
    '#e4f0ea',
    2.1
  );
  inkLine(ctx, lx, ly - 22, lx, ly + 22, 1.3, 'rgba(18, 28, 26, 0.45)');
  // 青白小火苗
  ctx.fillStyle = '#9ce2d8';
  ctx.beginPath();
  ctx.ellipse(lx, ly + 2, 4.2, 8.5, 0, 0, Math.PI * 2);
  ctx.fill();
  inkRect(ctx, lx - 11, ly - 26, 22, 5, '#191a1b', 1.4);
  inkRect(ctx, lx - 10, ly + 21, 20, 5, '#191a1b', 1.4);
  inkLine(ctx, lx, ly + 26, lx + lanternSway * 0.4, ly + 42, 2.0, CINNABAR);

  // 童颜纸脸（西瓜头、淡腮红、大眼珠）
  ctx.fillStyle = '#efe9dc';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.ellipse(0, -194, 21, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  inkPoly(
    ctx,
    [[-22, -194], [-22, -214], [-10, -222], [10, -222], [22, -214], [22, -194], [14, -204], [-14, -204]],
    '#121213',
    2.1
  );
  for (const ex of [-9, 9]) {
    ctx.fillStyle = '#fcf9f0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(ex, -194, 5.2, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#090909';
    ctx.beginPath();
    ctx.arc(ex, -194, 2.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(196, 36, 28, 0.48)';
  ctx.beginPath();
  ctx.arc(-13, -186, 4.2, 0, Math.PI * 2);
  ctx.arc(13, -186, 4.2, 0, Math.PI * 2);
  ctx.fill();
  inkLine(ctx, -5, -178, 5, -178, 1.5, INK, -1.8);

  ctx.restore();
}
