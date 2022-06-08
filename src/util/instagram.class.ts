import puppeteer from "puppeteer";
import { wait } from "./image.util";
import { Name } from "./nameday.class";

export class Instagram {
  private browser: puppeteer.Browser;
  private page: puppeteer.Page;
  public loggedIn: boolean = false;
  constructor(public username: string, private password: string) {}

  public async setup() {
    console.log("Settting up brwoser window");
    this.browser = await puppeteer.launch({
      args: ["--lang=en-EN,en"],
    });
  }

  private takeScreenshot = async (name?: string) => {
    await this.page.screenshot({
      path: name || "instagram.png",
    });
  };

  public async login() {
    this.page = await this.browser.newPage();
    try {
      console.log("[IG] Logging in...");
      this.page.goto("https://www.instagram.com");

      // Allow cookies
      await this.page.waitForSelector("button[class='aOOlW  bIiDR  ']");
      await this.page.click("button[class='aOOlW  bIiDR  ']");
      await wait(1500);

      await this.page.waitForSelector("input[name=username]");
      await this.page.type("input[name=username]", this.username);
      await this.page.type("input[name=password]", this.password);
      await wait(200);
      await this.page.click("button[type=submit]");

      await this.page.waitForSelector("nav");

      console.log("[IG] Instargam UI loaded!");

      this.loggedIn = true;
    } catch (error) {
      console.log("[IG] Error, saving to instagram-err.png");
      console.error(error);
      await this.takeScreenshot("instagram-err.png");
    }
  }

  public async uploadImages(images: string[], names: Name[]) {
    if (!this.loggedIn) {
      throw new Error("[IG] Not logged in!");
    }

    await this.page.click("button[class='wpO6b ZQScA ']");
    await this.page.waitForSelector("div[role='dialog'] button");
    await this.page.click("div[role='dialog'] button");

    console.log("Waiting for file chooser");

    const [fileChooser] = await Promise.all([
      this.page.waitForFileChooser(),
      this.page.click("div[role='dialog'] button"),
    ]);

    console.log("Uploading images");
    await fileChooser.accept(images);

    await wait(500);

    let selectors: puppeteer.ElementHandle<Element>[] = [];

    while (true) {
      selectors = await this.page.$$("div[role='dialog'] button");
      if (selectors.length > 1) break;
      await wait(500);
    }

    await selectors[1].click();

    await wait(500);

    while (true) {
      selectors = await this.page.$$("div[role='dialog'] button");
      if (selectors.length > 1) break;
      await wait(500);
    }

    await selectors[1].click();

    await wait(500);

    await this.page.type(
      "textarea",
      `Ke dni ${names[0].day} mají svátek ${names.map((n) => n.name).join(", ")}
.
.
#svatkycz #citat #radost #citatycz #myslienky #memeczsk #srandamusibyt #srandicky #kazdyden #cernyhumor #legrace #cze #demotivacia #emefka #sarkazmus #sranda #czechrepublic #volnycas #memecz #zajimavosti #konecne`
    );

    await wait(500);

    while (true) {
      selectors = await this.page.$$("div[role='dialog'] button");
      if (selectors.length > 1) break;
      await wait(500);
    }

    await selectors[1].click();

    this.takeScreenshot();
  }
}
