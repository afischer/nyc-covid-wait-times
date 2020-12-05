const fs = require('fs').promises;
const path = require('path');
const axios = require("axios");
const pdfParse = require("pdf-parse");
const dateFns = require("date-fns")


const PDF_URL = "https://hhinternet.blob.core.windows.net/wait-times/testing-wait-times.pdf";

async function run() {

  const req = await axios.request({
    method: "GET",
    url: PDF_URL,
    responseType: "arraybuffer",
  })

  const parsedData = await pdfParse(req.data);
  // TODO: Save immediately and rename so we don't lose data

  const {text} = parsedData;

  // older dashboards had "refreshed at" times, seems to have been removed
  const [refreshTsText] = text.match(/refresh timestamp:\n.*[AP]M/gim) || [];
  // the time frame window at top
  const timeWindowRe = /\d+\/\d+\/2020\s+\|\s+\d+:\d+(:\d+)? [AP]M/gim
  const [timeWindowText] = text.match(timeWindowRe) || []
  const timestamp = (
    refreshTsText ? refreshTsText : timeWindowText
  ).replace(/refresh timestamp:\n/gim, '').replace('|', '')

  // attempt to nicely parse timestamp
  // try {
  //   console.log(timestamp);
  //   const parsed = dateFns.parse(timestamp, 'M/d/yyyy h:mm:ss a', new Date())
  //   console.log(parsed)
  // } catch (error) {
  //   console.error('could not clean up date', error)
  // }

  const filename = timestamp.replace(/\//g, '-').replace(/\s+/g, '_');

  // write out PDF
  await fs.writeFile(path.join(__dirname, `data/pdfs/${filename}.pdf`), req.data);

  // if all sites are closed, save PDF and exit early
  const [closedText] = text.match(/sites are currently closed/gim) || []
  if (closedText) {
    return console.info('all sites closed');
  }

  // this text comes immediately before the list of locations
  const [windowText] = text.match(/changed since last reported.*\n/gim)
  // find location where text for wait times start plus 1 for newline
  // const locationOffset = text.indexOf(windowText) + windowText.length;

  // pattern here is $LOCATION\n$WAIT_TIME\n
  const locationWaits = text.split('\n')//.substr(locationOffset).split('\n');

  let i = 0
  const waitTimes = {}
  while (locationWaits.length > i) {
    while (locationWaits[i] === '') i += 1;
    console.log('checking', locationWaits[i]);
    waitTimes[locationWaits[i]] = locationWaits[i + 1].replace('*', '');
    i += 2;
    // if there is a last updated time, skip it
    if (/last reported/ig.test(locationWaits[i])) i += 1;
    // HACK: if this is a newer dashboard and the text is parsed to the end, end it
    if (timeWindowRe.test(locationWaits[i])) i = locationWaits.length;
  }

  // sort keys in alphabetical order
  const sorted = {}
  Object.keys(waitTimes).sort().forEach(function(key) {
    sorted[key] = waitTimes[key];
  });

  // write json files
  const outData = JSON.stringify(sorted, null, 2)
  await fs.writeFile(path.join(__dirname, `data/${filename}.json`), outData);
  await fs.writeFile(path.join(__dirname, `data/latest.json`), outData);
}

run().catch(err => console.error(err));
