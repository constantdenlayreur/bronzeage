'use strict';

// ============================================================
//  WILUSA: Twilight of the Bronze Age — Complete Rewrite
//  Two-panel: City (left) + World (right)
//  Season system, population units, 3 factions, dynasty
// ============================================================

const REF_W = 1200, REF_H = 800;

// ─── REGION DEFINITIONS ─────────────────────────────────────
const REGIONS = {
  troy: {
    name: 'Troy (Wilusa)', icon: '⚔', isPlayer: true,
    cx: 218, cy: 182,
    poly: [[215,148],[268,142],[298,165],[302,198],[275,224],[240,228],[215,224],[215,162]],
    fillColor: '#4a2e08', borderColor: '#d4a017',
    desc: 'Hail Priamm, Son of Laomedon. Your city. Guards the Hellespont, commanding the strait between the Aegean and Black Sea.',
    relation: 'player', exports: {}, distance: 0,
  },
  mycenae: {
    name: 'Mycenae', icon: '🛡', isPlayer: false,
    cx: 65, cy: 298,
    poly: [[15,260],[92,254],[107,274],[105,312],[82,342],[44,348],[14,322],[12,288]],
    fillColor: '#2e1e44', borderColor: '#9a5cc0',
    desc: 'The great warrior kingdoms of Greece. Rich in silver and olive oil — but hungry for bronze. As the saying goes  : Timeo danaos et dona ferentes',
    relation: 'suspicious', distance: 2,
    exports: {
      olive_oil: { name:'Olive Oil', icon:'🫒', basePrice:4, qty:5 },
      silver:    { name:'Silver',    icon:'🥈', basePrice:7, qty:3 },
    },
    imports: ['bronze','grain'], threatLevel: 0,
  },
  crete: {
    name: 'Crete (Knossos)', icon: '🐂', isPlayer: false,
    cx: 148, cy: 392,
    poly: [[88,382],[152,378],[195,384],[208,398],[180,410],[142,412],[95,405]],
    fillColor: '#1a2040', borderColor: '#4878b8',
    desc: 'Island realm of Knossos. Safe and prosperous, a crossroads of Aegean trade.',
    relation: 'friendly', distance: 2,
    exports: {
      olive_oil: { name:'Olive Oil', icon:'🫒', basePrice:3, qty:4 },
      pottery:   { name:'Pottery',   icon:'🏺', basePrice:3, qty:4 },
    },
    imports: ['bronze','grain'],
  },
  arzawa: {
    name: 'Arzawa', icon: '🌲', isPlayer: false,
    cx: 292, cy: 278,
    poly: [[215,228],[240,228],[275,224],[340,222],[368,252],[368,308],[342,342],[295,358],[248,355],[220,325],[215,282]],
    fillColor: '#183520', borderColor: '#4a9038',
    desc: 'Your western neighbour in Anatolia. Rich in timber, grain, and horses.',
    relation: 'neutral', distance: 1,
    exports: {
      grain:   { name:'Grain',   icon:'🌾', basePrice:2, qty:6 },
      timber:  { name:'Timber',  icon:'🪵', basePrice:3, qty:5 },
      horses:  { name:'Horses',  icon:'🐎', basePrice:8, qty:2 },
    },
    imports: ['bronze','gold'],
  },
  hatti: {
    name: 'Hatti (Hittites)', icon: '👑', isPlayer: false,
    cx: 492, cy: 198,
    poly: [[340,138],[455,118],[575,122],[662,155],[668,215],[645,265],[580,292],[510,298],[435,292],[368,272],[368,252],[340,222],[340,138]],
    fillColor: '#2e1010', borderColor: '#c83028',
    desc: 'Your overlord. The Hittite Empire spans central Anatolia. They demand tribute in bronze each year.',
    relation: 'overlord', distance: 2,
    exports: {
      horses: { name:'Horses',  icon:'🐎', basePrice:7, qty:3 },
      silver: { name:'Silver',  icon:'🥈', basePrice:5, qty:4 },
      grain:  { name:'Grain',   icon:'🌾', basePrice:2, qty:5 },
    },
    imports: ['bronze'], tributeDue: 3,
  },
  kashka: {
    name: 'Kashka', icon: '🗡', isPlayer: false,
    cx: 480, cy: 88,
    poly: [[278,58],[438,42],[578,47],[688,80],[692,155],[662,155],[575,122],[455,118],[340,138],[278,118],[278,78]],
    fillColor: '#221c0c', borderColor: '#7a6822',
    desc: "Northern raiders along the Black Sea coast. They do not trade — they raid.",
    relation: 'hostile', distance: 2,
    exports: {}, noTrade: true,
  },
  cyprus: {
    name: 'Cyprus (Alashiya)', icon: '⚒', isPlayer: false,
    cx: 455, cy: 360,
    poly: [[415,352],[458,347],[492,355],[498,368],[468,378],[428,376],[412,362]],
    fillColor: '#2a1608', borderColor: '#c87030',
    desc: 'The great copper island. Cyprus supplies most of the copper in the Mediterranean world.',
    relation: 'friendly', distance: 3,
    exports: {
      copper: { name:'Copper', icon:'⚒', basePrice:3, qty:8 },
    },
    imports: ['grain','silver'], isCopperHub: true,
  },
  ugarit: {
    name: 'Ugarit / Syria', icon: '🏺', isPlayer: false,
    cx: 548, cy: 325,
    poly: [[515,302],[572,298],[605,315],[608,352],[580,378],[538,382],[510,362],[508,328]],
    fillColor: '#142a18', borderColor: '#3a8030',
    desc: 'The greatest trading hub of the age. Ugarit connects east and west, north and south.',
    relation: 'neutral', distance: 3,
    exports: {
      grain:    { name:'Grain',    icon:'🌾', basePrice:2, qty:7 },
      tin:      { name:'Tin',      icon:'🔩', basePrice:6, qty:4 },
      purple_dye:{ name:'Purple Dye', icon:'🟣', basePrice:8, qty:2 },
    },
    imports: ['bronze','copper','grain'], isTinHub: true,
  },
  canaan: {
    name: 'Canaan', icon: '🌿', isPlayer: false,
    cx: 525, cy: 415,
    poly: [[508,362],[580,378],[575,408],[548,442],[515,462],[485,448],[488,418],[490,388]],
    fillColor: '#182810', borderColor: '#588030',
    desc: 'Fertile coastal land rich in grain and olive oil.',
    relation: 'neutral', distance: 4,
    exports: {
      grain:     { name:'Grain',     icon:'🌾', basePrice:2, qty:6 },
      olive_oil: { name:'Olive Oil', icon:'🫒', basePrice:4, qty:4 },
    },
    imports: ['bronze','copper'],
  },
  egypt: {
    name: 'Egypt', icon: '𓂀', isPlayer: false,
    cx: 328, cy: 545,
    poly: [[0,440],[138,415],[165,440],[355,445],[382,468],[402,512],[418,562],[402,615],[428,668],[468,748],[480,800],[0,800]],
    fillColor: '#2e2400', borderColor: '#d4aa20',
    desc: 'The eternal grain basket of the world. Egypt exports enormous quantities of grain and gold.',
    relation: 'friendly', distance: 4,
    exports: {
      grain: { name:'Grain', icon:'🌾', basePrice:2, qty:10 },
      gold:  { name:'Gold',  icon:'◎',  basePrice:5, qty:3 },
    },
    imports: ['copper','bronze','silver'], isGrainHub: true,
  },
  assyria: {
    name: 'Assyria (Assur)', icon: '🦁', isPlayer: false,
    cx: 688, cy: 298,
    poly: [[642,262],[722,255],[775,275],[785,318],[758,358],[692,368],[642,348],[635,308]],
    fillColor: '#221408', borderColor: '#c86828',
    desc: 'The great trading empire of the north. Assyrian merchants operate the tin routes from Afghanistan.',
    relation: 'neutral', distance: 4,
    exports: {
      tin:    { name:'Tin',    icon:'🔩', basePrice:6, qty:5 },
      silver: { name:'Silver', icon:'🥈', basePrice:5, qty:4 },
    },
    imports: ['bronze','grain'], isTinSource: true,
  },
  babylon: {
    name: 'Babylon', icon: '🏛', isPlayer: false,
    cx: 768, cy: 398,
    poly: [[722,355],[812,348],[882,378],[902,432],[878,482],[808,512],[722,508],[682,465],[685,418]],
    fillColor: '#0e1828', borderColor: '#2870b8',
    desc: 'Ancient city of Hammurabi. The heart of Mesopotamia, rich in gold and tin routed from the east.',
    relation: 'neutral', distance: 5,
    exports: {
      tin:  { name:'Tin',  icon:'🔩', basePrice:7, qty:4 },
      gold: { name:'Gold', icon:'◎',  basePrice:5, qty:4 },
    },
    imports: ['bronze','grain','silver'],
  },
  elam: {
    name: 'Elam (Susa)', icon: '🔶', isPlayer: false,
    cx: 878, cy: 440,
    poly: [[902,432],[968,422],[1028,452],[1018,512],[952,545],[878,542],[835,512],[835,482],[878,482]],
    fillColor: '#1c0e0e', borderColor: '#983828',
    desc: 'Far eastern kingdom at the edge of the known world.',
    relation: 'neutral', distance: 5,
    exports: {
      silver: { name:'Silver', icon:'🥈', basePrice:5, qty:3 },
      gold:   { name:'Gold',   icon:'◎',  basePrice:5, qty:3 },
    },
    imports: ['bronze','grain'],
  },
};

// ─── DIPLOMACY PROFILES ──────────────────────────────────────
const DIPLO_PROFILE = {
  mycenae: { initScore:  28, driftPerTurn: -1, military: 45, warThreshold: -35, canWar: true,  interests: ['bronze','silver'] },
  crete:   { initScore:  62, driftPerTurn: -1, military:  0, warThreshold: null, canWar: false, interests: ['grain','pottery'] },
  arzawa:  { initScore:  48, driftPerTurn: -1, military: 18, warThreshold: -55, canWar: false,  interests: ['bronze','gold']   },
  hatti:   { initScore:  42, driftPerTurn: -1, military: 65, warThreshold: -22, canWar: true,   interests: ['bronze']          },
  cyprus:  { initScore:  65, driftPerTurn: -1, military:  0, warThreshold: null, canWar: false, interests: ['grain','silver']  },
  ugarit:  { initScore:  52, driftPerTurn: -1, military:  0, warThreshold: null, canWar: false, interests: ['bronze','copper'] },
  canaan:  { initScore:  42, driftPerTurn: -1, military: 12, warThreshold: -60, canWar: false,  interests: ['bronze','copper'] },
  egypt:   { initScore:  62, driftPerTurn: -1, military: 38, warThreshold: -32, canWar: true,   interests: ['copper','silver'] },
  assyria: { initScore:  36, driftPerTurn: -1, military: 28, warThreshold: -45, canWar: true,   interests: ['bronze','grain']  },
  babylon: { initScore:  32, driftPerTurn: -1, military: 18, warThreshold: -55, canWar: false,  interests: ['bronze','grain']  },
  elam:    { initScore:  22, driftPerTurn: -1, military: 12, warThreshold: -65, canWar: false,  interests: ['bronze','silver'] },
};

// ─── BASE PRICES ─────────────────────────────────────────────
const BASE_PRICES = {
  grain: 2, copper: 3, tin: 6, bronze: 10, silver: 5,
  gold: 1, olive_oil: 4, pottery: 3, timber: 3, horses: 8, purple_dye: 8,
};

// ─── CITY LIST ────────────────────────────────────────────────
const CITY_LIST = [
  { id:'hattusa',  label:'HATTUSA',  x:492, y:195, region:'hatti'    },
  { id:'nineveh',  label:'NINEVEH',  x:695, y:295, region:'assyria'  },
  { id:'babylon',  label:'BABYLON',  x:770, y:395, region:'babylon'  },
  { id:'thebes',   label:'THEBES',   x:348, y:598, region:'egypt'    },
  { id:'ugarit',   label:'UGARIT',   x:548, y:328, region:'ugarit'   },
  { id:'mycenae',  label:'MYCENAE',  x:65,  y:298, region:'mycenae'  },
  { id:'knossos',  label:'KNOSSOS',  x:148, y:390, region:'crete'    },
  { id:'susa',     label:'SUSA',     x:878, y:438, region:'elam'     },
  { id:'enkomi',   label:'ENKOMI',   x:455, y:360, region:'cyprus'   },
  { id:'ashdod',   label:'ASHDOD',   x:525, y:418, region:'canaan'   },
  { id:'apasa',    label:'APASA',    x:292, y:278, region:'arzawa'   },
];

// ─── HISTORICAL EVENTS (30-turn system: 1 event per 2 turns) ─
const EVENTS = [
  {
    turn: 1, icon: '⚔', title: 'The Reign Begins',
    text: 'You have taken the throne of Wilusa. The Hittite Empire dominates the land. As their vassal, you owe tribute each summer — but the sea-lanes are open, and trade flows freely.',
    effects: [],
  },
  {
    turn: 4, icon: '🌊', title: 'Mycenaean Pirates',
    text: 'Mycenaean raiders prey on trade ships in the Aegean. Sea transport costs rise.',
    effects: [{ type:'price_mod', resource:'olive_oil', regionId:'mycenae', mult:1.3, desc:'Aegean trade disrupted' }],
    logText: 'Mycenaean pirates raid Aegean shipping lanes.',
    logClass: 'log-crisis',
  },
  {
    turn: 6, icon: '📜', title: 'Afghan Tin Disruption',
    text: 'Nomadic migrations disrupt the tin caravans from Afghanistan. Tin prices are rising.',
    effects: [{ type:'price_global', resource:'tin', mult:1.5, desc:'Tin +50%' }],
    logText: 'Afghan tin routes disrupted — tin prices rising.',
    logClass: 'log-event',
  },
  {
    turn: 8, icon: '☀', title: 'Drought on the Nile',
    text: 'A prolonged drought has reduced the Nile flood. Egypt\'s grain exports are cut sharply.',
    effects: [
      { type:'price_global', resource:'grain', mult:1.8, desc:'Grain +80%' },
      { type:'reduce_export', regionId:'egypt', resource:'grain', amount:4, desc:'Egypt grain supply −4' },
    ],
    logText: 'Drought on the Nile — Egyptian grain scarce.',
    logClass: 'log-crisis',
  },
  {
    turn: 10, icon: '👑', title: 'Hittite Tribute Demand',
    text: 'The Great King of Hatti has sent envoys. He demands double tribute this year.',
    effects: [{ type:'tribute_double', desc:'Tribute doubles to 6 bronze this turn' }],
    logText: 'Hatti demands double tribute — 6 bronze due.',
    logClass: 'log-tribute',
  },
  {
    turn: 12, icon: '🏴‍☠️', title: 'The Sea Peoples',
    text: 'Reports arrive of mysterious raiders from the sea. They strike without warning, burning coastal villages.',
    effects: [{ type:'price_global', resource:'copper', mult:1.3, desc:'Copper +30% (Cyprus anxiety)' }],
    logText: 'Sea Peoples first reported in the Eastern Mediterranean.',
    logClass: 'log-crisis',
  },
  {
    turn: 14, icon: '⚔', title: 'The Trojan War',
    text: 'A great Mycenaean fleet has sailed for your shores! The city walls will be tested.',
    effects: [{ type:'siege', attackStrength:40, desc:'Mycenaean siege!' }],
    logText: 'MYCENAEAN FORCES BESIEGE TROY!',
    logClass: 'log-crisis', isSiege: true,
  },
  {
    turn: 16, icon: '🔥', title: 'Cyprus Burns',
    text: 'The Sea Peoples have sacked the great copper cities of Cyprus. Copper shipments have ceased.',
    effects: [
      { type:'destroy_region', regionId:'cyprus', desc:'Cyprus destroyed' },
      { type:'price_global', resource:'copper', mult:3.0, desc:'Copper TRIPLES' },
      { type:'price_global', resource:'bronze', mult:2.0, desc:'Bronze doubles' },
    ],
    logText: 'Cyprus sacked by Sea Peoples — copper supply DESTROYED.',
    logClass: 'log-crisis',
  },
  {
    turn: 18, icon: '🌋', title: 'Earthquakes',
    text: 'A series of devastating earthquakes strikes Anatolia. Your walls crack.',
    effects: [{ type:'damage_walls', amount:1, desc:'Walls −1 (earthquake)' }],
    logText: 'Earthquake damages Troy\'s walls.',
    logClass: 'log-crisis',
  },
  {
    turn: 20, icon: '💀', title: 'Ugarit Falls',
    text: 'Ugarit — the greatest trading city in the world — has been burned to the ground.',
    effects: [
      { type:'destroy_region', regionId:'ugarit', desc:'Ugarit destroyed' },
      { type:'price_global', resource:'tin', mult:2.5, desc:'Tin prices SKYROCKET' },
    ],
    logText: 'UGARIT HAS FALLEN. The great trade hub is gone.',
    logClass: 'log-crisis',
  },
  {
    turn: 22, icon: '🌑', title: 'Hatti Collapses',
    text: 'The Hittite Empire — your overlord for a century — has collapsed. Troy is no longer a vassal. You are free — but the world order has ended.',
    effects: [
      { type:'free_from_vassalage', desc:'No more tribute to Hatti' },
      { type:'destroy_region', regionId:'hatti', desc:'Hatti destroyed' },
    ],
    logText: 'HATTI COLLAPSES. Troy is FREE — but the world is in chaos.',
    logClass: 'log-event',
  },
  {
    turn: 24, icon: '🏴‍☠️', title: 'Sea Peoples Invade Egypt',
    text: 'The Sea Peoples have reached Egypt. Grain exports are cut off entirely.',
    effects: [
      { type:'reduce_export', regionId:'egypt', resource:'grain', amount:8, desc:'Egypt grain halted' },
      { type:'price_global', resource:'grain', mult:2.0, desc:'Grain prices double' },
    ],
    logText: 'Sea Peoples invade Egypt. Grain crisis begins.',
    logClass: 'log-crisis',
  },
  {
    turn: 26, icon: '🔥', title: 'Anatolia Burns',
    text: 'City after city in Anatolia is abandoned or burned. Troy stands increasingly alone.',
    effects: [
      { type:'destroy_region', regionId:'arzawa', desc:'Arzawa falls' },
      { type:'destroy_region', regionId:'crete', desc:'Crete collapses' },
    ],
    logText: 'Arzawa and Crete collapse. The dark age spreads.',
    logClass: 'log-crisis',
  },
  {
    turn: 28, icon: '🛡', title: 'Mycenae Falls',
    text: 'The great citadels of Mycenae have been abandoned. The Aegean falls silent.',
    effects: [{ type:'destroy_region', regionId:'mycenae', desc:'Mycenae falls' }],
    logText: 'Mycenae collapses. The Aegean is dark.',
    logClass: 'log-event',
  },
  {
    turn: 30, icon: '⚔', title: 'Final Stand',
    text: 'The Bronze Age is ending. Civilizations that stood for centuries have crumbled. Troy still stands. Will you endure to the dawn of a new age?',
    effects: [], logText: 'The final season. Can Troy survive?',
    logClass: 'log-event', isFinal: true,
  },
];


// ─── GAME STATE ──────────────────────────────────────────────
const G = {
  turn: 1,
  maxTurns: 30,  // 30 half-years = 15 full years

  // Resources
  res: {
    grain: 50, copper: 8, tin: 4, bronze: 6, gold: 30,
    silver: 0, olive_oil: 0, pottery: 0, timber: 0, horses: 0, purple_dye: 0,
  },

  // Population units (each unit = 100 people)
  pop: {
    peasant:   45,   // produce grain (summer only)
    artisan:   15,   // produce bronze
    militia:   20,   // defend city (cheap, weaker)
    legionary:  5,   // defend city (expensive, strong)
    trader:    10,   // generate gold
    patrician:  5,   // palatial faction; plot coups
  },

  // Dynasty
  dynasty: {
    rulerName: 'Priam',
    rulerAge:  35,
    legitimacy: 70,   // 0-100; at 0 = coup succeeds
    reignTurns: 0,
  },

  // Factions
  factions: {
    city:     { loyalty: 70 },   // peasants + artisans + traders
    military: { loyalty: 70 },   // militia + legionaries
    palatial: { loyalty: 65 },   // patricians
  },

  // Buildings (levels)
  buildings: { walls: 3, harbor: 1, workshop: 1, farms: 1, palace: 1 },

  // Policy
  taxRate:  'normal',  // 'low' | 'normal' | 'high'
  tollRate: 'normal',  // 'low' | 'normal' | 'high'

  // Stability (derived/updated each turn)
  stability: 75,

  // Iron working tech
  ironWorking: false,

  // Cavalry bonus
  cavalryBonus: 0,

  // Disruption: increases trade costs; increased by wars and collapse events
  disruption: 0,

  // Vassal status
  vassalOfHatti: true,
  tributeDoubleThisTurn: false,
  tributeRefusedThisTurn: false,

  // Drought
  droughtLevel: 0,

  // Famine
  famine: false,
  famineStreak: 0,   // consecutive turns with famine

  // Population history for chart (up to 30 entries)
  popHistory: [],

  // Trade
  tradeDoneThisTurn: false,
  lastTradedRegionId: null,

  // Diplomatic letters
  pendingLetters: [],
  nextLetterId: 1,

  // Inter-nation wars (affect disruption)
  nationWars: [],

  // Price multipliers
  priceMult: {
    grain:1, copper:1, tin:1, bronze:1, silver:1,
    olive_oil:1, pottery:1, timber:1, horses:1, purple_dye:1,
  },

  // Region state
  regionState: {},

  // Price history for chart
  priceHistory: [],

  // Production upgrades (legacy compatibility for smithy)
  production: { farmland: 0, tollgate: 0, smithy: 0 },

  // Log
  log: [],
  addLog(text, cls='log-norm') {
    this.log.unshift({ text, cls });
    if (this.log.length > 50) this.log.pop();
    renderLog();
  }
};

// ─── INIT REGION STATE ───────────────────────────────────────
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
      warAttackTurn:   null,
      pendingDemand:   null,
    } : null,
  };
});

// ─── SEASON / TIME HELPERS ───────────────────────────────────
function isSummer()    { return G.turn % 2 === 1; }
function seasonLabel() { return isSummer() ? '☀ Summer' : '❄ Winter'; }
function bcYear()      { return 1250 - Math.floor((G.turn - 1) / 2); }

function popTotal()    {
  return Object.values(G.pop).reduce((s, v) => s + v, 0);
}

function getTotalGarrison()   { return G.pop.militia + G.pop.legionary; }
function getGarrisonStrength() {
  const ironMult = G.ironWorking ? 1.30 : 1.0;
  return G.pop.militia * 1.0 + Math.round(G.pop.legionary * 1.6 * ironMult);
}

function garrisonGoldCost() {
  return Math.floor(G.pop.militia / 6) + Math.floor(G.pop.legionary / 4);
}

function garrisonGrainCost() {
  return Math.floor(G.pop.militia / 8) + Math.floor(G.pop.legionary / 6);
}

function applyGarrisonLoss(frac) {
  const mLoss = Math.min(G.pop.militia,   Math.round(G.pop.militia   * frac * 1.25));
  const iLoss = Math.min(G.pop.legionary, Math.round(G.pop.legionary * frac * 0.75));
  G.pop.militia   = Math.max(0, G.pop.militia   - mLoss);
  G.pop.legionary = Math.max(0, G.pop.legionary - iLoss);
  return mLoss + iLoss;
}

// ─── PRODUCTION (season-aware) ───────────────────────────────
function droughtGrainMult() { return [1.0, 0.70, 0.45][G.droughtLevel]; }

function stabilityProdMult() {
  if (G.stability >= 80) return 1.15;
  if (G.stability >= 60) return 1.00;
  if (G.stability >= 40) return 0.85;
  return 0.70;
}

function getTollGoldBonus() {
  return { low: -3, normal: 0, high: 5 }[G.tollRate] ?? 0;
}

function getTaxGoldMult() {
  return { low: 0.6, normal: 1.0, high: 1.5 }[G.taxRate] ?? 1.0;
}

function computeProduction() {
  const sm = stabilityProdMult();
  const dm = droughtGrainMult();

  // Grain: peasants produce only in summer; farms building boosts it
  const farmBonus = G.buildings.farms * 0.15;
  const grainPerPeasant = isSummer() ? (0.8 + farmBonus) * dm * sm : 0;
  const grain = Math.max(0, Math.round(G.pop.peasant * grainPerPeasant));

  // Gold: traders + toll income; harbor building boosts trader yield
  const harborBonus = G.buildings.harbor * 0.12;
  const traderGold = Math.round(G.pop.trader * (1.5 + harborBonus) * getTaxGoldMult() * sm);
  const tollGold   = Math.round((3 + getTollGoldBonus()) * sm);
  const gold = Math.max(0, traderGold + tollGold);

  // Bronze: artisans; workshop building boosts yield
  const workshopBonus = G.buildings.workshop * 0.15;
  const bronze = Math.max(0, Math.round(G.pop.artisan * (0.4 + workshopBonus) * sm));

  // Auto-smithy (legacy production building)
  const smithyBronze = Math.max(0, Math.round(G.production.smithy * sm));

  return { grain, gold, bronze: bronze + smithyBronze };
}

function popGrainConsumption() {
  // Each unit eats 0.15 grain per turn; during famine civilians eat 2x
  const civPop = G.pop.peasant + G.pop.artisan + G.pop.trader + G.pop.patrician;
  const milPop = G.pop.militia + G.pop.legionary;
  const famMult = G.famine ? 2.0 : 1.0;
  return Math.max(1, Math.ceil(civPop * 0.15 * famMult + milPop * 0.15));
}

function feedPopulation() {
  const need = popGrainConsumption();
  if (G.res.grain >= need) {
    G.res.grain -= need;
    // Clear famine when food is sufficient
    if (G.famine) {
      G.famine = false;
      G.famineStreak = 0;
      G.addLog('🌾 Food stores replenished — famine ends.', 'log-good');
    }
    // Population growth: only in summer, with food surplus and not in drought
    if (isSummer() && G.res.grain >= need && popTotal() < 200 && G.droughtLevel === 0) {
      // Growth chance scales with food surplus, farms, and stability
      const surplusMult = Math.min(2.0, G.res.grain / Math.max(1, need));
      const farmBoost = G.buildings.farms * 0.05;
      const stabBoost = G.stability >= 70 ? 0.1 : 0;
      const growChance = Math.min(0.60, 0.15 * surplusMult + farmBoost + stabBoost);
      if (Math.random() < growChance) {
        G.pop.peasant++;
        G.addLog(`🌾 Population grows! +1 peasant family (${popTotal()} units · ${popTotal()*100} people).`, 'log-good');
      }
    } else if (!isSummer() && G.res.grain >= need * 2 && popTotal() < 200 && G.droughtLevel === 0) {
      // Small chance of winter growth if massive surplus
      if (Math.random() < 0.08) {
        G.pop.peasant++;
        G.addLog(`🌾 Families arrive seeking shelter — +1 peasant unit.`, 'log-good');
      }
    }
  } else {
    // Famine: insufficient food
    const deficit = need - G.res.grain;
    G.res.grain = 0;
    G.famine = true;
    G.famineStreak++;
    // Losses scale with deficit and famine streak
    const unitsLost = Math.min(Math.ceil(deficit / 0.12) + Math.floor(G.famineStreak / 3), 5);
    killPopUnits(unitsLost);
    const extraMsg = G.famineStreak >= 3 ? ' Mass starvation spreads!' : '';
    G.addLog(`💀 FAMINE! ${unitsLost} population unit(s) lost (${popTotal()*100} people remain).${extraMsg}`, 'log-crisis');
    // Famine hurts faction loyalty
    G.factions.city.loyalty    = Math.max(0, G.factions.city.loyalty    - 8);
    G.factions.military.loyalty= Math.max(0, G.factions.military.loyalty- 4);
  }
  // Always record pop history entry this turn
  recordPopHistory();
}

function killPopUnits(n) {
  // Remove n units, prioritizing artisans then traders, spare military and patricians
  const order = ['artisan', 'trader', 'peasant', 'militia', 'legionary', 'patrician'];
  let remaining = n;
  for (const cls of order) {
    if (remaining <= 0) break;
    const remove = Math.min(G.pop[cls], remaining);
    G.pop[cls] = Math.max(0, G.pop[cls] - remove);
    remaining -= remove;
  }
}

function feedGarrison() {
  const need = garrisonGrainCost();
  if (need === 0) return;
  if (G.res.grain >= need) { G.res.grain -= need; return; }
  const deficit   = need - G.res.grain;
  G.res.grain     = 0;
  const mDesertion = Math.min(G.pop.militia, deficit * 4);
  G.pop.militia    = Math.max(0, G.pop.militia - mDesertion);
  const remaining  = Math.max(0, deficit - Math.ceil(mDesertion / 4));
  const iDesertion = Math.min(G.pop.legionary, remaining * 3);
  G.pop.legionary  = Math.max(0, G.pop.legionary - iDesertion);
  const total = mDesertion + iDesertion;
  if (total > 0) G.addLog(`⚠ Garrison underfed — ${total} soldiers desert.`, 'log-crisis');
}

// ─── POPULATION CONVERSION ───────────────────────────────────
function convertPeasantToMilitia() {
  if (G.pop.peasant < 1 || G.res.gold < 1 || G.res.grain < 1) return;
  G.pop.peasant--; G.pop.militia++;
  G.res.gold--; G.res.grain--;
  G.addLog('Conscripted 1 peasant unit as militia (+1 militia).', 'log-good');
  renderAll();
}

function convertMilitiaToLegionary() {
  if (G.pop.militia < 1 || G.res.bronze < 1) return;
  G.pop.militia--; G.pop.legionary++;
  G.res.bronze--;
  G.addLog('Equipped 1 militia as legionary (+1 legionary).', 'log-good');
  renderAll();
}

function convertPeasantToArtisan() {
  if (G.pop.peasant < 1 || G.res.gold < 2) return;
  if (G.pop.artisan >= G.buildings.workshop * 3 + 3) {
    G.addLog('Workshop capacity full. Build more workshop levels.', 'log-event');
    return;
  }
  G.pop.peasant--; G.pop.artisan++;
  G.res.gold -= 2;
  G.addLog('Trained 1 peasant as artisan (+1 artisan).', 'log-good');
  renderAll();
}

function demobilize(type) {
  if (type === 'militia'   && G.pop.militia   > 0) { G.pop.militia--;   G.pop.peasant++; G.addLog('Demobilized 1 militia → peasant.', 'log-event'); renderAll(); }
  if (type === 'legionary' && G.pop.legionary > 0) { G.pop.legionary--; G.pop.militia++; G.addLog('Demobilized 1 legionary → militia.', 'log-event'); renderAll(); }
}

// ─── BUILDINGS ───────────────────────────────────────────────
const BUILDING_DEFS = {
  walls:    { icon:'🏰', name:'Walls',    maxLevel:5, cost: (lv) => ({ bronze: 5 }),          desc:'Defense multiplier' },
  harbor:   { icon:'⛵', name:'Harbor',   maxLevel:3, cost: (lv) => ({ gold: 10 }),            desc:'Attracts traders, +gold' },
  workshop: { icon:'⚒', name:'Workshop', maxLevel:3, cost: (lv) => ({ gold: 8 }),             desc:'Enables more artisans' },
  farms:    { icon:'🌾', name:'Farms',    maxLevel:3, cost: (lv) => ({ gold: 6 }),             desc:'Boosts grain from peasants' },
  palace:   { icon:'🏛', name:'Palace',   maxLevel:3, cost: (lv) => ({ gold: 10, bronze: 2 }), desc:'Pleases palatial faction' },
};

function buildBuilding(type) {
  const def = BUILDING_DEFS[type];
  if (!def) return;
  const cur = G.buildings[type];
  if (cur >= def.maxLevel) return;
  const cost = def.cost(cur);
  for (const [res, amt] of Object.entries(cost)) {
    if ((G.res[res] || 0) < amt) { G.addLog(`Not enough ${res} to build ${def.name}.`, 'log-event'); return; }
  }
  for (const [res, amt] of Object.entries(cost)) G.res[res] -= amt;
  G.buildings[type]++;

  // Side effects
  if (type === 'harbor' && G.pop.trader < G.buildings.harbor * 2 + 2) {
    G.pop.trader++;  // harbor attracts a trader unit
    G.addLog(`${def.name} upgraded to level ${G.buildings[type]} — a trader family arrives!`, 'log-good');
  } else if (type === 'farms' && G.pop.peasant < G.buildings.farms * 5 + 20) {
    G.pop.peasant++;  // farms attract peasants
    G.addLog(`${def.name} upgraded to level ${G.buildings[type]} — a peasant family settles!`, 'log-good');
  } else {
    G.addLog(`${def.name} upgraded to level ${G.buildings[type]}.`, 'log-good');
  }
  renderAll();
}

// ─── CRAFTING ────────────────────────────────────────────────
function canCraft(qty) { return G.res.copper >= qty * 2 && G.res.tin >= qty; }

function craftBronze(qty) {
  if (!canCraft(qty)) return false;
  G.res.copper -= qty * 2;
  G.res.tin    -= qty;
  G.res.bronze += qty;
  G.addLog(`Forged ${qty} Bronze from Copper and Tin.`, 'log-good');
  renderAll();
  return true;
}

// ─── PRICE SYSTEM ────────────────────────────────────────────
function getPrice(resource, regionId, buying = false) {
  let p = BASE_PRICES[resource] || 1;
  p *= G.priceMult[resource] || 1;
  if (regionId) {
    const rs = G.regionState[regionId];
    if (rs && rs.priceMods[resource]) p *= rs.priceMods[resource];
    if (buying && rs?.diplo?.tradeDeal) p *= 0.85;
  }
  return Math.max(1, Math.round(p * 10) / 10);
}

function getTradeDistanceCost(regionId) {
  const dist = REGIONS[regionId]?.distance || 0;
  return Math.round(dist * 2 * (1 + G.disruption * 0.2));
}

// ─── TRIBUTE ─────────────────────────────────────────────────
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
    G.dynasty.legitimacy = Math.min(100, G.dynasty.legitimacy + 2);
  } else {
    G.addLog(`⚠ Could not pay tribute to Hatti — not enough bronze.`, 'log-crisis');
    if (hd) hd.score = clampScore(hd.score - 10);
    G.dynasty.legitimacy = Math.max(0, G.dynasty.legitimacy - 5);
  }

  G.tributeDoubleThisTurn  = false;
  G.tributeRefusedThisTurn = false;
}

// ─── DROUGHT ─────────────────────────────────────────────────
function updateDrought() {
  const t = G.turn;
  const worsen  = t >= 14 ? 0.22 : 0.10;
  const recover = G.droughtLevel === 2 ? 0.25 : 0.35;

  if (G.droughtLevel < 2 && Math.random() < worsen) {
    G.droughtLevel++;
    if (G.droughtLevel === 1)
      G.addLog('☀ Dry season — grain harvests down 30%.', 'log-event');
    else
      G.addLog('🔥 Severe drought — harvests nearly halved! Famine threatens.', 'log-crisis');
  } else if (G.droughtLevel > 0 && Math.random() < recover) {
    G.droughtLevel--;
    G.addLog(G.droughtLevel === 0 ? '🌧 Rains return — harvests recovering.' : '🌦 Drought easing.', 'log-good');
  }
}

// ─── STABILITY ───────────────────────────────────────────────
function updateStability() {
  const avg = (G.factions.city.loyalty + G.factions.military.loyalty + G.factions.palatial.loyalty) / 3;
  const target = Math.round(avg * 0.8 + G.dynasty.legitimacy * 0.2);
  G.stability = Math.round(G.stability * 0.7 + target * 0.3);
  G.stability = Math.max(0, Math.min(100, G.stability));
}

// ─── DYNASTY ─────────────────────────────────────────────────
function updateDynasty() {
  G.dynasty.reignTurns++;
  G.dynasty.rulerAge += 0.5;  // half-year per turn

  // Natural legitimacy decay
  let d = -1;

  // Boosts to legitimacy
  const prod = computeProduction();
  const need = popGrainConsumption() + garrisonGrainCost();
  if (G.res.grain >= need * 2) d += 2;   // well fed people
  if (G.res.gold >= 20)        d += 1;   // prosperous
  if (G.buildings.palace >= 2) d += 1;  // grand palace
  const anyAlliance = Object.values(G.regionState).some(rs => rs.diplo?.alliance && !rs.destroyed);
  if (anyAlliance) d += 1;

  // Penalties
  if (G.res.grain < need) d -= 4;
  if (G.res.gold  <= 0)   d -= 3;
  const warCount = Object.values(G.regionState).filter(rs => rs.diplo?.atWar && !rs.destroyed).length;
  d -= warCount * 1;

  G.dynasty.legitimacy = Math.max(0, Math.min(100, G.dynasty.legitimacy + d));
}

function triggerCoupAttempt() {
  G.addLog(`⚔ COUP ATTEMPT! The palatial faction moves against you!`, 'log-crisis');
  // Player loses legitimacy; can spend gold/bronze to suppress
  const suppressed = G.res.gold >= 15 || G.res.bronze >= 5;
  if (suppressed) {
    const goldUsed   = Math.min(G.res.gold, 15);
    const bronzeUsed = Math.min(G.res.bronze, 5);
    G.res.gold   -= goldUsed;
    G.res.bronze -= bronzeUsed;
    G.dynasty.legitimacy = Math.max(10, G.dynasty.legitimacy - 20);
    G.factions.palatial.loyalty = Math.max(0, G.factions.palatial.loyalty - 25);
    G.addLog(`Coup suppressed — spent ◎${goldUsed} ⚙${bronzeUsed} to buy loyalty. Legitimacy −20.`, 'log-event');
  } else {
    G.dynasty.legitimacy = Math.max(0, G.dynasty.legitimacy - 35);
    G.stability = Math.max(0, G.stability - 20);
    G.addLog(`Coup not fully suppressed! Legitimacy −35, stability −20.`, 'log-crisis');
    if (G.dynasty.legitimacy <= 0) {
      endGame(false, 'The palatial faction has deposed your dynasty. Another family takes the throne of Wilusa. Your line ends here.');
      return true; // game over
    }
  }
  return false;
}

// ─── FACTIONS ────────────────────────────────────────────────
function updateFactions() {
  const grainNeed = popGrainConsumption() + garrisonGrainCost();
  const warCount  = Object.values(G.regionState).filter(rs => rs.diplo?.atWar && !rs.destroyed).length;

  // --- CITY FACTION (peasants + artisans + traders) ---
  let cityD = 0;
  // Tax policy: high tax angers city
  if (G.taxRate === 'low')    cityD += 3;
  if (G.taxRate === 'high')   cityD -= 4;
  // Toll policy: high toll disrupts merchants
  if (G.tollRate === 'high')  cityD -= 2;
  if (G.tollRate === 'low')   cityD += 1;
  // Food security
  if (G.res.grain >= grainNeed * 2)        cityD += 3;
  else if (G.res.grain < grainNeed)        cityD -= 6;
  else if (G.res.grain < grainNeed * 1.5)  cityD -= 1;
  if (G.droughtLevel > 0)  cityD -= G.droughtLevel * 2;
  // Economy
  if (G.res.gold >= 20) cityD += 1;
  if (G.res.gold <= 3)  cityD -= 2;
  if (warCount > 0)     cityD -= warCount;
  G.factions.city.loyalty = Math.max(0, Math.min(100, G.factions.city.loyalty + cityD));

  // --- MILITARY FACTION (militia + legionaries) ---
  let milD = 0;
  if (G.res.gold >= 15)       milD += 2;
  else if (G.res.gold <= 3)   milD -= 5;
  if (G.res.bronze >= 5)      milD += 2;
  if (G.buildings.walls >= 4) milD += 1;
  if (G.cavalryBonus >= 2)    milD += 2;
  if (G.pop.legionary >= 5)   milD += 1;
  milD -= warCount * 2;
  if (G.stability < 40) milD -= 2;
  G.factions.military.loyalty = Math.max(0, Math.min(100, G.factions.military.loyalty + milD));

  // --- PALATIAL FACTION (patricians) ---
  let palD = 0;
  if (G.buildings.palace >= 2)          palD += 3;
  if (G.dynasty.legitimacy >= 70)       palD += 2;
  else if (G.dynasty.legitimacy < 30)   palD -= 3;  // smells opportunity
  if (G.res.gold >= 25) palD += 1;  // prosperity keeps them content
  // They plot when legitimacy is low
  if (G.dynasty.legitimacy < 40) palD += 3;  // paradoxically more active
  palD = Math.max(-5, Math.min(3, palD));
  G.factions.palatial.loyalty = Math.max(0, Math.min(100, G.factions.palatial.loyalty + palD));
}

function checkFactionCrises() {
  const city = G.factions.city;
  const mil  = G.factions.military;
  const pal  = G.factions.palatial;

  // City uprising
  if (city.loyalty < 25 && Math.random() < 0.30) {
    const grainLost = Math.min(G.res.grain, 8);
    const goldLost  = Math.min(G.res.gold,  5);
    G.res.grain -= grainLost; G.res.gold -= goldLost;
    killPopUnits(2);
    G.stability = Math.max(0, G.stability - 15);
    city.loyalty = Math.min(100, city.loyalty + 18);
    G.addLog(`👥 City uprising! Grain −${grainLost}, Gold −${goldLost}, 2 pop units lost, stability −15.`, 'log-crisis');
  }

  // Military mutiny
  if (mil.loyalty < 25 && Math.random() < 0.30) {
    const goldLost = Math.min(G.res.gold, 10);
    G.res.gold -= goldLost;
    G.pop.militia   = Math.max(0, G.pop.militia   - Math.min(G.pop.militia, 3));
    G.pop.legionary = Math.max(0, G.pop.legionary - Math.min(G.pop.legionary, 1));
    G.stability = Math.max(0, G.stability - 12);
    mil.loyalty = Math.min(100, mil.loyalty + 18);
    G.addLog(`⚔ Military mutiny! Gold −${goldLost}, soldiers desert. Stability −12.`, 'log-crisis');
  }

  // Palatial coup attempt
  if (pal.loyalty > 70 && G.dynasty.legitimacy < 35 && Math.random() < 0.28) {
    return triggerCoupAttempt();
  }

  return false;
}

function appeaseFaction(factionId) {
  const r = G.res;
  if (factionId === 'city') {
    if (r.grain < 5) { G.addLog('Not enough grain to appease the city faction.', 'log-event'); return; }
    r.grain -= 5;
    G.factions.city.loyalty = Math.min(100, G.factions.city.loyalty + 15);
    G.addLog('Distributed grain to the people — city faction loyalty +15.', 'log-good');
  } else if (factionId === 'military') {
    if (r.bronze < 2) { G.addLog('Not enough bronze to appease the military.', 'log-event'); return; }
    r.bronze -= 2;
    G.factions.military.loyalty = Math.min(100, G.factions.military.loyalty + 15);
    G.addLog('Issued arms to soldiers — military faction loyalty +15.', 'log-good');
  } else if (factionId === 'palatial') {
    if (r.gold < 8) { G.addLog('Not enough gold to appease the palatial faction.', 'log-event'); return; }
    r.gold -= 8;
    G.factions.palatial.loyalty = Math.min(100, G.factions.palatial.loyalty + 12);
    G.dynasty.legitimacy = Math.min(100, G.dynasty.legitimacy + 3);
    G.addLog('Gifts given to the patricians — palatial faction appeased. Legitimacy +3.', 'log-good');
  }
  renderAll();
}

// ─── POLICY ──────────────────────────────────────────────────
function setTaxRate(rate) {
  if (G.taxRate === rate) return;
  G.taxRate = rate;
  G.addLog(`Tax rate set to ${rate.toUpperCase()}.`, 'log-event');
  renderAll();
}

function setTollRate(rate) {
  if (G.tollRate === rate) return;
  G.tollRate = rate;
  G.addLog(`Toll rate set to ${rate.toUpperCase()}.`, 'log-event');
  // Maritime nations react to toll changes
  const maritime = ['cyprus','mycenae','crete','egypt','ugarit'];
  maritime.forEach(mid => {
    const md = G.regionState[mid]?.diplo;
    if (!md || G.regionState[mid]?.destroyed || md.atWar) return;
    md.score = clampScore(md.score + (rate === 'low' ? 3 : rate === 'high' ? -4 : 0));
  });
  renderAll();
}

// ─── DIPLOMATIC LETTERS ──────────────────────────────────────
const LETTER_TYPES = {
  GIFT: {
    weight: 40,
    generate(regionId) {
      const r = REGIONS[regionId];
      const gifts = [
        { res:'grain',   amt:8,  text:'grain to feed your people' },
        { res:'bronze',  amt:3,  text:'bronze for your armories' },
        { res:'silver',  amt:4,  text:'silver as a token of friendship' },
        { res:'timber',  amt:5,  text:'fine timber for your ships' },
        { res:'horses',  amt:2,  text:'swift horses from our stables' },
      ];
      const gift = gifts[Math.floor(Math.random() * gifts.length)];
      return {
        type: 'GIFT',
        greeting: Math.random() < 0.5 ? 'To my brother the king of Wilusa' : 'To my cousin the king of Troy',
        body: `Greetings and great honour from the king of ${r.name.split(' ')[0]}. May our friendship endure as long as the mountains stand. We send you ${gift.text} as a sign of our goodwill.`,
        offer: `Receive ${gift.amt} ${RES_META[gift.res]?.icon || ''} ${gift.res}.`,
        onAccept: () => {
          G.res[gift.res] = (G.res[gift.res] || 0) + gift.amt;
          G.addLog(`Received gift from ${r.name}: +${gift.amt} ${gift.res}.`, 'log-good');
          const d = G.regionState[regionId]?.diplo;
          if (d) d.score = clampScore(d.score + 5);
        },
        onDecline: () => {
          G.addLog(`Declined gift from ${r.name}. They seem offended.`, 'log-event');
          const d = G.regionState[regionId]?.diplo;
          if (d) d.score = clampScore(d.score - 8);
        },
      };
    },
  },
  REQUEST_GRAIN: {
    weight: 25,
    generate(regionId) {
      const r = REGIONS[regionId];
      const amt = 6 + Math.floor(Math.random() * 8);
      return {
        type: 'REQUEST_GRAIN',
        greeting: 'To my brother the king of Wilusa',
        body: `Our people face great hardship. The harvests have failed and our granaries are empty. We implore you, great king, to send us grain as a sign of brotherhood between our peoples.`,
        offer: `Send ${amt} 🌾 grain → +18 relations with ${r.name.split(' ')[0]}.`,
        canAccept: () => G.res.grain >= amt,
        onAccept: () => {
          G.res.grain -= amt;
          G.addLog(`Sent ${amt} grain to ${r.name}. Relations greatly improved.`, 'log-good');
          const d = G.regionState[regionId]?.diplo;
          if (d) d.score = clampScore(d.score + 18);
        },
        onDecline: () => {
          G.addLog(`Refused grain relief to ${r.name}.`, 'log-event');
          const d = G.regionState[regionId]?.diplo;
          if (d) d.score = clampScore(d.score - 8);
        },
      };
    },
  },
  REQUEST_MILITARY: {
    weight: 20,
    generate(regionId) {
      const r = REGIONS[regionId];
      const goldReward = 8 + Math.floor(Math.random() * 12);
      const milCost    = 3 + Math.floor(Math.random() * 4);
      return {
        type: 'REQUEST_MILITARY',
        greeting: 'To my brother the great king',
        body: `War threatens our borders! Our enemies grow bold. We ask that you send soldiers to aid us in our time of need, as befits the bond between great kings. In return, we offer generous payment.`,
        offer: `Send ${milCost} militia → receive ◎${goldReward} gold. Your troops will be lost.`,
        canAccept: () => G.pop.militia >= milCost,
        onAccept: () => {
          G.pop.militia = Math.max(0, G.pop.militia - milCost);
          G.res.gold += goldReward;
          G.addLog(`Sent ${milCost} militia to aid ${r.name}. Received ◎${goldReward} gold.`, 'log-good');
          const d = G.regionState[regionId]?.diplo;
          if (d) d.score = clampScore(d.score + 20);
        },
        onDecline: () => {
          G.addLog(`Refused military aid to ${r.name}.`, 'log-event');
          const d = G.regionState[regionId]?.diplo;
          if (d) d.score = clampScore(d.score - 12);
        },
      };
    },
  },
  TRADE_PROPOSAL: {
    weight: 15,
    generate(regionId) {
      const r = REGIONS[regionId];
      return {
        type: 'TRADE_PROPOSAL',
        greeting: 'To the great king of Wilusa, whose city commands the strait',
        body: `We propose a formal trade agreement between our peoples, to our mutual benefit. Lower your tolls and open your markets to our merchants, and we shall do likewise.`,
        offer: `Sign trade deal (as diplomacy, but free) → 15% trade discount with ${r.name.split(' ')[0]}.`,
        canAccept: () => !G.regionState[regionId]?.diplo?.tradeDeal,
        onAccept: () => {
          const d = G.regionState[regionId]?.diplo;
          if (d) { d.tradeDeal = true; d.score = clampScore(d.score + 8); }
          G.addLog(`Signed trade agreement with ${r.name}. 15% discount active.`, 'log-good');
        },
        onDecline: () => {
          G.addLog(`Declined trade proposal from ${r.name}.`, 'log-event');
          const d = G.regionState[regionId]?.diplo;
          if (d) d.score = clampScore(d.score - 5);
        },
      };
    },
  },
};

function tryGenerateLetters() {
  // Expire old letters
  G.pendingLetters = G.pendingLetters.filter(l => l.expires > G.turn);

  // Remove excess
  if (G.pendingLetters.length >= 5) return;

  // Each non-destroyed, non-war nation has a 15% chance to send a letter each turn
  const senders = Object.keys(REGIONS).filter(id => {
    if (id === 'troy') return false;
    const rs = G.regionState[id];
    if (!rs || rs.destroyed) return false;
    if (rs.diplo?.atWar) return false;
    if (!DIPLO_PROFILE[id]) return false;
    // Don't send if already has a pending letter
    if (G.pendingLetters.some(l => l.regionId === id)) return false;
    return true;
  });

  for (const regionId of senders) {
    if (Math.random() > 0.15) continue;

    // Pick letter type by weight
    const total = Object.values(LETTER_TYPES).reduce((s, t) => s + t.weight, 0);
    let r = Math.random() * total;
    let chosen = null;
    for (const [key, lt] of Object.entries(LETTER_TYPES)) {
      r -= lt.weight;
      if (r <= 0) { chosen = key; break; }
    }
    if (!chosen) chosen = 'GIFT';

    const lt   = LETTER_TYPES[chosen];
    const data = lt.generate(regionId);

    G.pendingLetters.push({
      id:       G.nextLetterId++,
      regionId,
      expires:  G.turn + 4,
      ...data,
    });
  }

  updateLetterBadge();
}

function updateLetterBadge() {
  const badge = document.getElementById('letter-badge');
  const btn   = document.getElementById('letters-btn');
  if (!badge || !btn) return;
  const count = G.pendingLetters.length;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline' : 'none';
  btn.style.borderColor = count > 0 ? '#c89020' : '';
}

function acceptLetter(id) {
  const letter = G.pendingLetters.find(l => l.id === id);
  if (!letter) return;
  if (letter.canAccept && !letter.canAccept()) {
    G.addLog('Cannot fulfill this request right now.', 'log-event');
    return;
  }
  letter.onAccept();
  G.pendingLetters = G.pendingLetters.filter(l => l.id !== id);
  updateLetterBadge();
  renderLetterModal();
  renderAll();
}

function declineLetter(id) {
  const letter = G.pendingLetters.find(l => l.id === id);
  if (!letter) return;
  letter.onDecline();
  G.pendingLetters = G.pendingLetters.filter(l => l.id !== id);
  updateLetterBadge();
  renderLetterModal();
  renderAll();
}

function openLetterModal() {
  renderLetterModal();
  document.getElementById('letter-modal').style.display = 'flex';
}

function renderLetterModal() {
  const container = document.getElementById('lmod-list');
  if (!container) return;
  if (G.pendingLetters.length === 0) {
    container.innerHTML = '<p class="letter-no-letters">No letters awaiting your response.</p>';
    return;
  }
  container.innerHTML = G.pendingLetters.map(letter => {
    const region = REGIONS[letter.regionId];
    const canAcc = !letter.canAccept || letter.canAccept();
    return `<div class="letter-card">
      <div class="letter-sender">${region.icon} From: ${region.name}</div>
      <div class="letter-greeting">"${letter.greeting},"</div>
      <div class="letter-body">${letter.body}</div>
      <div class="letter-offer">${letter.offer}</div>
      <div class="letter-expires">⏳ Expires in ${letter.expires - G.turn} turn(s)</div>
      <div class="letter-actions">
        <button class="letter-btn-accept" ${!canAcc ? 'disabled' : ''} onclick="acceptLetter(${letter.id})">✓ Accept</button>
        <button class="letter-btn-decline" onclick="declineLetter(${letter.id})">✗ Decline</button>
      </div>
    </div>`;
  }).join('');
}

// ─── NATION WARS ─────────────────────────────────────────────
function updateNationWars() {
  // Resolve existing wars
  G.nationWars = G.nationWars.filter(w => {
    if (G.turn >= w.endTurn) {
      G.disruption = Math.max(0, G.disruption - 0.2);
      G.addLog(`War between ${REGIONS[w.attackerId]?.name.split(' ')[0] || w.attackerId} and ${REGIONS[w.defenderId]?.name.split(' ')[0] || w.defenderId} ends.`, 'log-event');
      return false;
    }
    G.disruption = Math.min(5, G.disruption + 0.1);
    return true;
  });

  // Start new wars
  if (Math.random() < 0.12 && G.turn > 2) {
    const candidates = Object.keys(DIPLO_PROFILE).filter(id => {
      const rs = G.regionState[id];
      return rs && !rs.destroyed && DIPLO_PROFILE[id].canWar;
    });
    if (candidates.length >= 2) {
      const ai  = Math.floor(Math.random() * candidates.length);
      let   di  = Math.floor(Math.random() * (candidates.length - 1));
      if (di >= ai) di++;
      const a = candidates[ai], d = candidates[di];
      const duration = 4 + Math.floor(Math.random() * 6);
      G.nationWars.push({ attackerId: a, defenderId: d, startTurn: G.turn, endTurn: G.turn + duration });
      G.disruption = Math.min(5, G.disruption + 0.15);
      G.addLog(`⚔ ${REGIONS[a].name.split(' ')[0]} goes to war with ${REGIONS[d].name.split(' ')[0]}! Trade disruption rises.`, 'log-event');
    }
  }
}

// ─── MINI-EVENTS ─────────────────────────────────────────────
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

const MINI_EVENTS = [
  { w:10, fn:() => { G.res.grain += 10; G.addLog('🌾 Bumper harvest — grain stores +10.', 'log-good'); } },
  { w: 7, fn:() => { G.res.grain = Math.max(0, G.res.grain - 6); G.stability = Math.max(0, G.stability - 6);
                     G.addLog('🔥 Granary fire! Grain −6, stability shaken.', 'log-crisis'); } },
  { w: 9, fn:() => { G.res.gold += 7; G.addLog('⛵ Rich merchant fleet arrives — ◎7 in toll duties.', 'log-good'); } },
  { w: 4, fn:() => { killPopUnits(1); G.stability = Math.max(0, G.stability - 10);
                     G.addLog('💀 Plague strikes the city — 1 pop unit lost, stability −10.', 'log-crisis'); } },
  { w: 8, fn:() => { G.res.gold = Math.max(0, G.res.gold - 4);
                     G.addLog('🌊 Storm sinks a merchant ship — ◎4 lost.', 'log-event'); } },
  { w: 8, fn:() => { const opts=['grain','bronze','copper','tin']; const r=opts[Math.floor(Math.random()*opts.length)];
                     G.res[r]=(G.res[r]||0)+4; G.addLog(`🎁 Foreign envoy brings gifts — +4 ${RES_META[r]?.icon||r}.`, 'log-good'); } },
  { w: 6, fn:() => { G.stability = Math.min(100, G.stability + 10);
                     G.addLog('🎉 Festival season — city morale restored, stability +10.', 'log-good'); } },
  { w: 5, fn:() => { G.dynasty.legitimacy = Math.min(100, G.dynasty.legitimacy + 8);
                     G.addLog('📜 A bard composes an epic of your dynasty — legitimacy +8.', 'log-good'); } },
  { w:53, fn:() => {} },
];

function rollMiniEvent() {
  if (G.turn < 2) return;
  const total = MINI_EVENTS.reduce((s, e) => s + e.w, 0);
  let r = Math.random() * total;
  for (const ev of MINI_EVENTS) { r -= ev.w; if (r <= 0) { ev.fn(); return; } }
}

function recordPriceHistory() {
  G.priceHistory.push({
    turn: G.turn,
    prices: {
      grain:  getPrice('grain'),
      copper: getPrice('copper'),
      tin:    getPrice('tin'),
      bronze: getPrice('bronze'),
    },
  });
  if (G.priceHistory.length > 30) G.priceHistory.shift();
}

function recordPopHistory() {
  G.popHistory.push({
    turn:    G.turn,
    famine:  G.famine,
    total:   popTotal(),
    pop: {
      peasant:   G.pop.peasant,
      artisan:   G.pop.artisan,
      militia:   G.pop.militia,
      legionary: G.pop.legionary,
      trader:    G.pop.trader,
      patrician: G.pop.patrician,
    },
  });
  if (G.popHistory.length > 32) G.popHistory.shift();
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
        G.disruption = Math.min(5, G.disruption + 0.3);
        summary.push({ text: eff.desc, cls: 'eff-bad' });
        break;
      case 'damage_walls':
        G.buildings.walls = Math.max(1, G.buildings.walls - eff.amount);
        summary.push({ text: eff.desc, cls: 'eff-bad' });
        break;
      case 'tribute_double':
        G.tributeDoubleThisTurn = true;
        summary.push({ text: eff.desc, cls: 'eff-bad' });
        break;
      case 'free_from_vassalage':
        G.vassalOfHatti = false;
        G.dynasty.legitimacy = Math.min(100, G.dynasty.legitimacy + 10);
        summary.push({ text: 'Troy is FREE! No more tribute. Legitimacy +10.', cls: 'eff-good' });
        break;
      case 'siege':
        // Queue a battle against the attacker
        G._pendingModals = G._pendingModals || [];
        G._pendingModals.push({
          type: 'battle',
          data: {
            title:    eff.title  || 'SIEGE!',
            subtitle: eff.subtitle || 'Enemy forces attack Troy',
            atkName:  eff.atkName  || 'Mycenaean Army',
            atkIcon:  eff.atkIcon  || '⚔',
            atkSize:  eff.atkSize  || 25,
            atkPower: eff.attackStrength || 40,
            regionId: eff.regionId || 'mycenae',
            type:     'defense',
          },
        });
        summary.push({ text: eff.desc, cls: 'eff-bad' });
        break;
    }
  });
  return summary;
}


// ═══════════════════════════════════════════════════════════════
//  CANVAS MAP RENDERING  (preserved verbatim)
// ═══════════════════════════════════════════════════════════════
const canvas = document.getElementById('map-canvas');
const ctx    = canvas.getContext('2d');

let scaleX = 1, scaleY = 1;
let hoveredRegion    = null;
let selectedRegionId = null;
let armySelected     = false;

function resizeCanvas() {
  const container = document.getElementById('map-area');
  canvas.width  = container.clientWidth;
  canvas.height = container.clientHeight;
  scaleX = canvas.width  / REF_W;
  scaleY = canvas.height / REF_H;
}

function sp(x, y) { return [x * scaleX, y * scaleY]; }

function drawLandMasses() {
  const s = Math.min(scaleX, scaleY);
  const LAND  = '#c4ad78';
  const SEA   = '#1a3550';
  const COAST = '#8a7240';

  ctx.fillStyle = SEA;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  function poly(pts, fill, stroke) {
    const [x0, y0] = sp(pts[0][0], pts[0][1]);
    ctx.beginPath(); ctx.moveTo(x0, y0);
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = sp(pts[i][0], pts[i][1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (fill)   { ctx.fillStyle = fill;     ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.8 * s; ctx.stroke(); }
  }

  // ── Greece / Thrace peninsula ──
  poly([
    [0,0],[178,0],[212,80],[215,155],[192,205],[165,245],
    [138,285],[108,325],[82,368],[55,405],[28,440],[0,440]
  ], LAND, COAST);

  // ── Anatolia (Troy → Hatti → Kashka) ──
  poly([
    [215,155],[288,78],[440,52],[578,57],[685,90],[722,155],
    [722,332],[695,372],[648,402],[578,415],[510,408],
    [438,415],[378,402],[322,382],[265,352],[222,315],
    [215,248],[215,155]
  ], LAND, COAST);

  // ── Eastern + Southern landmass (Levant, Mesopotamia, Egypt) ──
  poly([
    [722,155],[798,78],[970,45],[1200,0],[1200,800],[0,800],
    [0,440],[28,440],[82,368],[285,462],[362,462],[440,468],
    [505,472],[535,508],[565,538],[602,525],[625,488],
    [658,455],[692,422],[695,402],[648,402],[722,372],[722,155]
  ], LAND, COAST);

  // ── Crete island ──
  poly([[88,382],[152,378],[195,384],[208,398],[180,410],[142,412],[95,405]], LAND, COAST);
  // ── Cyprus island ──
  poly([[415,352],[458,347],[492,355],[498,368],[468,378],[428,376],[412,362]], LAND, COAST);

  // ── Sea cutouts ──
  // Black Sea
  poly([[215,0],[215,155],[288,78],[440,52],[578,57],[685,90],[722,110],[722,0]], SEA);
  // Aegean inlet (notch between Greece and Anatolia)
  poly([[192,155],[215,155],[215,248],[192,255],[170,248],[165,215],[175,178]], SEA);
  // Red Sea
  poly([[360,478],[415,495],[440,548],[480,614],[495,668],[522,735],[522,800],
        [480,800],[468,748],[452,682],[452,615],[428,562],[402,510],[360,478]], SEA);
  // Persian Gulf
  poly([[748,480],[828,480],[908,535],[1000,575],[1015,615],[1000,640],
        [962,590],[882,535],[790,495],[748,480]], SEA);

  // Vignette
  const vig = ctx.createRadialGradient(
    canvas.width*0.5, canvas.height*0.5, canvas.height*0.25,
    canvas.width*0.5, canvas.height*0.5, canvas.width*0.75);
  vig.addColorStop(0,   'rgba(0,0,0,0)');
  vig.addColorStop(0.75,'rgba(0,0,0,0)');
  vig.addColorStop(1,   'rgba(0,0,0,0.5)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMap() {
  // Background is MAP1.png (img element). Canvas only draws city markers + army pawn.
  const w = canvas.width, h = canvas.height;
  const s = Math.min(scaleX, scaleY);

  ctx.clearRect(0, 0, w, h);

  // City dot markers
  ctx.save();
  CITY_LIST.forEach(c => {
    const rs = G.regionState[c.region];
    const destroyed = rs?.destroyed;
    const [x, y] = sp(c.x, c.y);

    ctx.beginPath();
    ctx.arc(x, y, 3 * s, 0, Math.PI * 2);
    ctx.fillStyle = destroyed ? 'rgba(180,60,40,0.6)' : 'rgba(220,195,140,0.85)';
    ctx.fill();
    ctx.strokeStyle = destroyed ? 'rgba(200,80,60,0.5)' : 'rgba(80,50,10,0.6)';
    ctx.lineWidth = 0.8 * s;
    ctx.stroke();

    ctx.font        = `bold ${Math.round(7.5 * s)}px Georgia`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur  = 5;
    ctx.fillStyle   = destroyed ? 'rgba(200,80,60,0.7)' : 'rgba(240,220,170,0.9)';
    ctx.fillText(c.label, x, y - 5 * s);

    if (destroyed) {
      ctx.font = `bold ${Math.round(11 * s)}px serif`;
      ctx.fillStyle = 'rgba(220,60,40,0.8)';
      ctx.textBaseline = 'middle';
      ctx.fillText('✕', x + 8 * s, y);
    }
  });
  ctx.restore();

  // Troy star marker
  const [tx, ty] = sp(218, 178);
  ctx.save();
  ctx.beginPath();
  ctx.arc(tx, ty, 10 * s, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(212,160,23,0.5)';
  ctx.lineWidth   = 3 * s;
  ctx.stroke();
  ctx.font = `${Math.round(12 * s)}px serif`;
  ctx.fillStyle = '#f0c030';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(212,160,23,0.9)';
  ctx.shadowBlur  = 8;
  ctx.fillText('★', tx, ty);
  ctx.font = `bold ${Math.round(8 * s)}px Georgia`;
  ctx.fillStyle = '#f0d060';
  ctx.shadowBlur = 5;
  ctx.textBaseline = 'bottom';
  ctx.fillText('TROY', tx, ty - 12 * s);
  ctx.restore();

  // Army pawn
  const [pawX, pawY] = sp(218, 195);
  const pawR = 8 * s;
  ctx.save();
  ctx.beginPath();
  ctx.arc(pawX, pawY, pawR, 0, Math.PI * 2);
  ctx.fillStyle = '#9a7010';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur  = 4;
  ctx.fill();
  ctx.strokeStyle = '#c89018';
  ctx.lineWidth = 1 * s;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.font = `${Math.round(9 * s)}px serif`;
  ctx.fillStyle = '#f0d060';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚔', pawX, pawY);
  const tot = getTotalGarrison();
  ctx.font = `bold ${Math.round(6 * s)}px sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'top';
  ctx.fillText(tot, pawX + 6 * s, pawY + 4 * s);
  ctx.restore();

  // Update SVG polygon states (destroyed, selected)
  updateMapSVG();

  drawCompassRose(w - 44 * s, h - 44 * s, 26 * s);
}


function drawRivers() {
  const s = Math.min(scaleX, scaleY);
  ctx.save();
  ctx.strokeStyle = 'rgba(70,150,210,0.55)';
  ctx.lineWidth   = 1.8 * s;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.shadowColor = 'rgba(50,130,200,0.3)';
  ctx.shadowBlur  = 3;

  function river(pts) {
    const [x0,y0] = sp(pts[0][0], pts[0][1]);
    ctx.beginPath(); ctx.moveTo(x0, y0);
    for (let i = 1; i < pts.length; i++) {
      const [x1,y1] = sp(pts[i][0],   pts[i][1]);
      const [cx,cy] = sp((pts[i-1][0]+pts[i][0])/2, (pts[i-1][1]+pts[i][1])/2);
      ctx.quadraticCurveTo(cx, cy, x1, y1);
    }
    ctx.stroke();
  }

  // Nile — flows north through Egypt, forks at delta near Mediterranean
  ctx.lineWidth = 2.0 * s;
  river([[340,610],[336,572],[332,538],[328,508],[325,478],[330,462],[340,450]]);
  ctx.lineWidth = 1.2 * s;
  river([[340,450],[328,444],[318,440]]);  // west delta branch
  river([[340,450],[352,444],[360,440]]);  // east delta branch

  // Euphrates — from Hatti SE through Assyria, curves through Babylon to Gulf
  ctx.lineWidth = 1.6 * s;
  river([[568,148],[602,188],[628,238],[648,288],[662,338],[668,388],[672,438],[675,488],[678,530]]);

  // Tigris — east of Euphrates, similar course
  river([[632,152],[662,195],[688,248],[712,302],[732,355],[748,408],[758,458],[762,508],[765,538]]);

  // River labels
  ctx.font      = `italic ${Math.round(6.5 * s)}px Georgia`;
  ctx.fillStyle = 'rgba(80,160,210,0.52)';
  ctx.textAlign = 'center';
  ctx.shadowBlur = 0;
  let lp;
  lp = sp(648, 385); ctx.fillText('Euphrates', lp[0], lp[1]);
  lp = sp(738, 395); ctx.fillText('Tigris',    lp[0], lp[1]);
  lp = sp(320, 528); ctx.fillText('Nile',      lp[0], lp[1]);
  ctx.restore();
}

function drawMountains() {
  const s = Math.min(scaleX, scaleY);
  ctx.save();
  ctx.fillStyle   = 'rgba(180,150,100,0.22)';
  ctx.strokeStyle = 'rgba(160,130,80,0.30)';
  ctx.lineWidth   = 0.8 * s;

  function mtn(rx, ry, size) {
    const [x, y] = sp(rx, ry);
    const sz = size * s;
    ctx.beginPath();
    ctx.moveTo(x, y - sz);
    ctx.lineTo(x - sz*0.7, y + sz*0.4);
    ctx.lineTo(x + sz*0.7, y + sz*0.4);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(220,210,190,0.18)';
    ctx.beginPath();
    ctx.moveTo(x, y - sz);
    ctx.lineTo(x - sz*0.25, y - sz*0.35);
    ctx.lineTo(x + sz*0.25, y - sz*0.35);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(180,150,100,0.22)';
  }

  // Taurus mountains (south Anatolia coast)
  [[268,338],[292,332],[315,328],[338,324],[362,320],[385,315],[408,312]].forEach(([x,y]) => mtn(x,y,5));
  // Pontic mountains (north Anatolia, Kashka border)
  [[318,145],[345,138],[372,133],[398,130],[425,128],[452,127],[478,128]].forEach(([x,y]) => mtn(x,y,4.5));
  // Zagros mountains (east of Babylon/Elam)
  [[835,345],[842,372],[848,398],[852,425],[855,452]].forEach(([x,y]) => mtn(x,y,5));
  // Caucasus (north of map, east)
  [[718,92],[742,85],[765,80],[788,78],[812,80]].forEach(([x,y]) => mtn(x,y,4));
  // Aegean/Greek hills
  [[142,265],[162,258],[182,252]].forEach(([x,y]) => mtn(x,y,4));
  // Lebanon mountains (Levant coast)
  [[558,318],[562,338],[565,358]].forEach(([x,y]) => mtn(x,y,3.5));
  // Sinai
  [[495,468],[512,478],[528,488]].forEach(([x,y]) => mtn(x,y,3.5));

  ctx.restore();
}

function drawCompassRose(cx, cy, r) {
  const s = Math.min(scaleX, scaleY);
  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(210,185,120,0.35)';
  ctx.lineWidth   = 1 * s;
  ctx.stroke();

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

    ctx.fillStyle   = d.label === 'N' ? 'rgba(210,50,50,0.70)' : 'rgba(200,175,110,0.55)';
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth   = 0.5 * s;
    ctx.fill();
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.10, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(200,175,110,0.75)';
  ctx.fill();

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

  ctx.beginPath();
  region.poly.forEach(([rx, ry], i) => {
    const [x, y] = sp(rx, ry);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();

  const s = Math.min(scaleX, scaleY);

  let fillColor = region.fillColor;
  if (destroyed)      fillColor = '#160e0e';
  else if (hov)       fillColor = lighten(region.fillColor, 0.38);
  else if (sel)       fillColor = lighten(region.fillColor, 0.22);
  ctx.globalAlpha = (hov || sel) ? 0.75 : 0.88;
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.globalAlpha = 1.0;

  ctx.strokeStyle = destroyed ? '#2a1818'
                  : sel       ? '#f0e080'
                  : hov       ? lighten(region.borderColor, 0.5)
                  : region.borderColor;
  ctx.lineWidth   = sel || isPlayer ? 2.5 * s : 1.3 * s;
  ctx.setLineDash(destroyed ? [4 * s, 3 * s] : []);
  ctx.stroke();
  ctx.setLineDash([]);

  if (!destroyed && !isPlayer) {
    const d = rs?.diplo;
    if (d?.atWar) {
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

// ─── SVG MAP INTERACTION ─────────────────────────────────────
function initMapSVG() {
  const svg = document.getElementById('map-svg');
  if (!svg) return;

  svg.querySelectorAll('polygon[data-region]').forEach(poly => {
    const id = poly.dataset.region;

    poly.addEventListener('mouseenter', e => {
      const r  = REGIONS[id];
      const rs = G.regionState[id];
      if (!r || !rs) return;
      const d = rs.diplo;
      const status = rs.destroyed ? '💀 Destroyed'
                   : d ? `<span style="color:${getDiploColor(d.score,d.atWar)}">${getDiploLabel(d.score,d.atWar)}</span> (${d.score>0?'+':''}${d.score})`
                   : getRelationLabel(rs.relation);
      let html = `<b style="color:${r.borderColor}">${r.icon} ${r.name}</b><br>${status}`;
      if (!rs.destroyed && !r.noTrade && id !== 'troy') {
        const exports = Object.entries(r.exports || {})
          .map(([res, info]) => `${info.icon} ${res} @ ◎${getPrice(res, id)}`)
          .join(', ');
        if (exports) html += `<br><span style="color:#6a8050">Exports: ${exports}</span>`;
        const distCost = getTradeDistanceCost(id);
        if (distCost > 0) html += `<br><span style="color:#c08030">Distance: ◎${distCost}</span>`;
      }
      const tooltip = document.getElementById('map-tooltip');
      tooltip.innerHTML = html;
      tooltip.style.display = 'block';
    });

    poly.addEventListener('mousemove', e => {
      const tooltip = document.getElementById('map-tooltip');
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top  = (e.clientY - 8)  + 'px';
    });

    poly.addEventListener('mouseleave', () => {
      document.getElementById('map-tooltip').style.display = 'none';
    });

    poly.addEventListener('click', () => {
      if (id === 'troy') return;
      const rs = G.regionState[id];
      if (!rs) return;
      // Deselect previous
      svg.querySelectorAll('polygon.selected').forEach(p => p.classList.remove('selected'));
      poly.classList.add('selected');
      selectedRegionId = id;
      renderRegionInfo(id);
    });
  });
}

// Sync destroyed state to SVG polygon classes
function updateMapSVG() {
  const svg = document.getElementById('map-svg');
  if (!svg) return;
  svg.querySelectorAll('polygon[data-region]').forEach(poly => {
    const id = poly.dataset.region;
    const rs = G.regionState[id];
    if (rs?.destroyed) poly.classList.add('destroyed');
    else poly.classList.remove('destroyed');
    if (id === selectedRegionId) poly.classList.add('selected');
  });
}

// Stub kept for compat
function getRegionAtPoint() { return null; }
function getCityAtPoint()   { return null; }


// ═══════════════════════════════════════════════════════════════
//  DIPLOMACY SYSTEM (preserved verbatim)
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

function updateDiplomacyPerTurn() {
  Object.entries(DIPLO_PROFILE).forEach(([id, prof]) => {
    const rs = G.regionState[id];
    if (!rs || rs.destroyed || !rs.diplo) return;
    const d = rs.diplo;

    if (d.atWar) return;

    d.score = clampScore(d.score + prof.driftPerTurn);

    if (G.lastTradedRegionId === id) {
      d.score = clampScore(d.score + 5);
    }

    if (!d.pendingDemand && d.score < 10 && d.score > (prof.warThreshold ?? -999) + 15 && Math.random() < 0.10) {
      const resource = prof.interests[0] || 'bronze';
      const qty = id === 'hatti' ? 3 : 2;
      d.pendingDemand = { resource, qty, deadline: G.turn + 3 };
      G.addLog(`${REGIONS[id].name} demands ${qty} ${resource}. Fulfill or relations suffer.`, 'log-event');
    }

    if (d.pendingDemand && G.turn > d.pendingDemand.deadline) {
      d.score = clampScore(d.score - 12);
      G.addLog(`${REGIONS[id].name}'s demand went unanswered — relations suffer.`, 'log-crisis');
      d.pendingDemand = null;
    }

    if (prof.canWar && prof.warThreshold !== null && d.score <= prof.warThreshold) {
      d.atWar = true;
      d.warDeclaredTurn = G.turn;
      d.warAttackTurn   = G.turn - 1;
      G.addLog(`⚔ ${REGIONS[id].name} has DECLARED WAR on Troy!`, 'log-crisis');
    }
  });

  if (G.tollRate !== 'normal') {
    const maritime = ['cyprus','mycenae','crete','egypt','ugarit'];
    maritime.forEach(mid => {
      const md = G.regionState[mid]?.diplo;
      if (!md || G.regionState[mid]?.destroyed || md.atWar) return;
      md.score = clampScore(md.score + (G.tollRate === 'low' ? 2 : -3));
    });
  }

  G.lastTradedRegionId = null;
}

function getHattiMilitary() {
  const base = 95 - (G.turn - 1) * 3;
  return Math.max(30, Math.round(base));
}

function getDiplomaticWarBattles() {
  const battles = [];
  Object.entries(DIPLO_PROFILE).forEach(([id, prof]) => {
    const rs = G.regionState[id];
    if (!rs || rs.destroyed || !rs.diplo) return;
    const d = rs.diplo;
    if (!d.atWar) return;
    if (d.warAttackTurn !== null && G.turn - d.warAttackTurn < 2) return;

    d.warAttackTurn = G.turn;
    const effMilitary = id === 'hatti' ? getHattiMilitary() : prof.military;
    const atkSize = effMilitary + Math.floor(Math.random() * 18);
    battles.push({
      title:    `${REGIONS[id].name} Attacks!`,
      subtitle: `${REGIONS[id].name} forces march on Troy in open war.`,
      atkName:  REGIONS[id].name,
      atkIcon:  REGIONS[id].icon,
      atkSize,
      atkPower: effMilitary,
      type:     'defense',
      regionId: id,
    });
  });
  return battles;
}

function diploGoldGift(regionId, amount) {
  const rs   = G.regionState[regionId];
  const d    = rs.diplo;
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
  renderDiploList();
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

  let demandHtml = '';
  if (d.pendingDemand) {
    const dm = d.pendingDemand;
    const canFulfill = (G.res[dm.resource] || 0) >= dm.qty;
    const meta = RES_META[dm.resource] || { icon:'?', name: dm.resource };
    demandHtml = `<div class="dd-demand-box">
      📨 <b>DEMAND:</b> ${REGIONS[id].name} demands ${dm.qty} ${meta.icon} ${meta.name} (deadline: Turn ${dm.deadline}).
      <br>Fulfill to gain +20 relations, or refuse for −18.
      <div class="dd-actions" style="margin-top:8px">
        <button class="dd-action-btn" ${!canFulfill?'disabled':''} onclick="diploFulfillDemand('${id}')">
          ✓ Fulfill Demand <span class="action-cost">${meta.icon}${dm.qty}</span>
        </button>
        <button class="dd-action-btn" onclick="diploRefuseDemand('${id}')">✗ Refuse</button>
      </div>
    </div>`;
  }

  const r = G.res;
  const actions = [];

  if (!d.atWar) {
    actions.push({ label:'Send Small Gold Gift',  cost:'◎5',  enabled: r.gold >= 5,                  cls:'', fn:`diploGoldGift('${id}',5)` });
    actions.push({ label:'Send Large Gold Gift',  cost:'◎15', enabled: r.gold >= 15,                 cls:'', fn:`diploGoldGift('${id}',15)` });
    actions.push({ label:'Send Gold Delegation',  cost:'◎30', enabled: r.gold >= 30,                 cls:'', fn:`diploGoldGift('${id}',30)` });
    actions.push({ label:'Send Bronze Tribute ×1', cost:'⚙1', enabled: r.bronze >= 1,               cls:'', fn:`diploBronzeGift('${id}',1)` });
    actions.push({ label:'Send Bronze Tribute ×3', cost:'⚙3', enabled: r.bronze >= 3,               cls:'', fn:`diploBronzeGift('${id}',3)` });
    actions.push({ label:'Send Grain Relief',     cost:'🌾5',  enabled: r.grain >= 5,                cls:'', fn:`diploGrainGift('${id}')` });
    if (!d.tradeDeal && d.score >= 35)
      actions.push({ label:'Sign Trade Agreement', cost:'◎10 · Req. 35+', enabled: r.gold >= 10,    cls:'', fn:`diploSignTradeDeal('${id}')` });
    if (!d.alliance && d.score >= 62)
      actions.push({ label:'Propose Alliance',     cost:'◎20 · Req. 62+', enabled: r.gold >= 20,   cls:'btn-alliance', fn:`diploFormAlliance('${id}')` });
  } else {
    actions.push({ label:'Offer Peace Treaty', cost:'◎10 + ⚙5', enabled: r.gold >= 10 && r.bronze >= 5, cls:'btn-peace', fn:`diploOfferPeace('${id}')` });
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
    ${d.atWar ? `<div class="dd-war-box">⚔ <b>ACTIVE WAR</b> — ${region.name} armies assault Troy periodically.</div>` : ''}
    ${d.tradeDeal ? `<div class="dd-benefit-box">📜 Trade Agreement active — <b>15% discount</b> on all purchases.</div>` : ''}
    ${d.alliance  ? `<div class="dd-benefit-box">🤝 Alliance active — <b>+10 garrison bonus</b> when defending.</div>` : ''}
    ${demandHtml}
    <div class="dd-section-label">Diplomatic Actions</div>
    <div class="dd-actions">${actHtml}</div>
  </div>`;
}


// ═══════════════════════════════════════════════════════════════
//  UI RENDERING
// ═══════════════════════════════════════════════════════════════

function renderAll() {
  renderTopBar();
  renderCityPanel();
  renderLog();
  drawMap();
}

function renderTopBar() {
  const el = id => document.getElementById(id);

  el('r-grain').textContent  = G.res.grain;
  el('r-copper').textContent = G.res.copper;
  el('r-tin').textContent    = G.res.tin;
  el('r-bronze').textContent = G.res.bronze;
  el('r-gold').textContent   = G.res.gold;
  el('r-silver').textContent = G.res.silver;
  el('disruption-val').textContent = G.disruption.toFixed(1);

  el('year-label').textContent = `${bcYear()} BC`;
  el('turn-label').textContent = `Turn ${G.turn} of ${G.maxTurns} · ${seasonLabel()}`;

  const nextBtn = el('next-turn-btn');
  if (nextBtn) nextBtn.textContent = `End ${isSummer() ? 'Summer' : 'Winter'} ▶`;
}

function renderCityPanel() {
  renderDynastyBar();
  renderPopSection();
  renderFactionsSection();
  renderBuildingsSection();
  renderPolicySection();
  renderActionsSection();
}

function renderDynastyBar() {
  const el = id => document.getElementById(id);
  const d = G.dynasty;

  if (el('season-icon'))  el('season-icon').textContent = isSummer() ? '☀' : '❄';
  if (el('season-label')) {
    el('season-label').textContent = isSummer() ? 'Summer' : 'Winter';
    el('season-label').className   = isSummer() ? '' : 'winter';
  }
  if (el('ruler-name'))    el('ruler-name').textContent  = d.rulerName;
  if (el('vassal-status')) {
    el('vassal-status').textContent = G.vassalOfHatti ? 'Vassal of Hatti' : 'Free City of Troy';
    el('vassal-status').style.color = G.vassalOfHatti ? '#8a5a20' : '#50a050';
  }

  const legitPct = d.legitimacy;
  if (el('legit-bar')) el('legit-bar').style.width = legitPct + '%';
  if (el('legit-bar')) {
    el('legit-bar').style.background =
      legitPct >= 60 ? '#d4a017' : legitPct >= 35 ? '#c06030' : '#c03030';
  }
  if (el('ruler-legitimacy')) el('ruler-legitimacy').textContent = d.legitimacy;
}


// ─── POPULATION CHART ────────────────────────────────────────
const POP_COLORS = {
  peasant:   '#6a9038',
  artisan:   '#c87030',
  militia:   '#8060a0',
  legionary: '#c04030',
  trader:    '#3080c0',
  patrician: '#d4a017',
};
const POP_KEYS = ['peasant','artisan','trader','patrician','militia','legionary'];

function drawPopChart() {
  const canvas = document.getElementById('pop-chart');
  if (!canvas) return;
  const ctx2 = canvas.getContext('2d');
  const W = canvas.offsetWidth || canvas.width;
  const H = canvas.offsetHeight || canvas.height;
  canvas.width  = W;
  canvas.height = H;

  ctx2.clearRect(0, 0, W, H);
  ctx2.fillStyle = '#0d0900';
  ctx2.fillRect(0, 0, W, H);

  const history = G.popHistory;
  if (history.length < 2) {
    ctx2.fillStyle = '#3a2800';
    ctx2.font = '10px Georgia';
    ctx2.textAlign = 'center';
    ctx2.fillText('Gathering data...', W / 2, H / 2 + 4);
    return;
  }

  const maxTotal = Math.max(...history.map(h => h.total), 1);
  const pad = { l: 2, r: 2, t: 4, b: 14 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const n  = history.length;

  function xOf(i) { return pad.l + (i / (n - 1)) * cW; }
  function yOf(v) { return pad.t + cH - (v / maxTotal) * cH; }

  // Draw famine bands
  history.forEach((h, i) => {
    if (h.famine) {
      const x0 = i === 0 ? pad.l : xOf(i - 0.5);
      const x1 = i === n - 1 ? pad.l + cW : xOf(i + 0.5);
      ctx2.fillStyle = 'rgba(192,48,24,0.18)';
      ctx2.fillRect(x0, pad.t, x1 - x0, cH);
    }
  });

  // Draw gridlines
  ctx2.strokeStyle = '#1a1200';
  ctx2.lineWidth = 1;
  for (let g = 0.25; g < 1; g += 0.25) {
    const y = pad.t + cH * (1 - g);
    ctx2.beginPath(); ctx2.moveTo(pad.l, y); ctx2.lineTo(pad.l + cW, y); ctx2.stroke();
  }

  // Stacked area chart
  // For each point, compute cumulative stack bottoms
  const stackedPaths = {};
  const bottoms = new Array(n).fill(0);

  for (const key of POP_KEYS) {
    const pts = history.map((h, i) => [xOf(i), yOf(bottoms[i] + h.pop[key])]);
    const bots = history.map((h, i) => [xOf(i), yOf(bottoms[i])]);

    // Build path: forward along top, backward along bottom
    ctx2.beginPath();
    ctx2.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n; i++) ctx2.lineTo(pts[i][0], pts[i][1]);
    for (let i = n - 1; i >= 0; i--) ctx2.lineTo(bots[i][0], bots[i][1]);
    ctx2.closePath();
    ctx2.fillStyle = POP_COLORS[key] + 'b0';
    ctx2.fill();

    // Advance bottoms
    for (let i = 0; i < n; i++) bottoms[i] += history[i].pop[key];
  }

  // Total line
  ctx2.beginPath();
  ctx2.moveTo(xOf(0), yOf(history[0].total));
  for (let i = 1; i < n; i++) ctx2.lineTo(xOf(i), yOf(history[i].total));
  ctx2.strokeStyle = '#f0d060';
  ctx2.lineWidth = 1.5;
  ctx2.stroke();

  // Turn labels on x-axis
  ctx2.fillStyle = '#4a3010';
  ctx2.font = '8px Georgia';
  ctx2.textAlign = 'center';
  const step = Math.max(1, Math.floor(n / 6));
  for (let i = 0; i < n; i += step) {
    ctx2.fillText(history[i].turn, xOf(i), H - 3);
  }

  // Current total label
  const last = history[n - 1];
  ctx2.fillStyle = '#d4a017';
  ctx2.font = 'bold 9px Georgia';
  ctx2.textAlign = 'right';
  ctx2.fillText(`${last.total * 100}`, W - pad.r, yOf(last.total) - 2);

  // Legend
  const legend = document.getElementById('pop-chart-legend');
  if (legend) {
    legend.innerHTML = POP_KEYS.map(k =>
      `<div class="pop-legend-item">
        <div class="pop-legend-dot" style="background:${POP_COLORS[k]}"></div>
        <span>${k.charAt(0).toUpperCase() + k.slice(1)}</span>
      </div>`
    ).join('');
  }

  // Famine indicator
  const fi = document.getElementById('famine-indicator');
  if (fi) fi.style.display = G.famine ? 'block' : 'none';
}

function renderPopSection() {
  const container = document.getElementById('pop-classes');
  if (!container) return;

  const POP_DEFS = [
    { key:'peasant',   icon:'🌾', name:'Peasants',    color:'#6a9038', tip:'Grain producers (summer only)' },
    { key:'artisan',   icon:'⚒',  name:'Artisans',    color:'#c87030', tip:'Bronze producers' },
    { key:'militia',   icon:'🗡',  name:'Militia',     color:'#8060a0', tip:'City defenders (cheap)' },
    { key:'legionary', icon:'⚔',  name:'Legionaries', color:'#c04030', tip:'Elite soldiers (bronze-equipped)' },
    { key:'trader',    icon:'🚢', name:'Traders',     color:'#3080c0', tip:'Gold income from toll trade' },
    { key:'patrician', icon:'👑', name:'Patricians',  color:'#d4a017', tip:'Palatial faction — may plot coups' },
  ];

  const total = popTotal();
  document.getElementById('pop-total').textContent = `${total} units · ${total * 100} people`;

  container.innerHTML = POP_DEFS.map(def => {
    const count  = G.pop[def.key];
    const barPct = Math.max(0, Math.min(100, (count / Math.max(1, total)) * 100));
    const canRecruit = def.key === 'militia'   && G.pop.peasant >= 1 && G.res.gold >= 1 && G.res.grain >= 1;
    const canTrain   = def.key === 'legionary' && G.pop.militia >= 1 && G.res.bronze >= 1;
    const canArtisan = def.key === 'artisan'   && G.pop.peasant >= 1 && G.res.gold >= 2 && G.pop.artisan < G.buildings.workshop * 3 + 3;
    const canDemobM  = def.key === 'militia'   && G.pop.militia > 0;
    const canDemobL  = def.key === 'legionary' && G.pop.legionary > 0;

    let btns = '';
    if (def.key === 'peasant') {
      btns = `<button class="pc-btn" title="Convert to militia (◎1 🌾1)" ${G.pop.peasant < 1 || G.res.gold < 1 || G.res.grain < 1 ? 'disabled' : ''} onclick="convertPeasantToMilitia()">⚔</button>
              <button class="pc-btn" title="Convert to artisan (◎2)" ${G.pop.peasant < 1 || G.res.gold < 2 || G.pop.artisan >= G.buildings.workshop*3+3 ? 'disabled' : ''} onclick="convertPeasantToArtisan()">⚒</button>`;
    } else if (def.key === 'militia') {
      btns = `<button class="pc-btn" title="Upgrade to legionary (⚙1)" ${G.pop.militia < 1 || G.res.bronze < 1 ? 'disabled' : ''} onclick="convertMilitiaToLegionary()">▲</button>
              <button class="pc-btn" title="Demobilize to peasant" ${G.pop.militia < 1 ? 'disabled' : ''} onclick="demobilize('militia')">▼</button>`;
    } else if (def.key === 'legionary') {
      btns = `<button class="pc-btn" title="Demobilize to militia" ${G.pop.legionary < 1 ? 'disabled' : ''} onclick="demobilize('legionary')">▼</button>`;
    }

    return `<div class="pop-class-row" title="${def.tip}">
      <span class="pc-icon">${def.icon}</span>
      <span class="pc-name">${def.name}</span>
      <span class="pc-count">${count}</span>
      <div class="pc-bar-wrap"><div class="pc-bar" style="width:${barPct}%;background:${def.color}"></div></div>
      ${btns}
    </div>`;
  }).join('');

  // Draw population chart
  requestAnimationFrame(drawPopChart);
}

function renderFactionsSection() {
  const container = document.getElementById('factions-list');
  if (!container) return;

  const FACTION_DEFS = [
    {
      key: 'city', icon: '🏙', name: 'City',
      members: 'Peasants · Artisans · Traders',
      anger: 'High taxes, food lack, disruption',
      color: () => loyaltyColor(G.factions.city.loyalty),
    },
    {
      key: 'military', icon: '⚔', name: 'Military',
      members: 'Militia · Legionaries',
      anger: 'Low pay, no weapons, no walls',
      color: () => loyaltyColor(G.factions.military.loyalty),
    },
    {
      key: 'palatial', icon: '🏛', name: 'Palatial',
      members: 'Patricians',
      anger: 'Low legitimacy — plots coups',
      color: () => loyaltyColor(G.factions.palatial.loyalty),
    },
  ];

  function loyaltyColor(v) {
    if (v >= 75) return '#50a050';
    if (v >= 55) return '#6a9050';
    if (v >= 35) return '#a07820';
    if (v >= 20) return '#c05030';
    return '#d03030';
  }

  function loyaltyLabel(v) {
    if (v >= 80) return 'Loyal';
    if (v >= 60) return 'Content';
    if (v >= 40) return 'Restless';
    if (v >= 20) return 'Angry';
    return 'MUTINOUS';
  }

  container.innerHTML = FACTION_DEFS.map(def => {
    const loyalty = G.factions[def.key].loyalty;
    const color   = loyaltyColor(loyalty);
    const label   = loyaltyLabel(loyalty);
    const warning = loyalty < 25 ? ' <span class="faction-risk">⚠ CRISIS</span>' : '';

    // Appease cost display
    const appeaseCost = def.key === 'city' ? '🌾5' : def.key === 'military' ? '⚙2' : '◎8';
    const canAppease  =
      def.key === 'city'     ? G.res.grain  >= 5 :
      def.key === 'military' ? G.res.bronze >= 2 :
                               G.res.gold   >= 8;

    return `<div class="faction-row-new" title="${def.members}&#10;Angry at: ${def.anger}">
      <span class="fn-icon">${def.icon}</span>
      <span class="fn-name">${def.name}</span>
      <div class="fn-bar-wrap"><div class="fn-bar" style="width:${loyalty}%;background:${color}"></div></div>
      <span class="fn-val">${loyalty}</span>
      <span class="fn-status" style="color:${color}">${label}${warning}</span>
      <button class="fn-btn" ${!canAppease ? 'disabled' : ''} onclick="appeaseFaction('${def.key}')">Appease ${appeaseCost}</button>
    </div>`;
  }).join('');
}

function renderBuildingsSection() {
  const container = document.getElementById('buildings-list');
  if (!container) return;

  const rows = Object.entries(BUILDING_DEFS).map(([type, def]) => {
    const level   = G.buildings[type];
    const maxLev  = def.maxLevel;
    const cost    = def.cost(level);
    const canBuild = level < maxLev && Object.entries(cost).every(([r, amt]) => (G.res[r] || 0) >= amt);
    const costStr  = Object.entries(cost).map(([r, amt]) => `${RES_META[r]?.icon || r}${amt}`).join(' ');

    const pips = Array.from({length: maxLev}, (_, i) =>
      `<div class="bld-pip${i < level ? ' active' : ''}"></div>`
    ).join('');

    return `<div class="building-row">
      <span class="bld-icon">${def.icon}</span>
      <span class="bld-name">${def.name}</span>
      <div class="bld-pips">${pips}</div>
      <span class="bld-level">${level}/${maxLev}</span>
      <button class="bld-btn" ${!canBuild ? 'disabled' : ''} onclick="buildBuilding('${type}')" title="${def.desc}">
        Build ${level < maxLev ? costStr : '(max)'}
      </button>
    </div>`;
  }).join('');

  container.innerHTML = rows;
}

function renderPolicySection() {
  const container = document.getElementById('policy-content');
  if (!container) return;

  const taxIncome = Math.round(G.pop.trader * 1.5 * getTaxGoldMult());
  const tollIncome = Math.round(3 + getTollGoldBonus());

  container.innerHTML = `
    <div class="policy-row">
      <span class="pol-label">Tax (◎${taxIncome}/t)</span>
      <button class="pol-btn ${G.taxRate === 'low'    ? 'active' : ''}" onclick="setTaxRate('low')">Low<br><small style="font-size:0.75em;color:#6a8a38">City+</small></button>
      <button class="pol-btn ${G.taxRate === 'normal' ? 'active' : ''}" onclick="setTaxRate('normal')">Normal</button>
      <button class="pol-btn ${G.taxRate === 'high'   ? 'active' : ''}" onclick="setTaxRate('high')">High<br><small style="font-size:0.75em;color:#c05030">City-</small></button>
    </div>
    <div class="policy-row">
      <span class="pol-label">Toll (◎${tollIncome}/t)</span>
      <button class="pol-btn ${G.tollRate === 'low'    ? 'active' : ''}" onclick="setTollRate('low')">Low<br><small style="font-size:0.75em;color:#6a8a38">Sea+</small></button>
      <button class="pol-btn ${G.tollRate === 'normal' ? 'active' : ''}" onclick="setTollRate('normal')">Normal</button>
      <button class="pol-btn ${G.tollRate === 'high'   ? 'active' : ''}" onclick="setTollRate('high')">High<br><small style="font-size:0.75em;color:#c05030">Sea-</small></button>
    </div>`;
}

function renderActionsSection() {
  const container = document.getElementById('action-list');
  if (!container) return;

  const r = G.res;
  const prod = computeProduction();
  const grainNet = prod.grain - popGrainConsumption() - garrisonGrainCost();

  const actions = [
    { type:'header', label:'🌾 PRODUCTION (this turn)' },
    { type:'info',   label:`☀ Grain: +${prod.grain} (net ${grainNet >= 0 ? '+' : ''}${grainNet}) · ◎ Gold: +${prod.gold} (−${garrisonGoldCost()} upkeep) · ⚙ Bronze: +${prod.bronze}` },

    { type:'header', label:'⚙ CRAFTING' },
    {
      id:'craft1', label:'⚙ Forge Bronze ×1', cost:'⚒2 🔩1', enabled: canCraft(1),
      fn: () => craftBronze(1),
    },
    {
      id:'craft2', label:'⚙ Forge Bronze ×2', cost:'⚒4 🔩2', enabled: canCraft(2),
      fn: () => craftBronze(2),
    },
    {
      id:'craft3', label:'⚙ Forge Bronze ×3', cost:'⚒6 🔩3', enabled: canCraft(3),
      fn: () => craftBronze(3),
    },

    { type:'header', label:'🗡 MILITIA & CAVALRY' },
    {
      id:'mercs', label:'🗡 Hire Mercenaries +2 militia', cost:'🥈5',
      enabled: r.silver >= 5,
      fn: () => { r.silver -= 5; G.pop.militia += 2; G.addLog('Hired mercenaries (+2 militia).', 'log-good'); renderAll(); },
    },
    {
      id:'cavalry', label:`🐎 Train Chariot Team (${G.cavalryBonus}/5)`, cost:'🐎1 ⚙1 ◎3',
      enabled: r.horses >= 1 && r.bronze >= 1 && r.gold >= 3 && G.cavalryBonus < 5,
      fn: () => {
        r.horses -= 1; r.bronze -= 1; r.gold -= 3;
        G.cavalryBonus = Math.min(5, G.cavalryBonus + 1);
        G.addLog('Chariot team trained. +8 defense, +10% expedition power.', 'log-good');
        renderAll();
      },
    },

    ...(!G.ironWorking ? [{
      id:'iron', label: G.turn >= 14 ? '⚒ Research Iron Working' : '⚒ Iron Working (available later)',
      cost:'◎18 🔩2', enabled: G.turn >= 14 && r.gold >= 18 && r.tin >= 2,
      fn: () => {
        r.gold -= 18; r.tin -= 2;
        G.ironWorking = true;
        G.dynasty.legitimacy = Math.min(100, G.dynasty.legitimacy + 10);
        G.addLog('Iron working mastered! Legionaries +30% strength. Legitimacy +10.', 'log-good');
        renderAll();
      },
    }] : [{ type:'info', label:'⚒ Iron Working RESEARCHED (+30% legionary str)' }]),

    { type:'header', label:'💰 SELL GOODS' },
    {
      id:'sell-oil', label:`🫒 Sell Olive Oil`, cost:`🫒${r.olive_oil} → ◎${r.olive_oil * 3}`,
      enabled: r.olive_oil > 0,
      fn: () => { const g = r.olive_oil * 3; r.gold += g; r.olive_oil = 0; G.addLog(`Sold olive oil for ◎${g}.`, 'log-trade'); renderAll(); },
    },
    {
      id:'sell-timber', label:`🪵 Sell Timber`, cost:`🪵${r.timber} → ◎${r.timber * 2}`,
      enabled: r.timber > 0,
      fn: () => { const g = r.timber * 2; r.gold += g; r.timber = 0; G.addLog(`Sold timber for ◎${g}.`, 'log-trade'); renderAll(); },
    },
    {
      id:'sell-horse', label:`🐎 Sell Horse`, cost:`🐎1 → ◎7`,
      enabled: r.horses >= 1,
      fn: () => { r.horses -= 1; r.gold += 7; G.addLog('Sold a horse for ◎7.', 'log-trade'); renderAll(); },
    },
    {
      id:'textiles', label:`🧵 Make Textiles`, cost:`🌾3 → 🥈4`,
      enabled: r.grain >= 3,
      fn: () => { r.grain -= 3; r.silver += 4; G.addLog('Converted grain to silver via textile trade.', 'log-good'); renderAll(); },
    },
  ];

  container.innerHTML = actions.map(a => {
    if (a.type === 'header') return `<div class="action-section-label">${a.label}</div>`;
    if (a.type === 'info')   return `<div class="action-section-label" style="color:#5a6a28;text-transform:none;font-size:0.68em;padding:3px 8px">${a.label}</div>`;
    return `<button class="action-item" data-id="${a.id}" ${!a.enabled ? 'disabled' : ''}>
      ${a.label} <span class="action-cost">${a.cost}</span>
    </button>`;
  }).join('');

  actions.filter(a => a.fn && !a.type).forEach(a => {
    const btn = container.querySelector(`[data-id="${a.id}"]`);
    if (btn && a.enabled) btn.addEventListener('click', a.fn);
  });
}

function renderLog() {
  const el = document.getElementById('log-entries');
  if (!el) return;
  el.innerHTML = G.log.slice(0, 20).map(e =>
    `<div class="log-entry ${e.cls}">${e.text}</div>`
  ).join('');
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

function renderRegionInfo(id) {
  const region = REGIONS[id];
  const rs     = G.regionState[id];
  const container = document.getElementById('trade-content');
  if (!container) return;

  if (rs.destroyed) {
    container.innerHTML = `<div class="region-info-card">
      <div class="ri-name">${region.icon} ${region.name}</div>
      <span class="ri-status status-gone">💀 DESTROYED</span>
      <p class="ri-desc" style="margin-top:8px">${region.desc}</p>
    </div>`;
    return;
  }

  if (region.noTrade) {
    container.innerHTML = `<div class="region-info-card">
      <div class="ri-name">${region.icon} ${region.name}</div>
      <span class="ri-status status-hostile">⚔ HOSTILE</span>
      <p class="ri-desc" style="margin-top:8px">${region.desc}</p>
    </div>`;
    return;
  }

  const exports = Object.entries(region.exports || {});
  const d = rs.diplo;
  const distCost = getTradeDistanceCost(id);
  const diploHtml = d ? `<div class="ri-diplo" style="color:${getDiploColor(d.score,d.atWar)};font-size:0.72em;margin:4px 0">
    ${getDiploLabel(d.score,d.atWar)} (${d.score>0?'+':''}${d.score})
    ${d.tradeDeal ? ' · 📜 Trade Deal' : ''}${d.alliance ? ' · 🤝 Allied' : ''}
    <button class="open-trade-btn" style="margin-left:6px;padding:2px 7px;font-size:0.9em" onclick="selectDiploRegion('${id}');openDiploModal()">Diplomacy ▶</button>
  </div>` : '';

  container.innerHTML = `<div class="region-info-card">
    <div class="ri-name">${region.icon} ${region.name}</div>
    ${diploHtml}
    ${distCost > 0 ? `<div style="font-size:0.72em;color:#c08030;margin:3px 0">⚡ Distance cost: ◎${distCost} (disruption: ${G.disruption.toFixed(1)})</div>` : ''}
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


// ─── TRADE MODAL ─────────────────────────────────────────────
let tradeCart = {}; // res -> {qty, buy}

function openTradeModal(regionId) {
  const region = REGIONS[regionId];
  const rs = G.regionState[regionId];
  if (!region || rs.destroyed || rs.diplo?.atWar) return;

  tradeCart = {};
  const modal = document.getElementById('trade-modal');
  modal.dataset.regionId = regionId;

  document.getElementById('tmod-region-icon').textContent = region.icon;
  document.getElementById('tmod-region-name').textContent = region.name;
  const d = rs.diplo;
  document.getElementById('tmod-region-status').textContent = d ? getDiploLabel(d.score, d.atWar) : '';
  document.getElementById('tmod-desc').textContent = region.desc;

  const distCost = getTradeDistanceCost(regionId);
  document.getElementById('tmod-distance-cost').innerHTML =
    `<div style="font-size:0.8em;color:#c08030;margin:6px 0">⚡ Distance cost: ◎${distCost} gold per trade (disruption: ${G.disruption.toFixed(1)})</div>`;

  renderTradeGoods(regionId);
  updateCartSummary(regionId);
  modal.style.display = 'flex';
}

function renderTradeGoods(regionId) {
  const region = REGIONS[regionId];
  const rs = G.regionState[regionId];
  const d = rs.diplo;
  const container = document.getElementById('tmod-goods');
  let html = '';

  // Exports from region (buy)
  const exps = Object.entries(region.exports || {});
  if (exps.length > 0) {
    html += `<div class="trade-section-header">Buy from ${region.name}</div>`;
    for (const [res, info] of exps) {
      const avail = Math.max(0, info.qty + (rs.exportMods[res] || 0));
      const price = getPrice(res, regionId, true);
      const inCart = tradeCart[`buy_${res}`]?.qty || 0;
      if (avail <= 0) continue;
      html += `<div class="trade-row">
        <span class="trade-res-icon">${info.icon}</span>
        <span class="trade-res-name">${info.name}</span>
        <span class="trade-res-price">◎${price.toFixed(1)} each${d?.tradeDeal ? ' <span style="color:#50a040">▼15%</span>' : ''}</span>
        <span class="trade-res-avail">Avail: ${avail - inCart}</span>
        <div class="trade-qty-ctrl">
          <button onclick="adjustCart('buy_${res}','${res}',${avail},${price},-1,'${regionId}')">-</button>
          <span id="cart-buy-${res}">${inCart}</span>
          <button onclick="adjustCart('buy_${res}','${res}',${avail},${price},1,'${regionId}')">+</button>
        </div>
      </div>`;
    }
  }

  // Imports to region (sell)
  // imports is an array of resource keys e.g. ['bronze','grain']
  const impsRaw = region.imports || [];
  const imps = Array.isArray(impsRaw)
    ? impsRaw.map(r => [r, { name: RES_META[r]?.name || r, icon: RES_META[r]?.icon || '📦' }])
    : Object.entries(impsRaw);

  if (imps.length > 0) {
    html += `<div class="trade-section-header" style="margin-top:10px">Sell to ${region.name}</div>`;
    for (const [res, info] of imps) {
      const price = getPrice(res, regionId, false);
      const have = G.res[res] || 0;
      const inCart = tradeCart[`sell_${res}`]?.qty || 0;
      // Live available = what player actually has right now minus already in cart
      const available = Math.max(0, have - inCart);
      html += `<div class="trade-row">
        <span class="trade-res-icon">${info.icon}</span>
        <span class="trade-res-name">${info.name}</span>
        <span class="trade-res-price">◎${price.toFixed(1)} each</span>
        <span class="trade-res-avail">Have: ${available}</span>
        <div class="trade-qty-ctrl">
          <button onclick="adjustCart('sell_${res}','${res}',${have},${price},-1,'${regionId}')">-</button>
          <span id="cart-sell-${res}">${inCart}</span>
          <button onclick="adjustCart('sell_${res}','${res}',${have},${price},1,'${regionId}')">+</button>
        </div>
      </div>`;
    }
  }

  container.innerHTML = html;
}

function adjustCart(key, res, maxQty, price, delta, regionId) {
  if (!tradeCart[key]) tradeCart[key] = { qty: 0, price, res, buy: key.startsWith('buy_') };
  const newQty = Math.max(0, Math.min(maxQty, tradeCart[key].qty + delta));
  tradeCart[key].qty = newQty;
  const el = document.getElementById(`cart-${key}`);
  if (el) el.textContent = newQty;
  updateCartSummary(regionId);
}

function buyCartCost() {
  let total = 0;
  for (const [key, item] of Object.entries(tradeCart)) {
    if (item.buy && item.qty > 0) total += item.qty * item.price;
  }
  return total;
}

function sellCartRevenue() {
  let total = 0;
  for (const [key, item] of Object.entries(tradeCart)) {
    if (!item.buy && item.qty > 0) total += item.qty * item.price;
  }
  return total;
}

function updateCartSummary(regionId) {
  const cost = buyCartCost();
  const rev = sellCartRevenue();
  const distCost = getTradeDistanceCost(regionId);
  const net = rev - cost - distCost;
  const hasItems = Object.values(tradeCart).some(i => i.qty > 0);

  document.getElementById('tmod-cart-summary').innerHTML = hasItems ?
    `<div style="font-size:0.82em;color:#b09050">
      Buy cost: ◎${cost.toFixed(1)} &nbsp;|&nbsp; Sell revenue: ◎${rev.toFixed(1)} &nbsp;|&nbsp;
      Distance cost: ◎${distCost} &nbsp;|&nbsp;
      <strong style="color:${net>=0?'#60a040':'#c04030'}">Net: ◎${net.toFixed(1)}</strong>
    </div>` :
    `<div style="font-size:0.82em;color:#806040">No items selected.</div>`;
}

document.getElementById('tmod-close').addEventListener('click', () => {
  document.getElementById('trade-modal').style.display = 'none';
});

document.getElementById('tmod-confirm').addEventListener('click', () => {
  const regionId = document.getElementById('trade-modal').dataset.regionId;
  if (!regionId) return;
  const rs = G.regionState[regionId];

  const cost = buyCartCost();
  const rev = sellCartRevenue();
  const distCost = getTradeDistanceCost(regionId);
  const totalCost = cost + distCost;

  if (G.res.gold < totalCost - rev) {
    G.addLog(`Not enough gold for this trade (need ◎${(totalCost - rev).toFixed(1)}).`, 'log-bad');
    renderLog();
    return;
  }

  // Apply buys
  for (const [key, item] of Object.entries(tradeCart)) {
    if (!item.buy || item.qty <= 0) continue;
    G.res[item.res] = (G.res[item.res] || 0) + item.qty;
    G.res.gold -= item.qty * item.price;
  }
  // Apply sells
  for (const [key, item] of Object.entries(tradeCart)) {
    if (item.buy || item.qty <= 0) continue;
    G.res[item.res] = Math.max(0, (G.res[item.res] || 0) - item.qty);
    G.res.gold += item.qty * item.price;
  }
  // Deduct distance cost
  G.res.gold -= distCost;
  G.res.gold = Math.max(0, G.res.gold);

  // Toll revenue for Troy
  const tollBonus = getTollGoldBonus();
  if (tollBonus > 0) G.res.gold += tollBonus;

  G.tradeDoneThisTurn = true;
  G.lastTradedRegionId = regionId;

  // Diplo relation boost
  if (rs.diplo) rs.diplo.score = Math.min(100, rs.diplo.score + 2);

  const lines = [];
  for (const [key, item] of Object.entries(tradeCart)) {
    if (item.qty > 0) lines.push(`${item.buy ? 'Bought' : 'Sold'} ${item.qty}× ${item.res}`);
  }
  G.addLog(`Trade with ${REGIONS[regionId].name}: ${lines.join(', ')}. Distance cost: ◎${distCost}.`, 'log-trade');

  document.getElementById('trade-modal').style.display = 'none';
  renderAll();
});

// ─── MODAL QUEUE ─────────────────────────────────────────────
// All turn-end modals (events, tribute, battles) are queued and shown one at a time.

let _modalQueue = [];
let _modalRunning = false;

function queueModal(type, data) {
  _modalQueue.push({ type, data });
}

function drainModalQueue() {
  if (_modalRunning || _modalQueue.length === 0) {
    if (!_modalRunning) {
      renderAll();
      updateLetterBadge();
    }
    return;
  }
  _modalRunning = true;
  const next = _modalQueue.shift();
  if (next.type === 'event') {
    _openEventModal(next.data, () => {
      _modalRunning = false;
      drainModalQueue();
    });
  } else if (next.type === 'tribute') {
    _openTributeModal(() => {
      _modalRunning = false;
      drainModalQueue();
    });
  } else if (next.type === 'battle') {
    simulateBattle(next.data, () => {
      _modalRunning = false;
      drainModalQueue();
    });
  } else {
    _modalRunning = false;
    drainModalQueue();
  }
}

// ─── EVENT MODAL ─────────────────────────────────────────────
let _eventModalCallback = null;

function _openEventModal(ev, callback) {
  _eventModalCallback = callback;
  const modal = document.getElementById('event-modal');
  document.getElementById('emod-icon').textContent = ev.icon || '📜';
  document.getElementById('emod-title').textContent = ev.title;
  document.getElementById('emod-text').textContent = ev.text;

  // Show effects summary
  const effects = ev.effectSummary || ev.effects || [];
  document.getElementById('emod-effects').innerHTML = effects.map(e => {
    const cls = e.cls === 'eff-good' ? 'effect-good' : 'effect-bad';
    const text = e.text || e.desc || '';
    return text ? `<div class="emod-effect ${cls}">${text}</div>` : '';
  }).join('');

  // Log text
  if (ev.logText) G.addLog(ev.logText, ev.logClass || 'log-event');

  modal.style.display = 'flex';
}

// Legacy shim so other code can still call showEventModal
function showEventModal(ev, extraEffects) {
  queueModal('event', { ...ev, effectSummary: extraEffects || ev.effects || [] });
}

document.getElementById('emod-continue').addEventListener('click', () => {
  document.getElementById('event-modal').style.display = 'none';
  const cb = _eventModalCallback;
  _eventModalCallback = null;
  if (cb) cb(); else drainModalQueue();
});

// ─── TRIBUTE MODAL ───────────────────────────────────────────
let _tributeModalCallback = null;

function _openTributeModal(callback) {
  _tributeModalCallback = callback;
  const modal = document.getElementById('tribute-modal');
  const due = G.tributeDoubleThisTurn ? 6 : 3;
  document.getElementById('trib-due-amount').textContent = due;
  document.getElementById('trib-double-warn').innerHTML = G.tributeDoubleThisTurn ?
    `<div style="color:#c04030;font-size:0.8em;margin-bottom:8px">⚠ Double tribute demanded this season!</div>` : '';
  document.getElementById('trib-bronze-have').textContent = `You have: ⚙ ${G.res.bronze} bronze`;
  const d = G.regionState.hatti?.diplo;
  document.getElementById('trib-hatti-status').textContent = d ?
    `Hatti relations: ${d.score} (${getDiploLabel(d.score, d.atWar)})` : '';
  modal.style.display = 'flex';
}

function showTributeModal() {
  queueModal('tribute', {});
}

function _closeTributeModal() {
  document.getElementById('tribute-modal').style.display = 'none';
  const cb = _tributeModalCallback;
  _tributeModalCallback = null;
  if (cb) cb(); else drainModalQueue();
}

document.getElementById('trib-pay-btn').addEventListener('click', () => {
  payTribute();
  _closeTributeModal();
});

document.getElementById('trib-refuse-btn').addEventListener('click', () => {
  G.tributeRefusedThisTurn = true;
  const d = G.regionState.hatti?.diplo;
  if (d) d.score = Math.max(-100, d.score - 15);
  G.dynasty.legitimacy = Math.max(0, G.dynasty.legitimacy - 5);
  G.addLog('You refused to pay tribute to Hatti. The Great King is angered.', 'log-bad');
  _closeTributeModal();
});

// ─── DIPLO MODAL LISTENERS ────────────────────────────────────
document.getElementById('diplo-btn').addEventListener('click', openDiploModal);
document.getElementById('diplo-close').addEventListener('click', () => {
  document.getElementById('diplo-modal').style.display = 'none';
});

// ─── LETTER MODAL ────────────────────────────────────────────
document.getElementById('letters-btn').addEventListener('click', openLetterModal);
document.getElementById('letter-close').addEventListener('click', () => {
  document.getElementById('letter-modal').style.display = 'none';
});


// ─── ADVANCE TURN ─────────────────────────────────────────────
function advanceTurn() {
  // Reset modal queue for this turn
  _modalQueue = [];
  _modalRunning = false;
  G._pendingModals = [];

  const wasSum = isSummer();

  // 1. Compute production
  const prod = computeProduction();

  if (wasSum) {
    G.res.grain += prod.grain;
    if (prod.grain > 0) G.addLog(`☀ Summer harvest: +${prod.grain} grain (${G.pop.peasant} peasants, farms lv${G.buildings.farms}).`, 'log-norm');
    else G.addLog('☀ Summer: drought devastates harvest.', 'log-crisis');
  } else {
    G.addLog('❄ Winter: no grain production.', 'log-norm');
  }

  // 2. Artisan/workshop production
  if (prod.bronze > 0) {
    G.res.bronze += prod.bronze;
  }

  // 3. Gold from traders + tolls
  G.res.gold += prod.gold;
  if (prod.gold > 0) G.addLog(`◎ Income: +${prod.gold} gold (traders: ${G.pop.trader}, tolls lv${G.buildings.harbor}).`, 'log-norm');

  // 4. Feed population & garrison
  feedPopulation();
  feedGarrison();

  // 5. Historical events → queued as modal
  const ev = EVENTS.find(e => e.turn === G.turn);
  if (ev) {
    const summary = applyEffects(ev.effects || []);
    // Attach summary to event data for modal display
    queueModal('event', { ...ev, effectSummary: summary });
    // Also queue any siege battles registered by applyEffects
    if (G._pendingModals) {
      G._pendingModals.forEach(m => queueModal(m.type, m.data));
      G._pendingModals = [];
    }
  }

  // 6. Mini-event (instant, no modal)
  rollMiniEvent();

  // 7. Letters
  tryGenerateLetters();

  // 8. Tribute (every summer while vassal)
  if (wasSum && G.vassalOfHatti) {
    G.tributeDoubleThisTurn = (Math.random() < 0.2);
    G.tributeRefusedThisTurn = false;
    queueModal('tribute', {});
  }

  // 9. Battles from nation wars / diplomacy
  updateNationWars();
  getDiplomaticWarBattles().forEach(b => queueModal('battle', b));

  // 10. Update systems
  updateFactions();
  checkFactionCrises();
  updateDynasty();
  updateDiplomacyPerTurn();
  updateDrought();

  // 11. Record histories
  recordPriceHistory();
  // popHistory is recorded inside feedPopulation

  // 12. Reset per-turn flags
  G.tradeDoneThisTurn = false;
  G.lastTradedRegionId = null;

  // 13. Advance turn counter
  G.turn++;

  // 14. Check defeat before showing modals
  if (!checkTurnEnd()) return;

  // 15. Drain modal queue (will renderAll when done)
  drainModalQueue();
}

function checkTurnEnd() {
  // Defeat conditions
  const total = popTotal();
  if (total <= 0) {
    endGame(false, 'Troy has fallen', 'Your city has been depopulated. The dynasty ends here.');
    return false;
  }
  if (G.dynasty.legitimacy <= 0) {
    endGame(false, 'Dynasty Overthrown', 'You have lost all legitimacy. A coup has deposed your line.');
    return false;
  }
  const hatti = G.regionState.hatti?.diplo;
  if (hatti?.atWar && G.buildings.walls <= 0) {
    endGame(false, 'Troy Falls to Hatti', 'The Great King\'s armies breach your walls. Wilusa is no more.');
    return false;
  }
  if (G.turn > G.maxTurns) {
    checkVictory();
    return false;
  }
  return true;
}

// ─── BATTLE SYSTEM ───────────────────────────────────────────
const PHASE_NAMES = ['Opening Volleys','Advance','Clash of Spears','Press the Advantage','Rout'];
const PHASE_DESCS = [
  'Archers exchange fire from distance.',
  'Infantry close the gap under missile fire.',
  'Spear lines crash together in brutal melee.',
  'One side begins to waver.',
  'The losing side breaks and flees.'
];
const LOSS_FRAC = [0.04, 0.08, 0.12, 0.10, 0.06];

let battleQueue = [];

function buildAndProcessRandomBattles() {
  // Check if Hatti or Mycenae is at war with Troy
  getDiplomaticWarBattles().forEach(b => battleQueue.push(b));
  processBattleQueue();
}

function processBattleQueue() {
  if (battleQueue.length === 0) return;
  const battle = battleQueue.shift();
  simulateBattle(battle, () => processBattleQueue());
}

function launchExpedition(city) {
  // Player clicks a city on the map to trade/raid
  const regionId = city.region;
  const rs = G.regionState[regionId];
  if (!rs || rs.destroyed) { G.addLog(`${city.name} is already destroyed.`,'log-bad'); return; }
  // Open trade modal instead for now
  openTradeModal(regionId);
}

function simulateExpedition(regionId, callback) {
  // Outgoing raid (not used much in new design — kept for compat)
  callback && callback();
}

function simulateBattle(battle, onComplete) {
  const modal = document.getElementById('battle-modal');
  const isSurvival = battle.type === 'defense';

  document.getElementById('bmod-year').textContent = bcYear();
  document.getElementById('bmod-title').textContent = battle.title || 'Battle!';
  document.getElementById('bmod-subtitle').textContent = battle.subtitle || '';
  document.getElementById('bmod-atk-icon').textContent = battle.atkIcon || '⚔';
  document.getElementById('bmod-atk-name').textContent = battle.atkName || 'Attacker';
  document.getElementById('bmod-atk-size').textContent = `Army: ${battle.atkSize || '?'} units`;

  const garr = getTotalGarrison();
  const garPow = getGarrisonStrength();
  const wallBonus = G.buildings.walls * 5;
  document.getElementById('bmod-def-size').textContent = `Garrison: ${garr} units`;
  document.getElementById('bmod-def-power').textContent = `Strength: ${garPow + wallBonus}`;
  document.getElementById('bmod-def-walls').textContent = `Walls: ${G.buildings.walls}/5`;

  const atkPow = battle.atkPower || 30;
  document.getElementById('bmod-atk-power').textContent = `Strength: ${atkPow}`;
  const defPow = garPow + wallBonus;
  const totalPow = atkPow + defPow;
  document.getElementById('bmod-bar-atk').style.width = `${Math.round(atkPow / totalPow * 100)}%`;
  document.getElementById('bmod-bar-def').style.width = `${Math.round(defPow / totalPow * 100)}%`;

  // Generate phases
  let phases = '';
  let atkLeft = battle.atkSize || 10;
  let defLeft = garr;
  let atkTotalLoss = 0, defTotalLoss = 0;

  for (let i = 0; i < PHASE_NAMES.length; i++) {
    const frac = LOSS_FRAC[i];
    const atkLoss = Math.max(0, Math.round(atkLeft * frac * (defPow / (atkPow + 1))));
    const defLoss = Math.max(0, Math.round(defLeft * frac * (atkPow / (defPow + wallBonus + 1))));
    atkLeft = Math.max(0, atkLeft - atkLoss);
    defLeft = Math.max(0, defLeft - defLoss);
    atkTotalLoss += atkLoss;
    defTotalLoss += defLoss;
    phases += `<div class="bmod-phase">
      <div class="bmod-phase-name">${PHASE_NAMES[i]}</div>
      <div class="bmod-phase-desc">${PHASE_DESCS[i]}</div>
      <div class="bmod-phase-losses">ATK −${atkLoss} &nbsp;|&nbsp; DEF −${defLoss}</div>
    </div>`;
  }
  document.getElementById('bmod-phases').innerHTML = phases;

  // Determine result
  const defWins = defPow >= atkPow * 0.8; // defender advantage
  document.getElementById('bmod-result-icon').textContent = defWins ? '🛡' : '💀';
  document.getElementById('bmod-result-title').textContent = defWins ? 'Troy Holds!' : 'Troy is Sacked!';
  document.getElementById('bmod-atk-cas').textContent = `Attacker: −${atkTotalLoss} units`;
  document.getElementById('bmod-def-cas').textContent = `Defender: −${defTotalLoss} units`;

  modal.style.display = 'flex';

  document.getElementById('bmod-continue').onclick = () => {
    modal.style.display = 'none';
    applyBattleResult(battle, defWins, defTotalLoss, atkTotalLoss);
    if (onComplete) onComplete();
    else drainModalQueue();
  };
}

function applyBattleResult(battle, defWins, defLoss, atkLoss) {
  if (!defWins) {
    // Sack: lose resources, population, walls
    const grainLost = Math.floor(G.res.grain * 0.3);
    const goldLost  = Math.floor(G.res.gold * 0.2);
    G.res.grain = Math.max(0, G.res.grain - grainLost);
    G.res.gold  = Math.max(0, G.res.gold  - goldLost);
    G.buildings.walls = Math.max(0, G.buildings.walls - 1);
    applyGarrisonLoss(0.4);
    killPopUnits(Math.floor(popTotal() * 0.1));
    G.dynasty.legitimacy = Math.max(0, G.dynasty.legitimacy - 15);
    G.disruption = Math.min(10, G.disruption + 0.5);
    G.addLog(`⚔ DEFEAT: Troy sacked! Lost ${grainLost} grain, ◎${goldLost} gold, walls damaged.`, 'log-bad');
    // Update diplo
    if (battle.regionId && G.regionState[battle.regionId]?.diplo) {
      G.regionState[battle.regionId].diplo.score = Math.max(-100, G.regionState[battle.regionId].diplo.score - 20);
    }
  } else {
    // Defense: lose some garrison
    applyGarrisonLoss(defLoss / Math.max(1, getTotalGarrison()) * 0.5);
    G.dynasty.legitimacy = Math.min(100, G.dynasty.legitimacy + 5);
    G.addLog(`🛡 VICTORY: Troy repels the attack! Defender losses: ${defLoss} units.`, 'log-good');
  }
}

// ─── VICTORY / END GAME ───────────────────────────────────────
function checkVictory() {
  const total = popTotal();
  const legit = G.dynasty.legitimacy;
  const walls = G.buildings.walls;

  let score = Math.floor(total * 0.5 + legit * 3 + G.res.gold * 0.2 + walls * 10 + G.res.grain * 0.1);
  let title, text;

  if (legit >= 70 && total >= 80 && walls >= 2) {
    title = '🏆 Troy Endures!';
    text = `Your dynasty has guided Wilusa through 15 years of Bronze Age crisis. The city stands strong.`;
  } else if (legit >= 40 && total >= 50) {
    title = '⚖ Twilight Dynasty';
    text = `Troy survives, but weakened. Your dynasty clings to power as the Bronze Age collapses around you.`;
  } else {
    title = '🌅 A Fading Glory';
    text = `Wilusa endures, but the golden age has passed. Your dynasty's hold is tenuous at best.`;
  }

  endGame(true, title, text, score);
}

function endGame(victory, title, text, score) {
  const screen = document.getElementById('gameover-screen');
  document.getElementById('gameover-icon').textContent = victory ? '🏺' : '💀';
  document.getElementById('gameover-title').textContent = title;
  document.getElementById('gameover-text').textContent = text;
  document.getElementById('gameover-score').textContent = score ? `Score: ${score}` : '';
  document.getElementById('game-screen').style.display = 'none';
  screen.style.display = 'flex';
}

// ─── NEXT TURN BUTTON ─────────────────────────────────────────
document.getElementById('next-turn-btn').addEventListener('click', () => {
  advanceTurn();
});

// ─── BEGIN BUTTON ─────────────────────────────────────────────
document.getElementById('begin-btn').addEventListener('click', () => {
  document.getElementById('intro-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
  // Seed initial population history entry
  recordPopHistory();
  initMapSVG();
  renderAll();
  updateLetterBadge();
  resizeCanvas();
  drawMap();
  G.addLog('Your reign begins. The Bronze Age world awaits.', 'log-norm');
});

// ─── WINDOW RESIZE ────────────────────────────────────────────
window.addEventListener('resize', () => {
  resizeCanvas();
  drawMap();
});

// Wire SVG map as soon as DOM is ready (before begin-btn click)
document.addEventListener('DOMContentLoaded', () => {
  initMapSVG();
});

