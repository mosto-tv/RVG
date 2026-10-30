// Art direction for the Ria Roleplay server (Los Santos, Blaine County and
// Cayo Perico). Every surface reads its imagery from this one module so the
// screenshots stay consistent — and so the whole set can be swapped in one
// place once the official in-game captures are ready.
//
// Each slot below names the in-game shot it is meant to hold. To ship the
// official GTA V / FiveM captures, drop the files into `velora/public/media/`
// and replace the CDN URL with `/media/<file>.jpg` — nothing else changes.
export const photo = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMAGES = {
  // Slots: hero — Downtown Los Santos at night, skyline and traffic
  heroCity: '1519501025264-65ba15a82390',
  // Slot: banner — Vinewood boulevard neon at night
  bannerNeon: '1496442226666-8d4d0e62e6e9',
  // Slot: road map / season art — Los Santos skyline at dusk
  aboutCity: '1477959858617-67f85cf4f1df',
  // Slot: street-level city shot — traffic on the boulevard
  aboutStreet: '1480714378408-67cf0d13bc1b',
  // Slot: roadmap art — city blocks from above
  roadmapSite: '1541443131876-44b03de101c5',
  // Slot: store hero — night meet under neon
  storeHero: '1550745165-9bc0b252726f',
  agents: {
    // Slots: staff portraits — in-game character portraits
    marcus: '1560250097-0b93528c311a',
    elena: '1580489944761-15a19d654956',
    kai: '1573496359142-b8d87734a5a2',
  },
  store: {
    // Slots: package art — garage, supercar, night meet, workshop, garage bay
    vip: '1550745165-9bc0b252726f',
    vehicle: '1503376780353-7e6692767b70',
    garage: '1544636331-e26879cd4d9b',
    tech: '1531297484001-80022131f5a1',
    night: '1558981403-c5f9899a28bc',
    lifestyle: '1552519507-da3b142c6e3d',
  },
};

// Shots used across features, districts and the roadmap.
export const SHOTS = {
  downtown: '1519501025264-65ba15a82390',
  boulevard: '1496442226666-8d4d0e62e6e9',
  skyline: '1477959858617-67f85cf4f1df',
  street: '1480714378408-67cf0d13bc1b',
  skylineDusk: '1485871981521-5b1fd3805eee',
  traffic: '1449824913935-59a10b8d2000',
  nightDrive: '1534430480872-3498386e7856',
  hills: '1541443131876-44b03de101c5',
  workshop: '1502877338535-766e1452684a',
  tunerCar: '1494976388531-d1058494cdd8',
  garageBay: '1511919884226-fd3cad34687c',
  supercar: '1503376780353-7e6692767b70',
  nightMeet: '1550745165-9bc0b252726f',
  interior: '1544636331-e26879cd4d9b',
  desert: '1552519507-da3b142c6e3d',
  neon: '1558981403-c5f9899a28bc',
  coastal: '1470071459604-3b5ec3a7fe05',
  farmland: '1500382017468-9049fed747ef',
  island: '1522083165195-3424ed129620',
  boardwalk: '1555396273-367ea4eb4db5',
  terminal: '1542362567-b07e54358753',
  coastRoad: '1512453979798-5ea266f8880c',
  workshopDesk: '1531297484001-80022131f5a1',
};

export const shot = (key, w = 1600) => photo(SHOTS[key], w);
