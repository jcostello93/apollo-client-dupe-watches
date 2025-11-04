export const WORDS: string[] = [
  'Alpha','Bravo','Charlie','Delta','Echo','Foxtrot','Golf','Hotel','India','Juliet',
  'Kilo','Lima','Mike','November','Oscar','Papa','Quebec','Romeo','Sierra','Tango',
  'Uniform','Victor','Whiskey','Xray','Yankee','Zulu','Apple','Banana','Cherry','Date',
  'Elderberry','Fig','Grape','Honeydew','Ivy','Jasmine','Kiwi','Lemon','Mango','Nectarine',
  'Olive','Peach','Quince','Raspberry','Strawberry','Tomato','Ugli','Vanilla','Watermelon','Xigua',
  'Yellow','Zebra','Red','Blue','Green','Orange','Purple','Pink','Black','White',
  'Silver','Gold','Bronze','Copper','Iron','Steel','Cloud','Rain','Storm','Thunder',
  'Lightning','Breeze','Gust','Snow','Hail','Sleet','River','Lake','Ocean','Sea',
  'Mountain','Valley','Forest','Desert','Island','Plain','Hill','Canyon','Cliff','Beach',
  'Sun','Moon','Star','Comet','Planet','Galaxy','Nebula','Aurora','Dawn','Dusk'
];

export function pickWord(n: number): string {
  if (!Number.isFinite(n)) return WORDS[0];
  const idx = ((Math.floor(n) % 100) + 100) % 100;
  return WORDS[idx];
}

export function randomWord(): string {
  return WORDS[Math.floor(Math.random() * 100)];
}
