
const fs = require('fs');
const puppeteer = require('puppeteer');

var browser
var page 

const minimal_args = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];
var htmlToImage
async function htmlToImage(html, outputPath,norecurseve) {
  try {
    if (!browser) {
      browser = await puppeteer.launch({ headless: "new", args: minimal_args });
    }
    if (!page) {
      page = await browser.newPage();
    }
    console.log("Генерируем изображение... ",outputPath)
    const dataUrl = `data:text/html,${encodeURIComponent(html)}`;
    await page.goto(dataUrl);
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log("Изображение сгенерированно!")


  } catch (error) {
    console.log("Ошибка внутри генератора изображений");
    console.error(error);
    await browser.close()
  }
}
module.exports = htmlToImage
  
