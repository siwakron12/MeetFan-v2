import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const events = [
  {
    id: "evt-001",
    title: "One Piece Pop-up Cafe in Thailand",
    description:
      "A fan meetup event around One Piece at ICONSIAM with exhibition, cafe, and photo spots.",
    category: "Exhibition / Art / Fan Event",
    imageUrl: "/ImgEvent/one_piece.jpg",
    location: "Attraction Hall Floor 6, ICONSIAM",
    latitude: 13.726694,
    longitude: 100.510498,
    eventDate: new Date("2026-10-31T12:00:00.000Z"),
  },
  {
    id: "evt-003",
    title: "Street Food Night Market",
    description: "Meet people who enjoy local street food and night markets.",
    category: "Food / Market",
    imageUrl: "/ImgEvent/one_piece.jpg",
    location: "The Commons Thonglor",
    latitude: 13.7309,
    longitude: 100.5825,
    eventDate: new Date("2026-07-04T12:00:00.000Z"),
  },
  {
    id: "evt-004",
    title: "Startup Pitch Night Bangkok",
    description: "A meetup for startup builders, designers, and product people.",
    category: "Business / Technology",
    imageUrl: "/ImgEvent/one_piece.jpg",
    location: "True Digital Park",
    latitude: 13.6856,
    longitude: 100.6112,
    eventDate: new Date("2026-06-28T12:00:00.000Z"),
  },
];

async function main() {
  const demoPasswordHash = await bcrypt.hash("password123", 12);

  await prisma.user.upsert({
    where: { email: "demo@meetfan.local" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@meetfan.local",
      passwordHash: demoPasswordHash,
    },
  });

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: event,
      create: event,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
