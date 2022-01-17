require("dotenv").config();
import https from "https";
import { CronJob } from "cron";
import { getDepartureDate, getPhrases } from "./notion";
import { getDaysBetween, pickRandom } from "./utility";

const cronString = process.env.CRON_STRING;
const botUrl =
  process.env.BOT_MODE === "REAL"
    ? process.env.REAL_DISCORD_BOT_URL
    : process.env.TEST_DISCORD_BOT_URL;

if (!cronString || !botUrl) {
  throw Error("Please create .env file");
}

const callouts = [
  "Guess what?",
  "Hey!",
  "Oh my!",
  "Get your camp pants ready!",
  "Good news everyone!",
  "Here's the thing.",
] as const;

const emojis = [
  [`:bullettrain_front:`, `:cloud:`],
  [`:camping:`, `:coffee:`],
  [`:potable_water:`, `:radio:`],
  [`:chipmunk:`, `:hiking_boot:`],
  [`:canned_food:`, `:hotdog:`],
  [`:beer:`, `:beverage_box:`],
] as const;

const getMessage = async (): Promise<string> => {
  const phrases = await getPhrases();
  const currentDate = new Date();
  const campingDate = await getDepartureDate();

  if (!campingDate) {
    return "Check the departure date in Notion, something is up";
  }

  const daysUntil = getDaysBetween(currentDate, campingDate);
  const randomPhrase1 = pickRandom(phrases);
  const randomPhrase2 = pickRandom(phrases.filter((p) => p !== randomPhrase1));
  const randomCallout = pickRandom(callouts)

  if (!randomPhrase1 || !randomPhrase2) {
    return "Check the random phrases in Notion, I couldn't find at least two";
  }

  const [emoji1, emoji2] = pickRandom(emojis)!;

  return `${emoji1}  ${randomCallout} Only ${daysUntil} more days until ${randomPhrase1}, and ${randomPhrase2}  ${emoji2}`;
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
      path: botUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": payload.length,
      },
    },
    (res) => {
      process.stdout.write(`statusCode: ${res.statusCode}\n`);

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

const bot = new CronJob(cronString, sendMessage, null, true, "America/Toronto");

bot.start();
