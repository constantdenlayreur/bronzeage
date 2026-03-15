'use strict';

// ============================================================
//  WILUSA: Twilight of the Bronze Age
//  Troy survival strategy — 1250–1150 BCE
//  Player manages Troy (Wilusa) through the Bronze Age Collapse
// ============================================================

// ─── MAP GEOMETRY ───────────────────────────────────────────
// Canvas target: fills the map area
// All region polygons defined at reference size 820×480
// We scale to actual canvas size at draw time
const REF_W = 820, REF_H = 480;

// ─── REGION DEFINITIONS ─────────────────────────────────────
// poly: array of [x, y] at reference 820×480
// Resources each region exports (what player can BUY there)
// imports: what they accept in payment (besides gold)
const REGIONS = {

  // ── Troy / Wilusa (player city) ──────────────────────────
  troy: {
    name: 'Troy (Wilusa)', icon: '⚔', isPlayer: true,
    cx: 182, cy: 162,
    poly: [[148,128],[188,118],[222,132],[232,158],[226,190],[205,210],[175,212],[152,196],[142,168]],
    fillColor: '#5a3800', borderColor: '#d4a017',
    desc: 'Your city. Guards the Hellespont, commanding the strait between the Aegean and Black Sea. Your wealth flows from tolls and trade.',
    relation: 'player',
    exports: {},
  },

  // ── Mycenae / Greece ────────────────────────────────────
  mycenae: {
    name: 'Mycenae', icon: '🛡', isPlayer: false,
    cx: 78, cy: 218,
    poly: [[14,170],[50,152],[90,155],[115,172],[128,198],[122,228],[108,260],[86,292],[62,298],[38,288],[16,270],[8,240],[12,200]],
    fillColor: '#3a2850', borderColor: '#8e44ad',
    desc: 'The great warrior kingdoms of Greece. Rich in silver and olive oil — but hungry for bronze. Their fleets grow bolder each year.',
    relation: 'suspicious',
    exports: {
      olive_oil: { name:'Olive Oil', icon:'🫒', basePrice:4, qty:5 },
      silver:    { name:'Silver',    icon:'🥈', basePrice:6, qty:3 },
    },
    imports: ['bronze','grain'],
    threatLevel: 0, // rises over turns → triggers Trojan War event
  },

  // ── Crete / Knossos ─────────────────────────────────────
  crete: {
    name: 'Crete (Knossos)', icon: '🐂', isPlayer: false,
    cx: 128, cy: 330,
    poly: [[72,316],[108,304],[152,302],[182,316],[188,334],[168,348],[124,350],[80,338]],
    fillColor: '#2a2a50', borderColor: '#5050a0',
    desc: 'Island realm of Knossos. Safe and prosperous, a crossroads of Aegean trade.',
    relation: 'friendly',
    exports: {
      olive_oil: { name:'Olive Oil', icon:'🫒', basePrice:3, qty:4 },
      pottery:   { name:'Pottery',   icon:'🏺', basePrice:3, qty:4 },
    },
    imports: ['bronze','grain'],
  },

  // ── Arzawa (W. Anatolia) ─────────────────────────────────
  arzawa: {
    name: 'Arzawa', icon: '🌲', isPlayer: false,
    cx: 198, cy: 248,
    poly: [[152,210],[178,212],[218,210],[250,228],[260,255],[246,278],[212,285],[175,278],[152,258],[142,235]],
    fillColor: '#1a3018', borderColor: '#4a8030',
    desc: 'Your western neighbour in Anatolia. Rich in timber, grain, and horses. Often friendly but sometimes rivals the Hittites.',
    relation: 'neutral',
    exports: {
      grain:   { name:'Grain',   icon:'🌾', basePrice:2, qty:6 },
      timber:  { name:'Timber',  icon:'🪵', basePrice:3, qty:5 },
      horses:  { name:'Horses',  icon:'🐎', basePrice:8, qty:2 },
    },
    imports: ['bronze','gold'],
  },

  // ── Hatti / Hittites ─────────────────────────────────────
  hatti: {
    name: 'Hatti (Hittites)', icon: '👑', isPlayer: false,
    cx: 318, cy: 152,
    poly: [[226,130],[272,112],[342,102],[408,108],[450,128],[468,158],[462,188],[440,220],[405,242],[358,250],[310,250],[268,240],[232,220],[218,188],[215,158]],
    fillColor: '#3a1010', borderColor: '#c03030',
    desc: 'Your overlord. The Hittite Empire spans central Anatolia. They demand tribute in bronze each year — and expect your military support. Do not defy them.',
    relation: 'overlord',
    exports: {
      horses: { name:'Horses',  icon:'🐎', basePrice:7, qty:3 },
      silver: { name:'Silver',  icon:'🥈', basePrice:5, qty:4 },
      grain:  { name:'Grain',   icon:'🌾', basePrice:2, qty:5 },
    },
    imports: ['bronze'],
    tributeDue: 3, // bronze per turn
  },

  // ── Kashka (N. Pontic raiders) ───────────────────────────
  kashka: {
    name: 'Kashka', icon: '🗡', isPlayer: false,
    cx: 308, cy: 88,
    poly: [[148,122],[198,95],[268,80],[350,74],[428,80],[492,98],[535,122],[525,138],[490,140],[424,138],[350,132],[268,132],[198,132],[148,132]],
    fillColor: '#2a2010', borderColor: '#7a6020',
    desc: 'Northern raiders along the Black Sea coast. Constant thorn in the Hittite Empire\'s side. They do not trade — they raid.',
    relation: 'hostile',
    exports: {},
    noTrade: true,
  },

  // ── Cyprus ───────────────────────────────────────────────
  cyprus: {
    name: 'Cyprus (Alashiya)', icon: '⚒', isPlayer: false,
    cx: 342, cy: 292,
    poly: [[308,272],[350,260],[385,266],[405,285],[402,310],[375,322],[338,320],[305,308]],
    fillColor: '#2a1810', borderColor: '#b06020',
    desc: 'The great copper island. Cyprus supplies most of the copper in the Mediterranean world. Without it, there is no bronze.',
    relation: 'friendly',
    exports: {
      copper: { name:'Copper', icon:'⚒', basePrice:3, qty:8 },
    },
    imports: ['grain','silver'],
    isCopperHub: true,
  },

  // ── Ugarit / Syria ───────────────────────────────────────
  ugarit: {
    name: 'Ugarit / Syria', icon: '🏺', isPlayer: false,
    cx: 398, cy: 248,
    poly: [[382,202],[428,195],[460,208],[475,230],[468,260],[450,280],[420,288],[392,272],[378,252],[375,228]],
    fillColor: '#182818', borderColor: '#3a7028',
    desc: 'The greatest trading hub of the age. Ugarit connects east and west, north and south. Grain, tin via land routes, fine goods — all pass through here.',
    relation: 'neutral',
    exports: {
      grain:    { name:'Grain',    icon:'🌾', basePrice:2, qty:7 },
      tin:      { name:'Tin',      icon:'🔩', basePrice:6, qty:4 },
      purple_dye:{ name:'Purple Dye', icon:'🟣', basePrice:8, qty:2 },
    },
    imports: ['bronze','copper','grain'],
    isTinHub: true,
  },

  // ── Canaan / Levant ──────────────────────────────────────
  canaan: {
    name: 'Canaan', icon: '🌿', isPlayer: false,
    cx: 402, cy: 338,
    poly: [[375,278],[418,268],[455,278],[465,308],[460,342],[448,372],[428,388],[405,388],[385,370],[370,342],[368,308]],
    fillColor: '#1a2a10', borderColor: '#507020',
    desc: 'Fertile coastal land rich in grain and olive oil. Cities like Megiddo and Ashdod are hubs of local trade.',
    relation: 'neutral',
    exports: {
      grain:     { name:'Grain',     icon:'🌾', basePrice:2, qty:6 },
      olive_oil: { name:'Olive Oil', icon:'🫒', basePrice:4, qty:4 },
    },
    imports: ['bronze','copper'],
  },

  // ── Egypt ────────────────────────────────────────────────
  egypt: {
    name: 'Egypt', icon: '𓂀', isPlayer: false,
    cx: 322, cy: 418,
    poly: [[242,360],[282,350],[335,354],[385,360],[432,380],[445,416],[432,460],[408,498],[372,520],[330,528],[288,515],[250,498],[228,465],[222,425]],
    fillColor: '#302800', borderColor: '#c8a820',
    desc: 'The eternal grain basket of the world. Egypt exports enormous quantities of grain and gold. They are diplomatic and prefer trade over war.',
    relation: 'friendly',
    exports: {
      grain: { name:'Grain', icon:'🌾', basePrice:2, qty:10 },
      gold:  { name:'Gold',  icon:'◎',  basePrice:5, qty:3 },
    },
    imports: ['copper','bronze','silver'],
    isGrainHub: true,
  },

  // ── Assyria ──────────────────────────────────────────────
  assyria: {
    name: 'Assyria (Assur)', icon: '🦁', isPlayer: false,
    cx: 508, cy: 215,
    poly: [[448,148],[495,135],[542,140],[572,158],[582,190],[570,224],[545,250],[510,262],[472,255],[448,232],[438,200]],
    fillColor: '#281808', borderColor: '#c06020',
    desc: 'The great trading empire of the north. Assyrian merchants operate the tin routes from Afghanistan via donkey caravans through Kanesh. Without them, there is no tin.',
    relation: 'neutral',
    exports: {
      tin:    { name:'Tin',    icon:'🔩', basePrice:6, qty:5 },
      silver: { name:'Silver', icon:'🥈', basePrice:5, qty:4 },
    },
    imports: ['bronze','grain'],
    isTinSource: true,
  },

  // ── Babylon ──────────────────────────────────────────────
  babylon: {
    name: 'Babylon', icon: '🏛', isPlayer: false,
    cx: 558, cy: 322,
    poly: [[472,260],[540,248],[578,255],[612,268],[625,298],[618,338],[600,368],[568,390],[535,398],[502,382],[480,352],[468,318],[465,282]],
    fillColor: '#101828', borderColor: '#2060a0',
    desc: 'Ancient city of Hammurabi. The heart of Mesopotamia, rich in gold and tin routed from the east. A distant but worthy trading partner.',
    relation: 'neutral',
    exports: {
      tin:  { name:'Tin',  icon:'🔩', basePrice:7, qty:4 },
      gold: { name:'Gold', icon:'◎',  basePrice:5, qty:4 },
    },
    imports: ['bronze','grain','silver'],
  },

  // ── Elam / Susa ──────────────────────────────────────────
  elam: {
    name: 'Elam (Susa)', icon: '🔶', isPlayer: false,
    cx: 648, cy: 312,
    poly: [[602,260],[648,248],[688,252],[718,275],[730,312],[725,352],[702,385],[668,410],[632,415],[600,390],[580,355],[578,318]],
    fillColor: '#201010', borderColor: '#903020',
    desc: 'Far eastern kingdom at the edge of the known world. Expensive to trade with but holds eastern gold and silver.',
    relation: 'neutral',
    exports: {
      silver: { name:'Silver', icon:'🥈', basePrice:5, qty:3 },
      gold:   { name:'Gold',   icon:'◎',  basePrice:5, qty:3 },
    },
    imports: ['bronze','grain'],
  },
};

// ─── BASE MARKET PRICES (gold per unit) ─────────────────────
const BASE_PRICES = {
  grain:     2,
  copper:    3,
  tin:       6,
  bronze:    10,
  silver:    5,
  gold:      1,   // gold buys itself at par, conceptually
  olive_oil: 4,
  pottery:   3,
  timber:    3,
  horses:    8,
  purple_dye:8,
};

// ─── HISTORICAL EVENTS ──────────────────────────────────────
const EVENTS = [
  {
    turn: 1,
    icon: '⚔',
    title: 'The Reign Begins',
    text: 'You have taken the throne of Wilusa. The Hittite Empire dominates the land. As their vassal, you owe tribute each year — but the sea-lanes are open, and trade flows freely. Establish your routes while times are good.',
    effects: [],
  },
  {
    turn: 2,
    icon: '🌊',
    title: 'Mycenaean Pirates',
    text: 'Mycenaean raiders are preying on trade ships in the Aegean. The sea lanes grow dangerous. Sea transport costs rise.',
    effects: [
      { type: 'price_mod', resource: 'olive_oil', regionId: 'mycenae', mult: 1.3, desc: 'Aegean trade disrupted' },
    ],
    logText: 'Mycenaean pirates raid Aegean shipping lanes.',
    logClass: 'log-crisis',
  },
  {
    turn: 3,
    icon: '📜',
    title: 'Afghan Tin Disruption',
    text: 'Nomadic migrations in the distant steppes disrupt the tin caravans from Afghanistan. The Assyrian merchants who supply tin via Kanesh report shortages. Tin prices are rising.',
    effects: [
      { type: 'price_global', resource: 'tin', mult: 1.5, desc: 'Tin +50%' },
    ],
    logText: 'Afghan tin routes disrupted — tin prices rising.',
    logClass: 'log-event',
  },
  {
    turn: 4,
    icon: '☀',
    title: 'Drought on the Nile',
    text: 'A prolonged drought has reduced the Nile flood. Egypt\'s grain exports are cut sharply. Find alternative grain sources now.',
    effects: [
      { type: 'price_global', resource: 'grain', mult: 1.8, desc: 'Grain +80%' },
      { type: 'reduce_export', regionId: 'egypt', resource: 'grain', amount: 4, desc: 'Egypt grain supply −4' },
    ],
    logText: 'Drought on the Nile — Egyptian grain scarce.',
    logClass: 'log-crisis',
  },
  {
    turn: 5,
    icon: '👑',
    title: 'Hittite Tribute Demand',
    text: 'The Great King of Hatti has sent envoys. He demands double tribute this year — a sign of the Empire\'s growing financial strain. You must pay 6 bronze instead of 3.',
    effects: [
      { type: 'tribute_double', desc: 'Tribute doubles to 6 bronze this turn' },
    ],
    logText: 'Hatti demands double tribute — 6 bronze due.',
    logClass: 'log-tribute',
  },
  {
    turn: 6,
    icon: '🏴‍☠️',
    title: 'The Sea Peoples',
    text: 'Reports arrive of mysterious raiders from the sea — the Egyptians call them "Sea Peoples." They strike without warning, burning coastal villages. Cyprus feels threatened.',
    effects: [
      { type: 'price_global', resource: 'copper', mult: 1.3, desc: 'Copper +30% (Cyprus anxiety)' },
    ],
    logText: 'Sea Peoples first reported in the Eastern Mediterranean.',
    logClass: 'log-crisis',
  },
  {
    turn: 7,
    icon: '⚔',
    title: 'The Trojan War',
    text: 'A great Mycenaean fleet has sailed for your shores! Led by the Achaean kings, they besiege Wilusa. The city walls will be tested. Your garrison must hold.',
    effects: [
      { type: 'siege', attackStrength: 40, desc: 'Mycenaean siege!' },
    ],
    logText: 'MYCENAEAN FORCES BESIEGE TROY!',
    logClass: 'log-crisis',
    isSiege: true,
  },
  {
    turn: 8,
    icon: '🔥',
    title: 'Cyprus Burns',
    text: 'The Sea Peoples have sacked the great copper cities of Cyprus. Enkomi, Kition — burning. Copper shipments have ceased. Your bronze production is in crisis.',
    effects: [
      { type: 'destroy_region', regionId: 'cyprus', desc: 'Cyprus destroyed' },
      { type: 'price_global', resource: 'copper', mult: 3.0, desc: 'Copper TRIPLES in price' },
      { type: 'price_global', resource: 'bronze', mult: 2.0, desc: 'Bronze doubles in price' },
    ],
    logText: 'Cyprus sacked by Sea Peoples — copper supply DESTROYED.',
    logClass: 'log-crisis',
  },
  {
    turn: 9,
    icon: '🌋',
    title: 'Earthquakes',
    text: 'A series of devastating earthquakes strikes Anatolia. Several cities are damaged. Your walls crack.',
    effects: [
      { type: 'damage_walls', amount: 1, desc: 'Walls −1 level (earthquake damage)' },
    ],
    logText: 'Earthquake damages Troy\'s walls.',
    logClass: 'log-crisis',
  },
  {
    turn: 10,
    icon: '💀',
    title: 'Ugarit Falls',
    text: 'Ugarit — the greatest trading city in the world — has been burned to the ground. A merchant wrote his last letter: "The ships have gone. We cannot save ourselves." The tin routes through the Levant are severed forever.',
    effects: [
      { type: 'destroy_region', regionId: 'ugarit', desc: 'Ugarit destroyed' },
      { type: 'price_global', resource: 'tin', mult: 2.5, desc: 'Tin prices SKYROCKET' },
    ],
    logText: 'UGARIT HAS FALLEN. The great trade hub is gone.',
    logClass: 'log-crisis',
  },
  {
    turn: 11,
    icon: '🌑',
    title: 'Hatti Collapses',
    text: 'The Hittite Empire — your overlord for a century — has collapsed. Hattusa has been burned and abandoned. The Great King is gone. Troy is no longer a vassal. You are free — but the world order has ended.',
    effects: [
      { type: 'free_from_vassalage', desc: 'No more tribute to Hatti' },
      { type: 'destroy_region', regionId: 'hatti', desc: 'Hatti destroyed' },
    ],
    logText: 'HATTI COLLAPSES. Troy is FREE — but the world is in chaos.',
    logClass: 'log-event',
  },
  {
    turn: 12,
    icon: '🏴‍☠️',
    title: 'Sea Peoples Invade Egypt',
    text: 'The Sea Peoples have reached Egypt. Pharaoh Ramesses III fights them at the Nile Delta. Egypt survives but barely — grain exports are cut off entirely for a year.',
    effects: [
      { type: 'reduce_export', regionId: 'egypt', resource: 'grain', amount: 8, desc: 'Egypt grain halted' },
      { type: 'price_global', resource: 'grain', mult: 2.0, desc: 'Grain prices double' },
    ],
    logText: 'Sea Peoples invade Egypt. Grain crisis begins.',
    logClass: 'log-crisis',
  },
  {
    turn: 13,
    icon: '🔥',
    title: 'Anatolia Burns',
    text: 'City after city in Anatolia is abandoned or burned. Arzawa collapses. The darkness spreads. Troy stands increasingly alone.',
    effects: [
      { type: 'destroy_region', regionId: 'arzawa', desc: 'Arzawa falls' },
      { type: 'destroy_region', regionId: 'crete', desc: 'Crete collapses' },
    ],
    logText: 'Arzawa and Crete collapse. The dark age spreads.',
    logClass: 'log-crisis',
  },
  {
    turn: 14,
    icon: '🛡',
    title: 'Mycenae Falls',
    text: 'The great citadels of Mycenae and Tiryns have been abandoned. The Achaean kingdoms that once threatened you are no more. The Aegean falls silent.',
    effects: [
      { type: 'destroy_region', regionId: 'mycenae', desc: 'Mycenae falls' },
    ],
    logText: 'Mycenae collapses. The Aegean is dark.',
    logClass: 'log-event',
  },
  {
    turn: 15,
    icon: '⚔',
    title: 'Final Stand',
    text: 'The Bronze Age is ending. Civilizations that stood for centuries have crumbled. Troy still stands. Will you endure to the dawn of a new age — or will this be your final year?',
    effects: [],
    logText: 'The final year. Can Troy survive?',
    logClass: 'log-event',
    isFinal: true,
  },
];

// ─── GAME STATE ──────────────────────────────────────────────
const G = {
  turn: 1,
  maxTurns: 15,

  // Resources
  res: {
    grain: 20, copper: 8, tin: 4, bronze: 6, gold: 20,
    silver: 0, olive_oil: 0, pottery: 0, timber: 0, horses: 0,
  },

  // City
  population: 100,
  walls: 3,          // 1-5
  maxWalls: 5,
  garrison: 15,
  vassalOfHatti: true,
  tributeDoubleThisTurn: false,
  actionsDone: new Set(),  // actions performed this turn

  // Market price multipliers (affected by events)
  priceMult: {
    grain: 1, copper: 1, tin: 1, bronze: 1,
    silver: 1, olive_oil: 1, pottery: 1, timber: 1, horses: 1, purple_dye: 1,
  },

  // Region state (can be destroyed, hostile, etc.)
  regionState: {},  // keyed by regionId: { destroyed, relation, exportMods }

  // Trade this turn
  tradeDoneThisTurn: false,

  // Log
  log: [],

  addLog(text, cls='log-norm') {
    this.log.unshift({ text, cls });
    if (this.log.length > 40) this.log.pop();
    renderLog();
  }
};

// Init region state
Object.keys(REGIONS).forEach(id => {
  const r = REGIONS[id];
  G.regionState[id] = {
    destroyed: false,
    relation: r.relation,
    exportMods: {},   // resource qty mods
    priceMods: {},    // resource price mods
  };
});

// ─── RESOURCE PRODUCTION (per turn) ─────────────────────────
function getTroyProduction() {
  return {
    grain:  4,   // Troad farmland
    gold:   5,   // Hellespont tolls
    copper: 0,
    tin:    0,
    bronze: 0,
  };
}

function popGrainConsumption() {
  // 3 grain per 100 pop, scales linearly
  return Math.max(1, Math.ceil((G.population / 100) * 3));
}

function garrisonGoldCost() {
  return Math.floor(G.garrison / 5);
}

// ─── CRAFTING (Bronze from Copper + Tin) ────────────────────
// 2 copper + 1 tin → 1 bronze (max 4/turn)
function canCraft(qty) {
  return G.res.copper >= qty * 2 && G.res.tin >= qty;
}

function craftBronze(qty) {
  if (!canCraft(qty)) return false;
  G.res.copper -= qty * 2;
  G.res.tin    -= qty;
  G.res.bronze += qty;
  G.addLog(`Forged ${qty} Bronze from Copper and Tin.`, 'log-good');
  return true;
}

// ─── GET EFFECTIVE PRICE ─────────────────────────────────────
function getPrice(resource, regionId) {
  let p = BASE_PRICES[resource] || 1;
  p *= G.priceMult[resource] || 1;
  if (regionId) {
    const rs = G.regionState[regionId];
    if (rs && rs.priceMods[resource]) p *= rs.priceMods[resource];
  }
  return Math.max(1, Math.round(p * 10) / 10);
}

// ─── TRIBUTE TO HATTI ────────────────────────────────────────
function payTribute() {
  if (!G.vassalOfHatti) return;
  const due = G.tributeDoubleThisTurn ? 6 : 3;
  if (G.res.bronze >= due) {
    G.res.bronze -= due;
    G.addLog(`Paid ${due} Bronze tribute to Hatti.`, 'log-tribute');
  } else {
    // Can't pay — Hatti is displeased
    G.addLog(`⚠ Failed to pay tribute to Hatti! They grow angry.`, 'log-crisis');
    // Add threat later
  }
  G.tributeDoubleThisTurn = false;
}

// ─── FEED POPULATION ─────────────────────────────────────────
function feedPopulation() {
  const need = popGrainConsumption();
  if (G.res.grain >= need) {
    G.res.grain -= need;
    // Slight population growth
    if (G.population < 100) G.population = Math.min(100, G.population + 2);
  } else {
    const deficit = need - G.res.grain;
    G.res.grain = 0;
    const loss = Math.ceil(deficit * 8);
    G.population = Math.max(0, G.population - loss);
    G.addLog(`Famine! Population falls by ${loss} (not enough grain).`, 'log-crisis');
  }
}

// ─── SIEGE RESOLUTION ────────────────────────────────────────
function resolveSiege(attackStrength) {
  const defense = G.garrison + G.walls * 8;
  if (defense >= attackStrength) {
    // Troy holds!
    const garrisonLoss = Math.floor(G.garrison * 0.3);
    G.garrison -= garrisonLoss;
    G.addLog(`Troy HELD the siege! Garrison lost ${garrisonLoss} warriors.`, 'log-good');
    return true;
  } else {
    // Partially breached
    G.walls = Math.max(0, G.walls - 1);
    const garrisonLoss = Math.floor(G.garrison * 0.5);
    G.garrison -= garrisonLoss;
    G.addLog(`Troy's walls were breached! Walls −1, garrison lost ${garrisonLoss}.`, 'log-crisis');
    if (G.walls === 0) {
      endGame(false, 'Troy has fallen. The walls are broken and the city is sacked. History will remember this as the end of an age.');
    }
    return false;
  }
}

// ─── APPLY EVENT EFFECTS ─────────────────────────────────────
function applyEffects(effects) {
  const summary = [];
  effects.forEach(eff => {
    switch (eff.type) {
      case 'price_global':
        G.priceMult[eff.resource] = (G.priceMult[eff.resource] || 1) * eff.mult;
        summary.push({ text: eff.desc, cls: eff.mult > 1 ? 'eff-bad' : 'eff-good' });
        break;
      case 'price_mod':
        if (eff.regionId && G.regionState[eff.regionId]) {
          G.regionState[eff.regionId].priceMods[eff.resource] = eff.mult;
        }
        summary.push({ text: eff.desc, cls: 'eff-warn' });
        break;
      case 'reduce_export':
        if (G.regionState[eff.regionId]) {
          G.regionState[eff.regionId].exportMods[eff.resource] =
            (G.regionState[eff.regionId].exportMods[eff.resource] || 0) - eff.amount;
        }
        summary.push({ text: eff.desc, cls: 'eff-bad' });
        break;
      case 'destroy_region':
        G.regionState[eff.regionId].destroyed = true;
        G.regionState[eff.regionId].relation = 'destroyed';
        summary.push({ text: eff.desc, cls: 'eff-bad' });
        break;
      case 'damage_walls':
        G.walls = Math.max(1, G.walls - eff.amount);
        summary.push({ text: eff.desc, cls: 'eff-bad' });
        break;
      case 'tribute_double':
        G.tributeDoubleThisTurn = true;
        summary.push({ text: eff.desc, cls: 'eff-bad' });
        break;
      case 'free_from_vassalage':
        G.vassalOfHatti = false;
        summary.push({ text: 'Troy is FREE! No more tribute.', cls: 'eff-good' });
        break;
      case 'siege':
        // handled specially in event modal callback
        summary.push({ text: eff.desc, cls: 'eff-bad' });
        break;
    }
  });
  return summary;
}

// ─── CANVAS MAP RENDERING ────────────────────────────────────
const canvas = document.getElementById('map-canvas');
const ctx    = canvas.getContext('2d');

let scaleX = 1, scaleY = 1;
let hoveredRegion = null;
let selectedRegionId = null;

function resizeCanvas() {
  const container = document.getElementById('map-area');
  canvas.width  = container.clientWidth;
  canvas.height = container.clientHeight;
  scaleX = canvas.width  / REF_W;
  scaleY = canvas.height / REF_H;
}

function sp(x, y) {
  // scale reference coords to canvas coords
  return [x * scaleX, y * scaleY];
}

function drawMap() {
  const w = canvas.width, h = canvas.height;

  // ── 1. Background: sea ───────────────────────────────────
  const seaGrad = ctx.createRadialGradient(w*0.4, h*0.5, 0, w*0.4, h*0.5, w*0.7);
  seaGrad.addColorStop(0, '#0e2e4e');
  seaGrad.addColorStop(1, '#050e1a');
  ctx.fillStyle = seaGrad;
  ctx.fillRect(0, 0, w, h);

  // ── 2. Sea labels ─────────────────────────────────────────
  const seaLabels = [
    { text: 'BLACK SEA',        x: 330, y: 48 },
    { text: 'CASPIAN SEA',      x: 695, y: 75 },
    { text: 'AEGEAN SEA',       x: 125, y: 265 },
    { text: 'MEDITERRANEAN SEA',x: 220, y: 380 },
    { text: 'RED SEA',          x: 305, y: 465 },
    { text: 'PERSIAN GULF',     x: 600, y: 455 },
  ];
  ctx.font = `italic ${Math.round(9 * Math.min(scaleX, scaleY))}px Georgia`;
  ctx.fillStyle = 'rgba(100,160,200,0.45)';
  ctx.textAlign = 'center';
  seaLabels.forEach(l => {
    const [x, y] = sp(l.x, l.y);
    ctx.fillText(l.text, x, y);
  });

  // ── 3. Draw all regions ───────────────────────────────────
  Object.entries(REGIONS).forEach(([id, region]) => {
    drawRegion(id, region);
  });

  // ── 4. Draw Troy special marker ───────────────────────────
  const [tx, ty] = sp(182, 162);
  // Pulsing ring
  ctx.beginPath();
  ctx.arc(tx, ty, 10 * Math.min(scaleX, scaleY), 0, Math.PI * 2);
  ctx.strokeStyle = '#d4a017';
  ctx.lineWidth   = 2;
  ctx.stroke();

  // Star
  ctx.fillStyle = '#d4a017';
  ctx.font = `${Math.round(14 * Math.min(scaleX, scaleY))}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', tx, ty);

  // ── 5. City name labels on map ────────────────────────────
  const cityLabels = [
    { text:'TROY',    x:182, y:142 },
    { text:'HATTUSA', x:355, y:135 },
    { text:'NINEVEH', x:490, y:195 },
    { text:'BABYLON', x:548, y:300 },
    { text:'THEBES',  x:338, y:482 },
    { text:'UGARIT',  x:420, y:220 },
    { text:'MYCENAE', x:75,  y:195 },
    { text:'KNOSSOS', x:130, y:310 },
    { text:'SUSA',    x:648, y:290 },
  ];

  ctx.font = `${Math.round(8 * Math.min(scaleX, scaleY))}px Georgia`;
  ctx.fillStyle = 'rgba(230,210,160,0.6)';
  ctx.textAlign = 'center';
  cityLabels.forEach(l => {
    if (G.regionState[l.text?.toLowerCase()]?.destroyed) return;
    const [x, y] = sp(l.x, l.y);
    ctx.fillText(l.text, x, y);
  });
}

function drawRegion(id, region) {
  if (!region.poly || region.poly.length < 3) return;

  const rs    = G.regionState[id];
  const hov   = hoveredRegion === id;
  const sel   = selectedRegionId === id;
  const isPlayer = region.isPlayer;
  const destroyed = rs?.destroyed;

  // Build path
  ctx.beginPath();
  region.poly.forEach(([rx, ry], i) => {
    const [x, y] = sp(rx, ry);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();

  // Fill
  let fillColor = region.fillColor;
  if (destroyed)      fillColor = '#1a1212';
  else if (hov)       fillColor = lighten(region.fillColor, 0.4);
  else if (sel)       fillColor = lighten(region.fillColor, 0.25);
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Border
  ctx.strokeStyle = destroyed ? '#2a2020'
                  : sel ? '#f0e080'
                  : hov ? lighten(region.borderColor, 0.5)
                  : region.borderColor;
  ctx.lineWidth   = (sel || (isPlayer)) ? 2.5 * Math.min(scaleX, scaleY) : 1.2 * Math.min(scaleX, scaleY);
  ctx.stroke();

  // Region label
  if (!isPlayer) {
    const [cx, cy] = sp(region.cx, region.cy);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Name
    const fontSize = Math.round(9.5 * Math.min(scaleX, scaleY));
    ctx.font = `bold ${fontSize}px Georgia`;
    ctx.fillStyle = destroyed ? 'rgba(100,80,60,0.4)'
                  : hov || sel ? 'rgba(255,240,180,0.9)'
                  : 'rgba(220,195,140,0.75)';
    ctx.fillText(region.name.split(' ')[0], cx, cy);

    // Destroyed overlay
    if (destroyed) {
      ctx.font = `${Math.round(14 * Math.min(scaleX, scaleY))}px serif`;
      ctx.fillStyle = 'rgba(180,60,40,0.6)';
      ctx.fillText('✕', cx, cy + 12 * scaleY);
    }
  }
}

function lighten(hex, amount) {
  // Parse hex to rgb
  let r = parseInt(hex.slice(1,3),16);
  let g = parseInt(hex.slice(3,5),16);
  let b = parseInt(hex.slice(5,7),16);
  r = Math.min(255, Math.round(r + (255 - r) * amount));
  g = Math.min(255, Math.round(g + (255 - g) * amount));
  b = Math.min(255, Math.round(b + (255 - b) * amount));
  return `rgb(${r},${g},${b})`;
}

function pointInPoly(px, py, poly) {
  let inside = false;
  const n = poly.length;
  for (let i = 0, j = n-1; i < n; j = i++) {
    const [xi, yi] = [poly[i][0] * scaleX, poly[i][1] * scaleY];
    const [xj, yj] = [poly[j][0] * scaleX, poly[j][1] * scaleY];
    if (((yi > py) !== (yj > py)) && (px < (xj-xi)*(py-yi)/(yj-yi)+xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function getRegionAtPoint(px, py) {
  // Check all regions (in reverse draw order so top-most wins)
  const ids = Object.keys(REGIONS);
  for (let i = ids.length - 1; i >= 0; i--) {
    const id = ids[i];
    const region = REGIONS[id];
    if (region.poly && pointInPoly(px, py, region.poly)) return id;
  }
  return null;
}

// Canvas mouse events
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;
  const id = getRegionAtPoint(px, py);

  hoveredRegion = id;
  drawMap();

  const tooltip = document.getElementById('map-tooltip');
  if (id && id !== 'troy') {
    const r  = REGIONS[id];
    const rs = G.regionState[id];
    const status = rs.destroyed ? '💀 Destroyed' : getRelationLabel(rs.relation);
    let html = `<b style="color:${r.borderColor}">${r.icon} ${r.name}</b><br>${status}`;
    if (!rs.destroyed && !r.noTrade) {
      const exports = Object.entries(r.exports || {})
        .map(([res,_]) => `${r.exports[res].icon} ${res} @ ◎${getPrice(res, id)}`)
        .join(', ');
      if (exports) html += `<br><span style="color:#6a8050">Exports: ${exports}</span>`;
    }
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
    tooltip.style.left = (e.clientX + 14) + 'px';
    tooltip.style.top  = (e.clientY - 8)  + 'px';
  } else {
    tooltip.style.display = 'none';
  }
});

canvas.addEventListener('mouseleave', () => {
  hoveredRegion = null;
  document.getElementById('map-tooltip').style.display = 'none';
  drawMap();
});

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const id = getRegionAtPoint(e.clientX - rect.left, e.clientY - rect.top);
  if (!id || id === 'troy') return;
  selectedRegionId = id;
  drawMap();
  renderRegionInfo(id);
});

// ─── UI RENDERING ────────────────────────────────────────────
function renderAll() {
  renderTopBar();
  renderCityStats();
  renderActions();
  renderMarket();
  drawMap();
}

function renderTopBar() {
  document.getElementById('r-grain').textContent  = G.res.grain;
  document.getElementById('r-copper').textContent = G.res.copper;
  document.getElementById('r-tin').textContent    = G.res.tin;
  document.getElementById('r-bronze').textContent = G.res.bronze;
  document.getElementById('r-gold').textContent   = G.res.gold;

  const prod = getTroyProduction();
  const needGrain = popGrainConsumption();
  const grainNet  = prod.grain - needGrain;
  setRate('rr-grain',  grainNet);
  setRate('rr-copper', prod.copper);
  setRate('rr-tin',    prod.tin);
  setRate('rr-bronze', 0);
  setRate('rr-gold',   prod.gold - garrisonGoldCost());

  const year = 1250 - (G.turn - 1) * 7;
  document.getElementById('year-label').textContent  = `${year} BCE`;
  document.getElementById('turn-label').textContent  = `Year ${G.turn} of ${G.maxTurns}`;
  document.getElementById('vassal-status').textContent =
    G.vassalOfHatti ? `Vassal of Hatti · ${G.tributeDoubleThisTurn?6:3}⚙ tribute/yr` : 'Free City';
  document.getElementById('vassal-status').style.color = G.vassalOfHatti ? '#8a5a20' : '#50a050';
}

function setRate(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = (val >= 0 ? '+' : '') + val;
  el.className   = 'res-rate' + (val < 0 ? ' neg' : val === 0 ? ' warn' : '');
}

function renderCityStats() {
  // Population bar
  const popPct = (G.population / 100) * 100;
  document.getElementById('bar-pop').style.width  = popPct + '%';
  document.getElementById('val-pop').textContent  = G.population;

  // Walls pips
  const pips = document.getElementById('wall-pips');
  pips.innerHTML = '';
  for (let i = 1; i <= G.maxWalls; i++) {
    const d = document.createElement('div');
    d.className = 'wall-pip' + (i <= G.walls ? ' active' : '');
    pips.appendChild(d);
  }
  document.getElementById('val-walls').textContent  = `${G.walls}/${G.maxWalls}`;

  // Garrison bar
  const armyPct = Math.min(100, (G.garrison / 50) * 100);
  document.getElementById('bar-army').style.width  = armyPct + '%';
  document.getElementById('val-army').textContent  = G.garrison;
}

function renderActions() {
  const container = document.getElementById('action-list');
  const done = G.actionsDone;
  const r = G.res;

  const actions = [
    {
      id: 'craft',
      label: `⚙ Forge Bronze (×2)`,
      cost: `⚒4 🔩2`,
      enabled: canCraft(2) && !done.has('craft'),
      fn: () => { craftBronze(2); done.add('craft'); renderAll(); }
    },
    {
      id: 'craft1',
      label: `⚙ Forge Bronze (×1)`,
      cost: `⚒2 🔩1`,
      enabled: canCraft(1) && !done.has('craft1'),
      fn: () => { craftBronze(1); done.add('craft1'); renderAll(); }
    },
    {
      id: 'recruit',
      label: `⚔ Recruit Warriors (+5)`,
      cost: `🌾3 ◎2`,
      enabled: r.grain >= 3 && r.gold >= 2 && !done.has('recruit'),
      fn: () => {
        r.grain -= 3; r.gold -= 2;
        G.garrison += 5;
        done.add('recruit');
        G.addLog('Recruited 5 warriors for the garrison.', 'log-good');
        renderAll();
      }
    },
    {
      id: 'walls',
      label: `🏰 Repair/Upgrade Walls (+1)`,
      cost: `⚙5`,
      enabled: r.bronze >= 5 && G.walls < G.maxWalls && !done.has('walls'),
      fn: () => {
        r.bronze -= 5;
        G.walls = Math.min(G.maxWalls, G.walls + 1);
        done.add('walls');
        G.addLog('Walls reinforced. Defense increases.', 'log-good');
        renderAll();
      }
    },
    {
      id: 'stockpile',
      label: `🌾 Build Grain Stockpile (+5)`,
      cost: `◎4`,
      enabled: r.gold >= 4 && !done.has('stockpile'),
      fn: () => {
        r.gold -= 4;
        r.grain += 5;
        done.add('stockpile');
        G.addLog('Bought additional grain stores.', 'log-good');
        renderAll();
      }
    },
  ];

  container.innerHTML = actions.map(a =>
    `<button class="action-item" data-id="${a.id}" ${!a.enabled ? 'disabled' : ''}>
      ${a.label} <span class="action-cost">${a.cost}</span>
    </button>`
  ).join('');

  actions.forEach(a => {
    const btn = container.querySelector(`[data-id="${a.id}"]`);
    if (btn && a.enabled) btn.addEventListener('click', a.fn);
  });
}

function renderMarket() {
  const resources = ['grain','copper','tin','bronze'];
  const icons = { grain:'🌾', copper:'⚒', tin:'🔩', bronze:'⚙' };
  const el = document.getElementById('market-prices');
  el.innerHTML = resources.map(res => {
    const price    = getPrice(res);
    const base     = BASE_PRICES[res];
    const cls      = price > base * 1.3 ? 'rising' : price < base * 0.8 ? 'falling' : '';
    const arrow    = price > base * 1.3 ? '↑' : price < base * 0.8 ? '↓' : '';
    return `<div class="mkt-item">
      <div class="mkt-icon">${icons[res]}</div>
      <div class="mkt-name">${res.charAt(0).toUpperCase()+res.slice(1)}</div>
      <div class="mkt-price ${cls}">◎${price.toFixed(1)} ${arrow}</div>
    </div>`;
  }).join('');
}

function renderRegionInfo(id) {
  const region = REGIONS[id];
  const rs     = G.regionState[id];
  const container = document.getElementById('trade-content');

  if (rs.destroyed) {
    container.innerHTML = `
      <div class="region-info-card">
        <div class="ri-name">${region.icon} ${region.name}</div>
        <span class="ri-status status-gone">💀 DESTROYED</span>
        <p class="ri-desc" style="margin-top:8px">${region.desc}</p>
        <p class="ri-desc" style="color:#3a2010">This region has been destroyed during the collapse. Trade is no longer possible.</p>
      </div>`;
    return;
  }

  if (region.noTrade) {
    container.innerHTML = `
      <div class="region-info-card">
        <div class="ri-name">${region.icon} ${region.name}</div>
        <span class="ri-status status-hostile">⚔ HOSTILE</span>
        <p class="ri-desc" style="margin-top:8px">${region.desc}</p>
      </div>`;
    return;
  }

  const exports = Object.entries(region.exports || {});
  const statusCls   = { friendly:'status-ok', neutral:'status-ok', overlord:'status-warn', suspicious:'status-warn', hostile:'status-hostile', destroyed:'status-gone' };
  const statusLabel = getRelationLabel(rs.relation);

  container.innerHTML = `
    <div class="region-info-card">
      <div class="ri-name">${region.icon} ${region.name}</div>
      <span class="ri-status ${statusCls[rs.relation] || 'status-ok'}">${statusLabel}</span>
      <p class="ri-desc">${region.desc}</p>
      ${exports.length > 0 ? `
        <div class="ri-exports">Exports: ${exports.map(([res,info]) => {
          const qty = Math.max(0, info.qty + (rs.exportMods[res] || 0));
          const price = getPrice(res, id);
          return `${info.icon} ${info.name} ×${qty} @ ◎${price.toFixed(1)}`;
        }).join(' · ')}</div>` : ''}
      ${exports.length > 0 ? `<button class="open-trade-btn" id="open-trade-${id}">Open Trade ▶</button>` : ''}
    </div>`;

  document.getElementById(`open-trade-${id}`)?.addEventListener('click', () => openTradeModal(id));
}

function getRelationLabel(rel) {
  return {
    player:    '⚔ Your City',
    friendly:  '✓ Friendly',
    neutral:   '~ Neutral',
    overlord:  '👑 Overlord',
    suspicious:'⚠ Suspicious',
    hostile:   '☠ Hostile',
    destroyed: '💀 Destroyed',
  }[rel] || rel;
}

function renderLog() {
  const el = document.getElementById('log-entries');
  el.innerHTML = G.log.slice(0, 15).map(e =>
    `<div class="log-entry ${e.cls}">${e.text}</div>`
  ).join('');
}

// ─── TRADE MODAL ─────────────────────────────────────────────
// Cart: { [resourceId]: { qty, type:'buy'|'sell' } }
let tradeCart = {};
let currentTradeRegionId = null;

function openTradeModal(regionId) {
  const region = REGIONS[regionId];
  const rs     = G.regionState[regionId];
  tradeCart = {};
  currentTradeRegionId = regionId;

  document.getElementById('tmod-region-icon').textContent = region.icon;
  document.getElementById('tmod-region-name').textContent = region.name;
  document.getElementById('tmod-region-status').textContent = getRelationLabel(rs.relation);
  document.getElementById('tmod-desc').textContent = region.desc;

  renderTradeGoods(regionId);
  document.getElementById('trade-modal').style.display = 'flex';
}

function renderTradeGoods(regionId) {
  const region  = REGIONS[regionId];
  const rs      = G.regionState[regionId];
  const exports = Object.entries(region.exports || {});
  const container = document.getElementById('tmod-goods');

  if (exports.length === 0) {
    container.innerHTML = '<p style="color:#4a3010;font-size:0.8em;padding:10px">Nothing available to trade.</p>';
    return;
  }

  container.innerHTML = exports.map(([resId, info]) => {
    const availQty = Math.max(0, info.qty + (rs.exportMods[resId] || 0));
    const price    = getPrice(resId, regionId);
    const cart     = tradeCart[resId] || { qty: 0 };
    const priceClass = price > BASE_PRICES[resId] * 1.4 ? 'expensive' : price < BASE_PRICES[resId] * 0.8 ? 'cheap' : '';
    const canAffordMore = G.res.gold >= price * (cart.qty + 1);

    return `<div class="trade-good-row" data-res="${resId}">
      <div class="tg-icon">${info.icon}</div>
      <div class="tg-name">${info.name}<br><span style="font-size:0.8em;color:#5a4020">Available: ${availQty} units</span></div>
      <div class="tg-price ${priceClass}">◎<span>${price.toFixed(1)}</span>/unit</div>
      <div class="tg-controls">
        <button class="qty-btn" data-res="${resId}" data-dir="-1">−</button>
        <span class="qty-val" id="qty-${resId}">${cart.qty}</span>
        <button class="qty-btn" data-res="${resId}" data-dir="1" ${!canAffordMore || cart.qty >= availQty ? 'disabled' : ''}>+</button>
      </div>
      <div class="tg-subtotal" id="sub-${resId}">◎${(price * cart.qty).toFixed(0)}</div>
      <span class="tg-label">BUY</span>
    </div>`;
  }).join('');

  // Wire quantity buttons
  container.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const res  = btn.dataset.res;
      const dir  = parseInt(btn.dataset.dir);
      const info = region.exports[res];
      const availQty = Math.max(0, info.qty + (rs.exportMods[res] || 0));
      const price    = getPrice(res, regionId);
      const current  = tradeCart[res]?.qty || 0;

      let newQty = Math.max(0, Math.min(availQty, current + dir));
      // Check gold
      if (dir > 0 && G.res.gold < price * (current + 1)) return;

      tradeCart[res] = { qty: newQty };
      document.getElementById(`qty-${res}`).textContent = newQty;
      document.getElementById(`sub-${res}`).textContent = `◎${(price * newQty).toFixed(0)}`;

      updateCartSummary(regionId);
      renderTradeGoods(regionId); // re-render to update disabled states
    });
  });

  updateCartSummary(regionId);
}

function updateCartSummary(regionId) {
  let totalCost = 0;
  let items = [];

  Object.entries(tradeCart).forEach(([resId, entry]) => {
    if (entry.qty <= 0) return;
    const price = getPrice(resId, regionId);
    const cost  = price * entry.qty;
    totalCost  += cost;
    items.push(`${entry.qty}× ${resId}`);
  });

  const summary = document.getElementById('tmod-cart-summary');
  const confirm = document.getElementById('tmod-confirm');

  if (items.length === 0) {
    summary.textContent = 'No items selected.';
    confirm.disabled    = true;
  } else {
    summary.innerHTML = `${items.join(', ')}<br>Total: <b style="color:#d4a017">◎${totalCost.toFixed(1)}</b>`;
    confirm.disabled  = totalCost > G.res.gold;
  }
}

document.getElementById('tmod-close').addEventListener('click', () => {
  document.getElementById('trade-modal').style.display = 'none';
});

document.getElementById('tmod-confirm').addEventListener('click', () => {
  if (!currentTradeRegionId) return;

  let totalCost = 0;
  const bought  = [];

  Object.entries(tradeCart).forEach(([resId, entry]) => {
    if (entry.qty <= 0) return;
    const price = getPrice(resId, currentTradeRegionId);
    const cost  = price * entry.qty;
    totalCost  += cost;
    G.res[resId] = (G.res[resId] || 0) + entry.qty;
    bought.push(`${entry.qty}× ${resId}`);
  });

  G.res.gold -= totalCost;

  const regionName = REGIONS[currentTradeRegionId].name;
  G.addLog(`Traded with ${regionName}: bought ${bought.join(', ')} for ◎${totalCost.toFixed(0)}.`, 'log-trade');

  document.getElementById('trade-modal').style.display = 'none';
  G.tradeDoneThisTurn = true;
  tradeCart = {};
  renderAll();
});

// ─── EVENT MODAL ─────────────────────────────────────────────
let pendingEventCb = null;

function showEventModal(ev, effectSummary, onContinue) {
  document.getElementById('emod-icon').textContent  = ev.icon;
  document.getElementById('emod-title').textContent = ev.title;
  document.getElementById('emod-text').textContent  = ev.text;

  const effectsEl = document.getElementById('emod-effects');
  effectsEl.innerHTML = effectSummary.map(e =>
    `<div class="effect-line ${e.cls}">${e.text}</div>`
  ).join('');

  pendingEventCb = onContinue;
  document.getElementById('event-modal').style.display = 'flex';
  document.getElementById('next-turn-btn').disabled = true;
}

document.getElementById('emod-continue').addEventListener('click', () => {
  document.getElementById('event-modal').style.display = 'none';
  document.getElementById('next-turn-btn').disabled = false;
  if (pendingEventCb) { pendingEventCb(); pendingEventCb = null; }
});

// ─── NEXT TURN ───────────────────────────────────────────────
document.getElementById('next-turn-btn').addEventListener('click', () => {
  advanceTurn();
});

function advanceTurn() {
  G.actionsDone.clear();
  G.tradeDoneThisTurn = false;

  // 1. Collect production
  const prod = getTroyProduction();
  G.res.grain  += prod.grain;
  G.res.gold   += prod.gold - garrisonGoldCost();

  // 2. Pay tribute
  if (G.vassalOfHatti) payTribute();

  // 3. Feed population
  feedPopulation();

  // 4. Check starvation
  if (G.population <= 0) {
    endGame(false, 'Your people have starved. The city of Troy falls silent, its population gone. The Bronze Age claims another victim.');
    return;
  }

  // 5. Advance turn
  G.turn++;

  // 6. Process scripted event (if any for new turn)
  const ev = EVENTS.find(e => e.turn === G.turn);
  if (ev) {
    const summary = applyEffects(ev.effects);

    if (ev.logText) G.addLog(ev.logText, ev.logClass);

    if (ev.isSiege) {
      // siege resolved after modal
      showEventModal(ev, summary, () => {
        const siegeEff = ev.effects.find(e => e.type === 'siege');
        if (siegeEff) resolveSiege(siegeEff.attackStrength);
        checkVictory();
        renderAll();
      });
    } else if (ev.isFinal) {
      showEventModal(ev, summary, () => {
        // Final turn - after they click continue, game proceeds normally
        renderAll();
      });
    } else {
      showEventModal(ev, summary, () => {
        renderAll();
      });
    }
  }

  // 7. Check victory (after final turn)
  if (G.turn > G.maxTurns) {
    checkVictory();
    return;
  }

  renderAll();
}

function checkVictory() {
  if (G.turn > G.maxTurns) {
    if (G.population > 20 && G.walls >= 1) {
      const score = G.population + G.walls * 10 + G.garrison + G.res.bronze * 2 + G.res.gold;
      endGame(true, `Troy has endured 100 years of catastrophe. As other great cities fell to fire and famine, Wilusa stood firm. The Bronze Age has ended — but your city breathes on into the new age. Poets will one day sing of Troy not for its fall, but for its endurance.`, score);
    } else {
      endGame(false, `Troy survived, but barely. Your walls crumble, your people are few. The dark age descends. History will remember Troy as a city that fell with the age that made it.`);
    }
  }
}

function endGame(victory, text, score) {
  document.getElementById('next-turn-btn').disabled = true;
  const screen = document.getElementById('gameover-screen');
  document.getElementById('gameover-icon').textContent   = victory ? '⚔' : '💀';
  document.getElementById('gameover-title').textContent  = victory ? 'TROY ENDURES' : 'TROY FALLS';
  document.getElementById('gameover-title').className    = victory ? 'title-victory' : 'title-defeat';
  document.getElementById('gameover-text').textContent   = text;
  document.getElementById('gameover-score').textContent  = score
    ? `Final Score: ${score} · Year Reached: ${1250 - (Math.min(G.turn, G.maxTurns)-1)*7} BCE`
    : '';
  screen.style.display = 'flex';
}

// ─── START GAME ──────────────────────────────────────────────
document.getElementById('begin-btn').addEventListener('click', () => {
  document.getElementById('intro-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';

  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); drawMap(); });

  // Show turn 1 event
  const firstEv = EVENTS.find(e => e.turn === 1);
  if (firstEv) {
    const summary = applyEffects(firstEv.effects);
    renderAll();
    showEventModal(firstEv, summary, () => { renderAll(); });
  } else {
    renderAll();
  }

  G.addLog('You have taken the throne of Wilusa. Troy stands at the Hellespont.', 'log-event');
});
