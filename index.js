const fs = require('fs').promises;
const path = require('path');
const axios = require("axios");
const pdfParse = require("pdf-parse");


const PDF_URL = "https://hhinternet.blob.core.windows.net/wait-times/testing-wait-times.pdf";

async function run() {

  const req = await axios.request({
    method: "GET",
    url: PDF_URL,
    responseType: "arraybuffer",
  })

  const parsedData = await pdfParse(req.data);

  const {text} = parsedData;

  const [refreshTsText] = text.match(/refresh timestamp:\n.*[AP]M/gim)
  const timestamp = refreshTsText.replace(/refresh timestamp:\n/gim, '').replace(/\//g, '-')

  // this text comes immediately before the list of locations
  const [windowText] = text.match(/changed since last reported.*\n/gim)
  // find location where text for wait times start plus 1 for newline
  const locationOffset = text.indexOf(windowText) + windowText.length;

  // pattern here is $LOCATION\n$WAIT_TIME\n
  const locationWaits = text.substr(locationOffset).split('\n');

  let i = 0
  const waitTimes = {}
  while (locationWaits.length > i) {
    waitTimes[locationWaits[i]] = locationWaits[i + 1].replace('*', '');
    i += 2;
    // if there is a last updated time, skip it
    if (/last reported/ig.test(locationWaits[i])) i += 1;
  }

  // write pdf, json file
  const filename = timestamp.replace(/\s+/g, '_');
  const outData = JSON.stringify(waitTimes, null, 2)
  await fs.writeFile(path.join(__dirname, `data/pdfs/${filename}.pdf`), req.data);
  await fs.writeFile(path.join(__dirname, `data/${filename}.json`), outData);
  await fs.writeFile(path.join(__dirname, `data/latest.json`), outData);
}

run().catch(err => {throw err});
