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
    fillColor: '#4a2e08', borderColor: '#d4a017',
    desc: 'Your city. Guards the Hellespont, commanding the strait between the Aegean and Black Sea. Your wealth flows from tolls and trade.',
    relation: 'player',
    exports: {},
  },

  // ── Mycenae / Greece ────────────────────────────────────
  mycenae: {
    name: 'Mycenae', icon: '🛡', isPlayer: false,
    cx: 78, cy: 218,
    poly: [[14,170],[50,152],[90,155],[115,172],[128,198],[122,228],[108,260],[86,292],[62,298],[38,288],[16,270],[8,240],[12,200]],
    fillColor: '#2e1e44', borderColor: '#9a5cc0',
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
    fillColor: '#1a2040', borderColor: '#4878b8',
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
    fillColor: '#183520', borderColor: '#4a9038',
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
    fillColor: '#2e1010', borderColor: '#c83028',
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
    fillColor: '#221c0c', borderColor: '#7a6822',
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
    fillColor: '#2a1608', borderColor: '#c87030',
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
    fillColor: '#142a18', borderColor: '#3a8030',
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
    fillColor: '#182810', borderColor: '#588030',
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
    fillColor: '#2e2400', borderColor: '#d4aa20',
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
    fillColor: '#221408', borderColor: '#c86828',
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
    fillColor: '#0e1828', borderColor: '#2870b8',
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
    fillColor: '#1c0e0e', borderColor: '#983828',
    desc: 'Far eastern kingdom at the edge of the known world. Expensive to trade with but holds eastern gold and silver.',
    relation: 'neutral',
    exports: {
      silver: { name:'Silver', icon:'🥈', basePrice:5, qty:3 },
      gold:   { name:'Gold',   icon:'◎',  basePrice:5, qty:3 },
    },
    imports: ['bronze','grain'],
  },
};

// ─── DIPLOMACY PROFILES ──────────────────────────────────────
// Per-region AI behaviour: score drift, military strength, war threshold
// initScore: starting relation (-100 to +100)
// driftPerTurn: score change each turn (negative = naturally declining)
// military: army strength used when declaring war
// warThreshold: score at which they declare war (null = never)
// interests: resources they most value as gifts (+50% effectiveness)
const DIPLO_PROFILE = {
  mycenae: { initScore:  28, driftPerTurn: -2, military: 45, warThreshold: -35, canWar: true,  interests: ['bronze','silver'] },
  crete:   { initScore:  62, driftPerTurn: -1, military:  0, warThreshold: null, canWar: false, interests: ['grain','pottery'] },
  arzawa:  { initScore:  48, driftPerTurn: -1, military: 18, warThreshold: -55, canWar: false,  interests: ['bronze','gold']   },
  hatti:   { initScore:  42, driftPerTurn: -2, military: 65, warThreshold: -22, canWar: true,   interests: ['bronze']          },
  cyprus:  { initScore:  65, driftPerTurn: -1, military:  0, warThreshold: null, canWar: false, interests: ['grain','silver']  },
  ugarit:  { initScore:  52, driftPerTurn: -1, military:  0, warThreshold: null, canWar: false, interests: ['bronze','copper'] },
  canaan:  { initScore:  42, driftPerTurn: -1, military: 12, warThreshold: -60, canWar: false,  interests: ['bronze','copper'] },
  egypt:   { initScore:  62, driftPerTurn: -1, military: 38, warThreshold: -32, canWar: true,   interests: ['copper','silver'] },
  assyria: { initScore:  36, driftPerTurn: -1, military: 28, warThreshold: -45, canWar: true,   interests: ['bronze','grain']  },
  babylon: { initScore:  32, driftPerTurn: -1, military: 18, warThreshold: -55, canWar: false,  interests: ['bronze','grain']  },
  elam:    { initScore:  22, driftPerTurn: -1, military: 12, warThreshold: -65, canWar: false,  interests: ['bronze','silver'] },
  // kashka: always hostile, handled by random raid system — no diplo profile
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

// ─── CITY LIST (attackable city markers on the map) ─────────
// x/y are reference coordinates (820×480 space)
const CITY_LIST = [
  { id:'hattusa',  label:'HATTUSA',  x:355, y:128, region:'hatti'    },
  { id:'nineveh',  label:'NINEVEH',  x:542, y:190, region:'assyria'  },
  { id:'babylon',  label:'BABYLON',  x:552, y:308, region:'babylon'  },
  { id:'thebes',   label:'THEBES',   x:330, y:478, region:'egypt'    },
  { id:'ugarit',   label:'UGARIT',   x:428, y:215, region:'ugarit'   },
  { id:'mycenae',  label:'MYCENAE',  x:72,  y:192, region:'mycenae'  },
  { id:'knossos',  label:'KNOSSOS',  x:128, y:310, region:'crete'    },
  { id:'susa',     label:'SUSA',     x:652, y:288, region:'elam'     },
  { id:'enkomi',   label:'ENKOMI',   x:352, y:278, region:'cyprus'   },
  { id:'ashdod',   label:'ASHDOD',   x:398, y:358, region:'canaan'   },
  { id:'apasa',    label:'APASA',    x:268, y:180, region:'arzawa'   },
];

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
  militia:  10,  // citizen levies — cheap, weaker in battle
  infantry:  5,  // professional soldiers — needs bronze, fights at 1.6× strength
  vassalOfHatti: true,
  tributeDoubleThisTurn: false,
  tributeRefusedThisTurn: false,
  cavalryBonus: 0,  // chariot teams (max 5): +8 defence each, +10% expedition power each

  stability:    75, // 0–100: social cohesion — scales production & battle morale
  ironWorking:  false, // researched iron-working (unlocked turn 7+)
  tollPolicy:   'normal', // 'low' | 'normal' | 'high' — Hellespont toll setting
  droughtLevel: 0,  // 0=good, 1=dry year (−30% grain), 2=severe drought (−55% grain)

  // Local production upgrades (permanent investments)
  production: {
    farmland: 0,   // 0-3 levels: each +2 grain/turn   (cost ◎8 each)
    tollgate: 0,   // 0-2 levels: each +3 gold/turn    (cost ◎12 each)
    smithy:   0,   // 0-2 levels: each +1 bronze/turn  (cost ◎8 + ⚒3 each)
  },

  // Market price multipliers (affected by events)
  priceMult: {
    grain: 1, copper: 1, tin: 1, bronze: 1,
    silver: 1, olive_oil: 1, pottery: 1, timber: 1, horses: 1, purple_dye: 1,
  },

  // Region state (can be destroyed, hostile, etc.)
  regionState: {},  // keyed by regionId: { destroyed, relation, exportMods }

  // Trade this turn
  tradeDoneThisTurn: false,
  lastTradedRegionId: null,

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
  const r    = REGIONS[id];
  const prof = DIPLO_PROFILE[id];
  G.regionState[id] = {
    destroyed: false,
    relation:  r.relation,
    exportMods: {},
    priceMods:  {},
    diplo: prof ? {
      score:           prof.initScore,
      atWar:           prof.initScore <= (prof.warThreshold ?? -999),
      alliance:        false,
      tradeDeal:       false,
      warDeclaredTurn: null,
      warAttackTurn:   null,  // last turn they attacked in war
      pendingDemand:   null,  // { resource, qty, deadline }
    } : null,
  };
});

// ─── DROUGHT & STABILITY HELPERS ─────────────────────────────

function droughtGrainMult() { return [1.0, 0.70, 0.45][G.droughtLevel]; }

function stabilityProdMult() {
  if (G.stability >= 80) return 1.15;
  if (G.stability >= 60) return 1.00;
  if (G.stability >= 40) return 0.85;
  return 0.70;
}

function getTollGoldBonus() {
  return { low: -3, normal: 0, high: 5 }[G.tollPolicy] ?? 0;
}

// ─── RESOURCE PRODUCTION (per turn) ─────────────────────────
function getTroyProduction() {
  const p  = G.production;
  const sm = stabilityProdMult();
  const dm = droughtGrainMult();
  return {
    grain:  Math.max(0, Math.round((4 + p.farmland * 2) * dm * sm)),
    gold:   Math.round((5 + p.tollgate * 3 + getTollGoldBonus()) * sm),
    copper: 0,
    tin:    0,
    bronze: Math.max(0, Math.round(p.smithy * sm)),
  };
}

function popGrainConsumption() {
  // 3 grain per 100 pop, scales linearly
  return Math.max(1, Math.ceil((G.population / 100) * 3));
}

// Headcount and weighted combat strength
function getTotalGarrison() { return G.militia + G.infantry; }
function getGarrisonStrength() {
  // Infantry: 1.6× for bronze arms; +30% more if iron weapons researched
  const ironMult = G.ironWorking ? 1.30 : 1.0;
  return G.militia * 1.0 + Math.round(G.infantry * 1.6 * ironMult);
}

// Gold upkeep: militia cheaper (less equipment), infantry costlier
function garrisonGoldCost() {
  return Math.floor(G.militia / 6) + Math.floor(G.infantry / 4);
}

// Grain upkeep: all soldiers eat
function garrisonGrainCost() {
  return Math.floor(G.militia / 8) + Math.floor(G.infantry / 6);
}

// Apply proportional losses — militia take heavier casualties (less armour)
function applyGarrisonLoss(frac) {
  const mLoss = Math.min(G.militia,  Math.round(G.militia  * frac * 1.25));
  const iLoss = Math.min(G.infantry, Math.round(G.infantry * frac * 0.75));
  G.militia  = Math.max(0, G.militia  - mLoss);
  G.infantry = Math.max(0, G.infantry - iLoss);
  return mLoss + iLoss;
}

function feedGarrison() {
  const need = garrisonGrainCost();
  if (need === 0) return;
  if (G.res.grain >= need) { G.res.grain -= need; return; }
  const deficit   = need - G.res.grain;
  G.res.grain     = 0;
  // Militia desert first — less loyal, no professional bond
  const mDesertion = Math.min(G.militia, deficit * 4);
  G.militia        = Math.max(0, G.militia - mDesertion);
  const remaining  = Math.max(0, deficit - Math.ceil(mDesertion / 4));
  const iDesertion = Math.min(G.infantry, remaining * 3);
  G.infantry       = Math.max(0, G.infantry - iDesertion);
  const total = mDesertion + iDesertion;
  if (total > 0) G.addLog(`⚠ Garrison underfed — ${total} warriors desert.`, 'log-crisis');
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
function getPrice(resource, regionId, buying = false) {
  let p = BASE_PRICES[resource] || 1;
  p *= G.priceMult[resource] || 1;
  if (regionId) {
    const rs = G.regionState[regionId];
    if (rs && rs.priceMods[resource]) p *= rs.priceMods[resource];
    if (buying && rs?.diplo?.tradeDeal) p *= 0.85; // 15% trade deal discount
  }
  return Math.max(1, Math.round(p * 10) / 10);
}

// ─── TRIBUTE TO HATTI ────────────────────────────────────────
function payTribute() {
  if (!G.vassalOfHatti) return;
  const due = G.tributeDoubleThisTurn ? 6 : 3;
  const hd  = G.regionState.hatti?.diplo;

  if (G.tributeRefusedThisTurn) {
    G.addLog(`Tribute to Hatti refused. The Great King will not forget this insult.`, 'log-crisis');
    if (hd) hd.score = clampScore(hd.score - 15);
  } else if (G.res.bronze >= due) {
    G.res.bronze -= due;
    G.addLog(`Paid ${due} ⚙ tribute to Hatti.`, 'log-tribute');
    if (hd && !hd.atWar) hd.score = clampScore(hd.score + 4);
  } else {
    G.addLog(`⚠ Could not pay tribute to Hatti — not enough bronze. They grow angry.`, 'log-crisis');
    if (hd) hd.score = clampScore(hd.score - 10);
  }

  G.tributeDoubleThisTurn  = false;
  G.tributeRefusedThisTurn = false;
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
  const defense = getGarrisonStrength() + G.walls * 8;
  if (defense >= attackStrength) {
    const lost = applyGarrisonLoss(0.3);
    G.addLog(`Troy HELD the siege! Garrison lost ${lost} warriors.`, 'log-good');
    return true;
  } else {
    G.walls = Math.max(0, G.walls - 1);
    const lost = applyGarrisonLoss(0.5);
    G.addLog(`Troy's walls were breached! Walls −1, garrison lost ${lost}.`, 'log-crisis');
    if (G.walls === 0) {
      endGame(false, 'Troy has fallen. The walls are broken and the city is sacked. History will remember this as the end of an age.');
    }
    return false;
  }
}

// ─── DROUGHT ─────────────────────────────────────────────────
// Historical: the 3.2kya megadrought struck hardest 1200-1150 BCE (turns 7-15)
function updateDrought() {
  const t = G.turn;
  const worsen  = t >= 7 ? 0.30 : 0.12;
  const recover = G.droughtLevel === 2 ? 0.20 : 0.30;

  if (G.droughtLevel < 2 && Math.random() < worsen) {
    G.droughtLevel++;
    if (G.droughtLevel === 1)
      G.addLog('☀ Dry season — grain harvests down 30%.', 'log-event');
    else
      G.addLog('🔥 Severe drought — harvests nearly halved! Famine threatens.', 'log-crisis');
  } else if (G.droughtLevel > 0 && Math.random() < recover) {
    G.droughtLevel--;
    G.addLog(G.droughtLevel === 0 ? '🌧 Rains return — harvests recovering.' : '🌦 Drought easing slightly.', 'log-good');
  }
}

// ─── STABILITY ───────────────────────────────────────────────
// Social cohesion: 0-100. Scales all production. Modifies battle morale.
function updateStability() {
  let d = -1; // natural drift — order requires active maintenance

  // Food security
  const grainNeed = popGrainConsumption() + garrisonGrainCost();
  if (G.res.grain >= grainNeed + 6) d += 3;
  else if (G.res.grain < grainNeed * 0.5) d -= 8;
  else if (G.res.grain < grainNeed)       d -= 4;

  // Prosperity
  if (G.res.gold >= 15) d += 2;
  else if (G.res.gold <= 2) d -= 3;

  // Commerce: active trade deals signal healthy relations
  const anyDeal = Object.values(G.regionState).some(rs => rs.diplo?.tradeDeal && !rs.destroyed);
  if (anyDeal) d += 3;

  // Walls (physical security)
  if (G.walls >= 4) d += 1;
  if (G.walls <= 1) d -= 2;

  // Active wars (fear and disruption)
  const warCount = Object.values(G.regionState).filter(rs => rs.diplo?.atWar && !rs.destroyed).length;
  d -= warCount * 3;

  G.stability = Math.max(0, Math.min(100, G.stability + d));
}

// ─── RANDOM MINI-EVENTS ───────────────────────────────────────
const MINI_EVENTS = [
  { w: 12, fn: () => { G.res.grain += 8;  G.addLog('🌾 Bumper harvest — grain stores +8.', 'log-good'); } },
  { w:  7, fn: () => { G.res.grain = Math.max(0, G.res.grain - 6); G.stability = Math.max(0, G.stability - 6);
                       G.addLog('🔥 Granary fire! Grain −6, stability shaken.', 'log-crisis'); } },
  { w:  9, fn: () => { G.res.gold += 7;   G.addLog('⛵ Rich merchant fleet arrives — ◎7 in toll duties.', 'log-good'); } },
  { w:  5, fn: () => { G.population = Math.max(1, G.population - 8); G.stability = Math.max(0, G.stability - 12);
                       G.addLog('💀 Plague strikes the city — population −8, stability −12.', 'log-crisis'); } },
  { w:  8, fn: () => { G.res.gold = Math.max(0, G.res.gold - 4);
                       G.addLog('🌊 Storm sinks a merchant ship — ◎4 lost.', 'log-event'); } },
  { w:  8, fn: () => { const opts=['grain','bronze','copper','tin']; const r=opts[Math.floor(Math.random()*opts.length)];
                       G.res[r]=(G.res[r]||0)+4; G.addLog(`🎁 Foreign envoy brings gifts — +4 ${RES_META[r]?.icon||r}.`, 'log-good'); } },
  { w:  7, fn: () => { G.stability = Math.min(100, G.stability + 10);
                       G.addLog('🎉 Festival season — city morale restored, stability +10.', 'log-good'); } },
  { w: 53, fn: () => {} },  // no event (weighted blank for ~53% chance of nothing)
];

function rollMiniEvent() {
  if (G.turn < 2) return;
  const total = MINI_EVENTS.reduce((s, e) => s + e.w, 0);
  let r = Math.random() * total;
  for (const ev of MINI_EVENTS) { r -= ev.w; if (r <= 0) { ev.fn(); return; } }
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
let hoveredRegion    = null;
let selectedRegionId = null;
let armySelected     = false;  // true when player clicked their army pawn

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
  const s = Math.min(scaleX, scaleY);

  // ── 1. Sea background ─────────────────────────────────────
  // Multi-stop gradient: deeper at edges, slightly lighter in Mediterranean
  const seaGrad = ctx.createLinearGradient(0, 0, w, h);
  seaGrad.addColorStop(0,   '#0a1e32');
  seaGrad.addColorStop(0.35,'#102840');
  seaGrad.addColorStop(0.6, '#0d2238');
  seaGrad.addColorStop(1,   '#071420');
  ctx.fillStyle = seaGrad;
  ctx.fillRect(0, 0, w, h);

  // Mediterranean shimmer — subtle radial highlight
  const medGlow = ctx.createRadialGradient(w*0.28, h*0.70, 0, w*0.28, h*0.70, w*0.38);
  medGlow.addColorStop(0,   'rgba(30,90,140,0.28)');
  medGlow.addColorStop(0.6, 'rgba(15,55,95,0.12)');
  medGlow.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = medGlow;
  ctx.fillRect(0, 0, w, h);

  // Black Sea shimmer
  const bsGlow = ctx.createRadialGradient(w*0.42, h*0.12, 0, w*0.42, h*0.12, w*0.22);
  bsGlow.addColorStop(0,   'rgba(25,75,120,0.22)');
  bsGlow.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = bsGlow;
  ctx.fillRect(0, 0, w, h);

  // ── 2. Regions ────────────────────────────────────────────
  Object.entries(REGIONS).forEach(([id, region]) => drawRegion(id, region));

  // ── 3. Rivers ─────────────────────────────────────────────
  drawRivers();

  // ── 4. Mountains ─────────────────────────────────────────
  drawMountains();

  // ── 5. Sea labels ─────────────────────────────────────────
  ctx.save();
  ctx.font = `italic ${Math.round(8.5 * s)}px Georgia`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const seaLabels = [
    { text:'BLACK SEA',         x:338, y:44  },
    { text:'CASPIAN SEA',       x:700, y:72  },
    { text:'AEGEAN SEA',        x:118, y:270 },
    { text:'MEDITERRANEAN SEA', x:215, y:385 },
    { text:'RED SEA',           x:295, y:468 },
    { text:'PERSIAN GULF',      x:607, y:458 },
  ];
  seaLabels.forEach(l => {
    const [x, y] = sp(l.x, l.y);
    ctx.shadowColor   = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur    = 3;
    ctx.fillStyle     = 'rgba(110,175,215,0.52)';
    ctx.fillText(l.text, x, y);
  });
  ctx.restore();

  // ── 6. City dot markers ────────────────────────────────────
  const cities = CITY_LIST;

  ctx.save();
  cities.forEach(c => {
    const rs = G.regionState[c.region];
    const destroyed = rs?.destroyed;
    const [x, y] = sp(c.x, c.y);

    // Dot
    ctx.beginPath();
    ctx.arc(x, y, 2.8 * s, 0, Math.PI * 2);
    ctx.fillStyle = destroyed ? 'rgba(180,60,40,0.5)' : 'rgba(220,195,140,0.7)';
    ctx.fill();

    // Label
    ctx.font        = `${Math.round(7.5 * s)}px Georgia`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur  = 4;
    ctx.fillStyle   = destroyed ? 'rgba(180,80,60,0.55)' : 'rgba(230,210,160,0.65)';
    ctx.fillText(c.label, x, y - 4 * s);

    // Destroyed X
    if (destroyed) {
      ctx.font      = `bold ${Math.round(11 * s)}px serif`;
      ctx.fillStyle = 'rgba(210,60,40,0.7)';
      ctx.textBaseline = 'middle';
      ctx.fillText('✕', x + 8 * s, y);
    }
  });
  ctx.restore();

  // ── 7. Troy special marker ────────────────────────────────
  const [tx, ty] = sp(182, 162);
  ctx.save();
  // Outer glow ring
  ctx.beginPath();
  ctx.arc(tx, ty, 13 * s, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(212,160,23,0.25)';
  ctx.lineWidth   = 4 * s;
  ctx.stroke();
  // Inner ring
  ctx.beginPath();
  ctx.arc(tx, ty, 9 * s, 0, Math.PI * 2);
  ctx.strokeStyle = '#d4a017';
  ctx.lineWidth   = 1.5 * s;
  ctx.stroke();
  // Star
  ctx.font         = `${Math.round(13 * s)}px serif`;
  ctx.fillStyle    = '#f0c030';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor  = 'rgba(212,160,23,0.8)';
  ctx.shadowBlur   = 6;
  ctx.fillText('★', tx, ty);
  // TROY label
  ctx.font         = `bold ${Math.round(9 * s)}px Georgia`;
  ctx.fillStyle    = '#f0d060';
  ctx.shadowBlur   = 5;
  ctx.textBaseline = 'bottom';
  ctx.fillText('TROY', tx, ty - 11 * s);
  ctx.restore();

  // ── 8. Army pawn at Troy ──────────────────────────────────
  const [pawX, pawY] = sp(200, 174);  // slightly offset from Troy star
  const pawR = 9 * s;
  ctx.save();
  if (armySelected) {
    // Pulse ring
    ctx.beginPath();
    ctx.arc(pawX, pawY, pawR + 5 * s, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(240,220,60,0.7)';
    ctx.lineWidth = 2 * s;
    ctx.stroke();
    // Highlight attackable cities
    CITY_LIST.forEach(c => {
      const rs = G.regionState[c.region];
      if (rs?.destroyed) return;
      const [cx, cy] = sp(c.x, c.y);
      ctx.beginPath();
      ctx.arc(cx, cy, 7 * s, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(220,60,40,0.75)';
      ctx.lineWidth = 1.5 * s;
      ctx.stroke();
    });
  }
  // Pawn body
  ctx.beginPath();
  ctx.arc(pawX, pawY, pawR, 0, Math.PI * 2);
  ctx.fillStyle = armySelected ? '#e0c020' : '#9a7010';
  ctx.shadowColor = armySelected ? 'rgba(240,220,60,0.9)' : 'rgba(0,0,0,0.6)';
  ctx.shadowBlur  = armySelected ? 10 : 4;
  ctx.fill();
  ctx.strokeStyle = armySelected ? '#fff080' : '#c89018';
  ctx.lineWidth = 1 * s;
  ctx.stroke();
  // Sword icon inside
  ctx.shadowBlur = 0;
  ctx.font = `${Math.round(10 * s)}px serif`;
  ctx.fillStyle = armySelected ? '#3a2000' : '#f0d060';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚔', pawX, pawY);
  // Troop count badge
  const tot = getTotalGarrison();
  ctx.font = `bold ${Math.round(6.5 * s)}px sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'top';
  ctx.fillText(tot, pawX + 7 * s, pawY + 5 * s);
  ctx.restore();

  // Army selection hint text
  if (armySelected) {
    ctx.save();
    ctx.font = `italic ${Math.round(8.5 * s)}px Georgia`;
    ctx.fillStyle = 'rgba(240,210,80,0.9)';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur  = 3;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Select a city to attack', w / 2, 6 * s);
    ctx.restore();
  }

  // ── 9. Compass rose ───────────────────────────────────────
  drawCompassRose(w - 44 * s, h - 44 * s, 26 * s);

  // ── 9. Vignette ───────────────────────────────────────────
  const vig = ctx.createRadialGradient(w*0.5, h*0.5, h*0.3, w*0.5, h*0.5, w*0.75);
  vig.addColorStop(0,   'rgba(0,0,0,0)');
  vig.addColorStop(0.8, 'rgba(0,0,0,0)');
  vig.addColorStop(1,   'rgba(0,0,0,0.45)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

function drawRivers() {
  const s = Math.min(scaleX, scaleY);
  ctx.save();
  ctx.strokeStyle = 'rgba(70,150,210,0.50)';
  ctx.lineWidth   = 1.8 * s;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.shadowColor = 'rgba(50,130,200,0.3)';
  ctx.shadowBlur  = 3;

  // ── Nile: from upper Egypt north to delta ─────────────────
  ctx.beginPath();
  let p = sp(328, 498); ctx.moveTo(p[0], p[1]);
  p = sp(326, 470); ctx.lineTo(p[0], p[1]);
  p = sp(322, 440); ctx.lineTo(p[0], p[1]);
  // Bend at Thebes
  p = sp(318, 410); ctx.lineTo(p[0], p[1]);
  // Delta fan
  p = sp(312, 385); ctx.lineTo(p[0], p[1]);
  ctx.stroke();
  // Delta branches
  ctx.lineWidth = 1.2 * s;
  // West branch
  ctx.beginPath();
  p = sp(312, 385); ctx.moveTo(p[0], p[1]);
  p = sp(298, 368); let cp1 = sp(302, 372);
  ctx.quadraticCurveTo(cp1[0], cp1[1], p[0], p[1]);
  ctx.stroke();
  // East branch
  ctx.beginPath();
  p = sp(312, 385); ctx.moveTo(p[0], p[1]);
  p = sp(325, 368); cp1 = sp(320, 372);
  ctx.quadraticCurveTo(cp1[0], cp1[1], p[0], p[1]);
  ctx.stroke();

  // ── Euphrates: Anatolia → Syria → Babylon ────────────────
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath();
  p = sp(390, 145); ctx.moveTo(p[0], p[1]);
  // Curve south-east through Syria
  let cp2;
  p = sp(450, 220); cp1 = sp(420, 170);
  ctx.quadraticCurveTo(cp1[0], cp1[1], p[0], p[1]);
  p = sp(480, 290); cp1 = sp(470, 255);
  ctx.quadraticCurveTo(cp1[0], cp1[1], p[0], p[1]);
  p = sp(545, 355); cp1 = sp(510, 320);
  ctx.quadraticCurveTo(cp1[0], cp1[1], p[0], p[1]);
  p = sp(572, 420); cp1 = sp(560, 388);
  ctx.quadraticCurveTo(cp1[0], cp1[1], p[0], p[1]);
  ctx.stroke();

  // ── Tigris: Anatolia → Assyria → Babylon ─────────────────
  ctx.beginPath();
  p = sp(450, 148); ctx.moveTo(p[0], p[1]);
  p = sp(498, 205); cp1 = sp(475, 170); cp2 = sp(488, 190);
  ctx.quadraticCurveTo(cp1[0], cp1[1], p[0], p[1]);
  p = sp(540, 270); cp1 = sp(522, 238);
  ctx.quadraticCurveTo(cp1[0], cp1[1], p[0], p[1]);
  p = sp(568, 340); cp1 = sp(555, 305);
  ctx.quadraticCurveTo(cp1[0], cp1[1], p[0], p[1]);
  p = sp(585, 418); cp1 = sp(578, 380);
  ctx.quadraticCurveTo(cp1[0], cp1[1], p[0], p[1]);
  ctx.stroke();

  // River labels
  ctx.font      = `italic ${Math.round(6.5 * s)}px Georgia`;
  ctx.fillStyle = 'rgba(80,160,210,0.45)';
  ctx.textAlign = 'center';
  ctx.shadowBlur = 0;
  let lp;
  lp = sp(452, 302); ctx.fillText('Euphrates', lp[0], lp[1]);
  lp = sp(542, 292); ctx.fillText('Tigris', lp[0], lp[1]);
  lp = sp(310, 432); ctx.fillText('Nile', lp[0], lp[1]);
  ctx.restore();
}

function drawMountains() {
  const s = Math.min(scaleX, scaleY);
  ctx.save();
  ctx.fillStyle   = 'rgba(180,150,100,0.22)';
  ctx.strokeStyle = 'rgba(160,130,80,0.30)';
  ctx.lineWidth   = 0.8 * s;

  // Draw a single mountain triangle symbol
  function mtn(rx, ry, size) {
    const [x, y] = sp(rx, ry);
    const sz = size * s;
    ctx.beginPath();
    ctx.moveTo(x, y - sz);
    ctx.lineTo(x - sz * 0.7, y + sz * 0.4);
    ctx.lineTo(x + sz * 0.7, y + sz * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Snow cap
    ctx.fillStyle = 'rgba(220,210,190,0.18)';
    ctx.beginPath();
    ctx.moveTo(x, y - sz);
    ctx.lineTo(x - sz * 0.25, y - sz * 0.35);
    ctx.lineTo(x + sz * 0.25, y - sz * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(180,150,100,0.22)';
  }

  // Taurus range (southern edge of Hatti/Anatolia)
  [[248,262],[268,256],[290,252],[312,248],[334,245],[356,243],[378,241],[400,240],[422,238],[445,236]].forEach(
    ([x,y]) => mtn(x, y, 5)
  );

  // Zagros (eastern Mesopotamia / Elam border)
  [[628,265],[635,292],[640,318],[644,344],[647,370]].forEach(
    ([x,y]) => mtn(x, y, 5)
  );

  // Caucasus (north of Hatti, Black Sea south coast)
  [[505,95],[525,89],[548,86],[570,89],[592,95]].forEach(
    ([x,y]) => mtn(x, y, 4.5)
  );

  // Lebanon / Anti-Lebanon (Canaan/Ugarit border)
  [[408,258],[412,272],[415,286]].forEach(
    ([x,y]) => mtn(x, y, 4)
  );

  // Pontic mountains (Kashka territory)
  [[195,118],[222,112],[252,108],[282,106],[312,105]].forEach(
    ([x,y]) => mtn(x, y, 4)
  );

  ctx.restore();
}

function drawCompassRose(cx, cy, r) {
  const s = Math.min(scaleX, scaleY);
  ctx.save();
  ctx.translate(cx, cy);

  // Outer circle
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(210,185,120,0.35)';
  ctx.lineWidth   = 1 * s;
  ctx.stroke();

  // Cardinal arrow points
  const dirs = [
    { angle: -Math.PI/2, label:'N', long: r*0.85, short: r*0.35 },
    { angle:  Math.PI/2, label:'S', long: r*0.70, short: r*0.30 },
    { angle:  0,         label:'E', long: r*0.70, short: r*0.30 },
    { angle:  Math.PI,   label:'W', long: r*0.70, short: r*0.30 },
  ];

  dirs.forEach(d => {
    const cos = Math.cos(d.angle), sin = Math.sin(d.angle);
    const perp_cos = Math.cos(d.angle + Math.PI/2);
    const perp_sin = Math.sin(d.angle + Math.PI/2);
    const tip   = [cos * d.long, sin * d.long];
    const base1 = [perp_cos * r*0.12, perp_sin * r*0.12];
    const base2 = [-perp_cos * r*0.12, -perp_sin * r*0.12];
    const back  = [-cos * d.short, -sin * d.short];

    ctx.beginPath();
    ctx.moveTo(tip[0], tip[1]);
    ctx.lineTo(base1[0], base1[1]);
    ctx.lineTo(back[0], back[1]);
    ctx.lineTo(base2[0], base2[1]);
    ctx.closePath();

    const isNorth = d.label === 'N';
    ctx.fillStyle   = isNorth ? 'rgba(210,50,50,0.70)' : 'rgba(200,175,110,0.55)';
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth   = 0.5 * s;
    ctx.fill();
    ctx.stroke();
  });

  // Center dot
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.10, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(200,175,110,0.75)';
  ctx.fill();

  // N label
  ctx.font         = `bold ${Math.round(r * 0.38)}px Georgia`;
  ctx.fillStyle    = 'rgba(210,60,60,0.85)';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('N', 0, -r * 0.92);

  ctx.restore();
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

  const s = Math.min(scaleX, scaleY);

  // Base fill
  let fillColor = region.fillColor;
  if (destroyed)      fillColor = '#160e0e';
  else if (hov)       fillColor = lighten(region.fillColor, 0.38);
  else if (sel)       fillColor = lighten(region.fillColor, 0.22);
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Inner terrain gradient overlay (top-left lighter, bottom-right darker)
  if (!destroyed) {
    const xs = region.poly.map(p => p[0] * scaleX);
    const ys = region.poly.map(p => p[1] * scaleY);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    try {
      const tg = ctx.createLinearGradient(minX, minY, maxX, maxY);
      tg.addColorStop(0,   'rgba(255,235,180,0.07)');
      tg.addColorStop(0.5, 'rgba(0,0,0,0)');
      tg.addColorStop(1,   'rgba(0,0,0,0.10)');
      ctx.fillStyle = tg;
      ctx.fill();
    } catch(e) { /* ignore degenerate gradients */ }
  }

  // Border
  ctx.strokeStyle = destroyed ? '#2a1818'
                  : sel       ? '#f0e080'
                  : hov       ? lighten(region.borderColor, 0.5)
                  : region.borderColor;
  ctx.lineWidth   = sel || isPlayer ? 2.5 * s : 1.3 * s;
  ctx.setLineDash(destroyed ? [4 * s, 3 * s] : []);
  ctx.stroke();
  ctx.setLineDash([]);

  // Diplomatic glow overlay
  if (!destroyed && !isPlayer) {
    const d = rs?.diplo;
    if (d?.atWar) {
      // Red war glow — rebuild path
      ctx.beginPath();
      region.poly.forEach(([rx, ry], i) => {
        const [px, py] = sp(rx, ry);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.save();
      ctx.shadowColor = 'rgba(220,50,30,0.70)';
      ctx.shadowBlur  = 12 * s;
      ctx.strokeStyle = 'rgba(220,50,30,0.45)';
      ctx.lineWidth   = 2.5 * s;
      ctx.stroke();
      ctx.restore();
    } else if (d?.alliance) {
      ctx.beginPath();
      region.poly.forEach(([rx, ry], i) => {
        const [px, py] = sp(rx, ry);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.save();
      ctx.shadowColor = 'rgba(50,200,100,0.60)';
      ctx.shadowBlur  = 10 * s;
      ctx.strokeStyle = 'rgba(50,200,100,0.35)';
      ctx.lineWidth   = 2 * s;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Region label
  if (!isPlayer) {
    const [cx, cy] = sp(region.cx, region.cy);
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    const fontSize = Math.round(9.5 * s);
    ctx.font        = `bold ${fontSize}px Georgia`;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur  = 4;
    ctx.fillStyle   = destroyed ? 'rgba(100,80,60,0.4)'
                    : hov || sel ? 'rgba(255,240,180,0.95)'
                    : 'rgba(215,190,135,0.80)';
    ctx.fillText(region.name.split(' ')[0], cx, cy);
    ctx.shadowBlur  = 0;

    if (destroyed) {
      ctx.font      = `bold ${Math.round(13 * s)}px serif`;
      ctx.fillStyle = 'rgba(200,55,35,0.65)';
      ctx.fillText('✕', cx, cy + 13 * scaleY);
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
    const d = rs.diplo;
    const status = rs.destroyed ? '💀 Destroyed'
                 : d ? `<span style="color:${getDiploColor(d.score,d.atWar)}">${getDiploLabel(d.score,d.atWar)}</span> (${d.score>0?'+':''}${d.score})`
                 : getRelationLabel(rs.relation);
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

// Returns city from CITY_LIST if click lands within ~13px of a city dot
function getCityAtPoint(px, py) {
  for (const c of CITY_LIST) {
    const [cx, cy] = sp(c.x, c.y);
    if (Math.hypot(px - cx, py - cy) <= 13 * Math.min(scaleX, scaleY)) return c;
  }
  return null;
}

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;

  // Check click on army pawn (ref: 200,174)
  const [pawX, pawY] = sp(200, 174);
  const s = Math.min(scaleX, scaleY);
  if (Math.hypot(px - pawX, py - pawY) <= 11 * s) {
    armySelected = !armySelected;
    drawMap();
    return;
  }

  // If army is selected, a city click triggers an expedition
  if (armySelected) {
    const city = getCityAtPoint(px, py);
    armySelected = false;
    if (city) {
      const rs = G.regionState[city.region];
      if (rs?.destroyed) {
        G.addLog(`${city.label} is already destroyed — nothing to raid.`, 'log-event');
        drawMap();
        return;
      }
      launchExpedition(city);
      return;
    }
    drawMap();
    return;
  }

  // Normal region click
  const id = getRegionAtPoint(px, py);
  if (!id || id === 'troy') return;
  selectedRegionId = id;
  drawMap();
  renderRegionInfo(id);
});

// ═══════════════════════════════════════════════════════════════
//  DIPLOMACY SYSTEM
// ═══════════════════════════════════════════════════════════════

function clampScore(s) { return Math.max(-100, Math.min(100, Math.round(s))); }

function getDiploLabel(score, atWar) {
  if (atWar)       return '⚔ AT WAR';
  if (score >= 70) return '🤝 Allied';
  if (score >= 50) return '✓ Friendly';
  if (score >= 20) return '~ Neutral';
  if (score >= -15) return '~ Cool';
  if (score >= -40) return '⚠ Hostile';
  return '☠ Enemy';
}

function getDiploColor(score, atWar) {
  if (atWar)        return '#c03030';
  if (score >= 70)  return '#30a060';
  if (score >= 50)  return '#60a048';
  if (score >= 20)  return '#888060';
  if (score >= -15) return '#a08040';
  if (score >= -40) return '#c07030';
  return '#c03030';
}

function getAllianceBonus() {
  return Object.entries(G.regionState).reduce((sum, [id, rs]) => {
    if (rs.diplo?.alliance && !rs.destroyed) sum += 10;
    return sum;
  }, 0);
}

// ── Per-turn AI diplomacy updates ────────────────────────────
function updateDiplomacyPerTurn() {
  Object.entries(DIPLO_PROFILE).forEach(([id, prof]) => {
    const rs = G.regionState[id];
    if (!rs || rs.destroyed || !rs.diplo) return;
    const d = rs.diplo;

    if (d.atWar) return; // score frozen during active war

    // Natural drift
    d.score = clampScore(d.score + prof.driftPerTurn);

    // Trade bonus: player traded with this region last turn
    if (G.lastTradedRegionId === id) {
      d.score = clampScore(d.score + 5);
    }

    // Hatti: tribute bonus / penalty applied in payTribute()

    // Random demand: hostile regions occasionally send demands
    if (!d.pendingDemand && d.score < 10 && d.score > (prof.warThreshold ?? -999) + 15 && Math.random() < 0.12) {
      const resource = prof.interests[0] || 'bronze';
      const qty = id === 'hatti' ? 3 : 2;
      d.pendingDemand = { resource, qty, deadline: G.turn + 2 };
      G.addLog(`${REGIONS[id].name} demands ${qty} ${resource}. Fulfill or relations suffer.`, 'log-event');
    }

    // Process pending demand expiry
    if (d.pendingDemand && G.turn > d.pendingDemand.deadline) {
      d.score = clampScore(d.score - 12);
      G.addLog(`${REGIONS[id].name}'s demand went unanswered — relations suffer.`, 'log-crisis');
      d.pendingDemand = null;
    }

    // War declaration
    if (prof.canWar && prof.warThreshold !== null && d.score <= prof.warThreshold) {
      d.atWar = true;
      d.warDeclaredTurn = G.turn;
      d.warAttackTurn   = G.turn - 1; // allow attack this same turn
      G.addLog(`⚔ ${REGIONS[id].name} has DECLARED WAR on Troy!`, 'log-crisis');
    }
  });

  // Hellespont toll policy — maritime regions react
  if (G.tollPolicy !== 'normal') {
    const maritime = ['cyprus','mycenae','crete','egypt','ugarit'];
    maritime.forEach(mid => {
      const md = G.regionState[mid]?.diplo;
      if (!md || G.regionState[mid]?.destroyed || md.atWar) return;
      md.score = clampScore(md.score + (G.tollPolicy === 'low' ? 2 : -3));
    });
  }

  // Clear trade record for next turn
  G.lastTradedRegionId = null;
}

// ── Hatti military power decays with the Late Bronze Age collapse ─────
// Turn 1 (1250 BCE): ~95 — peak empire; Turn 11 (1180 BCE): ~30 — barely intact
function getHattiMilitary() {
  const base = 95 - (G.turn - 1) * 6;  // 95 → 35 over turns 1-11
  return Math.max(30, Math.round(base));
}

// ── War battle configs injected into the battle queue ─────────
function getDiplomaticWarBattles() {
  const battles = [];
  Object.entries(DIPLO_PROFILE).forEach(([id, prof]) => {
    const rs = G.regionState[id];
    if (!rs || rs.destroyed || !rs.diplo) return;
    const d = rs.diplo;
    if (!d.atWar) return;
    // Attack every 2 turns to avoid overwhelming the player
    if (d.warAttackTurn !== null && G.turn - d.warAttackTurn < 2) return;

    d.warAttackTurn = G.turn;
    const effMilitary = id === 'hatti' ? getHattiMilitary() : prof.military;
    battles.push({
      attacker:     REGIONS[id].name,
      attackerIcon: REGIONS[id].icon,
      baseSize:     effMilitary + Math.floor(Math.random() * 18),
      type:         effMilitary >= 60 ? 'invasion' : effMilitary >= 35 ? 'siege' : 'raid',
      desc:         `${REGIONS[id].name} forces march on Troy in open war.`,
      regionId:     id,
    });
  });
  return battles;
}

// ── Player diplomatic actions ─────────────────────────────────
function diploGoldGift(regionId, amount) {
  const rs   = G.regionState[regionId];
  const d    = rs.diplo;
  const prof = DIPLO_PROFILE[regionId];
  if (!d || G.res.gold < amount) return;
  G.res.gold -= amount;
  const gain = amount <= 5 ? 9 : amount <= 15 ? 22 : 35;
  d.score = clampScore(d.score + gain);
  G.addLog(`Sent ◎${amount} as a gift to ${REGIONS[regionId].name}. Relations improved by +${gain}.`, 'log-good');
  renderAll();
  renderDiploList();
  renderDiploDetail(regionId);
}

function diploBronzeGift(regionId, qty) {
  const rs   = G.regionState[regionId];
  const d    = rs.diplo;
  const prof = DIPLO_PROFILE[regionId];
  if (!d || G.res.bronze < qty) return;
  G.res.bronze -= qty;
  const base  = qty * 14;
  const bonus = prof.interests.includes('bronze') ? Math.round(base * 0.5) : 0;
  const gain  = base + bonus;
  d.score = clampScore(d.score + gain);
  G.addLog(`Sent ${qty} bronze to ${REGIONS[regionId].name}. Relations improved by +${gain}.`, 'log-good');
  renderAll();
  renderDiploList();
  renderDiploDetail(regionId);
}

function diploGrainGift(regionId) {
  const rs   = G.regionState[regionId];
  const d    = rs.diplo;
  const prof = DIPLO_PROFILE[regionId];
  if (!d || G.res.grain < 5) return;
  G.res.grain -= 5;
  const gain = prof.interests.includes('grain') ? 16 : 9;
  d.score = clampScore(d.score + gain);
  G.addLog(`Sent grain to ${REGIONS[regionId].name}. Relations improved by +${gain}.`, 'log-good');
  renderAll();
  renderDiploList();
  renderDiploDetail(regionId);
}

function diploFulfillDemand(regionId) {
  const rs = G.regionState[regionId];
  const d  = rs.diplo;
  if (!d?.pendingDemand) return;
  const { resource, qty } = d.pendingDemand;
  if ((G.res[resource] || 0) < qty) return;
  G.res[resource] -= qty;
  d.score = clampScore(d.score + 20);
  d.pendingDemand = null;
  G.addLog(`Fulfilled ${REGIONS[regionId].name}'s demand. Relations greatly improved.`, 'log-good');
  renderAll();
  renderDiploList();
  renderDiploDetail(regionId);
}

function diploSignTradeDeal(regionId) {
  const rs = G.regionState[regionId];
  const d  = rs.diplo;
  if (!d || G.res.gold < 10 || d.score < 35 || d.tradeDeal) return;
  G.res.gold -= 10;
  d.tradeDeal = true;
  d.score = clampScore(d.score + 6);
  G.addLog(`Trade agreement signed with ${REGIONS[regionId].name}. 15% discount on trade.`, 'log-good');
  renderAll();
  renderDiploList();
  renderDiploDetail(regionId);
}

function diploFormAlliance(regionId) {
  const rs = G.regionState[regionId];
  const d  = rs.diplo;
  if (!d || G.res.gold < 20 || d.score < 62 || d.alliance) return;
  G.res.gold -= 20;
  d.alliance  = true;
  d.tradeDeal = true;
  d.score = clampScore(d.score + 10);
  G.addLog(`⚜ ALLIANCE forged with ${REGIONS[regionId].name}! They will aid Troy in defense.`, 'log-good');
  renderAll();
  renderDiploList();
  renderDiploDetail(regionId);
}

function diploOfferPeace(regionId) {
  const rs = G.regionState[regionId];
  const d  = rs.diplo;
  if (!d?.atWar || G.res.gold < 10 || G.res.bronze < 5) return;
  G.res.gold   -= 10;
  G.res.bronze -= 5;
  d.atWar = false;
  d.score = -18;
  G.addLog(`Peace treaty with ${REGIONS[regionId].name}. War ends — tensions remain.`, 'log-event');
  renderAll();
  renderDiploList();
  renderDiploDetail(regionId);
}

function diploRefuseDemand(regionId) {
  const rs = G.regionState[regionId];
  const d  = rs.diplo;
  if (!d?.pendingDemand) return;
  d.score = clampScore(d.score - 18);
  d.pendingDemand = null;
  G.addLog(`Refused ${REGIONS[regionId].name}'s demand. Relations deteriorated.`, 'log-crisis');
  renderAll();
  renderDiploList();
  renderDiploDetail(regionId);
}

// ── Modal rendering ───────────────────────────────────────────
let selectedDiploId = null;

function openDiploModal() {
  renderDiploList();
  if (selectedDiploId) renderDiploDetail(selectedDiploId);
  document.getElementById('diplo-modal').style.display = 'flex';
}

function renderDiploList() {
  const container = document.getElementById('diplo-list');
  if (!container) return;

  const rows = Object.entries(REGIONS)
    .filter(([id, r]) => !r.isPlayer)
    .map(([id, region]) => {
      const rs  = G.regionState[id];
      const d   = rs.diplo;
      const destroyed = rs.destroyed;

      let label, color, barPct;
      if (destroyed) {
        label = '💀 Destroyed'; color = '#3a2010'; barPct = 0;
      } else if (!d) {
        label = '☠ Hostile'; color = '#c03030'; barPct = 10;
      } else {
        label  = getDiploLabel(d.score, d.atWar);
        color  = getDiploColor(d.score, d.atWar);
        barPct = Math.round(((d.score + 100) / 200) * 100);
      }

      const badges = [];
      if (d?.alliance) badges.push('🤝');
      if (d?.tradeDeal && !d?.alliance) badges.push('📜');
      if (d?.atWar) badges.push('⚔');
      if (d?.pendingDemand) badges.push('📨');

      const selClass  = selectedDiploId === id ? ' selected' : '';
      const warClass  = d?.atWar ? ' diplo-at-war' : '';
      return `<div class="diplo-row${selClass}${warClass}" onclick="selectDiploRegion('${id}')">
        <div class="drow-icon">${region.icon}</div>
        <div class="drow-body">
          <div class="drow-name">${region.name.split('(')[0].trim()} <span class="drow-badges">${badges.join('')}</span></div>
          <div class="drow-bar-bg"><div class="drow-bar-fill" style="width:${barPct}%;background:${color}"></div></div>
        </div>
        <div class="drow-status" style="color:${color}">${label}</div>
      </div>`;
    }).join('');

  container.innerHTML = rows;
}

function selectDiploRegion(id) {
  selectedDiploId = id;
  renderDiploList();       // re-render to update .selected class
  renderDiploDetail(id);
}

function renderDiploDetail(id) {
  const container = document.getElementById('diplo-detail');
  if (!container) return;

  const region = REGIONS[id];
  const rs     = G.regionState[id];
  const d      = rs.diplo;
  const prof   = DIPLO_PROFILE[id];

  if (rs.destroyed) {
    container.innerHTML = `<div class="diplo-detail-card">
      <div class="dd-name">${region.icon} ${region.name}</div>
      <div class="dd-status" style="color:#4a3020">💀 DESTROYED</div>
      <p class="dd-desc">This nation has collapsed. Diplomatic relations are no longer possible.</p>
    </div>`;
    return;
  }

  if (!d || !prof) {
    container.innerHTML = `<div class="diplo-detail-card">
      <div class="dd-name">${region.icon} ${region.name}</div>
      <div class="dd-status" style="color:#c03030">☠ HOSTILE — No diplomacy possible</div>
      <p class="dd-desc">${region.desc}</p>
    </div>`;
    return;
  }

  const label  = getDiploLabel(d.score, d.atWar);
  const color  = getDiploColor(d.score, d.atWar);
  const barPct = Math.round(((d.score + 100) / 200) * 100);

  // Pending demand info
  let demandHtml = '';
  if (d.pendingDemand) {
    const dm = d.pendingDemand;
    const canFulfill = (G.res[dm.resource] || 0) >= dm.qty;
    const meta = RES_META[dm.resource] || { icon:'?', name: dm.resource };
    demandHtml = `<div class="dd-demand-box">
      📨 <b>DEMAND:</b> ${REGIONS[id].name} demands ${dm.qty} ${meta.icon} ${meta.name} (deadline: Year ${dm.deadline}).
      <br>Fulfill to gain +20 relations, or refuse for −18.
      <div class="dd-actions" style="margin-top:8px">
        <button class="dd-action-btn" ${!canFulfill?'disabled':''} onclick="diploFulfillDemand('${id}')">
          ✓ Fulfill Demand <span class="action-cost">${meta.icon}${dm.qty}</span>
        </button>
        <button class="dd-action-btn" onclick="diploRefuseDemand('${id}')">
          ✗ Refuse
        </button>
      </div>
    </div>`;
  }

  // Action buttons
  const r = G.res;
  const actions = [];

  if (!d.atWar) {
    actions.push({ label:'Send Small Gold Gift',  cost:'◎5',   enabled: r.gold >= 5,                    cls:'', fn:`diploGoldGift('${id}',5)` });
    actions.push({ label:'Send Large Gold Gift',  cost:'◎15',  enabled: r.gold >= 15,                   cls:'', fn:`diploGoldGift('${id}',15)` });
    actions.push({ label:'Send Gold Delegation',  cost:'◎30',  enabled: r.gold >= 30,                   cls:'', fn:`diploGoldGift('${id}',30)` });
    actions.push({ label:'Send Bronze Tribute (×1)', cost:'⚙1', enabled: r.bronze >= 1,                 cls:'', fn:`diploBronzeGift('${id}',1)` });
    actions.push({ label:'Send Bronze Tribute (×3)', cost:'⚙3', enabled: r.bronze >= 3,                 cls:'', fn:`diploBronzeGift('${id}',3)` });
    actions.push({ label:'Send Grain Relief',     cost:'🌾5',  enabled: r.grain >= 5,                   cls:'', fn:`diploGrainGift('${id}')` });
    if (!d.tradeDeal && d.score >= 35) {
      actions.push({ label:'Sign Trade Agreement', cost:'◎10 · Requires 35+', enabled: r.gold >= 10,    cls:'', fn:`diploSignTradeDeal('${id}')` });
    }
    if (!d.alliance && d.score >= 62) {
      actions.push({ label:'Propose Alliance',     cost:'◎20 · Requires 62+', enabled: r.gold >= 20,   cls:'btn-alliance', fn:`diploFormAlliance('${id}')` });
    }
  } else {
    actions.push({ label:'Offer Peace Treaty',    cost:'◎10 + ⚙5',           enabled: r.gold >= 10 && r.bronze >= 5, cls:'btn-peace', fn:`diploOfferPeace('${id}')` });
  }

  const actHtml = actions.map(a =>
    `<button class="dd-action-btn ${a.cls}" ${!a.enabled?'disabled':''} onclick="${a.fn}">
      ${a.label} <span class="action-cost">${a.cost}</span>
    </button>`
  ).join('');

  container.innerHTML = `<div class="diplo-detail-card">
    <div class="dd-name">${region.icon} ${region.name}</div>
    <div class="dd-status" style="color:${color}">${label}</div>
    <div class="dd-score-row">
      <span>Score: <b style="color:${color}">${d.score > 0 ? '+' : ''}${d.score}</b></span>
      ${d.alliance ? '<span class="dd-badge">🤝 Allied</span>' : ''}
      ${d.tradeDeal && !d.alliance ? '<span class="dd-badge">📜 Trade Deal</span>' : ''}
      ${d.atWar ? '<span class="dd-badge" style="color:#c05040;border-color:#582020">⚔ At War</span>' : ''}
    </div>
    <div class="dd-bar-bg"><div class="dd-bar-fill" style="width:${barPct}%;background:${color}"></div></div>
    <p class="dd-desc">${region.desc}<br><br><span style="color:#4a3818">Interests: ${prof.interests.map(r => RES_META[r]?.icon || r).join(' ')}</span></p>
    ${d.atWar ? `<div class="dd-war-box">⚔ <b>ACTIVE WAR</b> — ${region.name} armies assault Troy periodically. Offer a peace treaty or defeat them in battle to end the conflict.</div>` : ''}
    ${d.tradeDeal ? `<div class="dd-benefit-box">📜 Trade Agreement active — <b>15% discount</b> on all purchases from this region.</div>` : ''}
    ${d.alliance  ? `<div class="dd-benefit-box">🤝 Alliance active — <b>+10 garrison bonus</b> when defending against any attack.</div>` : ''}
    ${demandHtml}
    <div class="dd-section-label">Diplomatic Actions</div>
    <div class="dd-actions">${actHtml}</div>
  </div>`;
}

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
  const grainNet  = prod.grain - needGrain - garrisonGrainCost();
  setRate('rr-grain',  grainNet);
  setRate('rr-copper', prod.copper);
  setRate('rr-tin',    prod.tin);
  setRate('rr-bronze', prod.bronze);
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

  // Militia bar
  const militiaPct = Math.min(100, (G.militia / 40) * 100);
  document.getElementById('bar-militia').style.width = militiaPct + '%';
  document.getElementById('val-militia').textContent = G.militia;

  // Infantry bar
  const infantryPct = Math.min(100, (G.infantry / 30) * 100);
  document.getElementById('bar-infantry').style.width = infantryPct + '%';
  document.getElementById('val-infantry').textContent = G.infantry;

  // Stability bar
  const stabEl = document.getElementById('bar-stability');
  if (stabEl) {
    stabEl.style.width      = G.stability + '%';
    stabEl.style.background = G.stability >= 70 ? '#3a8f50' : G.stability >= 45 ? '#a07820' : '#b03828';
  }
  const stabValEl = document.getElementById('val-stability');
  if (stabValEl) {
    const stabLabel = G.stability >= 80 ? 'Stable' : G.stability >= 60 ? 'Steady' : G.stability >= 40 ? 'Tense' : 'CRISIS';
    stabValEl.textContent = `${G.stability} — ${stabLabel}`;
    stabValEl.style.color = G.stability >= 60 ? '#6a9050' : G.stability >= 40 ? '#a07820' : '#b03828';
  }

  // Chariot display
  const charEl = document.getElementById('val-chariots');
  if (charEl) charEl.textContent = `${G.cavalryBonus}/5`;
  const charBarEl = document.getElementById('bar-chariots');
  if (charBarEl) charBarEl.style.width = (G.cavalryBonus / 5 * 100) + '%';

  // Upkeep breakdown
  const goldUp  = garrisonGoldCost();
  const grainUp = garrisonGrainCost();
  const upkeepEl = document.getElementById('garrison-upkeep');
  if (upkeepEl) {
    const ironTag = G.ironWorking ? ' · ⚒ Iron' : '';
    upkeepEl.textContent = `Upkeep: ◎${goldUp}/yr  🌾${grainUp}/yr  · Str: ${getGarrisonStrength()}${ironTag}`;
    upkeepEl.style.color = grainUp > getTroyProduction().grain - popGrainConsumption() ? '#c05030' : '#6a5020';
  }

  // Production & policy summary
  const prodEl = document.getElementById('production-summary');
  if (prodEl) {
    const p = G.production;
    const parts = [];
    if (p.farmland) parts.push(`🌾+${p.farmland*2}/yr`);
    if (p.tollgate) parts.push(`◎+${p.tollgate*3}/yr`);
    if (p.smithy)   parts.push(`⚙+${p.smithy}/yr`);
    const droughtTag = ['', ' · ☀Dry', ' · 🔥Drought'][G.droughtLevel];
    const tollTag = G.tollPolicy !== 'normal' ? ` · Toll:${G.tollPolicy.toUpperCase()}` : '';
    prodEl.textContent = (parts.length ? `City: ${parts.join('  ')}` : 'City: no upgrades') + droughtTag + tollTag;
  }
}

function renderActions() {
  const container = document.getElementById('action-list');
  const r = G.res;
  const p = G.production;

  const actions = [
    // ── Production Upgrades ──────────────────────────────────
    { type: 'header', label: '🏗 Production Upgrades' },
    {
      id: 'farm-up',
      label: `🌾 Expand Farmland  (Lv ${p.farmland}/3)`,
      cost:  `◎8 → +2🌾/yr`,
      enabled: p.farmland < 3 && r.gold >= 8,
      fn: () => {
        r.gold -= 8; p.farmland++;
        G.addLog(`Farmland expanded. Grain production +2/yr (now ${4 + p.farmland * 2}/yr).`, 'log-good');
        renderAll();
      }
    },
    {
      id: 'toll-up',
      label: `🚢 Fortify Toll Gate  (Lv ${p.tollgate}/2)`,
      cost:  `◎12 → +3◎/yr`,
      enabled: p.tollgate < 2 && r.gold >= 12,
      fn: () => {
        r.gold -= 12; p.tollgate++;
        G.addLog(`Toll gate fortified. Gold income +3/yr (now ${5 + p.tollgate * 3}/yr).`, 'log-good');
        renderAll();
      }
    },
    {
      id: 'smithy-up',
      label: `⚒ Build Bronze Smithy  (Lv ${p.smithy}/2)`,
      cost:  `◎8 ⚒3 → +1⚙/yr`,
      enabled: p.smithy < 2 && r.gold >= 8 && r.copper >= 3,
      fn: () => {
        r.gold -= 8; r.copper -= 3; p.smithy++;
        G.addLog(`Bronze smithy upgraded. Auto-produces ${p.smithy} bronze/yr.`, 'log-good');
        renderAll();
      }
    },
    // ── Crafting ─────────────────────────────────────────────
    { type: 'header', label: '⚙ Crafting' },
    {
      id: 'craft2',
      label: `⚙ Forge Bronze ×2`,
      cost: `⚒4 🔩2`,
      enabled: canCraft(2),
      fn: () => { craftBronze(2); renderAll(); }
    },
    {
      id: 'craft1',
      label: `⚙ Forge Bronze ×1`,
      cost: `⚒2 🔩1`,
      enabled: canCraft(1),
      fn: () => { craftBronze(1); renderAll(); }
    },
    {
      id: 'craft3',
      label: `⚙ Forge Bronze ×3`,
      cost: `⚒6 🔩3`,
      enabled: canCraft(3),
      fn: () => { craftBronze(3); renderAll(); }
    },
    // ── Militia (cheap; grain + gold only) ───────────────────
    { type: 'header', label: `👥 Militia  ×${G.militia}  — upkeep ◎${Math.floor(G.militia/6)}/yr 🌾${Math.floor(G.militia/8)}/yr` },
    {
      id: 'recruit-militia-5',
      label: `👥 Levy Militia +5`,
      cost: `🌾2 ◎1`,
      enabled: r.grain >= 2 && r.gold >= 1,
      fn: () => {
        r.grain -= 2; r.gold -= 1;
        G.militia += 5;
        G.addLog('Levied 5 militia. Cheap but lightly armed.', 'log-good');
        renderAll();
      }
    },
    {
      id: 'recruit-militia-10',
      label: `👥 Levy Militia +10`,
      cost: `🌾4 ◎2`,
      enabled: r.grain >= 4 && r.gold >= 2,
      fn: () => {
        r.grain -= 4; r.gold -= 2;
        G.militia += 10;
        G.addLog('Levied 10 militia.', 'log-good');
        renderAll();
      }
    },
    {
      id: 'disband-militia-5',
      label: `🏚 Disband Militia −5`,
      cost: `saves ◎1 🌾1/yr`,
      enabled: G.militia >= 5,
      fn: () => {
        G.militia -= 5;
        G.addLog('Disbanded 5 militia. Upkeep reduced.', 'log-event');
        renderAll();
      }
    },
    // ── Infantry (bronze-equipped; 1.6× combat strength) ─────
    { type: 'header', label: `⚔ Infantry  ×${G.infantry}  — upkeep ◎${Math.floor(G.infantry/4)}/yr 🌾${Math.floor(G.infantry/6)}/yr` },
    {
      id: 'recruit-inf-5',
      label: `⚔ Equip Infantry +5`,
      cost: `🌾2 ◎2 ⚙1`,
      enabled: r.grain >= 2 && r.gold >= 2 && r.bronze >= 1,
      fn: () => {
        r.grain -= 2; r.gold -= 2; r.bronze -= 1;
        G.infantry += 5;
        G.addLog('Equipped 5 infantry with bronze arms. Combat strength +8.', 'log-good');
        renderAll();
      }
    },
    {
      id: 'recruit-inf-10',
      label: `⚔ Equip Infantry +10`,
      cost: `🌾3 ◎3 ⚙2`,
      enabled: r.grain >= 3 && r.gold >= 3 && r.bronze >= 2,
      fn: () => {
        r.grain -= 3; r.gold -= 3; r.bronze -= 2;
        G.infantry += 10;
        G.addLog('Equipped 10 infantry. Combat strength +16.', 'log-good');
        renderAll();
      }
    },
    {
      id: 'disband-inf-5',
      label: `🏚 Disband Infantry −5`,
      cost: `saves ◎1 🌾1/yr`,
      enabled: G.infantry >= 5,
      fn: () => {
        G.infantry -= 5;
        G.addLog('Disbanded 5 infantry. Upkeep reduced.', 'log-event');
        renderAll();
      }
    },
    // ── Hellespont Toll Policy ────────────────────────────────
    { type: 'header', label: `⚖ HELLESPONT TOLL POLICY  [currently: ${G.tollPolicy.toUpperCase()}]` },
    {
      id: 'toll-low',
      label: `🚢 Low Tolls  (−◎3/yr · maritime diplo +2/yr)`,
      cost: G.tollPolicy === 'low' ? '✓ Active' : '',
      enabled: G.tollPolicy !== 'low',
      fn: () => { G.tollPolicy = 'low'; G.addLog('Toll gates lowered — ships pass freely. Maritime relations improve.', 'log-event'); renderAll(); }
    },
    {
      id: 'toll-normal',
      label: `🚢 Normal Tolls  (standard ◎5/yr base)`,
      cost: G.tollPolicy === 'normal' ? '✓ Active' : '',
      enabled: G.tollPolicy !== 'normal',
      fn: () => { G.tollPolicy = 'normal'; G.addLog('Toll gates set to standard rates.', 'log-event'); renderAll(); }
    },
    {
      id: 'toll-high',
      label: `🚢 High Tolls  (+◎5/yr · maritime diplo −3/yr)`,
      cost: G.tollPolicy === 'high' ? '✓ Active' : '',
      enabled: G.tollPolicy !== 'high',
      fn: () => { G.tollPolicy = 'high'; G.addLog('Toll gates raised — merchants pay dearly to pass the Hellespont.', 'log-event'); renderAll(); }
    },
    // ── Defence & Military Tech ──────────────────────────────
    { type: 'header', label: '🏰 Defence & Military' },
    {
      id: 'walls',
      label: `🏰 Reinforce Walls +1`,
      cost: `⚙5`,
      enabled: r.bronze >= 5 && G.walls < G.maxWalls,
      fn: () => {
        r.bronze -= 5;
        G.walls = Math.min(G.maxWalls, G.walls + 1);
        G.addLog('Walls reinforced. Defense increases.', 'log-good');
        renderAll();
      }
    },
    {
      id: 'mercs',
      label: `🗡 Hire Mercenaries +8`,
      cost: `🥈5`,
      enabled: r.silver >= 5,
      fn: () => {
        r.silver -= 5;
        G.militia += 8;
        G.addLog('Hired mercenaries (+8 militia).', 'log-good');
        renderAll();
      }
    },
    {
      id: 'cavalry',
      label: `🐎 Train Chariot Team  (${G.cavalryBonus}/5)`,
      cost: `🐎1 ⚙1 ◎3`,
      enabled: r.horses >= 1 && r.bronze >= 1 && r.gold >= 3 && G.cavalryBonus < 5,
      fn: () => {
        r.horses -= 1; r.bronze -= 1; r.gold -= 3;
        G.cavalryBonus = Math.min(5, G.cavalryBonus + 1);
        G.addLog(`Chariot team ready — +8 city defense, +10% expedition power.`, 'log-good');
        renderAll();
      }
    },
    ...(G.ironWorking ? [] : [{
      id: 'iron',
      label: G.turn >= 7 ? `⚒ Research Iron Working` : `⚒ Research Iron Working  (available ~1208 BCE)`,
      cost: `◎18 🔩2`,
      enabled: G.turn >= 7 && r.gold >= 18 && r.tin >= 2,
      fn: () => {
        r.gold -= 18; r.tin -= 2;
        G.ironWorking = true;
        G.addLog('Iron working mastered! Infantry combat strength +30%. The Hittite iron monopoly is broken.', 'log-good');
        G.stability = Math.min(100, G.stability + 8); // prestige boost
        renderAll();
      }
    }]),
    ...(G.ironWorking ? [{ type: 'header', label: '⚒ Iron Working — RESEARCHED (+30% infantry str)' }] : []),
    {
      id: 'sell-oil',
      label: `🫒 Sell Olive Oil`,
      cost: `🫒${r.olive_oil} → ◎${r.olive_oil * 3}`,
      enabled: r.olive_oil > 0,
      fn: () => {
        const gold = r.olive_oil * 3;
        G.addLog(`Sold ${r.olive_oil} olive oil for ◎${gold}.`, 'log-trade');
        r.gold += gold; r.olive_oil = 0;
        renderAll();
      }
    },
    {
      id: 'sell-pot',
      label: `🏺 Sell Pottery`,
      cost: `🏺${r.pottery} → ◎${r.pottery * 2}`,
      enabled: r.pottery > 0,
      fn: () => {
        const gold = r.pottery * 2;
        G.addLog(`Sold ${r.pottery} pottery for ◎${gold}.`, 'log-trade');
        r.gold += gold; r.pottery = 0;
        renderAll();
      }
    },
    {
      id: 'sell-timber',
      label: `🪵 Sell Timber`,
      cost: `🪵${r.timber} → ◎${r.timber * 2}`,
      enabled: r.timber > 0,
      fn: () => {
        const gold = r.timber * 2;
        G.addLog(`Sold ${r.timber} timber for ◎${gold}.`, 'log-trade');
        r.gold += gold; r.timber = 0;
        renderAll();
      }
    },
    {
      id: 'sell-horse',
      label: `🐎 Convert Horse to Gold`,
      cost: `🐎1 → ◎7`,
      enabled: r.horses >= 1,
      fn: () => {
        r.horses -= 1; r.gold += 7;
        G.addLog('Sold a horse for ◎7.', 'log-trade');
        renderAll();
      }
    },
    {
      id: 'textiles',
      label: `🧵 Produce Textiles`,
      cost: `🌾3 → 🥈4`,
      enabled: r.grain >= 3,
      fn: () => {
        r.grain -= 3; r.silver += 4;
        G.addLog('Converted grain to silver via textile trade.', 'log-good');
        renderAll();
      }
    },
  ];

  container.innerHTML = actions.map(a => {
    if (a.type === 'header')
      return `<div class="action-section-label">${a.label}</div>`;
    return `<button class="action-item" data-id="${a.id}" ${!a.enabled ? 'disabled' : ''}>
      ${a.label} <span class="action-cost">${a.cost}</span>
    </button>`;
  }).join('');

  actions.filter(a => !a.type).forEach(a => {
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
  const d = rs.diplo;
  const diploHtml = d ? `<div class="ri-diplo" style="color:${getDiploColor(d.score,d.atWar)};font-size:0.72em;margin:4px 0">
    ${getDiploLabel(d.score,d.atWar)} (${d.score>0?'+':''}${d.score})
    ${d.tradeDeal ? ' · 📜 Trade Deal' : ''}${d.alliance ? ' · 🤝 Allied' : ''}
    <button class="open-trade-btn" style="margin-left:6px;padding:2px 7px;font-size:0.9em" onclick="selectDiploRegion('${id}');openDiploModal()">Diplomacy ▶</button>
  </div>` : '';

  container.innerHTML = `
    <div class="region-info-card">
      <div class="ri-name">${region.icon} ${region.name}</div>
      ${diploHtml}
      <p class="ri-desc">${region.desc}</p>
      ${exports.length > 0 ? `
        <div class="ri-exports">Exports: ${exports.map(([res,info]) => {
          const qty = Math.max(0, info.qty + (rs.exportMods[res] || 0));
          const price = getPrice(res, id, true);
          return `${info.icon} ${info.name} ×${qty} @ ◎${price.toFixed(1)}${d?.tradeDeal ? ' <span style="color:#50a040">▼15%</span>' : ''}`;
        }).join(' · ')}</div>` : ''}
      ${exports.length > 0 && !d?.atWar ? `<button class="open-trade-btn" id="open-trade-${id}">Open Trade ▶</button>` : ''}
      ${d?.atWar ? '<div style="color:#c04030;font-size:0.72em;margin-top:6px">⚔ At war — trade suspended.</div>' : ''}
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
const RES_META = {
  grain:      { name:'Grain',      icon:'🌾' },
  copper:     { name:'Copper',     icon:'⚒'  },
  tin:        { name:'Tin',        icon:'🔩' },
  bronze:     { name:'Bronze',     icon:'⚙'  },
  silver:     { name:'Silver',     icon:'🥈' },
  olive_oil:  { name:'Olive Oil',  icon:'🫒' },
  pottery:    { name:'Pottery',    icon:'🏺' },
  timber:     { name:'Timber',     icon:'🪵' },
  horses:     { name:'Horses',     icon:'🐎' },
  purple_dye: { name:'Purple Dye', icon:'🟣' },
};

let buyCart  = {};   // resId → qty player wants to buy
let sellCart = {};   // resId → qty player wants to sell
let currentTradeRegionId = null;

function getSellPrice(resId, regionId) {
  const region = REGIONS[regionId];
  const mult = (region.imports || []).includes(resId) ? 0.72 : 0.38;
  return Math.max(0.5, Math.round(getPrice(resId, regionId) * mult * 10) / 10);
}

function openTradeModal(regionId) {
  const region = REGIONS[regionId];
  const rs     = G.regionState[regionId];
  buyCart  = {};
  sellCart = {};
  currentTradeRegionId = regionId;

  document.getElementById('tmod-region-icon').textContent   = region.icon;
  document.getElementById('tmod-region-name').textContent   = region.name;
  document.getElementById('tmod-region-status').textContent = getRelationLabel(rs.relation);
  document.getElementById('tmod-desc').textContent          = region.desc;

  renderTradeGoods(regionId);
  document.getElementById('trade-modal').style.display = 'flex';
}

function renderTradeGoods(regionId) {
  const region  = REGIONS[regionId];
  const rs      = G.regionState[regionId];
  const exports = Object.entries(region.exports || {});
  const container = document.getElementById('tmod-goods');

  // ── BUY section ──────────────────────────────────────────
  let buyHtml = `<div class="tmod-section-header">📦 BUY from ${region.name.split(' ')[0]}</div>`;
  if (exports.length === 0) {
    buyHtml += '<p style="color:#4a3010;font-size:0.8em;padding:4px 0">Nothing available to buy.</p>';
  } else {
    buyHtml += exports.map(([resId, info]) => {
      const availQty = Math.max(0, info.qty + (rs.exportMods[resId] || 0));
      const price    = getPrice(resId, regionId);
      const cartQty  = buyCart[resId] || 0;
      const priceClass = price > BASE_PRICES[resId] * 1.4 ? 'expensive' : price < BASE_PRICES[resId] * 0.8 ? 'cheap' : '';
      const canAffordMore = G.res.gold + sellCartRevenue(regionId) - buyCartCost(regionId) >= price;

      return `<div class="trade-good-row">
        <div class="tg-icon">${info.icon}</div>
        <div class="tg-name">${info.name}<br><span style="font-size:0.78em;color:#5a4020">Avail: ${availQty}</span></div>
        <div class="tg-price ${priceClass}">◎${price.toFixed(1)}<br><span class="tg-label">BUY</span></div>
        <div class="tg-controls">
          <button class="buy-btn" data-res="${resId}" data-dir="-1">−</button>
          <span id="bqty-${resId}">${cartQty}</span>
          <button class="buy-btn" data-res="${resId}" data-dir="1" ${!canAffordMore || cartQty >= availQty ? 'disabled' : ''}>+</button>
        </div>
        <div class="tg-subtotal" id="bsub-${resId}">◎${(price * cartQty).toFixed(0)}</div>
      </div>`;
    }).join('');
  }

  // ── SELL section ─────────────────────────────────────────
  const sellable = Object.entries(RES_META).filter(([resId]) =>
    resId !== 'gold' && (G.res[resId] || 0) > 0
  );

  let sellHtml = `<div class="tmod-section-header" style="margin-top:12px">💰 SELL to ${region.name.split(' ')[0]}</div>`;
  if (sellable.length === 0) {
    sellHtml += '<p style="color:#4a3010;font-size:0.8em;padding:4px 0">You have nothing to sell.</p>';
  } else {
    sellHtml += sellable.map(([resId, meta]) => {
      const playerQty = G.res[resId] || 0;
      const cartQty   = sellCart[resId] || 0;
      const sellPrice = getSellPrice(resId, regionId);
      const isWanted  = (region.imports || []).includes(resId);
      const wantedBadge = isWanted ? `<span class="wanted-badge">WANTED</span>` : '';

      return `<div class="trade-good-row">
        <div class="tg-icon">${meta.icon}</div>
        <div class="tg-name">${meta.name} ${wantedBadge}<br><span style="font-size:0.78em;color:#5a4020">You have: ${playerQty}</span></div>
        <div class="tg-price cheap">◎${sellPrice.toFixed(1)}<br><span class="tg-label tg-sell-label">SELL</span></div>
        <div class="tg-controls">
          <button class="sell-btn" data-res="${resId}" data-dir="-1">−</button>
          <span id="sqty-${resId}">${cartQty}</span>
          <button class="sell-btn" data-res="${resId}" data-dir="1" ${cartQty >= playerQty ? 'disabled' : ''}>+</button>
        </div>
        <div class="tg-subtotal" id="ssub-${resId}" style="color:#80c060">+◎${(sellPrice * cartQty).toFixed(0)}</div>
      </div>`;
    }).join('');
  }

  container.innerHTML = buyHtml + sellHtml;

  // Wire BUY buttons
  container.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const resId  = btn.dataset.res;
      const dir    = parseInt(btn.dataset.dir);
      const info   = region.exports[resId];
      const avail  = Math.max(0, info.qty + (rs.exportMods[resId] || 0));
      const price  = getPrice(resId, regionId);
      const cur    = buyCart[resId] || 0;
      const newQty = Math.max(0, Math.min(avail, cur + dir));

      if (dir > 0) {
        const netGold = G.res.gold + sellCartRevenue(regionId) - buyCartCost(regionId);
        if (netGold < price) return;
      }

      buyCart[resId] = newQty;
      document.getElementById(`bqty-${resId}`).textContent = newQty;
      document.getElementById(`bsub-${resId}`).textContent = `◎${(price * newQty).toFixed(0)}`;
      updateCartSummary(regionId);
      renderTradeGoods(regionId);
    });
  });

  // Wire SELL buttons
  container.querySelectorAll('.sell-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const resId     = btn.dataset.res;
      const dir       = parseInt(btn.dataset.dir);
      const playerQty = G.res[resId] || 0;
      const sellPrice = getSellPrice(resId, regionId);
      const cur       = sellCart[resId] || 0;
      const newQty    = Math.max(0, Math.min(playerQty, cur + dir));

      sellCart[resId] = newQty;
      document.getElementById(`sqty-${resId}`).textContent = newQty;
      document.getElementById(`ssub-${resId}`).textContent = `+◎${(sellPrice * newQty).toFixed(0)}`;
      updateCartSummary(regionId);
      renderTradeGoods(regionId);
    });
  });

  updateCartSummary(regionId);
}

function buyCartCost(regionId) {
  return Object.entries(buyCart).reduce((sum, [resId, qty]) => {
    return sum + (qty > 0 ? getPrice(resId, regionId, true) * qty : 0);
  }, 0);
}

function sellCartRevenue(regionId) {
  return Object.entries(sellCart).reduce((sum, [resId, qty]) => {
    return sum + (qty > 0 ? getSellPrice(resId, regionId) * qty : 0);
  }, 0);
}

function updateCartSummary(regionId) {
  const buyCost  = buyCartCost(regionId);
  const sellRev  = sellCartRevenue(regionId);
  const netCost  = buyCost - sellRev;

  const buyItems  = Object.entries(buyCart).filter(([,q]) => q > 0).map(([r,q]) => `${q}× ${RES_META[r]?.icon || r}`);
  const sellItems = Object.entries(sellCart).filter(([,q]) => q > 0).map(([r,q]) => `${q}× ${RES_META[r]?.icon || r}`);

  const summary = document.getElementById('tmod-cart-summary');
  const confirm = document.getElementById('tmod-confirm');

  if (!buyItems.length && !sellItems.length) {
    summary.textContent  = 'No items selected.';
    confirm.disabled     = true;
    return;
  }

  let html = '';
  if (buyItems.length)  html += `Buy: ${buyItems.join(' ')} <span style="color:#d4a017">−◎${buyCost.toFixed(1)}</span><br>`;
  if (sellItems.length) html += `Sell: ${sellItems.join(' ')} <span style="color:#80c060">+◎${sellRev.toFixed(1)}</span><br>`;
  const netColor = netCost <= 0 ? '#80c060' : '#d4a017';
  html += `Net: <b style="color:${netColor}">${netCost <= 0 ? '+' : '−'}◎${Math.abs(netCost).toFixed(1)}</b>`;
  if (netCost > 0 && G.res.gold < netCost) html += ` <span style="color:#c03030">(need ◎${(netCost - G.res.gold).toFixed(1)} more)</span>`;

  summary.innerHTML = html;
  confirm.disabled  = netCost > 0 && G.res.gold < netCost;
}

document.getElementById('tmod-close').addEventListener('click', () => {
  document.getElementById('trade-modal').style.display = 'none';
});

document.getElementById('tmod-confirm').addEventListener('click', () => {
  if (!currentTradeRegionId) return;

  const regionId   = currentTradeRegionId;
  const regionName = REGIONS[regionId].name;
  const buyCost    = buyCartCost(regionId);
  const sellRev    = sellCartRevenue(regionId);
  const netCost    = buyCost - sellRev;

  const bought = [], sold = [];

  Object.entries(buyCart).forEach(([resId, qty]) => {
    if (qty <= 0) return;
    G.res[resId] = (G.res[resId] || 0) + qty;
    bought.push(`${qty}× ${RES_META[resId]?.icon || resId}`);
  });

  Object.entries(sellCart).forEach(([resId, qty]) => {
    if (qty <= 0) return;
    G.res[resId] = Math.max(0, (G.res[resId] || 0) - qty);
    sold.push(`${qty}× ${RES_META[resId]?.icon || resId}`);
  });

  G.res.gold = Math.max(0, G.res.gold - netCost);

  const parts = [];
  if (bought.length) parts.push(`bought ${bought.join(' ')}`);
  if (sold.length)   parts.push(`sold ${sold.join(' ')}`);
  G.addLog(`Trade with ${regionName}: ${parts.join(', ')}. Net ◎${Math.abs(netCost).toFixed(0)} ${netCost <= 0 ? 'gained' : 'spent'}.`, 'log-trade');

  document.getElementById('trade-modal').style.display = 'none';
  G.tradeDoneThisTurn = true;
  G.lastTradedRegionId = regionId;
  buyCart = {}; sellCart = {};
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
document.getElementById('diplo-btn').addEventListener('click', openDiploModal);
document.getElementById('diplo-close').addEventListener('click', () => {
  document.getElementById('diplo-modal').style.display = 'none';
});

// ─── TRIBUTE MODAL ────────────────────────────────────────────
function showTributeModal(callback) {
  const hattiRs = G.regionState.hatti;
  const hd      = hattiRs?.diplo;

  // Skip modal: not a vassal, Hatti destroyed, or already at war with Hatti
  if (!G.vassalOfHatti || hattiRs?.destroyed || hd?.atWar) {
    return callback();
  }

  const due     = G.tributeDoubleThisTurn ? 6 : 3;
  const canPay  = G.res.bronze >= due;
  const score   = hd?.score ?? 0;
  const color   = getDiploColor(score, false);
  const label   = hd ? getDiploLabel(score, false) : '~ Unknown';
  const doubleWarn = G.tributeDoubleThisTurn
    ? `<div class="trib-warn">⚠ Double tribute demanded this year!</div>` : '';

  document.getElementById('trib-due-amount').textContent  = due;
  document.getElementById('trib-hatti-status').innerHTML  =
    `Hatti relations: <span style="color:${color}">${label} (${score > 0 ? '+' : ''}${score})</span>`;
  document.getElementById('trib-double-warn').innerHTML   = doubleWarn;
  document.getElementById('trib-bronze-have').textContent =
    `You have: ⚙ ${G.res.bronze} bronze`;

  const payBtn = document.getElementById('trib-pay-btn');
  payBtn.disabled = !canPay;
  payBtn.innerHTML = canPay
    ? `Pay ⚙${due} &nbsp;<span class="trib-consequence good">Relations +4</span>`
    : `Pay ⚙${due} &nbsp;<span class="trib-consequence bad">Not enough bronze</span>`;

  document.getElementById('tribute-modal').style.display = 'flex';

  const finish = (refused) => {
    document.getElementById('tribute-modal').style.display = 'none';
    G.tributeRefusedThisTurn = refused;
    callback();
  };

  document.getElementById('trib-pay-btn').onclick    = () => canPay && finish(false);
  document.getElementById('trib-refuse-btn').onclick = () => finish(true);
}

document.getElementById('next-turn-btn').addEventListener('click', () => {
  showTributeModal(advanceTurn);
});

function advanceTurn() {
  G.tradeDoneThisTurn = false;

  // 0. Update diplomacy (score drift, demands, war declarations)
  updateDiplomacyPerTurn();

  // 0b. Update drought — must come before production since it changes grain mult
  updateDrought();

  // 1. Collect production (drought + stability + toll already factored in)
  const prod = getTroyProduction();
  G.res.grain  += prod.grain;
  G.res.gold   += prod.gold - garrisonGoldCost();
  if (prod.bronze > 0) {
    G.res.bronze += prod.bronze;
    G.addLog(`Bronze Smithy produced ${prod.bronze} bronze.`, 'log-good');
  }
  if (G.droughtLevel > 0) {
    const label = G.droughtLevel === 1 ? 'dry season' : 'severe drought';
    G.addLog(`🌾 Harvest reduced by ${G.droughtLevel === 1 ? '30' : '55'}% (${label}).`, 'log-event');
  }

  // 2. Pay tribute
  if (G.vassalOfHatti) payTribute();

  // 3. Feed population
  feedPopulation();

  // 3b. Feed garrison (rations for soldiers)
  feedGarrison();

  // 3c. Random mini-event (before stability — events may affect it)
  rollMiniEvent();

  // 3d. Update social stability
  updateStability();

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
      // Force Mycenae into war state via diplomacy
      const myd = G.regionState.mycenae?.diplo;
      if (myd && !myd.atWar) {
        myd.atWar = true; myd.score = -85;
        myd.warDeclaredTurn = G.turn; myd.warAttackTurn = G.turn - 1;
      }
      showEventModal(ev, summary, () => {
        const siegeEff = ev.effects.find(e => e.type === 'siege');
        const battleConfig = siegeEff ? {
          attacker: 'Mycenaean Host',
          attackerIcon: '🛡',
          baseSize: siegeEff.attackStrength,
          type: 'siege',
          desc: 'A great Achaean fleet besieges the walls of Troy!',
          regionId: 'mycenae',
        } : null;
        if (battleConfig) {
          processBattleQueue([battleConfig], () => { renderAll(); checkTurnEnd(); });
        } else {
          renderAll(); checkTurnEnd();
        }
      });
    } else if (ev.isFinal) {
      showEventModal(ev, summary, () => {
        buildAndProcessRandomBattles(() => { renderAll(); checkTurnEnd(); });
      });
    } else {
      showEventModal(ev, summary, () => {
        buildAndProcessRandomBattles(() => { renderAll(); checkTurnEnd(); });
      });
    }
  } else {
    buildAndProcessRandomBattles(() => { renderAll(); checkTurnEnd(); });
  }
}

function checkTurnEnd() {
  if (G.turn > G.maxTurns) checkVictory();
}

function buildAndProcessRandomBattles(callback) {
  const t = G.turn;
  const queue = [];

  // ── Diplomatic wars (from region AI) ─────────────────────
  getDiplomaticWarBattles().forEach(b => queue.push(b));

  // Kashka raiders (turns 2-10)
  if (t >= 2 && t <= 10 && Math.random() < 0.22) {
    queue.push({
      attacker: 'Kashka Raiders',
      attackerIcon: '🗡',
      baseSize: 12 + Math.floor(Math.random() * 22),
      type: 'raid',
      desc: 'A Kashka raiding party descends from the northern hills.'
    });
  }

  // Sea Peoples (turns 6-15) — grow dramatically as the Bronze Age collapses
  if (t >= 6 && t <= 15) {
    const spChance  = t >= 12 ? 0.78 : t >= 9 ? 0.52 : t >= 7 ? 0.32 : 0.18;
    const spMinSize = t >= 12 ? 95  : t >= 9  ? 68   : t >= 7  ? 45   : 30;
    const spRndSize = t >= 12 ? 55  : t >= 9  ? 40   : t >= 7  ? 30   : 20;
    if (Math.random() < spChance) {
      queue.push({
        attacker: 'Sea Peoples',
        attackerIcon: '🏴‍☠️',
        baseSize: spMinSize + Math.floor(Math.random() * spRndSize),
        type: t >= 8 ? 'invasion' : 'raid',
        desc: t >= 12
          ? 'A vast Sea Peoples migration fleet descends on Troy — entire nations on the move.'
          : 'Sea Peoples raiders strike at the heart of the Aegean trade routes.',
      });
    }
  }

  // Refugee bandits (turns 12-15)
  if (t >= 12 && t <= 15 && Math.random() < 0.20) {
    queue.push({
      attacker: 'Refugee Bandits',
      attackerIcon: '👥',
      baseSize: 8 + Math.floor(Math.random() * 15),
      type: 'raid',
      desc: 'Desperate refugees from fallen cities have turned to raiding.'
    });
  }

  processBattleQueue(queue, callback);
}

function processBattleQueue(queue, callback) {
  if (!queue.length) { callback(); return; }
  const config = queue.shift();
  const result = simulateBattle(config);
  showBattleModal(result, () => {
    applyBattleResult(result);
    processBattleQueue(queue, callback);
  });
}

// ─── BATTLE SYSTEM ────────────────────────────────────────────

const PHASE_NAMES = ['Advance & Skirmish', 'Main Assault', 'Final Clash'];
const PHASE_DESCS = [
  'Archers and skirmishers exchange fire as the attackers advance.',
  'The main force storms the walls and gate.',
  'The battle reaches its climax — one side gives way.'
];
const LOSS_FRAC = { decisive_victory: 0.02, victory: 0.05, pyrrhic: 0.20, defeat: 0.40, sack: 0.60 };

// ─── EXPEDITION (player attacks a city) ─────────────────────
function launchExpedition(city) {
  if (getTotalGarrison() === 0) {
    G.addLog('You have no troops to send on expedition.', 'log-crisis');
    drawMap(); return;
  }
  const result = simulateExpedition(city);
  showBattleModal(result, () => {
    applyExpeditionResult(result);
    renderAll();
  });
}

function simulateExpedition(city) {
  const { region, label: cityLabel, id: cityId } = city;
  const prof      = DIPLO_PROFILE[region];
  const cityIcon  = REGIONS[region]?.icon ?? '🏰';
  const effMil    = region === 'hatti' ? getHattiMilitary() : (prof?.military ?? 15);
  // Cities defend with walls bonus (1.2×) and home-field randomness
  const cityDefSize = Math.max(8, effMil + Math.floor(Math.random() * 18));
  const cityDefBase = cityDefSize * 1.20;

  // Chariots boost expedition attack power (+10% per team, up to +50%)
  const chariotMult = 1 + G.cavalryBonus * 0.10;
  const playerStr   = getGarrisonStrength() * chariotMult;

  let atkTotalRolls = 0, defTotalRolls = 0;
  let atkTotalCas   = 0, defTotalCas   = 0;
  const rounds = [];

  for (let i = 0; i < 3; i++) {
    const atkRoll = playerStr   * (0.55 + Math.random() * 0.90);
    const defRoll = cityDefBase * (0.60 + Math.random() * 0.80);
    const atkCas  = Math.floor(getTotalGarrison() * (0.04 + Math.random() * 0.09));
    const defCas  = Math.floor(cityDefSize        * (0.03 + Math.random() * 0.07));
    atkTotalRolls += atkRoll; defTotalRolls += defRoll;
    atkTotalCas   += atkCas;  defTotalCas   += defCas;
    rounds.push({ name: PHASE_NAMES[i], desc: PHASE_DESCS[i], atkRoll, defRoll, atkCas, defCas });
  }

  // ratio > 1 means Troy won
  const ratio = atkTotalRolls / defTotalRolls;
  let outcome;
  if (ratio >= 1.5)       outcome = 'decisive_victory';
  else if (ratio >= 1.0)  outcome = 'victory';
  else if (ratio >= 0.80) outcome = 'pyrrhic';
  else if (ratio >= 0.55) outcome = 'defeat';
  else                    outcome = 'sack';  // Troy routed

  // Attacker (Troy) takes more casualties than defenders in siege
  const EXP_LOSS = { decisive_victory: 0.05, victory: 0.12, pyrrhic: 0.28, defeat: 0.45, sack: 0.65 };
  const lf = EXP_LOSS[outcome];
  const mLossExp = Math.min(G.militia,  Math.round(G.militia  * lf * 1.25));
  const iLossExp = Math.min(G.infantry, Math.round(G.infantry * lf * 0.75));
  const garrisonBefore = { militia: G.militia, infantry: G.infantry };
  const garrisonAfter  = { militia: Math.max(0, G.militia - mLossExp), infantry: Math.max(0, G.infantry - iLossExp) };

  return {
    isExpedition: true,
    cityId, cityLabel, cityIcon, region, cityDefSize,
    config: {
      attacker: cityLabel, attackerIcon: cityIcon,
      desc: `Troy marches on ${cityLabel}.`, regionId: region
    },
    atkSize: getTotalGarrison(),
    rounds, outcome, atkTotalCas, defTotalCas, atkTotalRolls, defTotalRolls,
    garrisonBefore, garrisonAfter, mLossExp, iLossExp, expLossFrac: lf,
  };
}

function applyExpeditionResult(result) {
  const { outcome, cityLabel, region, mLossExp, iLossExp } = result;
  const prof = DIPLO_PROFILE[region];
  const d    = G.regionState[region]?.diplo;

  // Stability: victories inspire, defeats demoralise
  const expStabDelta = { decisive_victory: +6, victory: +4, pyrrhic: -5, defeat: -8, sack: -14 }[outcome] ?? 0;
  G.stability = Math.max(0, Math.min(100, G.stability + expStabDelta));

  // Apply player garrison losses (attacker takes heavy casualties)
  applyGarrisonLoss(result.expLossFrac);

  if (outcome === 'decisive_victory' || outcome === 'victory') {
    const lootGold  = Math.floor(Math.random() * 8)  + 4;
    const lootGrain = Math.floor(Math.random() * 5)  + 2;
    G.res.gold  += lootGold;
    G.res.grain += lootGrain;
    G.addLog(`${cityLabel} raided! Seized ◎${lootGold}, 🌾${lootGrain}.`, 'log-good');
    if (d) {
      d.score = clampScore(d.score - 30);
      if (prof?.canWar && d.score <= (prof.warThreshold ?? -40) && !d.atWar) {
        d.atWar = true;
        d.warAttackTurn = null;
        G.addLog(`⚔ ${REGIONS[region].name} declares war after the raid!`, 'log-crisis');
      }
    }
  } else if (outcome === 'pyrrhic') {
    const lootGold = Math.floor(Math.random() * 4) + 1;
    G.res.gold += lootGold;
    G.addLog(`Pyrrhic raid on ${cityLabel}. Heavy losses. Seized ◎${lootGold}.`, 'log-event');
    if (d) d.score = clampScore(d.score - 18);
  } else if (outcome === 'defeat') {
    G.addLog(`Expedition to ${cityLabel} repelled. Army retreats with losses.`, 'log-crisis');
    if (d) d.score = clampScore(d.score - 8);
  } else {
    G.addLog(`Expedition to ${cityLabel} routed! Army in disorder.`, 'log-crisis');
    if (d) d.score = clampScore(d.score - 4);
  }
}

function simulateBattle(config) {
  const typeMultiplier = { siege: 1.25, invasion: 1.1, raid: 0.8 }[config.type] || 1.0;
  const atkSize = Math.round(config.baseSize * (0.8 + Math.random() * 0.4));

  const moraleMult    = G.population > 70 ? 1.12 : G.population > 40 ? 1.0 : 0.82;
  const allianceBonus = getAllianceBonus();
  // Stability morale (different from stabilityProdMult — direct combat modifier)
  const stabMorale = G.stability >= 70 ? 1.08 : G.stability >= 50 ? 1.0 : G.stability >= 30 ? 0.88 : 0.72;
  const defBase    = (getGarrisonStrength() + allianceBonus) * (1 + G.walls * 0.28) * moraleMult * stabMorale
                     + G.cavalryBonus * 8;  // chariots: +8 each (was +5)

  const atkBase = atkSize * typeMultiplier;

  let atkTotalRolls = 0, defTotalRolls = 0;
  let atkTotalCas = 0, defTotalCas = 0;
  const rounds = [];

  for (let i = 0; i < 3; i++) {
    const atkRoll = atkBase * (0.55 + Math.random() * 0.9);
    const defRoll = defBase * (0.60 + Math.random() * 0.8);
    const atkCas  = Math.floor(atkSize * (0.04 + Math.random() * 0.08));
    const defCas  = Math.floor(getTotalGarrison() * (0.03 + Math.random() * 0.07));
    atkTotalRolls += atkRoll;
    defTotalRolls += defRoll;
    atkTotalCas   += atkCas;
    defTotalCas   += defCas;
    rounds.push({ name: PHASE_NAMES[i], desc: PHASE_DESCS[i], atkRoll, defRoll, atkCas, defCas });
  }

  const ratio = defTotalRolls / atkTotalRolls;
  let outcome;
  if (ratio >= 1.5)       outcome = 'decisive_victory';
  else if (ratio >= 1.0)  outcome = 'victory';
  else if (ratio >= 0.80) outcome = 'pyrrhic';
  else if (ratio >= 0.55) outcome = 'defeat';
  else                    outcome = 'sack';

  // Pre-compute expected garrison losses (mirrors applyGarrisonLoss exactly)
  const lf = LOSS_FRAC[outcome];
  const mLossExp = Math.min(G.militia,  Math.round(G.militia  * lf * 1.25));
  const iLossExp = Math.min(G.infantry, Math.round(G.infantry * lf * 0.75));
  const garrisonBefore = { militia: G.militia, infantry: G.infantry };
  const garrisonAfter  = { militia: Math.max(0, G.militia - mLossExp), infantry: Math.max(0, G.infantry - iLossExp) };

  return { config, atkSize, rounds, outcome, atkTotalCas, defTotalCas, atkTotalRolls, defTotalRolls,
           garrisonBefore, garrisonAfter, mLossExp, iLossExp };
}

function applyBattleResult(result) {
  const { outcome, defTotalCas, atkTotalCas, config } = result;
  if (outcome === 'sack') {
    applyGarrisonLoss(0.60);
    G.walls      = Math.max(0, G.walls - 2);
    G.population = Math.max(0, Math.floor(G.population * 0.80));
    G.res.grain  = Math.max(0, Math.floor(G.res.grain * 0.50));
    G.addLog(`💀 CITY SACKED by ${config.attacker}! Walls breached, people slain.`, 'log-crisis');
    if (G.walls <= 0 || G.population <= 0) {
      endGame(false, `Troy has been sacked and its walls thrown down. The city burns. The Bronze Age claims one more victim.`);
    }
  } else if (outcome === 'defeat') {
    applyGarrisonLoss(0.40);
    G.walls      = Math.max(0, G.walls - 1);
    G.population = Math.max(0, Math.floor(G.population * 0.90));
    G.res.grain  = Math.max(0, Math.floor(G.res.grain * 0.75));
    G.addLog(`⚠ Defeated by ${config.attacker}. Heavy losses sustained.`, 'log-crisis');
  } else if (outcome === 'pyrrhic') {
    applyGarrisonLoss(0.20);
    G.population = Math.max(0, Math.floor(G.population * 0.95));
    G.addLog(`⚔ ${config.attacker} repelled — but at great cost.`, 'log-event');
  } else if (outcome === 'victory') {
    applyGarrisonLoss(0.05);
    G.addLog(`✓ ${config.attacker} driven back. Troy holds!`, 'log-good');
  } else {
    applyGarrisonLoss(0.02);
    G.addLog(`🏆 ${config.attacker} crushed decisively. Troy's glory grows!`, 'log-good');
  }

  // Stability effects: battles shake social cohesion
  const stabDelta = { decisive_victory: +8, victory: +4, pyrrhic: -3, defeat: -12, sack: -22 }[outcome] ?? 0;
  G.stability = Math.max(0, Math.min(100, G.stability + stabDelta));

  // Diplomatic war: update scores based on result
  if (config.regionId) {
    const d = G.regionState[config.regionId]?.diplo;
    if (d?.atWar) {
      if (outcome === 'decisive_victory' || outcome === 'victory') {
        d.score = clampScore(d.score + 10); // war weariness — they may seek peace
        if (d.score > -10) { d.atWar = false; G.addLog(`${config.attacker} retreats. War ends.`, 'log-good'); }
      } else if (outcome === 'sack' || outcome === 'defeat') {
        d.score = clampScore(d.score - 8);  // emboldened
      }
    }
  }
}

function showBattleModal(result, onDone) {
  const { config, atkSize, rounds, outcome, atkTotalCas, defTotalCas, atkTotalRolls, defTotalRolls,
          garrisonBefore, garrisonAfter, mLossExp, iLossExp, isExpedition } = result;
  const year = 1250 - (G.turn - 1) * 7;

  document.getElementById('bmod-year').textContent     = `${year} BCE`;
  document.getElementById('bmod-subtitle').textContent = config.desc;

  if (isExpedition) {
    // Left card = Troy army (attacker); Right card = city (defender)
    document.getElementById('bmod-title').textContent    = `Troy Expedition — ${result.cityLabel}`;
    document.getElementById('bmod-atk-icon').textContent = '♟';
    document.getElementById('bmod-atk-name').textContent = 'TROY ARMY';
    document.getElementById('bmod-atk-size').textContent = `Militia: ${garrisonBefore.militia}  Infantry: ${garrisonBefore.infantry}`;
    document.getElementById('bmod-atk-power').textContent = `Str: ${Math.round(atkTotalRolls)}`;
    document.getElementById('bmod-def-size').textContent  = `${result.cityIcon} ${result.cityLabel}`;
    document.getElementById('bmod-def-power').textContent = `Garrison: ~${result.cityDefSize}`;
    document.getElementById('bmod-def-walls').textContent = `🏰 Fortified city ×1.20`;
  } else {
    // Normal defence: Left card = enemy; Right card = Troy
    document.getElementById('bmod-title').textContent    = `Battle of Troy — ${config.attacker}`;
    document.getElementById('bmod-atk-icon').textContent = config.attackerIcon;
    document.getElementById('bmod-atk-name').textContent = config.attacker;
    document.getElementById('bmod-atk-size').textContent = `Army: ${atkSize}`;
    document.getElementById('bmod-atk-power').textContent = `Power: ${Math.round(atkTotalRolls)}`;
    document.getElementById('bmod-def-size').textContent  = `Militia: ${garrisonBefore.militia}  Infantry: ${garrisonBefore.infantry}  (str: ${getGarrisonStrength()})`;
    document.getElementById('bmod-def-power').textContent = `Power: ${Math.round(defTotalRolls)}`;
    document.getElementById('bmod-def-walls').textContent = `🏰 Walls ×${(1 + G.walls * 0.28).toFixed(2)}`;
  }

  const maxPow = Math.max(atkTotalRolls, defTotalRolls);
  document.getElementById('bmod-bar-atk').style.width = `${Math.round(atkTotalRolls / maxPow * 100)}%`;
  document.getElementById('bmod-bar-def').style.width = `${Math.round(defTotalRolls / maxPow * 100)}%`;

  document.getElementById('bmod-phases').innerHTML = rounds.map((rnd, i) => {
    // "winner" label: in expedition Troy is atk side, in defence Troy is def side
    const troyWon = isExpedition ? rnd.atkRoll >= rnd.defRoll : rnd.defRoll >= rnd.atkRoll;
    const winner = troyWon ? '🛡 Troy holds' : '⚔ Enemy presses';
    return `<div class="battle-phase">
      <div class="phase-name">Phase ${i+1}: ${rnd.name}</div>
      <div class="phase-desc">${rnd.desc}</div>
      <div class="phase-losses">
        <span class="phase-atk-loss">⚔ −${rnd.atkCas}</span>
        <span class="phase-winner">${winner}</span>
        <span class="phase-def-loss">🛡 −${rnd.defCas}</span>
      </div>
    </div>`;
  }).join('');

  const outcomeLabels = isExpedition
    ? {
        decisive_victory: { icon: '🏆', title: 'CITY SACKED',       cls: 'result-victory' },
        victory:          { icon: '✓',  title: 'RAID SUCCESSFUL',    cls: 'result-victory' },
        pyrrhic:          { icon: '⚔',  title: 'PYRRHIC RAID',       cls: 'result-pyrrhic' },
        defeat:           { icon: '💀', title: 'REPELLED',           cls: 'result-defeat'  },
        sack:             { icon: '🔥', title: 'ROUTED',             cls: 'result-defeat'  },
      }
    : {
        decisive_victory: { icon: '🏆', title: 'DECISIVE VICTORY',   cls: 'result-victory' },
        victory:          { icon: '✓',  title: 'VICTORY',            cls: 'result-victory' },
        pyrrhic:          { icon: '⚔',  title: 'PYRRHIC VICTORY',    cls: 'result-pyrrhic' },
        defeat:           { icon: '💀', title: 'DEFEAT',             cls: 'result-defeat'  },
        sack:             { icon: '🔥', title: 'CITY SACKED',        cls: 'result-defeat'  },
      };

  const outcomeInfo = outcomeLabels[outcome];
  document.getElementById('bmod-result-icon').textContent  = outcomeInfo.icon;
  const titleEl = document.getElementById('bmod-result-title');
  titleEl.textContent = outcomeInfo.title;
  titleEl.className   = outcomeInfo.cls;

  const totalLoss = mLossExp + iLossExp;
  if (isExpedition) {
    // Swap: left shows city losses, right shows Troy's army losses
    document.getElementById('bmod-atk-cas').textContent = `${result.cityLabel} casualties: ${defTotalCas}`;
    document.getElementById('bmod-def-cas').innerHTML =
      totalLoss > 0
        ? `Troy army: ${garrisonBefore.militia}+${garrisonBefore.infantry} → ` +
          `<span class="bmod-loss-after">${garrisonAfter.militia}+${garrisonAfter.infantry}</span>` +
          ` &nbsp;(−${mLossExp} militia, −${iLossExp} infantry)`
        : `Troy army: ${garrisonBefore.militia}+${garrisonBefore.infantry} — no significant losses`;
  } else {
    document.getElementById('bmod-atk-cas').textContent = `${config.attacker} casualties: ${atkTotalCas}`;
    document.getElementById('bmod-def-cas').innerHTML =
      totalLoss > 0
        ? `Troy garrison: ${garrisonBefore.militia}+${garrisonBefore.infantry} → ` +
          `<span class="bmod-loss-after">${garrisonAfter.militia}+${garrisonAfter.infantry}</span>` +
          ` &nbsp;(−${mLossExp} militia, −${iLossExp} infantry)`
        : `Troy garrison: ${garrisonBefore.militia}+${garrisonBefore.infantry} — no significant losses`;
  }

  const modal = document.getElementById('battle-modal');
  modal.style.display = 'flex';

  const btn = document.getElementById('bmod-continue');
  const handler = () => {
    modal.style.display = 'none';
    btn.removeEventListener('click', handler);
    onDone();
  };
  btn.addEventListener('click', handler);
}

function checkVictory() {
  if (G.turn > G.maxTurns) {
    if (G.population > 20 && G.walls >= 1) {
      const score = G.population + G.walls * 10 + getTotalGarrison() + G.res.bronze * 2 + G.res.gold
                  + Math.round(G.stability / 5)  // social cohesion reward
                  + (G.ironWorking ? 20 : 0);     // prestige of iron age transition
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
