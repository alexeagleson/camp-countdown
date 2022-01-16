require("dotenv").config();
import https from "https";
import { CronJob } from "cron";

const data = JSON.stringify({
  content: "Buy the milk",
});

const sendMessage = () => {
  const req = https.request(
    {
      hostname: "discord.com",
      port: 443,
      path: process.env.DISCORD_BOT_URL,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
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

  req.write(data);
  req.end();
};

var bot = new CronJob(
  "* * * * * *",
  sendMessage,
  null,
  true,
  "America/Toronto"
);

bot.start();
