import type { CanId, Taste } from '../types/can';

// What each can tastes like, summed up in our own words from the sources listed
// with it: the official product page, the Energy Drink Mania review, and the
// Monster Energy wiki. A can with no usable source has no entry (see CLAUDE.md).

const UK = 'https://www.monsterenergy.com/en-gb/energy-drinks/';
const DE = 'https://www.monsterenergy.com/de-de/energy-drinks/';
const US = 'https://www.monsterenergy.com/en-us/energy-drinks/';
const EDM = 'https://www.energydrinkmania.net/en/monster_energy/';
const WIKI = 'https://monster-energy.fandom.com/wiki/';

export const tastes: Partial<Record<CanId, Taste>> = {
  'monster-energy': {
    text: 'A strong, sweet aroma the moment the can opens. Heavy sweetness with only a light acidity, much less tart than Red Bull, and a thick, mouth-filling body; the aroma builds with every sip.',
    sources: [UK + 'monster-energy/original-green/', EDM + 'monster_energy.html'],
  },
  'lo-carb': {
    text: 'Smells and tastes like the original Monster, only lighter: the heavy sweetness is toned down and the acidity is higher, while the finish stays strong. Ice-cold, it gets noticeably less sweet and more tart.',
    sources: [EDM + 'monster_energy_low_carb.html'],
  },
  'assault': {
    text: 'Sold as bourbon cola, it pours a dark, blood-red colour. In the glass it reads as strong cherry, sweet and close to fruit punch, with a cherry-cola feel.',
    sources: [UK + 'monster-energy/assault/', EDM + 'monster_energy_assault.html'],
  },
  'vanilla-shot': {
    text: 'The original Monster flavour with a creamy vanilla twist on top.',
    sources: [US + 'monster-energy/monster-energy-vanilla-shot/'],
  },
  'zero-sugar-vanilla-shot': {
    text: 'Zero-sugar Monster with the same creamy vanilla twist on top.',
    sources: [US + 'monster-energy/zero-sugar-vanilla-shot/'],
  },
  'strawberry-shot': {
    text: 'The original Monster flavour with a sweet strawberry twist on top.',
    sources: [US + 'monster-energy/strawberry-shot/'],
  },
  'zero-sugar-strawberry-shot': {
    text: 'Zero-sugar Monster with a sweet strawberry twist on top.',
    sources: [US + 'monster-energy/zero-sugar-strawberry-shot/'],
  },
  'electric-blue': {
    text: 'Blue raspberry in the style of a blue ice pop, made with real sugar and pitched as shockingly smooth.',
    sources: [US + 'monster-energy/electric-blue/'],
  },
  'orange-dreamsicle': {
    text: 'Orange and vanilla in the style of an orange creamsicle: a sweet, creamy, ice-cream-like blend.',
    sources: [US + 'monster-energy/orange-dreamsicle/'],
  },
  'nitro-super-dry': {
    text: 'Orange, lime, grapefruit, and lemon with a clear tartness and a slightly bitter citrus-peel finish. Nitrous oxide makes it foam a little and gives a creamy, smooth, lighter and drier feel.',
    sources: [UK + 'monster-energy/nitro/', EDM + 'monster_energy_nitro_super_dry.html'],
  },
  'nitro-cosmic-peach': {
    text: 'Smells of peach, orange, and nectarine. The taste is more a sweet-sour, orange-led tropical mix than pure peach, with peach in the background; the nitrogen makes it creamy and smooth, a can to sip rather than chug.',
    sources: [UK + 'monster-energy/nitro-cosmic-peach/', EDM + 'monster_energy_nitro_cosmic_peach.html'],
  },
  'vr46-the-doctor': {
    text: 'Bright gold, light and crisp: a refreshing, sweet orange with well-balanced acidity, rich rather than thin. Carbonation is mild and the orange aroma stays after the last sip.',
    sources: [UK + 'monster-energy/vr46-aka-the-doctor/', EDM + 'monster_energy_the_doctor.html', WIKI + 'Monster_Energy_The_Doctor'],
  },
  'mule': {
    text: 'A sharp ginger aroma, but a gentler taste: honey-like sweetness with concentrated lime, like a sweet ginger ale, with only a light tingle of ginger in the throat. Ice-cold, the lime comes forward and it gets more refreshing.',
    sources: [UK + 'monster-energy/monster-mule/', EDM + 'monster_energy_mule_ginger_brew.html'],
  },
  'import': {
    text: 'The original Monster, a little less sweet: the same sweet, rich aroma, with a sweetness that fades quickly.',
    sources: [US + 'monster-energy/import/', EDM + 'monster_energy_import.html'],
  },
  'absolutely-zero': {
    text: 'Sugar-free, yet it keeps a strong, sweet, almost perfume-like Monster aroma and the heavy, aromatic classic energy-drink taste. The aftertaste lingers; closest to the original among the zero-sugar cans.',
    sources: [EDM + 'monster_energy_absolutely_zero.html'],
  },
  'unleaded': {
    text: 'Caffeine-free, but it smells and tastes almost exactly like the original Monster: rich, with sweetness and sourness in balance.',
    sources: [EDM + 'monster_energy_unleaded.html'],
  },
  'import-light': {
    text: 'The sweet Monster aroma with a heavier body than you would expect from a low-sugar can. Sweet but lighter than the original, with a faint tang and fruity, banana-like notes.',
    sources: [EDM + 'monster_energy_import_light.html'],
  },
  'cuba-lima': {
    text: 'Inspired by the Cuba Libre cocktail: cola, closer to Pepsi than to Coke, with lime. Very strong at room temperature; chilled, a refreshing lime-cola that does not linger.',
    sources: [EDM + 'monster_energy_cuba_lima.html', WIKI + 'Monster_Cuba-Lima'],
  },
  'lewis-hamilton': {
    text: 'Tart white grape: noticeable sourness, moderate sweetness, and a chemical, classic energy-drink note with a sweetener aftertaste that lingers.',
    sources: [EDM + 'monster_energy_lewis_hamilton.html'],
  },
  'lewis-hamilton-zero-sugar': {
    text: 'Peach, slightly cloudy yellow. Tartness and mellow sweetness in balance, like juicy peach flesh, with a light tartness in the finish; it does not taste sugar-free.',
    sources: [EDM + 'monster_energy_lewis_hamilton_zero_sugar.html'],
  },
  'gronk': {
    text: 'A classic energy-drink flavour: tangy with mild sweetness, close to the classic Red Bull taste, plus a medicinal bitterness.',
    sources: [EDM + 'monster_energy_gronk.html'],
  },
  'gronk-formula-87': {
    text: 'A classic sweet-sour energy-drink flavour with a fruity white-grape note that lingers after each sip. About half the sugar of the first Gronk and cleaner, without its medicinal taste.',
    sources: [EDM + 'monster_energy_gronk_formula87.html'],
  },
  'uber-monster': {
    text: 'A non-alcoholic, beer-style Monster in a bottle, brewed with German methods. It opens like the original Monster, then a malty, beer-like flavour shows up at the back of the nose.',
    sources: [EDM + 'uber_monster_energy_brew.html'],
  },
  'reserve-orange-dreamsicle': {
    text: 'Strong orange with a creamy, milky aroma. Tastes like an orange cream soda: tangy orange with the sweetness of orange pulp and cream, and a light, clean finish with a hint of sweet cream.',
    sources: [EDM + 'monster_energy_reserve_orange_dreamsicle.html'],
  },
  'reserve-peaches-n-creme': {
    text: 'Peaches and cream on the original Monster base, made smooth and easy to drink.',
    sources: [US + 'monster-energy/reserve-peaches-n-creme/'],
  },
  'reserve-white-pineapple': {
    text: 'Cloudy, with a sweet-sour pineapple aroma. Tastes like canned pineapple juice, juicy and with the syrupy sweetness of fruit in syrup, though it contains no juice; lower in sugar, so it does not cling, and the finish is refreshing.',
    sources: [UK + 'monster-energy/reserve-white-pineapple/', EDM + 'monster_energy_reserve_white_pineapple.html'],
  },
  'reserve-watermelon': {
    text: 'Sold as smooth watermelon, but a review of the US can found it smells and tastes mostly of sweet-tart strawberry candy, with watermelon only as a faint note in the finish.',
    sources: [UK + 'monster-energy/reserve-watermelon/', EDM + 'monster_energy_reserve_watermelon.html'],
  },
  'mango-loco': {
    text: 'A sweet, fresh mango aroma and a cloudy, deep yellow colour. Rich mango sweetness with a slight tang, plus pineapple, orange, papaya, and guava; juicy and dense, with a softer fizz than classic Monster and a slightly lingering finish.',
    sources: [UK + 'juiced-monster/mango-loco/', EDM + 'juice_monster_mango_loco.html', WIKI + 'Juiced_Monster_Mango_Loco'],
  },
  'pipeline-punch': {
    text: 'Passion fruit, orange, and guava; it pours a cloudy orange, not pink. A very sweet tropical punch: peach and mango underneath, pineapple\'s tang, guava and passion fruit on top, even a banana-like note, with bright carbonation and little aftertaste.',
    sources: [UK + 'juiced-monster/pipeline-punch/', EDM + 'juice_monster_pipeline_punch.html', WIKI + 'Juiced_Monster_Pipeline_Punch'],
  },
  'pacific-punch': {
    text: 'A classic red fruit punch, lighter and less sweet than the other Juiced flavours: smooth sweetness and tartness, not heavy. Papaya, pineapple, acerola, and cherry sit inside the punch.',
    sources: [UK + 'juiced-monster/pacific-punch/', EDM + 'juice_monster_pacific_punch.html'],
  },
  'khaotic': {
    text: 'Orange citrus with a candy-like sweetness: sweet orange pulp and orange syrup over the artificial-flavour signature of the old Khaos. The European can leans towards a tropical mix led by orange.',
    sources: [UK + 'juiced-monster/khaotic/', EDM + 'juice_monster_khaotic.html'],
  },
  'monarch': {
    text: 'Light and subtle: peach and nectarine with a delicate sweetness, a gentle tartness, and a clean, fruity finish. Mellower than Mango Loco or Pacific Punch.',
    sources: [UK + 'juiced-monster/monarch/', WIKI + 'Juiced_Monster_Monarch'],
  },
  'rio-punch': {
    text: 'Sweet papaya and vanilla ice cream with a hint of blackcurrant. The first sip is a fruity, candy-like burst, then it mellows into something creamy.',
    sources: [UK + 'juiced-monster/juiced-monster-rio-punch/', WIKI + 'Juiced_Monster_Rio_Punch'],
  },
  'aussie-style-lemonade': {
    text: 'Cloudy, glowing yellow with a tangy lemon aroma. A real-lemon lemonade rather than a sweet one: mild acidity and a lemon-peel note like sour lemon candy, with a clean finish and no lingering sweetness.',
    sources: [UK + 'juiced-monster/aussie-lemonade/', EDM + 'juice_monster_aussie_style_lemonade.html'],
  },
  'bad-apple': {
    text: 'Crisp, dry apple that is not too sweet. Sweet-sour, juicy apple flesh with a hidden baked-apple depth; it pours a cloudy brown, and some countries\' cans lean more towards green apple.',
    sources: [UK + 'juiced-monster/juiced-monster-bad-apple/', EDM + 'juiced_monster_bad_apple.html'],
  },
  'ripper': {
    text: 'Tropical juices: sweet pineapple, mango, papaya, and guava with a slight tang and a rich aroma. Bright, slightly cloudy yellow; the tropical flavour lingers after each sip.',
    sources: [UK + 'juiced-monster/ripper/', EDM + 'juice_monster_ripper.html'],
  },
  'mixxd-punch': {
    text: 'Sold as sweet as homemade punch; it smells of fruit punch and pours a bright, orange-tinged red. The sweetness is light and the punch soft rather than intense; sipped slowly, mango, banana, and apple come through.',
    sources: [DE + 'juiced-monster/mixxd-punch/', EDM + 'monster_energy_punch_mixxd.html'],
  },
  'voodoo-grape': {
    text: 'Full-bodied grape made with Concord, Niagara, and red grape juices.',
    sources: [US + 'juice-monster/voodoo-grape/'],
  },
  'strawberry-lemonade': {
    text: 'Sweet strawberry with tart lemonade: bright and refreshing.',
    sources: [US + 'juice-monster/strawberry-lemonade/'],
  },
  'khaos': {
    text: 'Mandarin orange: a distinctive mandarin aroma, rich sweetness with a slight tartness, and a fresh, clean taste without off-notes.',
    sources: [EDM + 'juice_monster_khaos.html'],
  },
  'm-80': {
    text: 'A rich tropical aroma. Pineapple leads, then mango and peach, like a mixed tropical juice; very sweet, with a thick, fruity body and a long aftertaste.',
    sources: [EDM + 'monster_energy_m80.html'],
  },
  'papillon': {
    text: 'A light, sweet-tart mix of peach, mango, pineapple, and apple, with a surprisingly real peach note like grated peach flesh. A subtle aroma; light and easy rather than punchy.',
    sources: [EDM + 'juice_monster_papillon.html'],
  },
  'mixxd': {
    text: 'Grape with fruit juice: a rich, prominent grape flavour with a lasting aftertaste and aroma, as remembered from fresh cans.',
    sources: [EDM + 'monster_energy_mixxd.html'],
  },
  'zero-ultra': {
    text: 'Light, refreshing citrus, less sweet and lighter than the original Monster. In the glass it reads as sweet lychee and aloe, with a mild aroma and no lingering aftertaste; quite sweet when warm, so best ice-cold.',
    sources: [UK + 'monster-ultra/zero-sugar-ultra/', EDM + 'monster_energy_zero_ultra.html'],
  },
  'ultra-paradise': {
    text: 'Kiwi and lime with a hint of cucumber. A bold, sweet kiwi-apple taste, then a green, melon- or cucumber-like note; apple shows more when warm, kiwi when chilled. Little sweetener aftertaste.',
    sources: [UK + 'monster-ultra/zero-sugar-ultra-paradise/', EDM + 'monster_energy_ultra_paradise.html'],
  },
  'ultra-fiesta-mango': {
    text: 'Cool mango: a sweet-tangy tropical mix led by mango, like a sugar-free Mango Loco without the juicy body. Cloudy yellow, with no noticeable sweetener taste.',
    sources: [UK + 'monster-ultra/zero-sugar-ultra-fiesta/', EDM + 'monster_energy_ultra_fiesta.html'],
  },
  'ultra-rosa': {
    text: 'Bright and sweet, crisp, with a floral finish. It pours a cloudy pink with a sweet fruit-candy aroma, and tastes sweet-tangy, of strawberry, lychee, and red berries: a fruitier, sweeter Zero Ultra.',
    sources: [UK + 'monster-ultra/zero-sugar-ultra-rosa/', EDM + 'monster_energy_ultra_rosa.html'],
  },
  'ultra-watermelon': {
    text: 'Bright red, with a strong sweet watermelon-syrup aroma. Less sweet than you would expect and leaning tart, without the grassy note many watermelon drinks have; smooth, with little sweetener taste.',
    sources: [UK + 'monster-ultra/zero-sugar-ultra-watermelon/', EDM + 'monster_energy_ultra_watermelon.html'],
  },
  'ultra-gold': {
    text: 'Golden pineapple: a strong, sweet pineapple aroma, then light sweetness with pineapple\'s tang. No juice, so it is smooth and clean with no aftertaste rather than thick like real pineapple.',
    sources: [UK + 'monster-ultra/zero-sugar-ultra-gold/', EDM + 'monster_energy_ultra_gold.html'],
  },
  'ultra-violet': {
    text: 'Light citrus and grape. It smells like an ordinary grape soda; the taste starts with the sweetness of Zero Ultra, then a balanced tartness and a soft grape note. Pours a clear purple.',
    sources: [US + 'zero-sugar/ultra-violet/', EDM + 'monster_energy_ultra_violet.html'],
  },
  'ultra-peachy-keen': {
    text: 'A sweet peach aroma and the yellow of ripe peach flesh. Smooth, mildly tangy peach that later settles into a simpler sweet peach; no sweetener aftertaste, and it holds up warm or over ice.',
    sources: [EDM + 'monster_energy_ultra_peachy_keen.html'],
  },
  'ultra-strawberry-dreams': {
    text: 'Sweet yet tart strawberry. It smells like milky strawberry candy and pours a soft, cloudy pink; the taste is fresh strawberry over a tropical fruit mix, with a clean finish.',
    sources: [EDM + 'monster_energy_ultra_strawberry_dreams.html'],
  },
  'ultra-black': {
    text: 'Black cherry (the US launch called it blackberry). Dark purple, with a sweet berry aroma; it tastes like a sweet berry jam without much fruit acidity, light and very clean.',
    sources: [UK + 'monster-ultra/zero-sugar-ultra-black/', EDM + 'monster_energy_ultra_black.html'],
  },
  'ultra-fantasy-ruby-red': {
    text: 'Pink grapefruit: a sweet grapefruit aroma with no bitterness. The taste is mostly the Ultra sweetness with a splash of grapefruit behind it, without the zest or bitterness of real grapefruit.',
    sources: [EDM + 'monster_energy_ultra_fantasy_ruby_red.html'],
  },
  'ultra-blue': {
    text: 'Sold as blue raspberry. Cloudy light blue with a rich sweet-sour aroma; the taste is a hard-to-pin sweet-sour mix, closer to pineapple or passion fruit with citrus than to anything blue.',
    sources: [US + 'zero-sugar/ultra-blue/', EDM + 'monster_energy_ultra_blue.html'],
  },
  'ultra-red': {
    text: 'Sold as crisp mixed berry; usually described as fruit punch, and some find it tastes like cranberry.',
    sources: [US + 'zero-sugar/ultra-red/', WIKI + 'Monster_Ultra_Red'],
  },
  'ultra-sunrise': {
    text: 'Citrus and orange. A gentle orange aroma; the first sip is sweet, Valencia-style orange, then the sweetness fades and the tartness takes over, without a harsh citric bite. Slightly cloudy, like orange juice; more tart when chilled.',
    sources: [US + 'zero-sugar/ultra-sunrise/', EDM + 'monster_energy_ultra_sunrise.html'],
  },
  'ultra-vice-guava': {
    text: 'Ripe guava: a sweet-tangy guava aroma with apple and papaya, and a vivid, cloudy red colour. Sweet and tangy guava with a tropical mix, like fresh guava juice; gentle acidity, and the finish fades cleanly.',
    sources: [US + 'zero-sugar/ultra-vice-guava/', EDM + 'monster_energy_ultra_vice_guava.html'],
  },
  'ultra-wild-passion': {
    text: 'Sweet and tart passion fruit with a citrus twist.',
    sources: [US + 'zero-sugar/ultra-wild-passion/'],
  },
  'ultra-blue-hawaiian': {
    text: 'A light tropical tiki blend. Pale blue with a soft tropical aroma; sweet-tangy pineapple and papaya lead, with lime and mixed berries and a gentle apple-and-pear finish. More generally tropical than any one fruit.',
    sources: [US + 'zero-sugar/ultra-blue-hawaiian/', EDM + 'monster_energy_ultra_blue_hawaiian.html'],
  },
  'ultra-punk-punch': {
    text: 'A zero-sugar take on classic, nostalgic fruit punch.',
    sources: [US + 'zero-sugar/ultra-punk-punch/'],
  },
  'ultra-red-white-blue-razz': {
    text: 'Blue raspberry in the style of a red, white, and blue rocket pop, with a crisp finish.',
    sources: [US + 'zero-sugar/ultra-red-white-blue-razz/'],
  },
  'ultra-citron': {
    text: 'Citrus with a slightly bitter, zesty aroma. Much sweeter than it smells and very close to lemonade, with the zest keeping it light; best not too cold, when the sweetener shows more.',
    sources: [EDM + 'monster_energy_ultra_citron.html'],
  },
  'rehab-tea-lemonade': {
    text: 'Still, not fizzy: brewed tea with lemonade that tastes like a refreshing lemon iced tea. Best ice-cold.',
    sources: [DE + 'rehab-monster/iced-tea-lemonade/'],
  },
  'rehab-peach-tea': {
    text: 'Still peach iced tea: a burst of peach aroma with almost no tea smell, a sweet, gentle peach taste, and only a faint tea-leaf note. Shake before opening.',
    sources: [DE + 'rehab-monster/peach-iced-tea/', EDM + 'monster_energy_rehab_peach_tea.html'],
  },
  'rehab-wild-berry-tea': {
    text: 'Still black tea with wild berries: a black-tea aroma with sweet-sour berry, cloudy brown. Smooth, sweet tea with a pronounced mixed-berry finish; one of the most natural, gentle Rehab flavours.',
    sources: [EDM + 'monster_energy_rehab_wild_berry_tea.html'],
  },
  'rehab-green-tea': {
    text: 'Still green tea with electrolytes and coconut water. Not a bitter Japanese green tea but a sweet, American-style fruit tea; the 2024 recipe is crisper, with much less of the old version\'s peach-and-pineapple sweetness.',
    sources: [US + 'rehab-monster/green-tea/', EDM + 'monster_energy_rehab_green_tea.html'],
  },
  'rehab-lemonade': {
    text: 'A tea-leaf aroma with sweet-sour lemonade; a full-bodied, sweet-tangy lemonade where the tea adds a fresh edge. Still, and low in sugar.',
    sources: [EDM + 'monster_energy_rehab_lemonade.html'],
  },
  'rehab-orangeade': {
    text: 'Orange Pekoe tea with a surprisingly bold orange flavour. Still, and refreshing when chilled.',
    sources: [EDM + 'monster_energy_rehab_orangeade.html'],
  },
  'rehab-pink-lemonade': {
    text: 'Tastes essentially like pink lemonade; the tea is barely noticeable. Soft and still, and refreshingly authentic for so little juice.',
    sources: [EDM + 'monster_energy_rehab_pink_lemonade.html'],
  },
  'rehab-protean': {
    text: 'A protein tea that tastes nothing like a shake: a tropical aroma, cloudy orange, and a light, fruity peach-tea flavour with no acidity.',
    sources: [EDM + 'monster_energy_rehab_protean.html'],
  },
  'rehab-rojo-tea': {
    text: 'A tea-forward aroma and a cloudy reddish-brown colour. A sweet, refreshing fruit tea with cranberry in the background and a light tea flavour.',
    sources: [EDM + 'monster_energy_rehab_rojo_tea.html'],
  },
  'rehab-strawberry-lemonade': {
    text: 'A sweet-sour strawberry aroma, murky pink. A clear lemonade, not too sweet, with just the right tartness; the strawberry is more aroma than fruit, candy-like. Still, with a crisp lemony finish.',
    sources: [EDM + 'monster_energy_rehab_strawberry_lemonade.html'],
  },
  'rehab-watermelon': {
    text: 'Smells of strawberry rather than watermelon and pours a soft pink. A sweet, light strawberry-candy taste with only a faint idea of watermelon; still, low in sugar, with a clean finish.',
    sources: [EDM + 'monster_energy_rehab_watermelon.html'],
  },
  'rehab-white-dragon-tea': {
    text: 'A light, fruity aroma with almost no tea; clear and brownish. A sweet fruit tea that reads as aloe, white grape, and a little lychee, with a faint tea note at the end and very little aftertaste.',
    sources: [EDM + 'monster_energy_rehab_white_dragon_tea.html'],
  },
  'java-cafe-latte': {
    text: 'A classic café latte: real coffee and cream, a creamy texture, and balanced sweetness.',
    sources: [US + 'java-monster/cafe-latte/'],
  },
  'java-dubai-chocolate': {
    text: 'Inspired by the Dubai chocolate trend: real cocoa layered with creamy pistachio tahini and crispy phyllo notes, with coffee and cream.',
    sources: [US + 'java-monster/dubai-chocolate/'],
  },
  'java-irish-creme': {
    text: 'A non-alcoholic Irish coffee. A rich sweet-milk and deep coffee aroma, real-coffee brown. Gentle sweetness wraps the coffee\'s bitterness; smooth, almost chocolatey, and more coffee-forward than the old Irish Blend.',
    sources: [US + 'java-monster/irish-creme/', EDM + 'java_monster_irish_creme.html'],
  },
  'java-loca-moca': {
    text: 'Chocolate mocha. Sweet, but some coffee aroma and taste come through; creamy and slightly powdery, like a sweet café au lait, and the most coffee-like of the classic Java cans.',
    sources: [US + 'java-monster/loca-moca/', EDM + 'java_monster_loca_moca.html'],
  },
  'java-mean-bean': {
    text: 'Vanilla bean with real coffee and cream. A very sweet aroma; lots of milk and sugar make it intensely sweet and creamy, and it stays that way even over ice.',
    sources: [US + 'java-monster/mean-bean/', EDM + 'java_monster_mean_bean.html'],
  },
  'java-salted-caramel': {
    text: 'Salted caramel with rich coffee and cream: smooth and sweet.',
    sources: [US + 'java-monster/salted-caramel/'],
  },
  'killer-brew-loca-moca': {
    text: 'Mocha: chocolate and coffee, smooth and creamy.',
    sources: [US + 'java-monster/killer-brew-loca-moca/'],
  },
  'killer-brew-mean-bean': {
    text: 'Real coffee with a rich vanilla bean flavour.',
    sources: [US + 'java-monster/killer-brew-mean-bean/'],
  },
  'java-chai-hai': {
    text: 'Chai rather than coffee: a strong cinnamon aroma with cloves and ginger, and a sweet, light milk-tea taste. The spices add aroma, not heat.',
    sources: [EDM + 'java_monster_chai_hai.html'],
  },
  'java-farmers-oats': {
    text: 'Coffee with oat milk: a caramel-sweet aroma with a roasted, spicy oat note. Light texture, subtle sweetness, and a lingering coffee bitterness; the oat-milk flavour stays to the last sip.',
    sources: [EDM + 'java_monster_farmers_oats.html'],
  },
  'java-irish-blend': {
    text: 'Mild for a Java: a light colour, a gentle roasted aroma, and noticeably less sweetness and richness than the other Java cans. Inspired by Irish coffee, and non-alcoholic.',
    sources: [EDM + 'java_monster_irish_blend.html'],
  },
  'java-kona-blend': {
    text: 'A rich coffee aroma; mild sweetness with a deep coffee flavour and a just-right creamy texture. One of the most coffee-like Java cans.',
    sources: [EDM + 'java_monster_kona_blend.html'],
  },
  'java-kona-cappuccino': {
    text: 'Sweeter and milkier than Kona Blend, with a creamy sweetness, but not as sugary as many coffee energy drinks. Best chilled.',
    sources: [EDM + 'java_monster_kona_cappuccino.html'],
  },
  'java-russian': {
    text: 'Inspired by Russian coffee: a sweet coffee drink with a lot of milk and a fairly subtle sweetness.',
    sources: [EDM + 'java_monster_russian.html'],
  },
  'java-toffee': {
    text: 'Sweet milk caramel with a light, milky finish. Sweet but not heavy, with almost no coffee taste or bitterness.',
    sources: [EDM + 'java_monster_toffee.html'],
  },
  'java-triple-shot-french-vanilla': {
    text: 'A sweet milk-and-vanilla aroma, but the taste keeps real coffee richness. Light texture; the creamy vanilla lives mostly in the aroma.',
    sources: [EDM + 'java_monster_triple_shot_french_vanilla.html'],
  },
  'java-triple-shot-mocha': {
    text: 'A strong coffee and creamy aroma. Mild milk sweetness with the richness of coffee and cocoa, like coffee milk; made with robusta coffee for more bitterness.',
    sources: [EDM + 'java_monster_triple_shot_mocha.html'],
  },
  'java-vanilla-light': {
    text: 'A lower-calorie vanilla that tastes more like very sweet coffee milk, closer to caramel than to coffee; the sweetness does not linger.',
    sources: [EDM + 'java_monster_vanilla_light.html'],
  },
  'java-cold-brew-latte': {
    text: 'A sweet, roasted latte aroma and a balanced blend of coffee and milk, like a regular latte with real coffee flavour. Best chilled rather than over ice.',
    sources: [EDM + 'java_monster_cold_brew_latte.html'],
  },
  'java-cold-brew-sweet-black': {
    text: 'Still cold brew with nitrogen: a roasted coffee aroma, and it foams like nitro coffee. A mildly sweet black coffee, gently bitter, with almost no acidity; smooth and light, and great over ice.',
    sources: [EDM + 'java_monster_cold_brew_sweet_black.html'],
  },
  'caffe-mocha': {
    text: 'Dark, with little aroma. Tastes like a sweet, smooth, creamy iced chocolate: rich and thick, with no real coffee flavour.',
    sources: [EDM + 'caffe_monster_mocha.html'],
  },
  'caffe-salted-caramel': {
    text: 'A rich, sweet caramel aroma. Creamy caramel sweetness with a dense, smooth body; more a caramel milk coffee than salted caramel, with little coffee bitterness.',
    sources: [EDM + 'caffe_monster_salted_caramel.html'],
  },
  'caffe-vanilla': {
    text: 'A milky coffee with subdued sweetness, like coffee milk without the coffee\'s bitterness; creamy and satisfying.',
    sources: [EDM + 'caffe_monster_vanilla.html'],
  },
  'espresso-and-cream': {
    text: 'A fresh coffee aroma without heavy sweetness. Mild sweetness, a strongly emphasised bitterness, and a creamy, rich texture: a proper coffee.',
    sources: [EDM + 'espresso_monster_espresso_and_cream.html'],
  },
  'espresso-vanilla': {
    text: 'Smells sweet like a Java, but balances the coffee\'s bitterness with creamy vanilla sweetness. A rich, creamy texture and a distinct coffee flavour.',
    sources: [EDM + 'espresso_monster_vanilla_espresso.html'],
  },
  'dragon-tea-green-tea': {
    text: 'A brown, North American-style sweet green tea: the tea-leaf aroma comes first, with no bitterness or astringency and a light sweetness that does not linger.',
    sources: [EDM + 'monster_energy_dragon_tea_green_tea.html'],
  },
  'dragon-tea-white-tea': {
    text: 'A subtle aroma and a pale, barley-tea colour. A gentle, simple tea with a hint of sweetness; the finish fades, leaving a faint tea aroma.',
    sources: [EDM + 'monster_energy_dragon_tea_white_tea.html'],
  },
  'dragon-tea-yerba-mate': {
    text: 'A strong tea-leaf aroma, dull yellow. Real yerba mate bitterness and astringency with a slight acidity, not a sweetened tea; the finish is clean, with a little bitterness.',
    sources: [EDM + 'monster_energy_dragon_tea_yerba_mate.html'],
  },
  'dragon-iced-tea-green-tea': {
    text: 'A North American-style sweet green tea: a refreshing tea-leaf aroma, mild and smooth sweetness, no astringency, and a slightly powdery tea finish.',
    sources: [EDM + 'monster_energy_dragon_iced_tea_green_tea.html'],
  },
  'dragon-iced-tea-lemon-tea': {
    text: 'A faint tea aroma; smooth, sweet lemonade with tea, like a refreshing sweet lemon tea. Moderate sweetness with about half the sugar of a full-sugar drink, and no aftertaste.',
    sources: [EDM + 'monster_energy_dragon_iced_tea_lemon_tea.html'],
  },
  'dragon-iced-tea-peach-tea': {
    text: 'The fruitiest of the Dragon Iced Teas: a fresh peach aroma and a clear sweetness with black tea, the peach balanced by the tea. Half the usual sugar; clean and smooth.',
    sources: [EDM + 'monster_energy_dragon_iced_tea_peach_tea.html'],
  },
  'dragon-iced-tea-raspberry-tea': {
    text: 'A faint tea aroma with a vague fruitiness. A sweet, fairly neutral fruit tea without raspberry\'s tartness, closer to peach or pear, with a strong tea flavour.',
    sources: [EDM + 'monster_energy_dragon_iced_tea_raspberry_tea.html'],
  },
  'hydro-blue-ice': {
    text: 'A still sports drink in a cloudy light blue, sold as blue raspberry. Light sweetness, clean and crisp, with a sweetener aftertaste that shows as it warms.',
    sources: [EDM + 'monster_energy_hydro_blue_ice.html', WIKI + 'Monster_Hydro_Blue_Ice'],
  },
  'hydro-manic-melon': {
    text: 'Still and light red. A light, mildly sweet artificial watermelon with only a faint melon note; often compared to watermelon Jolly Rancher candy.',
    sources: [EDM + 'monster_energy_hydro_manic_melon.html', WIKI + 'Monster_Hydro_Manic_Melon'],
  },
  'hydro-purple-passion': {
    text: 'Still and cloudy purple: a smooth, prominent grape flavour with a lingering fragrance, richer than a typical sports drink.',
    sources: [EDM + 'monster_energy_hydro_purple_passion.html'],
  },
  'hydro-tropical-thunder': {
    text: 'Still, slightly cloudy orange with an orange-led aroma. Light sweetness and a strong, sweet tropical scent; refreshing, with no heavy aftertaste.',
    sources: [EDM + 'monster_energy_hydro_tropical_thunder.html'],
  },
  'hydro-zero-sugar': {
    text: 'Still and sugar-free, cloudy white: a sweet, rich pear aroma followed by a light peach flavour.',
    sources: [EDM + 'monster_energy_hydro_zero_sugar.html'],
  },
  'muscle-vanilla': {
    text: 'A protein shake: thick and creamy, with the sweet, milky vanilla of a classic vanilla protein shake and a mild aroma.',
    sources: [EDM + 'muscle_monster_energy_shake_vanilla.html'],
  },
  'maxx-eclipse': {
    text: 'A strong grape aroma, bright purple, and little fizz. Grape acidity first, then smooth, mellow fruit; nitrous gives a smooth body and a clean finish with a strong grape fragrance.',
    sources: [EDM + 'monster_energy_maxx_eclipse.html'],
  },
  'maxx-solaris': {
    text: 'Cloudy rose pink with little fizz. A smooth nitrous texture with berry and cherry tartness, fruity sweetness, and a floral note; rich yet clean.',
    sources: [EDM + 'monster_energy_maxx_solaris.html'],
  },
  'maxx-super-dry': {
    text: 'An orange and lime aroma; glowing lime green with frothy nitro bubbles. Sweet orange pulp, then tangy orange, lime, and lemon, ending in fresh orange peel, with a tingling, lasting finish.',
    sources: [EDM + 'monster_energy_maxx_super_dry.html'],
  },
  'maxx-mango-matic': {
    text: 'Zero sugar, cloudy orange, and frothy. A smooth, sweet-sour mango juice taste with a deep dried-mango aroma; rich, with no sweetener aftertaste.',
    sources: [EDM + 'monster_energy_maxx_zero_sugar_mango_matic.html'],
  },
  'maxx-rad-red': {
    text: 'Zero sugar, clear bright red. A sweet-tart strawberry and cherry candy flavour, rich from the first sip to the finish, with a smooth, juice-like body and a creamy aftertaste.',
    sources: [EDM + 'monster_energy_maxx_zero_sugar_rad_red.html'],
  },
  'nitrous-super-dry': {
    text: 'Light green citrus with a strong citrus-bitterness aroma; more bitter than Extra Strength Super Dry.',
    sources: [EDM + 'nitrous_monster_super_dry.html'],
  },
  'extra-strength-anti-gravity': {
    text: 'Opens with a very sweet aroma of orange, mango, and cranberry. A sweet orange flavour close to Khaos, with a strong acidity that stays in the finish; strong carbonation keeps it lively.',
    sources: [EDM + 'monster_energy_extra_strength_anti_gravity.html'],
  },
  'extra-strength-black-ice': {
    text: 'Despite the icy blue can, a sweet strawberry aroma with an odd sour note. It tastes of sweet-tangy strawberry, light like a thin strawberry smoothie, with a strong aroma; it pours yellow.',
    sources: [EDM + 'monster_energy_extra_strength_black_ice.html'],
  },
  'extra-strength-super-dry': {
    text: 'Citrus led by orange, with a fresh, peeled-orange aroma that lingers, a tang of lime, and a grapefruit-like sourness without bitterness. Intense flavour with a crisp, clean citrus finish.',
    sources: [EDM + 'monster_energy_extra_strength_superdry.html'],
  },
  'mutant-super-soda': {
    text: 'Lime green with a limeade aroma: a sweet limeade like Mountain Dew, without lime\'s sharpness, and only lightly carbonated.',
    sources: [EDM + 'monster_energy_mutant_super_soda.html'],
  },
  'mutant-red-dawn': {
    text: 'A sweet, hard-to-define sports-drink flavour with mild carbonation and a clean finish; the orange juice barely shows.',
    sources: [EDM + 'monster_energy_mutant_super_soda_red_dawn.html'],
  },
  'mutant-white-lightning': {
    text: 'Zero sugar: sweet lychee with a hint of Calpis, very like Zero Ultra. Weak carbonation leaves it tasting flat and sweet.',
    sources: [EDM + 'monster_energy_mutant_super_soda_white_lightning.html'],
  },
  'dub-mad-dog': {
    text: 'A deep purple, grape-flavoured energy punch: refreshing, with balanced sweetness and sourness and no sugary juice aftertaste.',
    sources: [EDM + 'monster_energy_dub_mad_dog.html'],
  },
  'dub-ballers-blend': {
    text: 'A strong cranberry, cherry, and syrup aroma. The rich sourness of cranberry and cherry, then a syrupy sweetness, with no lingering aftertaste: a classic fruit punch.',
    sources: [EDM + 'monster_energy_dub_ballers_blend.html'],
  },
};
