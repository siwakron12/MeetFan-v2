import { PrismaClient } from "@prisma/client";
import { loadCsvEvents } from "../src/services/event-data";

const prisma = new PrismaClient();

async function main() {
  const events = await loadCsvEvents();

  console.log(`Seeding ${events.length} events from CSV into Postgres...`);

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {
        title: event.title,
        description: event.description,
        category: event.category,
        imageUrl: event.imageUrl,
        location: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
        eventDate: new Date(event.eventDate),
      },
      create: {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        imageUrl: event.imageUrl,
        location: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
        eventDate: new Date(event.eventDate),
      },
    });
  }

  console.log("Done seeding events.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });