const puppeteer = require('puppeteer');
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();

  // TODO:change your url
  await page.goto('https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5c024ecbf265da616a476638', {
    waitUntil: 'networkidle0'
  })

  // TODO: you can change this number or use `page.wait(selector)`
  await page.waitFor(5000)

  await page.click(".login")

  // TODO:add your username
  const username = "";
  const password = "";

  await page.type(".panel input[name = 'loginPhoneOrEmail']", username, {
    delay: 100
  })

  // TODO:add your password
  await page.type(".panel input[name='loginPassword']", password, {
    delay: 100
  })

  await Promise.all([
    page.waitForNavigation({
      waitUntil: "networkidle0"
    }),
    page.click(".btn"),
  ]);

  // TODO: you can change this number or use `page.wait(selector)`
  await page.waitFor(5000)

  const router = await page.$$(".book-directory a")

  const filename = await page.evaluate(() => {
    let item = [...document.querySelectorAll('.book-directory a')];
    return item.map((a) => a.text);
  });
  const title = await page.title()

  await page.$eval(".book-content__header", el => {
    el.style.display = "none"
  })

  // create file

  if (!fs.existsSync(`./${title}`)) fs.mkdirSync(`./${title}`)

  // first page
  await page.pdf({
    path: `./${title}/${filename[0]}.pdf`,
    format: "A4"
  })

  // others
  for (let i = 1; i < router.length; i++) {
    await page.setViewport({
      width: 1200,
      height: 5000
    });
    await Promise.all([
      page.waitForNavigation({
        waitUntil: "networkidle0"
      }),
      await page.click('.route-active+a')
    ]);
    // TODO: you can change this number or use `page.wait(selector)`
    await page.waitFor(5000)
    try {
      // normalize filename
      const normalize = filename[i].split("/").join("").split(" ").join("")
      await page.pdf({
        path: `./${title}/${normalize}.pdf`,
        format: "A4"
      })
    } catch (err) {
      console.log("error", err)
    }
  }

  await browser.close()
})()