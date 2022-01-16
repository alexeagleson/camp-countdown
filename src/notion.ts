import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const databaseId = process.env.NOTION_DATABASE_ID;

if (!databaseId) {
  throw Error("You need to create the .env file with Notion credentials");
}

export const getDepartureDate = async (): Promise<Date | undefined> => {
  const calendarQuery = await notion.databases.query({
    database_id: process.env.NOTION_CALENDAR_ID ?? "",
  });

  const departureDateString = calendarQuery.results
    .map((row): string | undefined => {
      if (row.properties.key.type === "title") {
        if (row.properties.key.title?.[0].plain_text === "Departure") {
          if (row.properties.date.type === "date") {
            return row.properties.date.date?.start;
          }
        }
      }
      return undefined;
    })
    .filter((departureDate) => departureDate !== undefined)?.[0];

  return departureDateString ? new Date(departureDateString) : undefined;
};

export const getPhrases = async (): Promise<string[]> => {
  const query = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID ?? "",
  });

  return query.results
    .map((row): string | undefined => {
      if (row.properties.key.type === "title") {
        return row.properties.key.title?.[0]?.plain_text;
      }
      return undefined;
    })
    .filter((text): text is string => text !== undefined);
};
