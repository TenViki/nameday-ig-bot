import axios from "axios";
import * as cheerio from "cheerio";
import { decode } from "./decode";

export default class NameDay {
  constructor() {}

  async fetchName() {
    const response = await axios.get(
      "https://www.nasejmena.cz/nj/cetnost.php",
      {
        responseType: "arraybuffer",
        responseEncoding: "binary",
        headers: {
          "accept-encoding": "gzip, deflate, br",
        },
      }
    );

    console.log(response.headers);

    const decoder = new TextDecoder("utf-8");
    const html = decode(response.data);

    const $ = cheerio.load(html);
    const nameText = $(".hlavicka").text();
    console.log(nameText);
  }
}
