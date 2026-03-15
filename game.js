// ============================================================
//  BRONZE AGE: Empires of the Ancient World
//  A turn-based hex map strategy game set 1700–1100 BCE
// ============================================================

'use strict';

// ─── CONSTANTS ──────────────────────────────────────────────
const HEX_R        = 38;          // flat-top hex radius
const COLS         = 14;
const ROWS         = 9;
const TURNS_MAX    = 24;          // 24 turns × 25 years = 600 years
const START_YEAR   = 1700;
const YEARS_PER    = 25;
const WIN_TILES    = 18;          // tiles needed for domination victory

// ─── TERRAIN DATA ───────────────────────────────────────────
const TERRAIN = {
  sea:       { label:'Sea',       color:'#0a2a50', dark:'#061830', passLand:false, passSea:true,  foodB:0, bronzeB:0, goldB:0, defB:0, icon:'🌊' },
  fertile:   { label:'Fertile',   color:'#2a5a18', dark:'#1a3a0a', passLand:true,  passSea:false, foodB:3, bronzeB:0, goldB:0, defB:0, icon:'🌾' },
  desert:    { label:'Desert',    color:'#7a5a10', dark:'#5a4008', passLand:true,  passSea:false, foodB:0, bronzeB:0, goldB:1, defB:0, icon:'🏜' },
  hills:     { label:'Hills',     color:'#6a4010', dark:'#4a2c08', passLand:true,  passSea:false, foodB:1, bronzeB:1, goldB:0, defB:2, icon:'⛰' },
  mountains: { label:'Mountains', color:'#4a4040', dark:'#303030', passLand:false, passSea:false, foodB:0, bronzeB:2, goldB:0, defB:5, icon:'🗻' },
  forest:    { label:'Forest',    color:'#1a4018', dark:'#102810', passLand:true,  passSea:false, foodB:1, bronzeB:1, goldB:0, defB:2, icon:'🌲' },
  steppe:    { label:'Steppe',    color:'#5a6018', dark:'#3a4010', passLand:true,  passSea:false, foodB:2, bronzeB:0, goldB:0, defB:0, icon:'🌿' },
};

// ─── MAP DATA (COLS × ROWS) ──────────────────────────────────
// Each entry: [terrain, name, special]
// special: 'cap-EGY' etc. marks starting capitals
const RAW_MAP = [
// col:  0          1            2             3              4              5              6              7              8              9            10              11            12           13
// ── row 0 (northernmost) ──
[['sea','Tyrrhenian'],['sea','Central Med'],['sea','Ionian Sea'],['hills','Macedonia'],['hills','Thrace'],['sea','W. Black Sea'],['mountains','Caucasus'],['steppe','Pontic Steppe'],['steppe','Caspian Steppe'],['sea','Caspian Sea'],['mountains','Hindu Kush'],['steppe','Bactria'],['sea','far east'],['sea','far east']],
// ── row 1 ──
[['sea','W. Mediterranean'],['sea','Adriatic'],['hills','Greece','cap-MYC'],['fertile','Aegean Coast'],['sea','Aegean Sea'],['hills','W. Anatolia'],['fertile','C. Anatolia','cap-HIT'],['mountains','E. Anatolia'],['hills','Armenia'],['steppe','Media'],['hills','Persia','cap-ELM'],['mountains','E. Persia'],['sea','far east'],['sea','far east']],
// ── row 2 ──
[['sea','W. Mediterranean'],['sea','Central Med'],['sea','Aegean'],['fertile','Crete'],['sea','E. Mediterranean'],['sea','E. Mediterranean'],['hills','Cyprus'],['fertile','Syria'],['hills','Assyria','cap-ASS'],['fertile','N. Mesopotamia'],['fertile','S. Mesopotamia','cap-BAB'],['hills','Elam'],['sea','Persian Gulf'],['sea','Gulf']],
// ── row 3 ──
[['desert','N. Libya'],['sea','Central Med'],['sea','E. Mediterranean'],['sea','E. Mediterranean'],['sea','E. Mediterranean'],['hills','Levant'],['fertile','Canaan'],['desert','Sinai'],['fertile','Nile Delta','cap-EGY'],['desert','Arabian Desert N'],['desert','Lower Mesopotamia'],['sea','Persian Gulf'],['sea','Gulf'],['sea','Arabian Sea']],
// ── row 4 ──
[['desert','Libya'],['desert','W. Egypt Desert'],['sea','E. Mediterranean'],['sea','E. Mediterranean'],['sea','E. Mediterranean'],['sea','Red Sea N'],['fertile','Upper Egypt'],['desert','Eastern Desert'],['sea','Red Sea'],['desert','Arabian Desert C'],['desert','Arabia'],['sea','Persian Gulf'],['sea','Arabian Sea'],['sea','Arabian Sea']],
// ── row 5 ──
[['desert','Sahara W'],['desert','Sahara C'],['desert','Sahara E'],['desert','Libyan Desert'],['sea','Red Sea W'],['fertile','Thebes'],['desert','E. Desert'],['sea','Red Sea'],['desert','Hejaz'],['desert','Rub al Khali'],['sea','Arabian Sea'],['sea','Arabian Sea'],['sea','Arabian Sea'],['sea','Arabian Sea']],
// ── row 6 ──
[['desert','Sahara'],['desert','Sahara'],['desert','Sahara'],['desert','Nubian Desert'],['hills','Nubia'],['desert','Sudan'],['sea','Red Sea S'],['sea','Gulf of Aden'],['sea','Arabian Sea'],['sea','Arabian Sea'],['sea','Arabian Sea'],['sea','Arabian Sea'],['sea','Arabian Sea'],['sea','Arabian Sea']],
// ── row 7 ──
[['desert','Sahara'],['desert','Sahara'],['desert','Sahara'],['desert','Sahara'],['fertile','Kush'],['hills','Ethiopian Highlands'],['sea','Indian Ocean'],['sea','Indian Ocean'],['sea','Indian Ocean'],['sea','Indian Ocean'],['sea','Indian Ocean'],['sea','Indian Ocean'],['sea','Indian Ocean'],['sea','Indian Ocean']],
// ── row 8 (southernmost) ──
[['desert','Deep Sahara'],['desert','Deep Sahara'],['desert','Deep Sahara'],['desert','Deep Sahara'],['desert','Deep Africa'],['desert','Deep Africa'],['sea','Indian Ocean'],['sea','Indian Ocean'],['sea','Indian Ocean'],['sea','Indian Ocean'],['sea','Indian Ocean'],['sea','Indian Ocean'],['sea','Indian Ocean'],['sea','Indian Ocean']],
];

// ─── CIVILIZATIONS ──────────────────────────────────────────
const CIV_DEFS = [
  {
    id: 'EGY', name: 'Egypt', color: '#d4a017', darkColor: '#7a5c08',
    icon: '𓂀', era: 'New Kingdom',
    desc: 'Masters of the Nile, Egypt commands vast agricultural wealth and powerful armies led by the Pharaoh.',
    bonus: '🌾 +2 Food/turn · Free Granary at start',
    startCap: 'cap-EGY',
    startRes: { food:15, bronze:6, gold:8 },
    bonusFn: (civ) => { civ.res.food += 2; }
  },
  {
    id: 'HIT', name: 'Hittites', color: '#c0392b', darkColor: '#6a1510',
    icon: '⚔', era: 'Hittite Empire',
    desc: 'The iron-fisted empire of Anatolia. Hittite war chariots are feared across the ancient world.',
    bonus: '⚙ +1 Bronze/turn · Chariot units cost 1 less',
    startCap: 'cap-HIT',
    startRes: { food:8, bronze:12, gold:5 },
    bonusFn: (civ) => { civ.res.bronze += 1; }
  },
  {
    id: 'BAB', name: 'Babylon', color: '#2980b9', darkColor: '#14406a',
    icon: '🏛', era: 'Kassite Period',
    desc: 'Heirs of the great Hammurabi, Babylon controls the fertile rivers between the Tigris and Euphrates.',
    bonus: '◎ +2 Gold/turn · Buildings cost 20% less',
    startCap: 'cap-BAB',
    startRes: { food:10, bronze:8, gold:12 },
    bonusFn: (civ) => { civ.res.gold += 2; }
  },
  {
    id: 'MYC', name: 'Mycenae', color: '#8e44ad', darkColor: '#4a1a60',
    icon: '⛵', era: 'Late Helladic',
    desc: 'Bold Greek warriors and seafarers. Mycenae dominates the Aegean through trade and raiding.',
    bonus: '⛵ Ships move 2 hexes · +1 Gold per sea-adjacent tile',
    startCap: 'cap-MYC',
    startRes: { food:8, bronze:8, gold:10 },
    bonusFn: (civ) => { /* sea bonus applied in collection */ }
  },
  {
    id: 'ASS', name: 'Assyria', color: '#e67e22', darkColor: '#7a3a0a',
    icon: '🦁', era: 'Middle Assyrian',
    desc: 'Ruthless warriors from the northern plains. Assyrian armies march relentlessly to expand the empire.',
    bonus: '⚔ Warriors cost 1 less Food · +2 Attack in hills',
    startCap: 'cap-ASS',
    startRes: { food:10, bronze:10, gold:5 },
    bonusFn: (civ) => { /* attack bonus in combat */ }
  },
];

// ─── HISTORICAL EVENTS ──────────────────────────────────────
const EVENTS = [
  { turn:1,  icon:'🌟', title:'Dawn of an Empire', text:'Your civilization rises. The gods smile upon your ambitions. Gather resources, train warriors, and expand your dominion.' },
  { turn:3,  icon:'🌊', title:'Minoan Trade Network', text:'Merchants from Crete establish trade routes across the Mediterranean. All civilizations gain +3 Gold this turn.', effect: g => { g.civs.forEach(c => { if (!c.eliminated) c.res.gold += 3; }); } },
  { turn:5,  icon:'⛈', title:'Drought on the Nile', text:'A prolonged drought reduces the Nile\'s flood. Egypt\'s food production falls by -3 this turn.', effect: g => { const e=g.civs.find(c=>c.id==='EGY'); if(e&&!e.eliminated) e.res.food=Math.max(0,e.res.food-3); } },
  { turn:7,  icon:'🔥', title:'Volcanic Eruption', text:'The great volcano Thera erupts with catastrophic force. Tidal waves strike the Aegean, disrupting Mycenaean trade for a turn.', effect: g => { const m=g.civs.find(c=>c.id==='MYC'); if(m&&!m.eliminated) m.res.gold=Math.max(0,m.res.gold-4); } },
  { turn:9,  icon:'⚔', title:'Battle of Kadesh', text:'Egypt and the Hittites clash in the greatest chariot battle of the age. Both great powers agree to the world\'s first peace treaty — a hard-won stability.', effect: g => { const e=g.civs.find(c=>c.id==='EGY'), h=g.civs.find(c=>c.id==='HIT'); [e,h].forEach(c=>{ if(c&&!c.eliminated){ c.res.bronze=Math.max(0,c.res.bronze-3); c.res.food=Math.max(0,c.res.food-3); } }); } },
  { turn:11, icon:'🐪', title:'Trade Caravan from the East', text:'Merchants arrive bearing exotic goods from distant Indus. Every civilization with a Market gains +5 Gold.', effect: g => { g.civs.forEach(c=>{ if(!c.eliminated){ const bonus=g.hexes.filter(h=>h.owner===c.id&&h.building==='market').length*2+3; c.res.gold+=bonus; } }); } },
  { turn:13, icon:'🌾', title:'Bumper Harvest', text:'Favourable rains bring an exceptional harvest across the Fertile Crescent. +4 Food to all civilizations.', effect: g => { g.civs.forEach(c=>{ if(!c.eliminated) c.res.food+=4; }); } },
  { turn:15, icon:'🏴‍☠️', title:'Sea Peoples Appear', text:'Waves of mysterious Sea Peoples begin raiding coastal territories. Beware your shores!', effect: g => {
    const coastal=['Nile Delta','Levant','Canaan','Aegean Coast','W. Anatolia','Syria','Crete','Cyprus'];
    coastal.forEach(name=>{
      const h=g.hexes.find(x=>x.name===name&&x.owner);
      if(h){ const c=g.civs.find(x=>x.id===h.owner); if(c&&!c.eliminated){ c.res.food=Math.max(0,c.res.food-2); c.res.gold=Math.max(0,c.res.gold-2); } }
    });
  }},
  { turn:17, icon:'⚙', title:'Bronze Shortage', text:'Tin routes from Afghanistan are disrupted. Bronze production halves for all civs this turn.', effect: g => { g.civs.forEach(c=>{ if(!c.eliminated) c.res.bronze=Math.max(0,c.res.bronze-Math.floor(c.res.bronze/2)); }); } },
  { turn:19, icon:'🌑', title:'Eclipse Omen', text:'A total solar eclipse terrifies the people. Morale is shaken — armies refuse to march. No movement allowed for the player this turn.', effect: g => { g.eclipseTurn=true; } },
  { turn:21, icon:'🏴‍☠️', title:'Sea Peoples Invasion', text:'The Sea Peoples strike in force! Coastal cities burn. All civilizations with coastal territories lose -5 Food and -5 Gold.', effect: g => {
    const seaAdj=new Set();
    g.hexes.forEach(h=>{ if(TERRAIN[h.terrain].passSea){ getNeighbors(h.col,h.row).forEach(([nc,nr])=>{ const nh=g.getHex(nc,nr); if(nh&&nh.terrain!=='sea'&&nh.owner) seaAdj.add(nh.owner); }); } });
    seaAdj.forEach(id=>{ const c=g.civs.find(x=>x.id===id); if(c&&!c.eliminated){ c.res.food=Math.max(0,c.res.food-5); c.res.gold=Math.max(0,c.res.gold-5); } });
  }},
  { turn:23, icon:'🌑', title:'Bronze Age Twilight', text:'The great civilizations tremble. Systems of trade collapse, cities are abandoned. Can you hold your empire together?', effect: g => { g.civs.forEach(c=>{ if(!c.eliminated){ c.res.food=Math.max(0,c.res.food-3); c.res.bronze=Math.max(0,c.res.bronze-3); } }); } },
];

// ─── BUILDINGS ──────────────────────────────────────────────
const BUILDINGS = {
  granary:  { name:'Granary',   icon:'🌾', cost:{food:3,bronze:2,gold:0}, effect:{food:2,bronze:0,gold:0}, desc:'Stores grain, increasing food output.' },
  foundry:  { name:'Foundry',   icon:'⚙', cost:{food:0,bronze:3,gold:2}, effect:{food:0,bronze:2,gold:0}, desc:'Smelts bronze, increasing metal output.' },
  market:   { name:'Bazaar',    icon:'◎', cost:{food:1,bronze:1,gold:3}, effect:{food:0,bronze:0,gold:2}, desc:'Facilitates trade, generating gold.' },
  fortress: { name:'Citadel',   icon:'🏰', cost:{food:0,bronze:5,gold:0}, effect:{food:0,bronze:0,gold:0}, desc:'Fortifies the tile, granting +4 defense.' },
  temple:   { name:'Temple',    icon:'⛩', cost:{food:2,bronze:2,gold:4}, effect:{food:1,bronze:1,gold:1}, desc:'Temple of the gods, boosting all production.' },
};

// ─── UNITS ──────────────────────────────────────────────────
const UNITS = {
  warrior: { name:'Warriors',  icon:'⚔', cost:{food:2,bronze:0,gold:0}, attack:2, defense:2 },
  chariot: { name:'Chariots',  icon:'🐎', cost:{food:0,bronze:3,gold:0}, attack:5, defense:3 },
  ship:    { name:'War Galleys',icon:'⛵',cost:{food:0,bronze:2,gold:2}, attack:3, defense:2 },
};

// ─── HEX GEOMETRY (flat-top) ────────────────────────────────
function hexCenter(col, row) {
  const w = HEX_R * Math.sqrt(3);
  const h = HEX_R * 2;
  const x = col * (HEX_R * 1.5) + HEX_R + 20;
  const y = row * (HEX_R * Math.sqrt(3)) + (col % 2 === 0 ? 0 : HEX_R * Math.sqrt(3) / 2) + HEX_R * Math.sqrt(3) / 2 + 10;
  return { x, y };
}

function hexCorners(cx, cy) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 180 * (60 * i);
    pts.push({ x: cx + HEX_R * Math.cos(angle), y: cy + HEX_R * Math.sin(angle) });
  }
  return pts;
}

function pointInHex(px, py, cx, cy) {
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) <= HEX_R * 1.05;
}

function getNeighbors(col, row) {
  const isOdd = col % 2 !== 0;
  const dirs = isOdd
    ? [[-1,-1],[0,-1],[1,-1],[1,0],[0,1],[-1,0]]
    : [[-1,0],[0,-1],[1,0],[1,1],[0,1],[-1,1]];
  return dirs.map(([dc, dr]) => [col + dc, row + dr]).filter(([c, r]) => c >= 0 && c < COLS && r >= 0 && r < ROWS);
}

// ─── GAME STATE ──────────────────────────────────────────────
const G = {
  turn: 1,
  phase: 'player', // 'player' | 'ai' | 'event'
  playerCiv: null,
  civs: [],
  hexes: [],        // flat array of hex objects
  selectedHex: null,
  moveMode: false,
  movedThisTurn: new Set(), // hex ids that have moved
  actedThisTurn: new Set(), // hex ids that built/recruited
  eventQueue: [],
  eclipseTurn: false,
  log: [],

  getHex(col, row) {
    return this.hexes.find(h => h.col === col && h.row === row);
  },

  getCiv(id) {
    return this.civs.find(c => c.id === id);
  },

  addLog(text, cls='') {
    this.log.unshift({ text, cls });
    if (this.log.length > 50) this.log.pop();
    renderLog();
  }
};

// ─── INITIALISE MAP ──────────────────────────────────────────
function initMap() {
  G.hexes = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const raw = RAW_MAP[row][col];
      const h = {
        col, row,
        terrain: raw[0],
        name: raw[1],
        special: raw[2] || null,
        owner: null,
        building: null,
        units: { warrior: 0, chariot: 0, ship: 0 },
        id: `${col}_${row}`
      };
      G.hexes.push(h);
    }
  }
}

// ─── INITIALISE CIVS ─────────────────────────────────────────
function initCivs(playerCivId) {
  G.civs = CIV_DEFS.map(def => ({
    ...def,
    res: { ...def.startRes },
    eliminated: false,
    isPlayer: def.id === playerCivId
  }));

  // Assign starting territories (capital + 1 adjacent tile each)
  G.civs.forEach(civ => {
    const capHex = G.hexes.find(h => h.special === civ.startCap);
    if (!capHex) return;
    capHex.owner = civ.id;
    capHex.units.warrior = 2;
    // Bonus for Egypt
    if (civ.id === 'EGY') capHex.building = 'granary';

    // Claim one neighbour
    const nbrs = getNeighbors(capHex.col, capHex.row)
      .map(([c, r]) => G.getHex(c, r))
      .filter(h => h && h.owner === null && TERRAIN[h.terrain].passLand);
    if (nbrs.length > 0) {
      const adj = nbrs[0];
      adj.owner = civ.id;
      adj.units.warrior = 1;
    }
    if (nbrs.length > 1) {
      const adj2 = nbrs[1];
      adj2.owner = civ.id;
    }
  });
}

// ─── RESOURCE COLLECTION ─────────────────────────────────────
function collectResources() {
  G.civs.forEach(civ => {
    if (civ.eliminated) return;

    let food = 0, bronze = 0, gold = 0;

    G.hexes.filter(h => h.owner === civ.id).forEach(h => {
      const t = TERRAIN[h.terrain];
      food   += t.foodB;
      bronze += t.bronzeB;
      gold   += t.goldB;

      // Building bonus
      if (h.building) {
        const b = BUILDINGS[h.building];
        food   += b.effect.food;
        bronze += b.effect.bronze;
        gold   += b.effect.gold;
      }

      // Mycenae sea-adjacent bonus
      if (civ.id === 'MYC') {
        const seaAdj = getNeighbors(h.col, h.row)
          .map(([c, r]) => G.getHex(c, r))
          .filter(n => n && n.terrain === 'sea').length;
        gold += seaAdj > 0 ? 1 : 0;
      }
    });

    // Civ bonuses
    civ.bonusFn(civ);

    // Subtract unit upkeep: each warrior costs 0.5 food (rounded)
    const tiles = G.hexes.filter(h => h.owner === civ.id);
    let warriors = 0, chariots = 0;
    tiles.forEach(h => { warriors += h.units.warrior; chariots += h.units.chariot; });
    const upkeep = Math.floor(warriors / 2) + chariots;
    food = Math.max(0, food - upkeep);

    civ.res.food   += food;
    civ.res.bronze += bronze;
    civ.res.gold   += gold;

    // Cap resources
    civ.res.food   = Math.min(civ.res.food,   99);
    civ.res.bronze = Math.min(civ.res.bronze, 99);
    civ.res.gold   = Math.min(civ.res.gold,   99);
  });
}

// ─── COMBAT ──────────────────────────────────────────────────
function doCombat(attHex, defHex) {
  const attCiv = G.getCiv(attHex.owner);
  const defCiv = defHex.owner ? G.getCiv(defHex.owner) : null;

  const attStr = attHex.units.warrior * UNITS.warrior.attack
               + attHex.units.chariot * UNITS.chariot.attack;

  const defTerrain = TERRAIN[defHex.terrain];
  let defBonus = defTerrain.defB;
  if (defHex.building === 'fortress') defBonus += 4;
  if (attCiv.id === 'ASS' && (defHex.terrain === 'hills' || defHex.terrain === 'steppe')) defBonus -= 2; // Assyria hill bonus

  const defStr = defCiv
    ? (defHex.units.warrior * UNITS.warrior.defense + defHex.units.chariot * UNITS.chariot.defense) + defBonus
    : 0;

  const total = attStr + defStr;
  const roll  = Math.random() * total;
  const attWin = roll < attStr;

  if (attWin) {
    // Attacker wins — move into tile
    const oldOwner = defHex.owner;
    defHex.owner = attHex.owner;
    defHex.units.warrior = Math.max(1, attHex.units.warrior - 1);
    defHex.units.chariot = Math.max(0, attHex.units.chariot - 1);
    attHex.units.warrior = 0;
    attHex.units.chariot = 0;

    const msg = `⚔ ${attCiv.name} captures ${defHex.name}${defCiv?' from '+defCiv.name:''}!`;
    G.addLog(msg, 'log-capture');

    // Check if captured civ's capital
    if (defHex.special && defCiv) {
      checkElimination(defCiv);
    }
  } else {
    // Defender wins
    attHex.units.warrior = Math.max(0, attHex.units.warrior - Math.ceil(attHex.units.warrior / 2));
    attHex.units.chariot = Math.max(0, attHex.units.chariot - 1);
    if (defHex.owner) {
      defHex.units.warrior = Math.max(0, defHex.units.warrior - 1);
    }
    G.addLog(`⚔ ${attCiv.name} attacks ${defHex.name} — repelled!`, 'log-battle');
  }

  return attWin;
}

function checkElimination(civ) {
  const tiles = G.hexes.filter(h => h.owner === civ.id);
  if (tiles.length === 0) {
    civ.eliminated = true;
    G.addLog(`💀 ${civ.name} has been eliminated!`, 'log-battle');
  }
}

// ─── MOVE UNITS ──────────────────────────────────────────────
function moveUnits(fromHex, toHex) {
  if (G.movedThisTurn.has(fromHex.id)) {
    G.addLog('These units have already moved this turn.', '');
    return false;
  }

  const canLand = TERRAIN[toHex.terrain].passLand;
  const totalUnits = fromHex.units.warrior + fromHex.units.chariot;
  if (totalUnits === 0) {
    G.addLog('No land units to move.', '');
    return false;
  }

  if (!canLand) {
    G.addLog('Cannot enter that terrain.', '');
    return false;
  }

  if (toHex.owner === fromHex.owner) {
    // Merge / reinforce
    toHex.units.warrior += fromHex.units.warrior;
    toHex.units.chariot += fromHex.units.chariot;
    fromHex.units.warrior = 0;
    fromHex.units.chariot = 0;
    G.addLog(`Reinforced ${toHex.name}.`, 'log-build');
  } else {
    // Attack
    const won = doCombat(fromHex, toHex);
    if (!won) {
      G.movedThisTurn.add(fromHex.id);
      return true;
    }
  }

  G.movedThisTurn.add(fromHex.id);
  return true;
}

// ─── AI ──────────────────────────────────────────────────────
function runAI() {
  G.civs.forEach(civ => {
    if (civ.isPlayer || civ.eliminated) return;

    const myTiles = G.hexes.filter(h => h.owner === civ.id);

    // Recruit units on tiles with room
    myTiles.forEach(h => {
      const total = h.units.warrior + h.units.chariot;
      if (total < 3 && civ.res.food >= 2) {
        h.units.warrior += 1;
        civ.res.food -= 2;
      }
      if (total < 4 && civ.res.bronze >= 3 && Math.random() < 0.3) {
        h.units.chariot += 1;
        civ.res.bronze -= 3;
      }
    });

    // Build on capital if resources
    const cap = myTiles.find(h => h.special && h.special.startsWith('cap-'));
    if (cap && !cap.building && civ.res.food >= 3 && civ.res.bronze >= 2) {
      cap.building = 'granary';
      civ.res.food -= 3; civ.res.bronze -= 2;
    }

    // Move / attack: each tile with strong army moves toward nearest enemy
    myTiles.forEach(h => {
      const str = h.units.warrior + h.units.chariot;
      if (str < 2) return;
      if (Math.random() < 0.4) return; // don't always act

      const nbrs = getNeighbors(h.col, h.row)
        .map(([c, r]) => G.getHex(c, r))
        .filter(n => n && n.owner !== civ.id && TERRAIN[n.terrain].passLand);

      if (nbrs.length === 0) return;

      // Prefer attacking enemies, else expand
      const enemy = nbrs.find(n => n.owner !== null);
      const neutral = nbrs.find(n => n.owner === null);
      const target = enemy || neutral;
      if (!target) return;

      if (target.owner && target.owner !== civ.id) {
        // attack
        doCombat(h, target);
        G.addLog(`${civ.name} attacks ${target.name}.`, 'log-ai');
      } else if (!target.owner) {
        // expand
        target.owner = civ.id;
        target.units.warrior = Math.max(0, Math.floor(h.units.warrior / 2));
        h.units.warrior = Math.ceil(h.units.warrior / 2);
        G.addLog(`${civ.name} expands into ${target.name}.`, 'log-ai');
      }

      // Check if player's capital was taken
      const playerCap = G.hexes.find(hx => hx.special === `cap-${G.playerCiv.id}`);
      if (playerCap && playerCap.owner !== G.playerCiv.id) {
        triggerGameOver(false, `${civ.name} has captured your capital — your empire has fallen.`);
      }
    });

    // Check AI elimination
    checkElimination(civ);
  });
}

// ─── RESOURCE RATES (display) ────────────────────────────────
function calcRates(civ) {
  let food = 0, bronze = 0, gold = 0;
  G.hexes.filter(h => h.owner === civ.id).forEach(h => {
    const t = TERRAIN[h.terrain];
    food += t.foodB; bronze += t.bronzeB; gold += t.goldB;
    if (h.building) {
      food += BUILDINGS[h.building].effect.food;
      bronze += BUILDINGS[h.building].effect.bronze;
      gold += BUILDINGS[h.building].effect.gold;
    }
  });
  if (civ.id === 'EGY') food += 2;
  if (civ.id === 'BAB') gold += 2;
  if (civ.id === 'HIT') bronze += 1;
  return { food, bronze, gold };
}

// ─── WIN / LOSE CHECK ────────────────────────────────────────
function checkVictory() {
  const p = G.playerCiv;
  const myTiles = G.hexes.filter(h => h.owner === p.id).length;

  // Domination victory
  if (myTiles >= WIN_TILES) {
    triggerGameOver(true, `Your empire controls ${myTiles} territories — a dominance unseen in the ancient world. Future ages will speak of your glory.`);
    return;
  }

  // Survival victory
  if (G.turn > TURNS_MAX) {
    const civScores = G.civs.filter(c => !c.eliminated).map(c => ({
      id: c.id,
      tiles: G.hexes.filter(h => h.owner === c.id).length
    })).sort((a, b) => b.tiles - a.tiles);

    if (civScores[0].id === p.id) {
      triggerGameOver(true, `You have guided your civilization through 600 years of the Bronze Age. As other empires crumble, yours endures — the greatest power of the ancient world.`);
    } else {
      const winner = G.getCiv(civScores[0].id);
      triggerGameOver(false, `The Bronze Age ends. ${winner.name} emerges as the dominant power with ${civScores[0].tiles} territories. Your civilization survives, but history will remember ${winner.name}'s empire.`);
    }
    return;
  }

  // Capital lost check
  const playerCap = G.hexes.find(h => h.special === `cap-${p.id}`);
  if (playerCap && playerCap.owner !== p.id) {
    triggerGameOver(false, 'Your capital has fallen. Without its heart, your empire crumbles into dust.');
    return;
  }

  // All AI eliminated
  const aiAlive = G.civs.filter(c => !c.isPlayer && !c.eliminated).length;
  if (aiAlive === 0) {
    triggerGameOver(true, 'All rival civilizations have been vanquished! You stand alone as the supreme power of the Bronze Age world!');
  }
}

function triggerGameOver(victory, text) {
  const el = document.getElementById('game-over-screen');
  const title = document.getElementById('game-over-title');
  const txt   = document.getElementById('game-over-text');
  title.textContent = victory ? '⚔ VICTORY ⚔' : '💀 DEFEAT 💀';
  title.className = victory ? 'victory-title' : 'defeat-title';
  txt.textContent = text;
  el.style.display = 'flex';
  document.getElementById('end-turn-btn').disabled = true;
}

// ─── HISTORICAL EVENTS ───────────────────────────────────────
function processEvent(turn) {
  const ev = EVENTS.find(e => e.turn === turn);
  if (!ev) return;

  if (ev.effect) ev.effect(G);

  const modal = document.getElementById('event-modal');
  document.getElementById('event-modal-icon').textContent  = ev.icon;
  document.getElementById('event-modal-title').textContent = ev.title;
  document.getElementById('event-modal-text').textContent  = ev.text;
  modal.style.display = 'flex';

  G.addLog(`📜 ${ev.title}`, 'log-event');
}

document.getElementById('event-modal-btn').addEventListener('click', () => {
  document.getElementById('event-modal').style.display = 'none';
  renderAll();
});

// ─── END TURN ────────────────────────────────────────────────
function endTurn() {
  if (G.phase !== 'player') return;

  G.eclipseTurn = false;
  G.movedThisTurn.clear();
  G.actedThisTurn.clear();
  G.selectedHex = null;
  G.moveMode = false;

  // AI turns
  runAI();
  // Resource collection
  collectResources();

  G.turn++;

  // Process event
  processEvent(G.turn);

  // Update UI
  checkVictory();
  renderAll();
}

document.getElementById('end-turn-btn').addEventListener('click', endTurn);

// ─── CANVAS RENDERING ────────────────────────────────────────
const canvas = document.getElementById('map-canvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  const mc = document.getElementById('map-container');
  canvas.width  = mc.clientWidth;
  canvas.height = mc.clientHeight;
}

function drawHex(h) {
  const { x, y } = hexCenter(h.col, h.row);
  const corners   = hexCorners(x, y);
  const isSelected = G.selectedHex && G.selectedHex.id === h.id;
  const t = TERRAIN[h.terrain];

  // Background fill
  ctx.beginPath();
  corners.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.closePath();

  // Color = terrain base + owner overlay
  if (h.owner) {
    const civColor = G.getCiv(h.owner)?.color || '#888';
    ctx.fillStyle = blendColors(t.color, civColor, 0.35);
  } else {
    ctx.fillStyle = t.color;
  }
  ctx.fill();

  // Border
  const isValidMove = G.moveMode && G.selectedHex && isValidMoveTarget(G.selectedHex, h);
  ctx.strokeStyle = isSelected   ? '#f0f0a0'
                  : isValidMove  ? '#70e070'
                  : h.owner      ? darkenColor(G.getCiv(h.owner)?.color || '#888', 0.6)
                  : '#1a1006';
  ctx.lineWidth   = isSelected ? 2.5 : isValidMove ? 2 : 1;
  ctx.stroke();

  // Owner color strip at top
  if (h.owner) {
    const civColor = G.getCiv(h.owner)?.color || '#888';
    ctx.beginPath();
    const top = corners.slice(0, 3);
    ctx.moveTo(x, y);
    top.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = civColor + '40';
    ctx.fill();
  }

  // Text: region name (small)
  if (h.terrain !== 'sea') {
    ctx.fillStyle = 'rgba(255,240,200,0.7)';
    ctx.font = '9px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const words = h.name.split(' ');
    if (words.length <= 2) {
      ctx.fillText(h.name, x, y + 6);
    } else {
      ctx.fillText(words.slice(0, 2).join(' '), x, y + 2);
      ctx.fillText(words.slice(2).join(' '), x, y + 12);
    }
  }

  // Building icon
  if (h.building) {
    ctx.font = '13px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(BUILDINGS[h.building].icon, x + 14, y - 14);
  }

  // Unit strength dot
  const totalUnits = h.units.warrior + h.units.chariot + h.units.ship;
  if (totalUnits > 0) {
    ctx.beginPath();
    ctx.arc(x - 12, y - 14, 7, 0, Math.PI * 2);
    ctx.fillStyle = h.owner ? (G.getCiv(h.owner)?.color || '#888') : '#888';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 8px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(totalUnits > 9 ? '9+' : totalUnits, x - 12, y - 14);
  }

  // Capital star
  if (h.special) {
    ctx.font = '11px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', x + 14, y + 14);
  }
}

function renderMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  G.hexes.forEach(h => drawHex(h));
}

// ─── SIDEBAR / UI RENDERING ──────────────────────────────────
function renderTopBar() {
  const p = G.playerCiv;
  document.getElementById('civ-name-display').innerHTML =
    `<span style="color:${p.color}">${p.icon} ${p.name}</span>`;

  document.getElementById('food-val').textContent   = p.res.food;
  document.getElementById('bronze-val').textContent = p.res.bronze;
  document.getElementById('gold-val').textContent   = p.res.gold;

  const rates = calcRates(p);
  const rateEl = (id, val) => {
    const el = document.getElementById(id);
    el.textContent = (val >= 0 ? '+' : '') + val + '/t';
    el.className = 'rate' + (val < 0 ? ' neg' : '');
  };
  rateEl('food-rate',   rates.food);
  rateEl('bronze-rate', rates.bronze);
  rateEl('gold-rate',   rates.gold);

  const year  = START_YEAR - (G.turn - 1) * YEARS_PER;
  document.getElementById('year-display').textContent  = `${year} BCE`;
  document.getElementById('turn-count').textContent    = `Turn ${G.turn} / ${TURNS_MAX}`;
}

function renderSidebar() {
  const h = G.selectedHex;
  const tileDiv = document.getElementById('tile-details');
  const actDiv  = document.getElementById('action-buttons');

  if (!h) {
    tileDiv.innerHTML = '<p class="hint-text">Click a hex to inspect it.</p>';
    actDiv.innerHTML  = '<p class="hint-text">Select one of your territories.</p>';
  } else {
    const t    = TERRAIN[h.terrain];
    const civ  = h.owner ? G.getCiv(h.owner) : null;
    const mine = h.owner === G.playerCiv.id;

    tileDiv.innerHTML = `
      <div class="tile-name">${t.icon} ${h.name}</div>
      <span class="terrain-tag terrain-${h.terrain}">${t.label}</span>
      <div class="tile-owner">
        ${civ
          ? `<span style="color:${civ.color}">▮</span> <span class="tile-owner-name">${civ.name}</span>`
          : '<span style="color:#4a3010">▮ Unclaimed</span>'}
      </div>
      <div class="tile-res-row">
        <span>🌾 +${t.foodB}${h.building ? '+'+BUILDINGS[h.building].effect.food : ''}</span>
        <span>⚙ +${t.bronzeB}${h.building ? '+'+BUILDINGS[h.building].effect.bronze : ''}</span>
        <span>◎ +${t.goldB}${h.building ? '+'+BUILDINGS[h.building].effect.gold : ''}</span>
      </div>
      ${h.building ? `<div class="tile-building">${BUILDINGS[h.building].icon} ${BUILDINGS[h.building].name}</div>` : ''}
      <div class="tile-units">
        ${h.units.warrior > 0 ? `⚔ ${h.units.warrior} Warriors ` : ''}
        ${h.units.chariot > 0 ? `🐎 ${h.units.chariot} Chariots ` : ''}
        ${h.units.ship    > 0 ? `⛵ ${h.units.ship} Galleys` : ''}
        ${(h.units.warrior + h.units.chariot + h.units.ship) === 0 ? 'No units' : ''}
      </div>`;

    // Actions
    if (!mine) {
      actDiv.innerHTML = '<p class="hint-text">Select one of your territories to take actions.</p>';
    } else {
      const p    = G.playerCiv;
      const moved= G.movedThisTurn.has(h.id);
      const acted= G.actedThisTurn.has(h.id);
      const hasUnits = (h.units.warrior + h.units.chariot) > 0;

      let html = '';

      // Move button
      html += `<button class="action-btn${G.moveMode && G.selectedHex?.id===h.id?' active-move':''}"
        id="btn-move" ${moved || !hasUnits ? 'disabled' : ''}>
        🚶 Move Units${moved?' (moved)':''}
      </button>`;

      // Recruit
      const wCost = G.playerCiv.id === 'ASS' ? 1 : 2;
      html += `<button class="action-btn" id="btn-recruit-w"
        ${acted || p.res.food < wCost ? 'disabled' : ''}>
        ⚔ Recruit Warriors <span class="cost-tag">🌾${wCost}</span>
      </button>`;

      const cCost = G.playerCiv.id === 'HIT' ? 2 : 3;
      html += `<button class="action-btn" id="btn-recruit-c"
        ${acted || p.res.bronze < cCost ? 'disabled' : ''}>
        🐎 Recruit Chariots <span class="cost-tag">⚙${cCost}</span>
      </button>`;

      // Build buttons (only on un-built land tiles)
      if (!h.building && h.terrain !== 'sea') {
        Object.entries(BUILDINGS).forEach(([key, b]) => {
          const canAfford = p.res.food >= b.cost.food && p.res.bronze >= b.cost.bronze && p.res.gold >= b.cost.gold;
          const costStr = [
            b.cost.food > 0   ? `🌾${b.cost.food}` : '',
            b.cost.bronze > 0 ? `⚙${b.cost.bronze}` : '',
            b.cost.gold > 0   ? `◎${b.cost.gold}` : '',
          ].filter(Boolean).join(' ');
          html += `<button class="action-btn" id="btn-build-${key}"
            ${acted || !canAfford ? 'disabled' : ''}>
            ${b.icon} Build ${b.name} <span class="cost-tag">${costStr}</span>
          </button>`;
        });
      }

      actDiv.innerHTML = html;

      // Wire buttons
      document.getElementById('btn-move')?.addEventListener('click', () => {
        G.moveMode = !G.moveMode;
        renderAll();
      });

      document.getElementById('btn-recruit-w')?.addEventListener('click', () => {
        const cost = G.playerCiv.id === 'ASS' ? 1 : 2;
        if (!acted && p.res.food >= cost) {
          p.res.food -= cost;
          h.units.warrior++;
          G.actedThisTurn.add(h.id);
          G.addLog(`Recruited Warriors in ${h.name}.`, 'log-build');
          renderAll();
        }
      });

      document.getElementById('btn-recruit-c')?.addEventListener('click', () => {
        const cost = G.playerCiv.id === 'HIT' ? 2 : 3;
        if (!acted && p.res.bronze >= cost) {
          p.res.bronze -= cost;
          h.units.chariot++;
          G.actedThisTurn.add(h.id);
          G.addLog(`Recruited Chariots in ${h.name}.`, 'log-build');
          renderAll();
        }
      });

      Object.keys(BUILDINGS).forEach(key => {
        document.getElementById(`btn-build-${key}`)?.addEventListener('click', () => {
          const b = BUILDINGS[key];
          if (!acted && p.res.food >= b.cost.food && p.res.bronze >= b.cost.bronze && p.res.gold >= b.cost.gold) {
            p.res.food   -= b.cost.food;
            p.res.bronze -= b.cost.bronze;
            p.res.gold   -= b.cost.gold;
            h.building = key;
            G.actedThisTurn.add(h.id);
            G.addLog(`Built ${b.name} in ${h.name}.`, 'log-build');
            renderAll();
          }
        });
      });
    }
  }

  // Civ list
  const civList = document.getElementById('civs-list');
  civList.innerHTML = G.civs.map(c => {
    const tiles = G.hexes.filter(h => h.owner === c.id).length;
    return `<div class="civ-entry${c.eliminated ? ' eliminated' : ''}">
      <div class="civ-color-dot" style="background:${c.color}"></div>
      <div class="civ-entry-name">${c.icon} ${c.name}${c.isPlayer ? ' (You)' : ''}</div>
      <div class="civ-entry-tiles">${tiles} tiles</div>
    </div>`;
  }).join('');
}

function renderLog() {
  const el = document.getElementById('log-entries');
  el.innerHTML = G.log.slice(0, 12).map(e =>
    `<div class="log-entry ${e.cls}">${e.text}</div>`
  ).join('');
}

function renderAll() {
  renderTopBar();
  renderMap();
  renderSidebar();

  // Move mode banner
  const banner = document.getElementById('move-mode-banner');
  if (banner) banner.style.display = G.moveMode ? 'block' : 'none';
}

// ─── HEX CLICK ───────────────────────────────────────────────
function isValidMoveTarget(from, to) {
  if (!TERRAIN[to.terrain].passLand) return false;
  if (to.owner === from.owner) return false; // can't attack yourself... wait — we want to allow reinforcement
  const nbrs = getNeighbors(from.col, from.row);
  return nbrs.some(([c, r]) => c === to.col && r === to.row);
}

function isValidReinforceTarget(from, to) {
  if (!TERRAIN[to.terrain].passLand) return false;
  const nbrs = getNeighbors(from.col, from.row);
  return nbrs.some(([c, r]) => c === to.col && r === to.row);
}

canvas.addEventListener('click', e => {
  if (G.eclipseTurn) {
    G.addLog('The eclipse prevents movement this turn.', '');
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  let clicked = null;
  for (const h of G.hexes) {
    const { x, y } = hexCenter(h.col, h.row);
    if (pointInHex(mx, my, x, y)) { clicked = h; break; }
  }

  if (!clicked) return;

  if (G.moveMode && G.selectedHex) {
    const from = G.selectedHex;
    if (clicked.id === from.id) {
      // Cancel move mode
      G.moveMode = false;
      renderAll();
      return;
    }

    const nbrs = getNeighbors(from.col, from.row);
    const isAdj = nbrs.some(([c, r]) => c === clicked.col && r === clicked.row);
    if (isAdj && TERRAIN[clicked.terrain].passLand) {
      if (clicked.owner === from.owner) {
        // Reinforce
        clicked.units.warrior += from.units.warrior;
        clicked.units.chariot += from.units.chariot;
        from.units.warrior = 0;
        from.units.chariot = 0;
        G.movedThisTurn.add(from.id);
        G.addLog(`Reinforced ${clicked.name} from ${from.name}.`, 'log-build');
      } else {
        moveUnits(from, clicked);
      }
      G.moveMode = false;
      G.selectedHex = clicked.owner === G.playerCiv.id ? clicked : null;
      renderAll();
      checkVictory();
    }
    return;
  }

  G.moveMode = false;
  G.selectedHex = clicked;
  renderAll();
});

// Tooltip
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const tooltip = document.getElementById('hex-tooltip');

  let hovered = null;
  for (const h of G.hexes) {
    const { x, y } = hexCenter(h.col, h.row);
    if (pointInHex(mx, my, x, y)) { hovered = h; break; }
  }

  if (hovered && hovered.terrain !== 'sea') {
    const t   = TERRAIN[hovered.terrain];
    const civ = hovered.owner ? G.getCiv(hovered.owner) : null;
    tooltip.style.display = 'block';
    tooltip.style.left    = (e.clientX + 14) + 'px';
    tooltip.style.top     = (e.clientY - 10) + 'px';
    tooltip.innerHTML     = `<b style="color:#d4a017">${hovered.name}</b><br>
      ${t.icon} ${t.label}<br>
      ${civ ? `<span style="color:${civ.color}">${civ.name}</span>` : 'Unclaimed'}`;
  } else {
    tooltip.style.display = 'none';
  }
});

canvas.addEventListener('mouseleave', () => {
  document.getElementById('hex-tooltip').style.display = 'none';
});

// ─── COLOR HELPERS ───────────────────────────────────────────
function blendColors(hex1, hex2, t) {
  const r1 = parseInt(hex1.slice(1,3),16), g1 = parseInt(hex1.slice(3,5),16), b1 = parseInt(hex1.slice(5,7),16);
  const r2 = parseInt(hex2.slice(1,3),16), g2 = parseInt(hex2.slice(3,5),16), b2 = parseInt(hex2.slice(5,7),16);
  const r = Math.round(r1*(1-t)+r2*t), g = Math.round(g1*(1-t)+g2*t), b = Math.round(b1*(1-t)+b2*t);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, factor) {
  const r = Math.round(parseInt(hex.slice(1,3),16)*factor);
  const g = Math.round(parseInt(hex.slice(3,5),16)*factor);
  const b = Math.round(parseInt(hex.slice(5,7),16)*factor);
  return `rgb(${r},${g},${b})`;
}

// ─── START SCREEN ────────────────────────────────────────────
let selectedCivId = null;

function buildStartScreen() {
  const grid = document.getElementById('civ-grid');
  grid.innerHTML = CIV_DEFS.map(c => `
    <div class="civ-card" data-id="${c.id}" style="border-color: #3a2010">
      <div class="civ-icon">${c.icon}</div>
      <div class="civ-name" style="color:${c.color}">${c.name}</div>
      <div class="civ-era">${c.era}</div>
      <div class="civ-desc">${c.desc}</div>
      <div class="civ-bonus">${c.bonus}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.civ-card').forEach(card => {
    card.addEventListener('click', () => {
      grid.querySelectorAll('.civ-card').forEach(c => {
        c.classList.remove('selected');
        c.style.borderColor = '#3a2010';
      });
      card.classList.add('selected');
      const cid = card.dataset.id;
      const civ = CIV_DEFS.find(c => c.id === cid);
      card.style.borderColor = civ.color;
      selectedCivId = cid;
      document.getElementById('start-btn').disabled = false;
    });
  });
}

document.getElementById('start-btn').addEventListener('click', () => {
  if (!selectedCivId) return;
  startGame(selectedCivId);
});

function startGame(civId) {
  // Hide start screen, show game
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';

  // Add move mode banner to map container
  const mc = document.getElementById('map-container');
  if (!document.getElementById('move-mode-banner')) {
    const banner = document.createElement('div');
    banner.id = 'move-mode-banner';
    banner.textContent = '🚶 MOVE MODE — Click an adjacent tile';
    mc.appendChild(banner);
  }

  // Init game
  initMap();
  initCivs(civId);
  G.playerCiv = G.getCiv(civId);
  G.turn = 1;
  G.phase = 'player';

  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); renderAll(); });

  G.addLog('Your campaign begins. Expand, build, and conquer!', 'log-victory');
  processEvent(1);
  renderAll();
}

// ─── BOOT ───────────────────────────────────────────────────
buildStartScreen();
