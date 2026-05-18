// Data arrays for rizz poem generation
const rizzThemes = [
  'romantic connection',
  'digital love',
  'modern romance',
  'virtual hearts',
  'cyber affection',
  'quantum attraction',
  'algorithmic love',
  'neural chemistry',
  'digital desire',
  'silicon soulmates',
];

const rizzVerbs = [
  'enchant',
  'captivate',
  'mesmerize',
  'charm',
  'allure',
  'bewitch',
  'entrance',
  'fascinate',
  'seduce',
  'hypnotize',
];

const rizzNouns = [
  'hearts',
  'souls',
  'emotions',
  'feelings',
  'connections',
  'chemistry',
  'attraction',
  'passion',
  'desire',
  'love',
];

const rizzPhrases = [
  'your beauty.exe has crashed my system',
  'sudo apt-get install love',
  'while(1) { love.you(); }',
  'git commit -m "falling for you"',
  'npm install @your/heart',
  'your smile is now cached',
  'heart.json parsed successfully',
  'echo $love > /dev/heart',
  'ping -c ∞ your.heart',
  'grep -r romance /dev/soul',
];

const patterns = [
  // Romantic ASCII art pattern
  (words: string[]) => `
❤️ ═══════════════ ❤️
  ${words[0]}
  ${words[1]}
  ${words[2]}
❤️ ═══════════════ ❤️`,
  
  // Love letter pattern
  (words: string[]) => `
Dear /dev/heart,

${words[0]}
${words[1]}
${words[2]}

Forever yours,
/dev/soul`,
  
  // Code pattern
  (words: string[]) => `
try {
  const love = {
    feeling: "${words[0]}",
    message: "${words[1]}",
    forever: "${words[2]}"
  };
  heart.accept(love);
} catch (feelings) {
  console.log("💘");
}`,
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRizzPoem(prompt: string): string {
  const pattern = getRandomElement(patterns);
  const theme = prompt ? `${prompt} ${getRandomElement(rizzThemes)}` : getRandomElement(rizzThemes);
  
  const words = [
    theme,
    getRandomElement(rizzPhrases),
    `${getRandomElement(rizzVerbs)} my ${getRandomElement(rizzNouns)}`,
  ];
  
  return pattern(words);
}

export function generatePoems(prompt: string, count: number): string[] {
  return Array.from({ length: count }, () => generateRizzPoem(prompt));
}