import * as dotenv from 'dotenv';
dotenv.config({ path: require('path').join(__dirname, '../.env') });

import { Pool } from 'pg';

const pool = new Pool({
  host:     process.env.PG_HOST     || 'localhost',
  port:     Number(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || 'hotfeed',
  user:     process.env.PG_USER     || 'postgres',
  password: process.env.PG_PASSWORD || '',
});

const CATEGORIES = ['Tech', 'Sports', 'Gaming', 'Music', 'Science', 'Culture'] as const;

const POST_TITLES: Record<string, string[]> = {
  Tech: [
    'TypeScript 6.0 Ships With Native Decorators Support',
    'Google DeepMind Achieves Human-Level Coding in Competitive Benchmarks',
    'Rust Surpasses C++ in Linux Kernel Contributions for the First Time',
    'OpenAI Releases GPT-5 With Vision and Real-Time Voice',
    'Apple M4 Ultra Destroys Every Benchmark Ever Recorded',
    'React 20 Drops Class Components Entirely',
    'WebAssembly 3.0 Enables Native GPU Compute in the Browser',
    'Microsoft Azure Suffers Global 6-Hour Outage, Millions Affected',
    'A 17-Year-Old Built a Compiler That Beats LLVM on ARM',
    'Quantum Processor Hits 1 Million Qubit Milestone',
    'Cloudflare Blocks Largest DDoS Attack in Internet History 5 Tbps',
    'Meta Unveils AR Glasses That Replace Your Smartphone',
    'Self-Healing Code: AI That Fixes Its Own Production Bugs',
    'Bun 2.0 Makes Node.js Officially Obsolete for New Projects',
    'The TCP and IP Stack Turns 50 A Visual History',
    'Tesla FSD v15 Achieves Zero Accidents Over 10 Billion Miles',
    'SpaceX Starlink Gen3 Hits 10 Gbps Download in Testing',
    'EU Mandates Open-Source AI Models for All Government Use',
    'Figma AI Designs Full Production Apps From a Voice Description',
    'Neuralink Patient Codes iPhone App Entirely With Thoughts',
  ],
  Sports: [
    'Champions League Final Breaks All-Time Viewership Record 2 Billion Viewers',
    'LeBron James Signs 500M Lifetime Extension With Nike',
    'Olympic 100m World Record Shattered New Mark 9 41s',
    'Formula 1 Bans AI-Assisted Driving After Team Protests',
    'England Win First FIFA World Cup in 60 Years',
    'Serena Williams Comes Out of Retirement at Age 43',
    'NBA Finals Game 7 OT Thriller Sets Twitter Record',
    'Tour de France Bans All Aerodynamic Bikes by 2027',
    'Novak Djokovic Wins 30th Grand Slam Title',
    'NFL Announces London Permanent Franchise by 2026',
    'Simone Biles Lands Worlds First Quadruple Twist on Floor',
    'Tiger Woods Returns From Retirement to Win the Masters',
    'MLS Surpasses EPL in Total Match Attendance for First Time',
    'Baseball Strike Cancelled After Historic 11-Hour Negotiation',
    'First AI Referee Officiates Professional Football Match in Germany',
    'Usain Bolts Secret Training Program Finally Revealed',
    'UFC 320 Becomes Most-Watched Combat Sports Event Ever',
    'Chess World Championship Ends in Controversy Over AI Assistance Claim',
    'Six Nations Ireland Wins Grand Slam for Third Consecutive Year',
    'Australian Open Final Lasts 7 Hours Longest Match in History',
  ],
  Gaming: [
    'GTA VI Launches to 50 Million Copies Sold in 24 Hours',
    'Elden Ring 2 Announced FromSoftwares Biggest World Yet',
    'Nintendo Switch 3 Specs Leak Portable 4K at 120fps',
    'Valve Finally Releases Half-Life 3 as a Free-to-Play VR Title',
    'Minecraft Surpasses 1 Billion Registered Accounts',
    'Epic Games Store Gives Away 500 Worth of Titles in One Month',
    'First Professional Esports Player Earns 10M in a Single Year',
    'PlayStation 6 Pro Renders Fully Ray-Traced 8K at 60fps',
    'Pokemon Legends Sinnoh Breaks Series Pre-Order Record',
    'China Bans Video Games for Under-18s on Weekdays Industry Reacts',
    'Cyberpunk 2077 Sequel Confirmed With Real-Time Crowd AI',
    'World of Warcraft Turns 20 Still 8 Million Subscribers',
    'Nintendo Files Patent for Haptic Suit Controller',
    'Steam Deck 2 Benchmarked Matches PS5 Performance',
    'Indie Roguelike Hollow Abyss Outsells AAA Titles on Steam',
    'Twitch Rival Rivals tv Hits 5 Million Concurrent Viewers',
    'Retro Gaming Boom SNES Cartridge Sells for 1 2M at Auction',
    'Halo Infinite Season 5 Brings Back Classic Reach Maps',
    'AI Generated Game World Generates Infinite Unique Quests',
    'Mobile Gaming Revenue Surpasses PC and Console Combined',
  ],
  Music: [
    'Taylor Swift Breaks Spotify All-Time Streaming Record on Day One',
    'Beyonce Announces Surprise World Tour With 200 Dates',
    'The Beatles Unreleased Album Found in Paul McCartneys Attic',
    'Kendrick Lamar Wins The Pulitzer Prize for Music',
    'Billie Eilish Scores Bond Theme Youngest Artist Twice',
    'Coldplay Headlines Glastonbury With Holographic Freddie Mercury',
    'Vinyl Sales Surpass CD Sales for Third Consecutive Year',
    'AI Composer Creates Entire Film Score Overnight Director Delighted',
    'Drake and Eminem End 10-Year Feud With Joint Album',
    'Adeles Las Vegas Residency Earns 500M All-Time Record',
    'YouTube Music Hits 100 Million Paid Subscribers',
    'Coachella 2026 Lineup Leaks Most Anticipated in Decade',
    'New Genre Neural Rock Created Entirely by AI-Human Bands',
    'K-Pop Overtakes Hip-Hop as Most Globally Streamed Genre',
    'SZAs SOS 2 Debuts at Number 1 in 92 Countries',
    'Live Nation Fined 500M for Ticketmaster Monopoly Violations',
    'A 16-Year-Old TikTok Star Signs 20M Record Deal',
    'Lana Del Rey Wins Academy Award for Best Original Song',
    'The Grammy Awards Add Best AI-Assisted Album Category',
    'Glastonbury 2026 Sells Out in 4 Minutes New Record',
  ],
  Science: [
    'Scientists Achieve Cold Fusion Breakthrough World Holds Its Breath',
    'Mars Rover Confirms Liquid Water Beneath Polar Ice Cap',
    'Universal Cancer Vaccine Shows 94 Percent Efficacy in Phase 3 Trial',
    'CERN Discovers Fifth Fundamental Force of the Universe',
    'Human Brain Map Completed 100 Trillion Synapses Charted',
    'Gene Therapy Reverses Aging by 20 Years in Clinical Trial',
    'First Room-Temperature Superconductor Reproduced and Verified',
    'James Webb Telescope Spots Signs of Life on Exoplanet K2-18b',
    'Artificial Photosynthesis Achieves 40 Percent Solar Energy Conversion',
    'Lab-Grown Organs Successfully Transplanted in 12 Patients',
    'CRISPR 3 0 Edits Entire Genome Without Off-Target Mutations',
    'Physicists Teleport Quantum Data 1000 km via Satellite',
    'Alzheimers Finally Defeated New Drug Halts Progression Entirely',
    'Deep Sea Mining Robot Discovers Unknown Civilization Ruins',
    'Dark Matter Finally Detected in Underground Utah Lab',
    'Climate Scientists Develop Carbon-Capture Seaweed That Scales',
    'Nuclear Fusion Reactor NET Produces Net Positive Energy for 1 Hour',
    'New Antibiotic Kills All Known Drug-Resistant Superbugs',
    'Octopus RNA Reprogramming Enables Humans to Regrow Limbs',
    'Physicists Create True Time Crystal Stable at Room Temperature',
  ],
  Culture: [
    'Oppenheimer 2 Becomes Highest-Grossing Film of All Time',
    'The Louvre Opening New Wing Dedicated to Digital Art',
    'Ancient 3000-Year-Old City Found Perfectly Preserved Under Sahara',
    'Netflix Subscribers Hit 400 Million Disney Plus Trails at 250M',
    'The New York Times Pivots 100 Percent to Audio Journalism',
    'Global Book Sales Surge 40 Percent Physical Books Lead the Recovery',
    'Vatican Opens Secret Archives to the Public for the First Time',
    'Wes Anderson New Film Shot Entirely on iPhone 17',
    'UNESCO Adds Internet Meme to Cultural Heritage Categories',
    'First AI-Written Novel Wins the Booker Prize Judges Resign',
    'The Met Gala Theme The Future Was Yesterday Best Looks',
    'Studio Ghiblis Last Film Is a 6-Hour Masterpiece',
    'Shakespeares Lost Play Discovered in Oxford Library Basement',
    'Language Death Reversed Cornish Becomes First Revived Native Language',
    'Virtual Reality Concerts Now Earn More Than Physical Tours',
    'The Last Blockbuster Becomes a National Historic Landmark',
    'New Rosetta Stone Discovered in Egypt Unlocks 12 Unknown Languages',
    'Cannes Palme dOr Goes to a 19-Year-Old First-Time Director',
    'Google Arts and Culture Digitizes Every Museum on Earth',
    'First Human Cloning Confirmed in South Korea Global Outrage',
  ],
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomTimestampLastNDays(days: number): Date {
  const now = Date.now();
  const pastMs = days * 24 * 60 * 60 * 1000;
  return new Date(now - Math.random() * pastMs);
}

function calcScore(views: number, likes: number, shares: number, createdAt: Date): {
  score: number;
  recencyDecay: number;
  trending: string;
} {
  const rawScore = views * 1 + likes * 3 + shares * 5;
  const hoursAge = (Date.now() - createdAt.getTime()) / 3_600_000;
  const decayFactor = 1 - Math.pow(0.5, hoursAge / 24);
  const recencyDecay = rawScore * decayFactor;
  const score = rawScore - recencyDecay;
  const trending = score >= 80000 ? 'hot' : score >= 40000 ? 'warm' : 'cold';
  return { score, recencyDecay, trending };
}

async function seed() {
  console.log('[Seed] Starting...');
  let totalInserted = 0;

  for (const category of CATEGORIES) {
    const titles = POST_TITLES[category];
    for (const title of titles) {
      const views     = randomBetween(1_000, 500_000);
      const likes     = Math.floor(views * (randomBetween(5, 15) / 100));
      const shares    = Math.floor(views * (randomBetween(1, 3) / 100));
      const createdAt = randomTimestampLastNDays(7);
      const { score, recencyDecay, trending } = calcScore(views, likes, shares, createdAt);

      await pool.query(
        `INSERT INTO posts (title, category, likes, views, shares, score, recency_decay, trending, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [title, category, likes, views, shares, score, recencyDecay, trending, createdAt]
      );
      totalInserted++;
    }
    console.log(`[Seed] Inserted 20 ${category} posts`);
  }

  console.log(`[Seed] Done! Total posts inserted: ${totalInserted}`);
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Error:', err.message);
  process.exit(1);
});
