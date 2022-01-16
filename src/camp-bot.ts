require("dotenv").config();
import https from "https";
import { CronJob } from "cron";
import { getDepartureDate, getPhrases } from "./notion";
import { getDaysBetween, pickRandom } from "./utility";

const getMessage = async (): Promise<string> => {
  const phrases = await getPhrases();
  const currentDate = new Date();
  const campingDate = await getDepartureDate();

  if (!campingDate) {
    return "Check the departure date in Notion, something is up";
  }

  const daysUntil = getDaysBetween(currentDate, campingDate);
  const randomPhrase = pickRandom(phrases);

  if (!randomPhrase) {
    return "Check the random phrases in Notion, I couldn't find any";
  }

  return `Only ${daysUntil} more days until ${randomPhrase}`;
};

const sendMessage = async () => {
  const message = await getMessage();

  const payload = JSON.stringify({
    content: message,
  });

  const req = https.request(
    {
      hostname: "discord.com",
      port: 443,
      path: process.env.DISCORD_BOT_URL,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": payload.length,
      },
    },
    (res) => {
      console.log(`statusCode: ${res.statusCode}`);

      res.on("data", (d) => {
        process.stdout.write(d);
      });
    }
  );

  req.on("error", (error) => {
    console.error(error);
  });

  req.write(payload);
  req.end();
};

const bot = new CronJob(
  "* * * * * *",
  sendMessage,
  null,
  true,
  "America/Toronto"
);

bot.start();
