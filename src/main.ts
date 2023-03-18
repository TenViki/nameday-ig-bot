import dotenv from "dotenv";
import { exit } from "process";
import NameDay from "./util/nameday.class";
import { getRandomImage } from "./util/image.util";
import * as fs from "fs/promises";
import { CronJob } from "cron";
import { join } from "path";
import { spawn } from "child_process";

// Load environment variables from .env file
dotenv.config();

const loadName = async () => {
  const name = new NameDay();
  const names = await name.fetchName({
    fetchOther: true,
  });

  if (!names) {
    console.log("No names found");
    return;
  }

  console.log("Generating images...");
  const images = await name.createImages();
  const textData = JSON.stringify(names);

  console.log("Sending files to python processer...");

  // convert images to absolute paths
  const imagePaths = images.map((image) => {
    return join(process.cwd(), image);
  });

  console.log(
    "cmd: " +
      'python ./python/main.py "' +
      textData +
      '" "' +
      JSON.stringify(imagePaths) +
      '"'
  );

  // send data to python processer
  const python = spawn(process.env.PYTHON_CMD || "python3", [
    "./python/main.py",
    JSON.stringify(imagePaths),
    textData,
  ]);

  python.stdout.on("data", (data) => {
    console.log("[PY]: " + data.toString());
  });

  python.stderr.on("data", (data) => {
    console.log("[PY ERR]: " + data.toString());
  });
};

const makeJob = async () => {
  console.log("Starting job for " + new Date().toLocaleString());
  await loadName();
};

const main = async () => {
  try {
    // await ig.simulate.postLoginFlow();
    // await ig.setup();
    // await ig.login();

    makeJob();

    new CronJob("0 7 * * *", makeJob, null, true);
  } catch (err) {
    console.log("Something went wrong: ", err);
  }
};

main();
