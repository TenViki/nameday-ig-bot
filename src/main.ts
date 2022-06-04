import { IgApiClient } from "instagram-private-api";
import dotenv from "dotenv";
import { exit } from "process";
import NameDay from "./util/nameday.class";

// Load environment variables from .env file
dotenv.config();

const username = process.env.IG_USERNAME;
const password = process.env.IG_PASSWORD;

if (!username || !password) {
  console.log("Please set your username and password in .env file");
  exit();
}

// export const ig = new IgApiClient();
// ig.state.generateDevice(username);

const main = async () => {
  try {
    // await ig.simulate.preLoginFlow();
    // const loggedInUser = await ig.account.login(username, password);
    // console.log(`Logged in as ${loggedInUser.username}`);

    const name = new NameDay();
    const names = await name.fetchName({
      fetchOther: true,
      url: "https://www.nasejmena.cz/nj/cetnost.php?id=3770&typ=jmeno",
    });

    name.createImage(0);
  } catch (err) {
    console.log("Something went wrong: ", err);
  }
};

main();
