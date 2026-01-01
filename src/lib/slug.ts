export function slugify(input: string) {
  const transliterated = transliterateCyrillicToLatin(input);

  const slug = transliterated
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Guarantee a non-empty slug (e.g. if input had only emojis/punctuation)
  return slug || crypto.randomUUID().slice(0, 8);
}

function transliterateCyrillicToLatin(input: string) {
  // Covers Russian + common Kazakh Cyrillic letters.
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  let out = "";
  for (const ch of input) {
    const lower = ch.toLowerCase();
    out += map[lower] ?? ch;
  }
  return out;
}


