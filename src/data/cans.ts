import type { Can, Region } from '../types/can';

// The catalog: every Monster sold in Europe or the US, past and present.
//
// Facts come only from the sources below, never from memory (see CLAUDE.md):
// - a flavor sold in Europe uses the official UK page (German if the UK has none):
//   caffeine and sugar for the 500 ml can;
// - a US-only flavor uses the official US page: caffeine and calories
//   (the US pages give no sugar, except 0 g for zero-sugar drinks);
// - a discontinued flavor uses the Energy Drink Mania review: volume,
//   caffeine, and calories.
// "Discontinued" means: not on the official US, UK, or German product lists
// as of October 2026. Anything a source does not state stays undefined ("—").
// `flavorColor` is our own placeholder color, not the real can artwork.

const UK = 'https://www.monsterenergy.com/en-gb/energy-drinks/';
const DE = 'https://www.monsterenergy.com/de-de/energy-drinks/';
const US = 'https://www.monsterenergy.com/en-us/energy-drinks/';
const EDM = 'https://www.energydrinkmania.net/en/monster_energy/';

// US can sizes in millilitres
const OZ_16 = 473;
const OZ_15_5 = 458;
const OZ_15 = 444;

type Facts = Pick<Can, 'caffeineMg' | 'sugarG' | 'caloriesKcal' | 'volumeMl' | 'factsRegion' | 'source'>;

/** Official UK page, figures for the 500 ml can. */
function uk(path: string, caffeineMg: number | undefined, sugarG: number | undefined): Facts {
  return { caffeineMg, sugarG, volumeMl: 500, factsRegion: 'EU', source: UK + path };
}

/** Official German page, figures for the 500 ml can. */
function de(path: string, caffeineMg: number, sugarG: number): Facts {
  return { caffeineMg, sugarG, volumeMl: 500, factsRegion: 'EU', source: DE + path };
}

/** Official US page. `sugarG` only where the page states it (zero-sugar drinks). */
function us(path: string, caffeineMg: number, caloriesKcal: number, volumeMl: number, sugarG?: number): Facts {
  return { caffeineMg, sugarG, caloriesKcal, volumeMl, factsRegion: 'US', source: US + path };
}

/** Energy Drink Mania review of a discontinued can. */
function edm(page: string, factsRegion: Region, volumeMl?: number, caffeineMg?: number, caloriesKcal?: number): Facts {
  return { caffeineMg, caloriesKcal, volumeMl, factsRegion, source: `${EDM}${page}.html` };
}

export const cans: Can[] = [
  // Original
  { id: 'monster-energy', name: 'Monster Energy', line: 'Original', flavorColor: '#3F8F2A', regions: ['EU', 'US'], flavor: 'Sweet and salty — it tastes like Monster!', ...uk('monster-energy/original-green/', 160, 55), label: '/cans/monster-energy.jpg' },
  { id: 'lo-carb', name: 'Lo-Carb', line: 'Original', flavorColor: '#3C7DD9', regions: ['US'], flavor: 'Sweet and salty — it tastes like Lo-Carb Monster!', ...us('monster-energy/lo-carb/', 140, 30, OZ_16), label: '/cans/lo-carb.jpg' },
  { id: 'zero-sugar', name: 'Zero Sugar', line: 'Original', flavorColor: '#2C6FB7', regions: ['EU', 'US'], flavor: 'Sweet and salty', ...uk('monster-energy/zero-sugar-monster-energy/', 160, 0), label: '/cans/zero-sugar.jpg' },
  { id: 'original-zero-sugar', name: 'The Original Zero Sugar', line: 'Original', flavorColor: '#4FA33A', regions: ['EU'], flavor: 'Sweet and salty', ...uk('monster-energy/zero-sugar/', 160, 0) },
  { id: 'assault', name: 'Assault', line: 'Original', flavorColor: '#7A2E2E', regions: ['EU'], flavor: 'Bourbon cola + Monster', ...uk('monster-energy/assault/', 160, 54), label: '/cans/assault.jpg' },
  { id: 'vanilla-shot', name: 'Vanilla Shot', line: 'Original', flavorColor: '#E8DCC0', regions: ['US'], flavor: 'Sweet and salty with a twist of creamy vanilla', ...us('monster-energy/monster-energy-vanilla-shot/', 160, 220, OZ_16) },
  { id: 'zero-sugar-vanilla-shot', name: 'Zero Sugar Vanilla Shot', line: 'Original', flavorColor: '#D9CBA8', regions: ['US'], flavor: 'Sweet and salty with a twist of creamy vanilla', ...us('monster-energy/zero-sugar-vanilla-shot/', 160, 10, OZ_16, 0) },
  { id: 'strawberry-shot', name: 'Strawberry Shot', line: 'Original', flavorColor: '#D94A5C', regions: ['US'], flavor: 'Sweet and salty with a hint of strawberry', ...us('monster-energy/strawberry-shot/', 160, 220, OZ_16) },
  { id: 'zero-sugar-strawberry-shot', name: 'Zero Sugar Strawberry Shot', line: 'Original', flavorColor: '#C9606F', regions: ['US'], flavor: 'Sweet and salty with a hint of strawberry', ...us('monster-energy/zero-sugar-strawberry-shot/', 160, 10, OZ_16, 0) },
  { id: 'electric-blue', name: 'Electric Blue', line: 'Original', flavorColor: '#2F8FE0', regions: ['US'], flavor: 'Shockingly smooth blue raspberry popsicle', ...us('monster-energy/electric-blue/', 160, 210, OZ_16) },
  { id: 'orange-dreamsicle', name: 'Orange Dreamsicle', line: 'Original', flavorColor: '#F08A3C', regions: ['US'], flavor: 'Wickedly creamy orange vanilla ice cream blend', ...us('monster-energy/orange-dreamsicle/', 160, 200, OZ_16) },
  { id: 'nitro-super-dry', name: 'Nitro Super Dry', line: 'Original', flavorColor: '#A8B4C0', regions: ['EU', 'US'], flavor: 'Refreshing citrus', ...uk('monster-energy/nitro/', 160, 54) },
  { id: 'nitro-cosmic-peach', name: 'Nitro Cosmic Peach', line: 'Original', flavorColor: '#E89A7A', regions: ['EU'], flavor: 'Light peach & dry texture', ...uk('monster-energy/nitro-cosmic-peach/', 160, 53) },
  { id: 'lando-norris-zero-sugar', name: 'Lando Norris Zero Sugar', line: 'Original', flavorColor: '#E8A33C', regions: ['EU', 'US'], flavor: 'Refreshing melon with yuzu', ...uk('monster-energy/lando-norris-zero-sugar/', 160, 0) },
  { id: 'full-throttle-zero-sugar', name: 'Full Throttle Zero Sugar', line: 'Original', flavorColor: '#C8C8C8', regions: ['EU'], flavor: 'Peach and nectarine', ...uk('monster-energy/full-throttle-zero-sugar/', 160, 0) },
  { id: 'top-speed-zero-sugar', name: 'Top Speed Zero Sugar', line: 'Original', flavorColor: '#B9C2CC', regions: ['EU'], flavor: 'Peach and nectarine', ...de('monster-energy/top-speed-zero-sugar/', 160, 0) },
  { id: 'vr46-the-doctor', name: 'VR46 The Doctor', line: 'Original', flavorColor: '#F2C230', regions: ['EU'], flavor: 'Light, crisp, refreshing citrus', ...uk('monster-energy/vr46-aka-the-doctor/', 160, 54) },
  { id: 'vr46-zero-sugar', name: 'VR46 Zero Sugar', line: 'Original', flavorColor: '#E3D27A', regions: ['EU'], flavor: 'Light, crisp, refreshing citrus', ...uk('monster-energy/vr-46-zero-sugar/', 160, 0) },
  { id: 'mule', name: 'Monster Mule', line: 'Original', flavorColor: '#C9A45C', regions: ['EU'], flavor: 'Spicy sweet ginger, zesty lime notes', ...uk('monster-energy/monster-mule/', 160, 0) },
  { id: 'import', name: 'Super-Premium Import', line: 'Original', flavorColor: '#B8B8B0', regions: ['US'], flavor: 'Monster with a good clean Euro flavor', ...us('monster-energy/import/', 180, 210, OZ_16) },
  { id: 'absolutely-zero', name: 'Absolutely Zero', line: 'Original', flavorColor: '#4A6FA8', regions: ['EU', 'US'], discontinued: true, ...edm('monster_energy_absolutely_zero', 'US', 473, 140, 0) },
  { id: 'unleaded', name: 'Unleaded', line: 'Original', flavorColor: '#6E7A5A', regions: ['US'], discontinued: true, ...edm('monster_energy_unleaded', 'US', 473, 0, 220) },
  { id: 'import-light', name: 'Import Light', line: 'Original', flavorColor: '#C9C9BF', regions: ['US'], discontinued: true, ...edm('monster_energy_import_light', 'US', 550, 179, 58) },
  { id: 'cuba-lima', name: 'Cuba-Lima', line: 'Original', flavorColor: '#7FAF4A', regions: ['US'], discontinued: true, flavor: 'Cola and lime', ...edm('monster_energy_cuba_lima', 'US', 473, 160, 200) },
  { id: 'lewis-hamilton', name: 'Lewis Hamilton LH44', line: 'Original', flavorColor: '#D9DDE2', regions: ['EU'], discontinued: true, flavor: 'White grape', ...edm('monster_energy_lewis_hamilton', 'EU', 500, 150, 96) },
  { id: 'lewis-hamilton-zero-sugar', name: 'Lewis Hamilton Zero Sugar', line: 'Original', flavorColor: '#CFCFCF', regions: ['EU'], discontinued: true, flavor: 'Peach', ...edm('monster_energy_lewis_hamilton_zero_sugar', 'EU', 500, 160, 14) },
  { id: 'gronk', name: 'Gronk', line: 'Original', flavorColor: '#5A6E8C', regions: ['US'], discontinued: true, ...edm('monster_energy_gronk', 'US', 473, 144, 220) },
  { id: 'gronk-formula-87', name: 'Gronk Formula #87', line: 'Original', flavorColor: '#6A5A8C', regions: ['US'], discontinued: true, ...edm('monster_energy_gronk_formula87', 'US', 473, 142, 90) },
  { id: 'uber-monster', name: 'Übermonster', line: 'Original', flavorColor: '#8C6A3C', regions: ['US'], discontinued: true, ...edm('uber_monster_energy_brew', 'US', 500, 160, 200) },
  { id: 'export', name: 'Export', line: 'Original', flavorColor: '#8E9AA6', regions: ['EU'], discontinued: true },
  { id: 'bfc', name: 'BFC (Big Freakin’ Can)', line: 'Original', flavorColor: '#4F7F3A', regions: ['US'], discontinued: true },
  { id: 'm3', name: 'M3', line: 'Original', flavorColor: '#3A3A3A', regions: ['US'], discontinued: true },

  // Reserve
  { id: 'reserve-orange-dreamsicle', name: 'Reserve Orange Dreamsicle', line: 'Reserve', flavorColor: '#F2A05A', regions: ['EU', 'US'], flavor: 'Monster Energy with creamy orange sherbet', ...uk('monster-energy/monster-energy-reserve-orange-dreamsicle/', 160, 30) },
  { id: 'reserve-peaches-n-creme', name: 'Reserve Peaches n’ Crème', line: 'Reserve', flavorColor: '#F2B38C', regions: ['US'], flavor: 'Monster Energy with sweet peaches & crème', ...us('monster-energy/reserve-peaches-n-creme/', 160, 120, OZ_16) },
  { id: 'reserve-white-pineapple', name: 'Reserve White Pineapple', line: 'Reserve', flavorColor: '#E6D9A8', regions: ['EU'], flavor: 'Monster Energy with authentic pineapple', ...uk('monster-energy/reserve-white-pineapple/', 160, 30), label: '/cans/reserve-white-pineapple.jpg' },
  { id: 'reserve-watermelon', name: 'Reserve Watermelon', line: 'Reserve', flavorColor: '#C94F5E', regions: ['EU'], flavor: 'Monster Energy with authentic watermelon', ...uk('monster-energy/reserve-watermelon/', 160, 29), label: '/cans/reserve-watermelon.jpg' },

  // Juice
  { id: 'mango-loco', name: 'Mango Loco', line: 'Juice', flavorColor: '#2FA8D8', regions: ['EU', 'US'], flavor: 'Juicy mango', ...uk('juiced-monster/mango-loco/', 160, 56), label: '/cans/mango-loco.jpg' },
  { id: 'pipeline-punch', name: 'Pipeline Punch', line: 'Juice', flavorColor: '#E3628F', regions: ['EU', 'US'], flavor: 'Passion fruit, orange, and guava', ...uk('juiced-monster/pipeline-punch/', 160, 43), label: '/cans/pipeline-punch.jpg' },
  { id: 'pacific-punch', name: 'Pacific Punch', line: 'Juice', flavorColor: '#E8743B', regions: ['EU', 'US'], flavor: 'Classic fruit punch', ...uk('juiced-monster/pacific-punch/', 160, 55), label: '/cans/pacific-punch.jpg' },
  { id: 'khaotic', name: 'Khaotic', line: 'Juice', flavorColor: '#F2A93B', regions: ['EU'], flavor: 'Orange citrus', ...uk('juiced-monster/khaotic/', 160, 39), label: '/cans/khaotic.jpg' },
  { id: 'monarch', name: 'Monarch', line: 'Juice', flavorColor: '#D9A441', regions: ['EU'], flavor: 'Peach and nectarine', ...uk('juiced-monster/monarch/', 160, 52), label: '/cans/monarch.jpg' },
  { id: 'rio-punch', name: 'Rio Punch', line: 'Juice', flavorColor: '#C9463D', regions: ['EU', 'US'], flavor: 'Sweet papaya, vanilla ice cream, hint of black currant', ...uk('juiced-monster/juiced-monster-rio-punch/', 160, 35), label: '/cans/rio-punch.jpg' },
  { id: 'aussie-style-lemonade', name: 'Aussie Style Lemonade', line: 'Juice', flavorColor: '#E9CF4A', regions: ['EU'], flavor: 'Exotic lemonade', ...uk('juiced-monster/aussie-lemonade/', 160, 48), label: '/cans/aussie-style-lemonade.jpg' },
  { id: 'bad-apple', name: 'Bad Apple', line: 'Juice', flavorColor: '#8CC04A', regions: ['EU', 'US'], flavor: 'Crisp, dry apple flavour that’s not too sweet', ...uk('juiced-monster/juiced-monster-bad-apple/', 160, 41) },
  { id: 'viking-berry', name: 'Viking Berry', line: 'Juice', flavorColor: '#8A3C6E', regions: ['EU', 'US'], flavor: 'Berry flavors with a unique twist', ...uk('juiced-monster/juiced-monster-viking-berry/', 160, 38) },
  { id: 'ripper', name: 'Ripper', line: 'Juice', flavorColor: '#F2C83C', regions: ['EU'], flavor: 'Tropical juices', ...uk('juiced-monster/ripper/', 160, 42) },
  { id: 'mixxd-punch', name: 'Mixxd Punch', line: 'Juice', flavorColor: '#9A4FB0', regions: ['EU'], flavor: 'Tropical punch', ...de('juiced-monster/mixxd-punch/', 160, 45) },
  { id: 'voodoo-grape', name: 'Voodoo Grape', line: 'Juice', flavorColor: '#6A3C9A', regions: ['US'], flavor: 'Purple grape', ...us('juice-monster/voodoo-grape/', 160, 150, OZ_16) },
  { id: 'strawberry-lemonade', name: 'Strawberry Lemonade', line: 'Juice', flavorColor: '#F27A8C', regions: ['US'], flavor: 'Sweet taste of strawberries and perfectly tart lemonade', ...us('juice-monster/strawberry-lemonade/', 160, 200, OZ_16) },
  { id: 'khaos', name: 'Khaos', line: 'Juice', flavorColor: '#F28C28', regions: ['EU', 'US'], discontinued: true, flavor: 'Orange', ...edm('juice_monster_khaos', 'US', 473, 154, 160) },
  { id: 'm-80', name: 'M-80', line: 'Juice', flavorColor: '#E8C23C', regions: ['US'], discontinued: true, ...edm('monster_energy_m80', 'US', 473, 160, 200) },
  { id: 'papillon', name: 'Papillon', line: 'Juice', flavorColor: '#E0A84F', regions: ['US'], discontinued: true, flavor: 'Apple, pineapple, peach, mango', ...edm('juice_monster_papillon', 'US', 473, 160, 200) },
  { id: 'mixxd', name: 'Mixxd', line: 'Juice', flavorColor: '#7A3C8C', regions: ['US'], discontinued: true, flavor: 'Grape', ...edm('monster_energy_mixxd', 'US', 473, 160, 220) },

  // Ultra
  { id: 'zero-ultra', name: 'Zero Ultra', line: 'Ultra', flavorColor: '#C9CED6', regions: ['EU', 'US'], flavor: 'Light refreshing citrus', ...uk('monster-ultra/zero-sugar-ultra/', 150, 0), label: '/cans/zero-ultra.jpg' },
  { id: 'ultra-paradise', name: 'Ultra Paradise', line: 'Ultra', flavorColor: '#7DC36B', regions: ['EU', 'US'], flavor: 'Kiwi lime with a hint of cucumber', ...uk('monster-ultra/zero-sugar-ultra-paradise/', 150, 0), label: '/cans/ultra-paradise.jpg' },
  { id: 'ultra-fiesta-mango', name: 'Ultra Fiesta Mango', line: 'Ultra', flavorColor: '#5BC2C7', regions: ['EU', 'US'], flavor: 'Cool mango', ...uk('monster-ultra/zero-sugar-ultra-fiesta/', 150, 0), label: '/cans/ultra-fiesta-mango.jpg' },
  { id: 'ultra-rosa', name: 'Ultra Rosá', line: 'Ultra', flavorColor: '#E7A3B8', regions: ['EU', 'US'], flavor: 'Bright and sweet', ...uk('monster-ultra/zero-sugar-ultra-rosa/', 150, 0), label: '/cans/ultra-rosa.jpg' },
  { id: 'ultra-watermelon', name: 'Ultra Watermelon', line: 'Ultra', flavorColor: '#E0566B', regions: ['EU', 'US'], flavor: 'Refreshing watermelon', ...uk('monster-ultra/zero-sugar-ultra-watermelon/', 150, 0), label: '/cans/ultra-watermelon.jpg' },
  { id: 'ultra-gold', name: 'Ultra Gold', line: 'Ultra', flavorColor: '#D4B25C', regions: ['EU'], flavor: 'Refreshing golden pineapple', ...uk('monster-ultra/zero-sugar-ultra-gold/', 150, 0), label: '/cans/ultra-gold.jpg' },
  { id: 'ultra-violet', name: 'Ultra Violet', line: 'Ultra', flavorColor: '#8A63C9', regions: ['US'], flavor: 'Light citrus and grape', ...us('zero-sugar/ultra-violet/', 150, 10, OZ_16, 0), label: '/cans/ultra-violet.jpg' },
  { id: 'ultra-peachy-keen', name: 'Ultra Peachy Keen', line: 'Ultra', flavorColor: '#F0A47A', regions: ['EU', 'US'], flavor: 'Refreshing peach', ...uk('monster-ultra/zero-sugar-ultra-peachy-keen/', 150, 0), label: '/cans/ultra-peachy-keen.jpg' },
  { id: 'ultra-strawberry-dreams', name: 'Ultra Strawberry Dreams', line: 'Ultra', flavorColor: '#D9607A', regions: ['EU', 'US'], flavor: 'Sweet, yet tart strawberry flavor', ...uk('monster-ultra/zero-sugar-ultra-strawberry-dreams/', 150, 0), label: '/cans/ultra-strawberry-dreams.jpg' },
  { id: 'ultra-black', name: 'Ultra Black', line: 'Ultra', flavorColor: '#3A2A33', regions: ['EU', 'US'], flavor: 'Crisp and refreshing black cherry', ...uk('monster-ultra/zero-sugar-ultra-black/', 150, 0) },
  { id: 'ultra-fantasy-ruby-red', name: 'Ultra Fantasy Ruby Red', line: 'Ultra', flavorColor: '#D9506A', regions: ['EU', 'US'], flavor: 'Fresh pink pamplemousse', ...uk('monster-ultra/zero-sugar-ultra-fantasy-ruby-red/', 160, 0) },
  { id: 'ultra-blue', name: 'Ultra Blue', line: 'Ultra', flavorColor: '#3C7FD9', regions: ['US'], flavor: 'Light citrus and berry', ...us('zero-sugar/ultra-blue/', 150, 10, OZ_16, 0) },
  { id: 'ultra-red', name: 'Ultra Red', line: 'Ultra', flavorColor: '#C93C3C', regions: ['US'], flavor: 'Crisp and refreshing mixed berry', ...us('zero-sugar/ultra-red/', 140, 10, OZ_16, 0) },
  { id: 'ultra-sunrise', name: 'Ultra Sunrise', line: 'Ultra', flavorColor: '#F2903C', regions: ['US'], flavor: 'Light and crisp citrus and orange', ...us('zero-sugar/ultra-sunrise/', 150, 10, OZ_16, 0) },
  { id: 'ultra-vice-guava', name: 'Ultra Vice Guava', line: 'Ultra', flavorColor: '#E86A9A', regions: ['US'], flavor: 'Guava', ...us('zero-sugar/ultra-vice-guava/', 150, 10, OZ_16, 0) },
  { id: 'ultra-wild-passion', name: 'Ultra Wild Passion', line: 'Ultra', flavorColor: '#E8623C', regions: ['US'], flavor: 'Passionfruit with citrus', ...us('zero-sugar/ultra-wild-passion/', 150, 10, OZ_16, 0) },
  { id: 'ultra-blue-hawaiian', name: 'Ultra Blue Hawaiian', line: 'Ultra', flavorColor: '#2FB5C9', regions: ['US'], flavor: 'Light & easy-drinking tropical blend', ...us('zero-sugar/ultra-blue-hawaiian/', 150, 10, OZ_16, 0) },
  { id: 'ultra-punk-punch', name: 'Ultra Punk Punch', line: 'Ultra', flavorColor: '#D93C8C', regions: ['US'], flavor: 'Classic fruit punch flavor', ...us('zero-sugar/ultra-punk-punch/', 150, 10, OZ_16, 0) },
  { id: 'ultra-red-white-blue-razz', name: 'Ultra Red White Blue Razz', line: 'Ultra', flavorColor: '#4A5FC9', regions: ['US'], flavor: 'Blue raspberry', ...us('zero-sugar/ultra-red-white-blue-razz/', 160, 10, OZ_16, 0) },
  { id: 'ultra-citron', name: 'Ultra Citron', line: 'Ultra', flavorColor: '#D8E06A', regions: ['EU', 'US'], discontinued: true, flavor: 'Citrus', ...edm('monster_energy_ultra_citron', 'US', 473, 152, 0) },

  // Rehab
  { id: 'rehab-tea-lemonade', name: 'Rehab Tea + Lemonade', line: 'Rehab', flavorColor: '#B8873B', regions: ['EU', 'US'], flavor: 'Brewed tea and lemonade', ...de('rehab-monster/iced-tea-lemonade/', 160, 11), label: '/cans/rehab-tea-lemonade.jpg' },
  { id: 'rehab-peach-tea', name: 'Rehab Peach Tea', line: 'Rehab', flavorColor: '#E0A070', regions: ['EU', 'US'], flavor: 'Brewed peach tea', ...de('rehab-monster/peach-iced-tea/', 160, 11) },
  { id: 'rehab-wild-berry-tea', name: 'Rehab Wild Berry Tea', line: 'Rehab', flavorColor: '#8A4F7A', regions: ['EU', 'US'], flavor: 'Mixed berry', ...de('rehab-monster/monster-rehab-tea-wild-berry/', 160, 10) },
  { id: 'rehab-green-tea', name: 'Rehab Green Tea', line: 'Rehab', flavorColor: '#7FA85A', regions: ['US'], flavor: 'Green tea', ...us('rehab-monster/green-tea/', 160, 15, OZ_15_5) },
  { id: 'rehab-lemonade', name: 'Rehab Lemonade', line: 'Rehab', flavorColor: '#E8D45A', regions: ['US'], discontinued: true, flavor: 'Tea, lemonade', ...edm('monster_energy_rehab_lemonade', 'US', 458, 161, 25) },
  { id: 'rehab-orangeade', name: 'Rehab Orangeade', line: 'Rehab', flavorColor: '#F29A3C', regions: ['US'], discontinued: true, ...edm('monster_energy_rehab_orangeade', 'US', 458, 161, 25) },
  { id: 'rehab-pink-lemonade', name: 'Rehab Pink Lemonade', line: 'Rehab', flavorColor: '#F0A0B4', regions: ['US'], discontinued: true, flavor: 'Tea, lemonade', ...edm('monster_energy_rehab_pink_lemonade', 'US', 458, 161, 20) },
  { id: 'rehab-protean', name: 'Rehab Protean', line: 'Rehab', flavorColor: '#C9B48C', regions: ['US'], discontinued: true, ...edm('monster_energy_rehab_protean', 'US', 458, 158, 100) },
  { id: 'rehab-rojo-tea', name: 'Rehab Rojo Tea', line: 'Rehab', flavorColor: '#B03C3C', regions: ['US'], discontinued: true, ...edm('monster_energy_rehab_rojo_tea', 'US', 458, 161, 25) },
  { id: 'rehab-strawberry-lemonade', name: 'Rehab Strawberry Lemonade', line: 'Rehab', flavorColor: '#E85A6A', regions: ['US'], discontinued: true, flavor: 'Strawberry, lemonade', ...edm('monster_energy_rehab_strawberry_lemonade', 'US', 458, 160, 25) },
  { id: 'rehab-watermelon', name: 'Rehab Watermelon', line: 'Rehab', flavorColor: '#E05A5A', regions: ['US'], discontinued: true, flavor: 'Watermelon', ...edm('monster_energy_rehab_watermelon', 'US', 458, 150, 25) },
  { id: 'rehab-white-dragon-tea', name: 'Rehab White Dragon Tea', line: 'Rehab', flavorColor: '#E0E0D0', regions: ['US'], discontinued: true, ...edm('monster_energy_rehab_white_dragon_tea', 'US', 458, 150, 40) },

  // Coffee
  { id: 'java-cafe-latte', name: 'Java Café Latte', line: 'Coffee', flavorColor: '#B08A64', regions: ['US'], flavor: 'Coffee forward with cream and sugar', ...us('java-monster/cafe-latte/', 200, 220, OZ_15) },
  { id: 'java-dubai-chocolate', name: 'Java Dubai Chocolate', line: 'Coffee', flavorColor: '#7A9A5A', regions: ['US'], flavor: 'Chocolate with creamy pistachio tahini and ultra-thin phyllo', ...us('java-monster/dubai-chocolate/', 200, 220, OZ_15) },
  { id: 'java-irish-creme', name: 'Java Irish Crème', line: 'Coffee', flavorColor: '#5A8C5A', regions: ['US'], flavor: 'Non-alcoholic Irish coffee', ...us('java-monster/irish-creme/', 200, 190, OZ_15) },
  { id: 'java-loca-moca', name: 'Java Loca Moca', line: 'Coffee', flavorColor: '#6A4A34', regions: ['US'], flavor: 'Chocolate mocha', ...us('java-monster/loca-moca/', 200, 220, OZ_15) },
  { id: 'java-mean-bean', name: 'Java Mean Bean', line: 'Coffee', flavorColor: '#C9A87A', regions: ['US'], flavor: 'Vanilla bean', ...us('java-monster/mean-bean/', 200, 220, OZ_15) },
  { id: 'java-salted-caramel', name: 'Java Salted Caramel', line: 'Coffee', flavorColor: '#C98C4A', regions: ['US'], flavor: 'Sweet and savory salted caramel', ...us('java-monster/salted-caramel/', 200, 180, OZ_15) },
  { id: 'killer-brew-loca-moca', name: 'Killer Brew Loca Moca', line: 'Coffee', flavorColor: '#4A3424', regions: ['US'], flavor: 'Mocha', ...us('java-monster/killer-brew-loca-moca/', 300, 220, OZ_15) },
  { id: 'killer-brew-mean-bean', name: 'Killer Brew Mean Bean', line: 'Coffee', flavorColor: '#A8885A', regions: ['US'], flavor: 'Vanilla coffee', ...us('java-monster/killer-brew-mean-bean/', 300, 220, OZ_15) },
  { id: 'java-chai-hai', name: 'Java Chai Hai', line: 'Coffee', flavorColor: '#B07A4A', regions: ['US'], discontinued: true, flavor: 'Tea', ...edm('java_monster_chai_hai', 'US', 443, 188, 180) },
  { id: 'java-farmers-oats', name: 'Java Farmer’s Oats', line: 'Coffee', flavorColor: '#C9B08A', regions: ['US'], discontinued: true, ...edm('java_monster_farmers_oats', 'US', 443, 200, 150) },
  { id: 'java-irish-blend', name: 'Java Irish Blend', line: 'Coffee', flavorColor: '#4A7A4A', regions: ['US'], discontinued: true, ...edm('java_monster_irish_blend', 'US', 443, 186, 200) },
  { id: 'java-kona-blend', name: 'Java Kona Blend', line: 'Coffee', flavorColor: '#8A6A4A', regions: ['US'], discontinued: true, ...edm('java_monster_kona_blend', 'US', 443, 189, 230) },
  { id: 'java-kona-cappuccino', name: 'Java Kona Cappuccino', line: 'Coffee', flavorColor: '#9A7A5A', regions: ['US'], discontinued: true, ...edm('java_monster_kona_cappuccino', 'US', 443, 188, 190) },
  { id: 'java-russian', name: 'Java Russian', line: 'Coffee', flavorColor: '#8C3C3C', regions: ['US'], discontinued: true, ...edm('java_monster_russian', 'US', 332, 188, 200) },
  { id: 'java-toffee', name: 'Java Toffee', line: 'Coffee', flavorColor: '#B0763C', regions: ['US'], discontinued: true, ...edm('java_monster_toffee', 'US', 443, 180, 200) },
  { id: 'java-triple-shot-french-vanilla', name: 'Java Triple Shot French Vanilla', line: 'Coffee', flavorColor: '#D9C49A', regions: ['US'], discontinued: true, ...edm('java_monster_triple_shot_french_vanilla', 'US', 443, 300, 200) },
  { id: 'java-triple-shot-mocha', name: 'Java Triple Shot Mocha', line: 'Coffee', flavorColor: '#5A3C2A', regions: ['US'], discontinued: true, ...edm('java_monster_triple_shot_mocha', 'US', 443, 300, 200) },
  { id: 'java-vanilla-light', name: 'Java Vanilla Light', line: 'Coffee', flavorColor: '#E0D4B0', regions: ['US'], discontinued: true, ...edm('java_monster_vanilla_light', 'US', 443, 185, 100) },
  { id: 'java-big-black', name: 'Java Big Black', line: 'Coffee', flavorColor: '#2A2420', regions: ['US'], discontinued: true },
  { id: 'java-cold-brew-latte', name: 'Java Cold Brew Latte', line: 'Coffee', flavorColor: '#A88A6A', regions: ['EU'], discontinued: true, ...edm('java_monster_cold_brew_latte', 'EU', 400, 200, 100) },
  { id: 'java-cold-brew-sweet-black', name: 'Java Cold Brew Sweet Black', line: 'Coffee', flavorColor: '#3A2E26', regions: ['EU'], discontinued: true, ...edm('java_monster_cold_brew_sweet_black', 'EU', 400, 200, 10) },
  { id: 'caffe-mocha', name: 'Caffè Monster Mocha', line: 'Coffee', flavorColor: '#6A4A3A', regions: ['US'], discontinued: true, ...edm('caffe_monster_mocha', 'US', 405, 150, 180) },
  { id: 'caffe-salted-caramel', name: 'Caffè Monster Salted Caramel', line: 'Coffee', flavorColor: '#B0824A', regions: ['US'], discontinued: true, ...edm('caffe_monster_salted_caramel', 'US', 405, 150, 180) },
  { id: 'caffe-vanilla', name: 'Caffè Monster Vanilla', line: 'Coffee', flavorColor: '#D9C8A0', regions: ['US'], discontinued: true, ...edm('caffe_monster_vanilla', 'US', 405, 150, 180) },
  { id: 'espresso-and-cream', name: 'Espresso Monster Espresso & Cream', line: 'Coffee', flavorColor: '#8A6A50', regions: ['EU'], discontinued: true, ...edm('espresso_monster_espresso_and_cream', 'EU', 250, 160, 150) },
  { id: 'espresso-vanilla', name: 'Espresso Monster Vanilla Espresso', line: 'Coffee', flavorColor: '#C9B08A', regions: ['EU'], discontinued: true, ...edm('espresso_monster_vanilla_espresso', 'EU', 250, 150, 150) },

  // Dragon Tea
  { id: 'dragon-tea-green-tea', name: 'Dragon Tea Green Tea', line: 'Dragon Tea', flavorColor: '#6A9A4A', regions: ['US'], discontinued: true, ...edm('monster_energy_dragon_tea_green_tea', 'US', 458, 155, 35) },
  { id: 'dragon-tea-white-tea', name: 'Dragon Tea White Tea', line: 'Dragon Tea', flavorColor: '#D0D4C0', regions: ['US'], discontinued: true, ...edm('monster_energy_dragon_tea_white_tea', 'US', 458, 155, 40) },
  { id: 'dragon-tea-yerba-mate', name: 'Dragon Tea Yerba Mate', line: 'Dragon Tea', flavorColor: '#8AA05A', regions: ['US'], discontinued: true, ...edm('monster_energy_dragon_tea_yerba_mate', 'US', 458, 155, 35) },
  { id: 'dragon-iced-tea-green-tea', name: 'Dragon Iced Tea Green Tea', line: 'Dragon Tea', flavorColor: '#5A8A3C', regions: ['US'], discontinued: true, ...edm('monster_energy_dragon_iced_tea_green_tea', 'US', 680, 160, 100) },
  { id: 'dragon-iced-tea-lemon-tea', name: 'Dragon Iced Tea Lemon Tea', line: 'Dragon Tea', flavorColor: '#D9C43C', regions: ['US'], discontinued: true, ...edm('monster_energy_dragon_iced_tea_lemon_tea', 'US', 680, 160, 100) },
  { id: 'dragon-iced-tea-peach-tea', name: 'Dragon Iced Tea Peach Tea', line: 'Dragon Tea', flavorColor: '#E8946A', regions: ['US'], discontinued: true, ...edm('monster_energy_dragon_iced_tea_peach_tea', 'US', 680, 160, 100) },
  { id: 'dragon-iced-tea-raspberry-tea', name: 'Dragon Iced Tea Raspberry Tea', line: 'Dragon Tea', flavorColor: '#C93C6A', regions: ['US'], discontinued: true, ...edm('monster_energy_dragon_iced_tea_raspberry_tea', 'US', 680, 160, 100) },

  // Hydro
  { id: 'hydro-blue-ice', name: 'Hydro Blue Ice', line: 'Hydro', flavorColor: '#5AB0E0', regions: ['US'], discontinued: true, ...edm('monster_energy_hydro_blue_ice', 'US', 750, 188, 150) },
  { id: 'hydro-manic-melon', name: 'Hydro Manic Melon', line: 'Hydro', flavorColor: '#E05A7A', regions: ['US'], discontinued: true, flavor: 'Watermelon', ...edm('monster_energy_hydro_manic_melon', 'US', 500, 125, 100) },
  { id: 'hydro-purple-passion', name: 'Hydro Purple Passion', line: 'Hydro', flavorColor: '#8A4FC9', regions: ['US'], discontinued: true, flavor: 'Grape', ...edm('monster_energy_hydro_purple_passion', 'US', 750, 188, 150) },
  { id: 'hydro-tropical-thunder', name: 'Hydro Tropical Thunder', line: 'Hydro', flavorColor: '#F2B43C', regions: ['US'], discontinued: true, ...edm('monster_energy_hydro_tropical_thunder', 'US', 500, 125, 100) },
  { id: 'hydro-zero-sugar', name: 'Hydro Zero Sugar', line: 'Hydro', flavorColor: '#B0C9D9', regions: ['US'], discontinued: true, flavor: 'Pear', ...edm('monster_energy_hydro_zero_sugar', 'US', 750, 188, 0) },
  { id: 'hydro-mean-green', name: 'Hydro Mean Green', line: 'Hydro', flavorColor: '#6AC94A', regions: ['US'], discontinued: true },
  { id: 'hydrosport-hang-time', name: 'Hydrosport Super Fuel Hang Time', line: 'Hydro', flavorColor: '#3C8CD9', regions: ['US'], discontinued: true },
  { id: 'hydrosport-striker', name: 'Hydrosport Super Fuel Striker', line: 'Hydro', flavorColor: '#D94A3C', regions: ['US'], discontinued: true },

  // Muscle
  { id: 'muscle-vanilla', name: 'Muscle Monster Vanilla', line: 'Muscle', flavorColor: '#E0D0A8', regions: ['US'], discontinued: true, flavor: 'Vanilla', ...edm('muscle_monster_energy_shake_vanilla', 'US', 443, 157, 200) },
  { id: 'muscle-chocolate', name: 'Muscle Monster Chocolate', line: 'Muscle', flavorColor: '#6A4A34', regions: ['US'], discontinued: true },
  { id: 'muscle-coffee', name: 'Muscle Monster Coffee', line: 'Muscle', flavorColor: '#8A6A4A', regions: ['US'], discontinued: true },
  { id: 'muscle-strawberry', name: 'Muscle Monster Strawberry', line: 'Muscle', flavorColor: '#E07A8A', regions: ['US'], discontinued: true },

  // Maxx
  { id: 'maxx-eclipse', name: 'Maxx Eclipse', line: 'Maxx', flavorColor: '#5A3C8C', regions: ['US'], discontinued: true, flavor: 'Grape', ...edm('monster_energy_maxx_eclipse', 'US', 355, 180, 160) },
  { id: 'maxx-solaris', name: 'Maxx Solaris', line: 'Maxx', flavorColor: '#E0503C', regions: ['US'], discontinued: true, ...edm('monster_energy_maxx_solaris', 'US', 355, 180, 160) },
  { id: 'maxx-super-dry', name: 'Maxx Super Dry', line: 'Maxx', flavorColor: '#B0B8C0', regions: ['US'], discontinued: true, flavor: 'Citrus', ...edm('monster_energy_maxx_super_dry', 'US', 355, 180, 160) },
  { id: 'maxx-mango-matic', name: 'Maxx Zero Sugar Mango Matic', line: 'Maxx', flavorColor: '#F2A83C', regions: ['US'], discontinued: true, flavor: 'Mango', ...edm('monster_energy_maxx_zero_sugar_mango_matic', 'US', 355, 200, 10) },
  { id: 'maxx-rad-red', name: 'Maxx Zero Sugar Rad Red', line: 'Maxx', flavorColor: '#C9303C', regions: ['US'], discontinued: true, flavor: 'Strawberry', ...edm('monster_energy_maxx_zero_sugar_rad_red', 'US', 355, 200, 10) },

  // Extra Strength
  { id: 'nitrous-super-dry', name: 'Nitrous Super Dry', line: 'Extra Strength', flavorColor: '#9AA4B0', regions: ['US'], discontinued: true, ...edm('nitrous_monster_super_dry', 'US', 355, 160, 160) },
  { id: 'extra-strength-anti-gravity', name: 'Extra Strength Anti-Gravity', line: 'Extra Strength', flavorColor: '#8AC93C', regions: ['US'], discontinued: true, ...edm('monster_energy_extra_strength_anti_gravity', 'US', 335, 160, 160) },
  { id: 'extra-strength-black-ice', name: 'Extra Strength Black Ice', line: 'Extra Strength', flavorColor: '#3A4A5A', regions: ['US'], discontinued: true, ...edm('monster_energy_extra_strength_black_ice', 'US', 355, 160, 0) },
  { id: 'extra-strength-super-dry', name: 'Extra Strength Super Dry', line: 'Extra Strength', flavorColor: '#C9C9B0', regions: ['US'], discontinued: true, ...edm('monster_energy_extra_strength_superdry', 'US', 355, 160, 160) },

  // Mutant
  { id: 'mutant-super-soda', name: 'Mutant Super Soda', line: 'Mutant', flavorColor: '#8CE03C', regions: ['US'], discontinued: true, flavor: 'Lime', ...edm('monster_energy_mutant_super_soda', 'US', 591, 115, 290) },
  { id: 'mutant-red-dawn', name: 'Mutant Red Dawn', line: 'Mutant', flavorColor: '#D9303C', regions: ['US'], discontinued: true, ...edm('monster_energy_mutant_super_soda_red_dawn', 'US', 591, 115, 290) },
  { id: 'mutant-white-lightning', name: 'Mutant White Lightning', line: 'Mutant', flavorColor: '#E0E4E8', regions: ['US'], discontinued: true, ...edm('monster_energy_mutant_super_soda_white_lightning', 'US', 591, 115, 10) },

  // Dub
  { id: 'dub-mad-dog', name: 'Dub Edition Mad Dog', line: 'Dub', flavorColor: '#7A3CA8', regions: ['US'], discontinued: true, flavor: 'Grape, punch', ...edm('monster_energy_dub_mad_dog', 'US', 473, 160, 220) },
  { id: 'dub-ballers-blend', name: 'Dub Edition Baller’s Blend', line: 'Dub', flavorColor: '#C9A83C', regions: ['US'], discontinued: true, flavor: 'Punch', ...edm('monster_energy_dub_ballers_blend', 'US', 473, 160, 210) },
];

export function findCan(id: string | undefined): Can | undefined {
  return cans.find((can) => can.id === id);
}

/** Catalog number shown as "No. 005". */
export function catalogNumber(can: Can): string {
  return `No. ${String(cans.indexOf(can) + 1).padStart(3, '0')}`;
}
