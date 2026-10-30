// Cinematic city, vehicle and nightlife photography (Unsplash CDN) for the
// Ria Roleplay server. Centralised so every surface reuses the same
// art-directed set instead of ad-hoc stock images.
export const photo = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMAGES = {
  heroCity: '1519501025264-65ba15a82390',
  bannerNeon: '1496442226666-8d4d0e62e6e9',
  aboutCity: '1477959858617-67f85cf4f1df',
  aboutStreet: '1480714378408-67cf0d13bc1b',
  roadmapSite: '1541443131876-44b03de101c5',
  agents: {
    marcus: '1560250097-0b93528c311a',
    elena: '1580489944761-15a19d654956',
    kai: '1573496359142-b8d87734a5a2',
  },
  store: {
    vip: '1550745165-9bc0b252726f',
    vehicle: '1503376780353-7e6692767b70',
    garage: '1544636331-e26879cd4d9b',
    tech: '1531297484001-80022131f5a1',
    night: '1558981403-c5f9899a28bc',
    lifestyle: '1552519507-da3b142c6e3d',
  },
};
