const fs = require('fs').promises;
const path = require('path');
const axios = require("axios");
const pdfParse = require("pdf-parse");
const papa = require("papaparse")
const crypto = require('crypto');

const { getCleanName, getNormalizedTime } = require('./util')

const md5 = (str) => crypto.createHash('md5').update(str).digest('hex')

const PDF_URL = "https://hhinternet.blob.core.windows.net/wait-times/testing-wait-times.pdf";
const CSV_PATH = path.join(__dirname, `data/timeseries.csv`)

async function run() {

  const req = await axios.request({
    method: "GET",
    url: PDF_URL,
    responseType: "arraybuffer",
  })

  const scrapeTime = new Date().toISOString();
  const parsedData = await pdfParse(req.data);

  const { text } = parsedData;

  // get hash of text, check if file exists, and if not write out file and continue
  const hash = md5(text)

  const files = await fs.readdir(path.join(__dirname, 'data/pdfs'))
  files.forEach(filename => {
    if (filename.includes(hash)) {
      console.info(hash, 'Duplicate data scraped. Exiting...');
      process.exit(0);
    }
  })

  await fs.writeFile(path.join(__dirname, `data/pdfs/${scrapeTime}-${hash}.pdf`), req.data);

  // the time frame window at top
  const timeWindowRe = /\d+\/\d+\/202\d\s+\|\s+\d+:\d+(:\d+)? [AP]M/gim

  // const filename = timestamp.replace(/\//g, '-').replace(/\s+/g, '_');

  // if all sites are closed, save PDF and exit early
  const [closedText] = text.match(/sites are currently closed/gim) || []
  if (closedText) {
    return console.info('all sites closed');
  }

  // pattern here is $LOCATION\n$WAIT_TIME\n
  const locationWaits = text.split('\n')

  let i = 0
  const waitTimes = {}
  while (locationWaits.length > i) {
    while (locationWaits[i] === '') i += 1;
    const cleanName = getCleanName(locationWaits[i])
    const cleanTime = getNormalizedTime(locationWaits[i + 1].replace('*', ''))
    waitTimes[cleanName] = cleanTime;
    i += 2;
    // if there is a last updated time, skip it
    if (/last reported/ig.test(locationWaits[i])) i += 1;
    // HACK: if this is a newer dashboard and the text is parsed to the end, end it
    if (timeWindowRe.test(locationWaits[i])) i = locationWaits.length;
  }

  // sort keys in alphabetical order
  const sorted = {}
  Object.keys(waitTimes).sort().forEach(function (key) {
    sorted[key] = waitTimes[key];
  });

  // write json files
  const outData = JSON.stringify(sorted, null, 2)
  // await fs.writeFile(path.join(__dirname, `data/${scrapeTime}-${hash}.json`), outData);
  await fs.writeFile(path.join(__dirname, `data/latest.json`), outData);


  // write timeseries line
  const csvText = await fs.readFile(CSV_PATH, 'utf-8');
  const { data: csvData } = papa.parse(csvText, { header: true })
  csvData.push({ timestamp: scrapeTime, hash, ...sorted })
  await fs.writeFile(CSV_PATH, papa.unparse(csvData))
}

run().catch(err => console.error(err));
