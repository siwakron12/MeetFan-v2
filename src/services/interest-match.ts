export interface InterestMatchResult {
  score: number;
  matchedTags: string[];
  reasons: string[];
}

const NEUTRAL_SCORE = 50;
const MATCH_POINTS = 20;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function uniqueCleanValues(values: string[]) {
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    const key = normalize(trimmed);

    if (!key || seen.has(key)) continue;

    seen.add(key);
    cleaned.push(trimmed);
  }

  return cleaned;
}

export function calculateInterestMatch(
  userInterests: string[],
  eventTags: string[]
): InterestMatchResult {
  const interests = uniqueCleanValues(userInterests);
  const tags = uniqueCleanValues(eventTags);

  if (interests.length === 0) {
    return {
      score: NEUTRAL_SCORE,
      matchedTags: [],
      reasons: [],
    };
  }

  const interestByKey = new Map(
    interests.map((interest) => [normalize(interest), interest])
  );
  const matchedTags = tags.filter((tag) => interestByKey.has(normalize(tag)));
  const reasons = matchedTags.map((tag) => {
    const interest = interestByKey.get(normalize(tag)) ?? tag;
    return `You like ${interest}`;
  });
  const score =
    matchedTags.length > 0
      ? Math.min(100, NEUTRAL_SCORE + matchedTags.length * MATCH_POINTS)
      : 0;

  return {
    score,
    matchedTags,
    reasons,
  };
}
