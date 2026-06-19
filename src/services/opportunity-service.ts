export interface ProfileInfo {
  occupation: string | null;
  interests: string[];
  goals: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  category: string;
  location: string;
  organizer: string;
  date: string;
  description: string;
  tags: string[];
  relatedEventId?: string;
}

export interface MatchBreakdownItem {
  label: string;
  reason: string;
  points: number;
}

export const EMPTY_OPPORTUNITY_PROFILE: ProfileInfo = {
  occupation: null,
  interests: [],
  goals: [],
};

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-001",
    title: "Bangkok Jazz Night",
    category: "Music",
    location: "Siam Square",
    organizer: "Bangkok Live Music Club",
    date: "July 20, 2026",
    description: "Meet people who enjoy live jazz, small venues, and relaxed conversations after the show.",
    tags: ["music", "live-performance", "meetup", "community"],
  },
  {
    id: "opp-002",
    title: "AI Meetup Bangkok",
    category: "Technology",
    location: "True Digital Park",
    organizer: "Bangkok AI Community",
    date: "July 24, 2026",
    description: "Join people curious about AI demos, tech talks, and practical experiments in Bangkok.",
    tags: ["ai", "technology", "meetup", "community"],
  },
  {
    id: "opp-003",
    title: "Riverside Photo Walk",
    category: "Photography",
    location: "Charoen Krung",
    organizer: "Bangkok Photo Walks",
    date: "August 3, 2026",
    description: "Explore street scenes, galleries, and river views with people who enjoy photography and design.",
    tags: ["photography", "art", "design", "community"],
  },
  {
    id: "opp-004",
    title: "Tech Makers Meetup",
    category: "Technology",
    location: "True Digital Park",
    organizer: "Bangkok Makers Club",
    date: "August 8, 2026",
    description: "Meet technology fans building apps, gadgets, small projects, and creative side experiments.",
    tags: ["technology", "startup", "meetup", "community"],
    relatedEventId: "evt-004",
  },
  {
    id: "opp-005",
    title: "Volunteer Bangkok",
    category: "Volunteer",
    location: "Bang Rak Community Center",
    organizer: "Volunteer Bangkok",
    date: "August 12, 2026",
    description: "Join people who care about local community projects, learning activities, and weekend volunteering.",
    tags: ["volunteer", "community", "friends"],
  },
  {
    id: "opp-006",
    title: "UX Thailand Meetup",
    category: "Art & Design",
    location: "TCDC Bangkok",
    organizer: "UX Thailand",
    date: "August 18, 2026",
    description: "Meet people interested in design, visual culture, research, and thoughtful digital experiences.",
    tags: ["design", "art", "meetup", "community"],
  },
  {
    id: "opp-007",
    title: "E-Sports Gaming Meetup",
    category: "Gaming",
    location: "Samyan Mitrtown",
    organizer: "Bangkok Gaming Circle",
    date: "August 23, 2026",
    description: "Find teammates, watch casual matches, and meet people who follow games and online communities.",
    tags: ["gaming", "sports", "community", "meetup"],
  },
  {
    id: "opp-008",
    title: "Weekend Football Social",
    category: "Sports",
    location: "Benjakitti Park",
    organizer: "Bangkok Sports Social",
    date: "August 30, 2026",
    description: "Join a casual football session for people who want to stay active and meet new friends.",
    tags: ["sports", "community", "friends"],
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function hasValue(values: string[], expected: string) {
  const target = normalize(expected);
  return values.some((value) => normalize(value) === target);
}

function hasTag(opportunity: Opportunity, tag: string) {
  return opportunity.tags.includes(tag);
}

export function getOpportunityById(id: string) {
  return MOCK_OPPORTUNITIES.find((opportunity) => opportunity.id === id) ?? null;
}

export function getMatchBreakdown(opportunity: Opportunity, profile: ProfileInfo) {
  const breakdown: MatchBreakdownItem[] = [
    {
      label: "Similar Community",
      reason: "People with similar interests joined",
      points: 30,
    },
  ];
  const occupation = normalize(profile.occupation ?? "");

  if (hasValue(profile.interests, "AI") && hasTag(opportunity, "ai")) {
    breakdown.push({ label: "Shared AI Interest", reason: "You like AI", points: 45 });
  }
  if (hasValue(profile.interests, "Startup") && hasTag(opportunity, "startup")) {
    breakdown.push({ label: "Shared Startup Interest", reason: "You like Startup", points: 35 });
  }
  if (hasValue(profile.interests, "Technology") && hasTag(opportunity, "technology")) {
    breakdown.push({ label: "Shared Technology Interest", reason: "You like Technology", points: 45 });
  }
  if (hasValue(profile.interests, "Business") && hasTag(opportunity, "business")) {
    breakdown.push({ label: "Shared Business Interest", reason: "You like Business", points: 30 });
  }
  if (hasValue(profile.interests, "Design") && (hasTag(opportunity, "design") || hasTag(opportunity, "art"))) {
    breakdown.push({ label: "Shared Design Interest", reason: "You like Design", points: 45 });
  }
  if (hasValue(profile.interests, "Music") && (hasTag(opportunity, "music") || hasTag(opportunity, "live-performance"))) {
    breakdown.push({ label: "Shared Music Interest", reason: "You like Music", points: 45 });
  }
  if (hasValue(profile.interests, "Gaming") && hasTag(opportunity, "gaming")) {
    breakdown.push({ label: "Shared Gaming Interest", reason: "You like Gaming", points: 45 });
  }
  if (hasValue(profile.interests, "Sports") && hasTag(opportunity, "sports")) {
    breakdown.push({ label: "Shared Sports Interest", reason: "You like Sports", points: 45 });
  }
  if (hasValue(profile.interests, "Volunteer") && hasTag(opportunity, "volunteer")) {
    breakdown.push({ label: "Shared Volunteer Interest", reason: "You like Volunteer", points: 45 });
  }

  if (hasValue(profile.goals, "Networking") && (hasTag(opportunity, "meetup") || hasTag(opportunity, "networking"))) {
    breakdown.push({ label: "Social Goal Bonus", reason: "You want to meet new people", points: 8 });
  }
  if (hasValue(profile.goals, "Learning") && (hasTag(opportunity, "learning") || hasTag(opportunity, "workshop"))) {
    breakdown.push({ label: "Learning Goal Bonus", reason: "You enjoy learning with others", points: 8 });
  }
  if (hasValue(profile.goals, "Friends") && (hasTag(opportunity, "friends") || hasTag(opportunity, "community"))) {
    breakdown.push({ label: "Friendship Goal Bonus", reason: "You want to make friends", points: 8 });
  }
  if (hasValue(profile.goals, "Volunteer Work") && hasTag(opportunity, "volunteer")) {
    breakdown.push({ label: "Community Goal Bonus", reason: "You enjoy community activities", points: 8 });
  }

  if (
    (occupation.includes("developer") ||
      occupation.includes("engineer") ||
      occupation.includes("programmer")) &&
    (hasTag(opportunity, "technology") || hasTag(opportunity, "ai"))
  ) {
    breakdown.push({ label: "Small Profile Bonus", reason: "Similar people joined this community", points: 5 });
  }
  if (occupation.includes("designer") && (hasTag(opportunity, "design") || hasTag(opportunity, "art"))) {
    breakdown.push({ label: "Small Profile Bonus", reason: "Similar people joined this community", points: 5 });
  }
  if (occupation.includes("student") && (hasTag(opportunity, "meetup") || hasTag(opportunity, "community"))) {
    breakdown.push({ label: "Small Profile Bonus", reason: "People like you also join", points: 5 });
  }

  return breakdown;
}

export function calculateMatchScore(opportunity: Opportunity, profile: ProfileInfo) {
  const total = getMatchBreakdown(opportunity, profile).reduce(
    (sum, item) => sum + item.points,
    0
  );

  return Math.min(total, 99);
}

export function getMatchDetails(opportunity: Opportunity, profile: ProfileInfo) {
  const breakdown = getMatchBreakdown(opportunity, profile);
  const matchScore = Math.min(
    breakdown.reduce((sum, item) => sum + item.points, 0),
    99
  );

  return {
    matchScore,
    breakdown,
    reasons: breakdown.map((item) => item.reason),
  };
}

export function getRecommendations(profile: ProfileInfo) {
  return MOCK_OPPORTUNITIES.map((opportunity) => ({
    ...opportunity,
    matchScore: calculateMatchScore(opportunity, profile),
  }))
    .sort((first, second) => second.matchScore - first.matchScore)
    .slice(0, 3);
}
