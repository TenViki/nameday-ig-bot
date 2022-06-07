import axios from "axios";
import * as cheerio from "cheerio";
import { decode } from "./decode.util";
import htmlToImage from "node-html-to-image";
import fs from "fs/promises";
import { formatMonth } from "./month.util";

export interface Name {
  name: string;
  amount: string;
  popularityRank: string;
  averageAge: string;
  day: string;
  origin: string;
  meaning: string;
  area: string;
}

export default class NameDay {
  public names: Name[] | null = null;
  public loaded = false;

  constructor() {}

  private formatHtml(html: string, name: Name) {
    return html
      .replaceAll("{{day}}", formatMonth(name.day))
      .replaceAll("{{name}}", name.name)
      .replaceAll("{{origin}}", name.origin)
      .replaceAll("{{meaning}}", name.meaning)
      .replaceAll("{{area}}", name.area)
      .replaceAll("{{amount}}", name.amount)
      .replaceAll("{{rank}}", name.popularityRank)
      .replaceAll("{{age}}", name.averageAge);
  }

  async createImage(index: number) {
    if (!this.names) throw new Error("Name not loaded");
    const html = await fs.readFile("./src/template/name.html", "utf8");
    const a = await htmlToImage({
      html: this.formatHtml(html, this.names[index]),
      output: `./tmp/${Date.now()}.png`,
      puppeteerArgs: {
        headless: true,
        ignoreDefaultArgs: true,
        // args: ["--headless"],
      },
    });
    return a;
  }

  async fetchName(options?: {
    url?: string;
    fetchOther?: boolean;
  }): Promise<Name[] | null> {
    const response = await axios.get(
      options?.url || "https://www.nasejmena.cz/nj/cetnost.php",
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

    const subNameRegex =
      /(\d+\.\d+\.)|((?<=p[uů]vod: )[a-zA-Z ěščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮĚÓ]*)|((?<=v[yý]znam: )[a-zA-Z ěščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮĚÓ]*)|((?<=oblasti )[a-zA-Z ěščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮĚÓ]*)/gm;
    const subMatches = subName.match(subNameRegex);
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

    const others: Name[] = [];

    if (options?.fetchOther) {
      const a = $(".dolnitext").children();

      for (const el of a) {
        const text = $(el).text();
        const href = $(el).attr("href");
        if (
          el.name === "a" &&
          href?.match(/cetnost\.php\?id=\d+&typ=jmeno/gm)
        ) {
          const names = await this.fetchName({
            url: "https://www.nasejmena.cz/nj/" + href,
            fetchOther: false,
          });
          if (!names) continue;

          others.push(names[0]);
        }
      }
    }

    this.names = [name, ...others];
    return [name, ...others];
  }
}
