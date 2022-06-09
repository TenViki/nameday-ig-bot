import dotenv from "dotenv";
import { exit } from "process";
import NameDay from "./util/nameday.class";
import { getRandomImage } from "./util/image.util";
import * as fs from "fs/promises";
import { Instagram } from "./util/instagram.class";
import { CronJob } from "cron";

// Load environment variables from .env file
dotenv.config();

const username = process.env.IG_USERNAME;
const password = process.env.IG_PASSWORD;

if (!username || !password) {
  console.log("Please set your username and password in .env file");
  exit();
}

const loadName = async () => {
  const name = new NameDay();
  const names = await name.fetchName({
    fetchOther: true,
  });

  console.log("Generating images...");
  const images = await name.createImages();

  await ig.uploadImages(images, names!);

  for (const image of images) {
    await fs.unlink(image);
  }
};

const ig = new Instagram(username, password);

const main = async () => {
  try {
    // await ig.simulate.postLoginFlow();
    await ig.setup();
    await ig.login();

    new CronJob(
      "0 7 * * *",
      async () => {
        console.log("Starting job for " + new Date().toLocaleString());
        await loadName();
      },
      null,
      true
    );
  } catch (err) {
    console.log("Something went wrong: ", err);
  }
};

main();
