// One accent colour per genre — used by cards, badges, and shelf headings
const GENRE_COLORS = {
  "Action":    "#E8773A",   // orange
  "Adventure": "#D4A827",   // amber
  "Animation": "#A97BD4",   // purple
  "Comedy":    "#6DBF7E",   // lime green
  "Crime":     "#C94040",   // red
  "Drama":     "#589C80",   // teal (palette colour)
  "Fantasy":   "#7C6FCF",   // violet
  "Family":    "#5BAF7A",   // green
  "Horror":    "#4A7EC7",   // steel blue
  "Music":     "#D45B8A",   // rose
  "Mystery":   "#5B85B8",   // slate blue
  "Romance":   "#D4617A",   // deep pink
  "Sci-Fi":    "#3AB8C4",   // cyan
  "Thriller":  "#C9874A",   // burnt sienna
  "Western":   "#B89050",   // sandy gold
};

function genreColor(genres){
  // Return the accent for the first genre that has a mapping, fallback to gold
  for(const g of genres){
    if(GENRE_COLORS[g]) return GENRE_COLORS[g];
  }
  return "#EBAE29";
}

/* ===================================================
   MOVIE DATA
   Frontend-only dataset. Posters are generated via
   placehold.co using the app's own colour palette so
   no external API key or backend is required.
=================================================== */

const PALETTE = {
  ink:    "132228", // near-black teal
  cream:  "F5EED2", // warm off-white
  gold:   "EBAE29", // amber accent
  teal:   "589C80"  // green-teal accent
};

// Cycle through palette pairs so the placeholder posters
// feel intentional rather than random.
const POSTER_THEMES = [
  [PALETTE.ink, PALETTE.gold],
  [PALETTE.teal, PALETTE.cream],
  [PALETTE.ink, PALETTE.teal],
  [PALETTE.gold, PALETTE.ink]
];

function posterURL(title, idx) {
  const [bg, fg] = POSTER_THEMES[idx % POSTER_THEMES.length];
  const label = encodeURIComponent(title.replace(/ /g, "\n"));
  return `https://placehold.co/400x600/${bg}/${fg}?font=playfair-display&text=${label}`;
}

const RAW_MOVIES = [
  ["Ashes of Tomorrow", 2023, ["Sci-Fi","Drama"], 8.4, "2h 12m", "A reluctant engineer must decide whether to save a dying colony ship or the secret it carries.", true],
  ["Velvet Hour", 2022, ["Romance","Drama"], 7.6, "1h 58m", "Two strangers keep meeting at the same midnight train platform, one year apart, every year.", false],
  ["Iron Tide", 2021, ["Action","Thriller"], 7.9, "2h 05m", "An ex-marine smuggler is pulled back into one last job when his old crew resurfaces.", true],
  ["Paper Moonlight", 2020, ["Drama"], 8.1, "1h 47m", "A letter found in a secondhand bookstore unravels three generations of a family's secrets.", false],
  ["Static Bloom", 2023, ["Horror","Thriller"], 6.9, "1h 39m", "A radio host starts receiving broadcasts from a town that vanished forty years ago.", true],
  ["The Cartographer's Wife", 2019, ["Drama","Romance"], 8.7, "2h 20m", "In 1920s Lisbon, a mapmaker's wife charts routes for smugglers to fund her own freedom.", false],
  ["Neon Requiem", 2024, ["Sci-Fi","Action"], 8.0, "2h 02m", "In a city run by algorithms, a glitch in the system grants one woman a single day of free will.", true],
  ["Hollow Orchard", 2018, ["Horror"], 6.4, "1h 32m", "A family inherits an orchard where the trees only bear fruit after dark.", false],
  ["Last Light Diner", 2022, ["Comedy","Drama"], 7.3, "1h 41m", "Four strangers stranded by a snowstorm spend the night swapping lies in a roadside diner.", false],
  ["Gravity of Us", 2021, ["Romance","Sci-Fi"], 7.8, "2h 00m", "Two astronauts fall in love on a mission with no return trip scheduled.", true],
  ["Crimson Ledger", 2020, ["Crime","Thriller"], 8.2, "2h 15m", "An accountant for a crime family starts keeping a second set of books — the truth.", false],
  ["Wildflower County", 2017, ["Drama"], 7.1, "1h 55m", "A retired rodeo star teaches a runaway teenager how to find her footing again.", false],
  ["The Quiet Algorithm", 2023, ["Sci-Fi","Drama"], 8.5, "2h 08m", "An AI built to predict grief begins predicting its own.", true],
  ["Saltwater Kingdom", 2019, ["Fantasy","Adventure"], 7.7, "2h 18m", "A lighthouse keeper's daughter discovers her family has guarded a door to the sea-folk for centuries.", false],
  ["Blackout City", 2022, ["Action","Crime"], 7.4, "1h 49m", "During a 36-hour blackout, a beat cop has one night to stop a heist before the lights return.", false],
  ["Echo Chamber", 2021, ["Thriller"], 7.0, "1h 44m", "A podcaster realises the true-crime case she's covering is still very much open.", false],
  ["Marigold & Smoke", 2018, ["Drama","Romance"], 8.3, "2h 06m", "A chef and a wildfire investigator rebuild a restaurant — and each other — after the season's worst fire.", true],
  ["The Understudy", 2020, ["Drama"], 7.5, "1h 50m", "When the lead vanishes days before opening night, her understudy starts living the role offstage too.", false],
  ["Frost Line", 2023, ["Thriller","Mystery"], 8.0, "2h 03m", "A train is stopped mid-journey by snow — and one passenger isn't who their ticket says.", true],
  ["Comet Season", 2017, ["Animation","Family"], 7.9, "1h 36m", "A young fox tracks a falling star across three kingdoms to bring it home before winter.", false],
  ["Glass Horizon", 2024, ["Sci-Fi","Thriller"], 8.6, "2h 11m", "The last habitable dome on Earth votes on who gets to leave — and who doesn't.", true],
  ["Borrowed Time Cafe", 2019, ["Comedy","Fantasy"], 7.2, "1h 38m", "A cafe lets customers relive exactly one hour from their past — for the price of a memory.", false],
  ["Ironclad Lullaby", 2022, ["Action","Drama"], 7.6, "2h 09m", "A retired bodyguard comes out of hiding to protect the one client she once failed.", false],
  ["Dustlight", 2021, ["Western","Drama"], 8.1, "2h 14m", "Two outlaw sisters split the same bounty on their own heads to survive the winter.", true],
  ["The Cartwright Tapes", 2018, ["Mystery","Crime"], 7.3, "1h 52m", "Decades-old cassette tapes found in an attic reopen a case the town wanted buried.", false],
  ["Honeybrook", 2020, ["Romance","Comedy"], 6.8, "1h 43m", "Rival beekeepers inherit adjoining farms and a feud neither of them actually wants.", false],
  ["Permafrost", 2023, ["Thriller","Sci-Fi"], 7.8, "2h 01m", "A research station thaws something that's been waiting eleven thousand years.", false],
  ["The Long Encore", 2019, ["Drama","Music"], 8.4, "2h 17m", "A washed-up musician gets one final tour — opening for the daughter he never met.", true],
  ["Paperclip Cities", 2022, ["Animation","Sci-Fi"], 7.7, "1h 40m", "In a world built entirely from office supplies, a tiny clip dreams of becoming a bridge.", false],
  ["Vacancy", 2021, ["Horror","Thriller"], 6.6, "1h 35m", "A motel that's never had a guest leave a bad review has never had a guest leave, period.", false],
  ["Saints of Nowhere", 2020, ["Crime","Drama"], 8.0, "2h 10m", "Three small-town friends become accidental legends after botching a robbery on live television.", true],
  ["Tidewater Letters", 2018, ["Romance","Drama"], 7.9, "1h 57m", "A lighthouse keeper exchanges letters with a sailor for a decade before learning his name.", false],
  ["Static King", 2024, ["Action","Sci-Fi"], 8.2, "2h 04m", "The last human radio signal becomes the most wanted broadcast in the galaxy.", true],
  ["Marrow", 2017, ["Horror","Drama"], 6.9, "1h 46m", "A surgeon discovers the donor heart she received remembers things she never did.", false],
  ["Confetti State", 2023, ["Comedy"], 7.0, "1h 33m", "A failing parade-float company gets one shot at the national championship — and total chaos.", false]
];

const MOVIES = RAW_MOVIES.map((m, i) => ({
  id: i + 1,
  title: m[0],
  year: m[1],
  genres: m[2],
  rating: m[3],
  duration: m[4],
  description: m[5],
  trending: m[6],
  poster: posterURL(m[0], i)
}));

const ALL_GENRES = [...new Set(MOVIES.flatMap(m => m.genres))].sort();
