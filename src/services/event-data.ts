import { readdir, readFile } from "fs/promises";
import path from "path";

const EVENT_DATA_DIR = path.join(process.cwd(), "src", "data", "events");
const FALLBACK_IMAGE = "/ImgEvent/one_piece.jpg";

const CATEGORY_BY_FILE: Record<string, string> = {
  "active-health.csv": "Active & Health",
  "art-exhibition.csv": "Art & Exhibition",
  "founder-hackathon.csv": "Founder & Hackathon",
};

export interface CsvEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  imageUrl: string;
  location: string;
  latitude: number;
  longitude: number;
  eventDate: string;
  createdAt: string;
  date: string;
  time: string;
  organizer: string;
  posterPng: string;
  poster_png: string;
}

interface RawCsvEvent {
  title: string;
  description: string;
  location_name: string;
  "latitude,longitude": string;
  date: string;
  time: string;
  organizer: string;
  poster_png: string;
  category?: string;
  tags?: string;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim().length > 0)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.trim().length > 0)) rows.push(row);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.trim()).filter(Boolean);

  return rows.slice(1).map((values) =>
    headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = (values[index] ?? "").trim();
      return record;
    }, {})
  );
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "event";
}

function parseCoordinates(value: string) {
  const [lat, lng] = value.split(",").map((part) => Number(part.trim()));

  return {
    latitude: Number.isFinite(lat) ? lat : 13.7563,
    longitude: Number.isFinite(lng) ? lng : 100.5018,
  };
}

function parseEventDate(date: string, time: string, fallbackIndex: number) {
  const normalized = `${date} ${time}`.trim();
  const isoMatch = normalized.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  const slashMatch = normalized.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
  const thaiYearMatch = normalized.match(/(\d{1,2}).{0,20}(25\d{2})/);
  const timeMatch = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);

  let year = 2026;
  let month = 0;
  let day = Math.min(fallbackIndex + 1, 28);

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]) - 1;
    day = Number(isoMatch[3]);
  } else if (slashMatch) {
    day = Number(slashMatch[1]);
    month = Number(slashMatch[2]) - 1;
    year = Number(slashMatch[3]);
    if (year < 100) year += 2000;
    if (year >= 2400) year -= 543;
  } else if (thaiYearMatch) {
    day = Number(thaiYearMatch[1]);
    year = Number(thaiYearMatch[2]) - 543;
  }

  let hour = 9;
  let minute = 0;

  if (timeMatch) {
    hour = Number(timeMatch[1]);
    minute = Number(timeMatch[2] ?? "0");
    const meridiem = timeMatch[3]?.toUpperCase();
    if (meridiem === "PM" && hour < 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
  }

  return new Date(Date.UTC(year, month, day, hour, minute)).toISOString();
}

function normalizePoster(value: string) {
  if (!value) return "";
  if (value.startsWith("/") || value.startsWith("http")) return value;

  return `/${value.replace(/^public[\\/]/, "").replace(/\\/g, "/")}`;
}

function parseTags(value: string) {
  if (!value) return [];

  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function toCsvEvent(
  row: Record<string, string>,
  fileName: string,
  index: number
): CsvEvent | null {
  const raw = row as unknown as RawCsvEvent;
  const title = raw.title?.trim();
  const coords = parseCoordinates(raw["latitude,longitude"] ?? "");

  if (!title) return null;

  const posterPng = normalizePoster(raw.poster_png ?? "");
  const category = raw.category?.trim() || CATEGORY_BY_FILE[fileName] || "Event";

  return {
    id: `${slugify(category)}-${index + 1}-${slugify(title)}`,
    title,
    description: raw.description?.trim() ?? "",
    category,
    tags: parseTags(raw.tags ?? ""),
    imageUrl: posterPng || FALLBACK_IMAGE,
    location: raw.location_name?.trim() ?? "",
    latitude: coords.latitude,
    longitude: coords.longitude,
    eventDate: parseEventDate(raw.date ?? "", raw.time ?? "", index),
    createdAt: new Date(0).toISOString(),
    date: raw.date?.trim() ?? "",
    time: raw.time?.trim() ?? "",
    organizer: raw.organizer?.trim() ?? "",
    posterPng,
    poster_png: posterPng,
  };
}

let eventCache: CsvEvent[] | null = null;

export async function loadCsvEvents() {
 if (eventCache && process.env.NODE_ENV === "production") return eventCache;

  const fileNames = (await readdir(EVENT_DATA_DIR))
    .filter((fileName) => fileName.toLowerCase().endsWith(".csv"))
    .sort();

  const events = (
    await Promise.all(
      fileNames.map(async (fileName) => {
        const text = await readFile(path.join(EVENT_DATA_DIR, fileName), "utf8");
        return parseCsv(text)
          .map((row, index) => toCsvEvent(row, fileName, index))
          .filter((event): event is CsvEvent => Boolean(event));
      })
    )
  ).flat();

  eventCache = events.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  return eventCache;
}

export async function findCsvEvent(eventId: string) {
  const events = await loadCsvEvents();
  return events.find((event) => event.id === eventId) ?? null;
}
