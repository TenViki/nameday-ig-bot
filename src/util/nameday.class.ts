import axios from "axios";
import * as cheerio from "cheerio";
import { decode } from "./decode";

export default class NameDay {
  constructor() {}

  async fetchName() {
    const response = await axios.get(
      "https://www.nasejmena.cz/nj/cetnost.php?id=121278&typ=jmeno",
      {
        responseType: "arraybuffer",
        responseEncoding: "binary",
        headers: {
          "accept-encoding": "gzip, deflate, br",
        },
      }
    );

    const html = decode(response.data);

    const $ = cheerio.load(html);
    const nameText = $(".hlavicka").text();
    const subName = $(".dopinfo").text();

    const nameRegex =
      /((?<=Jméno )[a-zA-ZěščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮĚÓ]*)|((?<= má )\d+)|((?<=je na )\d+)|((?<=je )\d+)/gm;
    const matches = nameText.match(nameRegex);
    if (!matches || matches.length < 4) return null;

    console.log(subName, subName.charCodeAt(72));
    const subNameRegex =
      /(\d+\.\d+\.)|((?<=p[uů]vod: )[a-zA-Z ěščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮĚÓ]*)|((?<=v[yý]znam: )[a-zA-Z ěščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮĚÓ]*)|((?<=oblasti )[a-zA-Z ěščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮĚÓ]*)/gm;
    const subMatches = subName.match(subNameRegex);
    console.log(subMatches);
    if (!subMatches || subMatches.length < 4) return null;

    const name = {
      name: matches[0],
      amount: matches[1],
      popularityRank: matches[2],
      averageAge: matches[3],
      day: subMatches[0],
      origin: subMatches[1],
      meaning: subMatches[2],
      area: subMatches[3],
    };

    console.log(name);
  }
}
