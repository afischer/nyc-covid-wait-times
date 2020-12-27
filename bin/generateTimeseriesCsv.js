#!/usr/bin/env node

const path = require('path')
const fs = require('fs').promises;
const papa = require('papaparse');

const { getCleanName, getNormalizedTime } = require('../util')

async function run() {
  const files = await fs.readdir(path.join(__dirname, '../data'))

  const waitTimes = [];


  for (const filename of files) {
    if (!filename.startsWith('20')) continue;
    const filePath = path.join(__dirname, '../data/', filename);
    const [ts, hash] = filename.replace('.json', '').split(/Z-/)
    const fileContents = await fs.readFile(filePath);
    const scrapedTimes = JSON.parse(fileContents);

    // get clean names, times
    const cleanTimes = Object.entries(scrapedTimes).reduce((acc, [name, time]) => {
      acc[getCleanName(name)] = getNormalizedTime(time);
      return acc
    }, { // acc starts with timestamp and hash.
      timestamp: `${ts}Z`,
      hash,
    })

    waitTimes.push(cleanTimes)
  }

  await fs.writeFile(
    path.join(__dirname, '../data/timeseries.csv'),
    papa.unparse(waitTimes)
  )
}

run().catch(err => console.error(err));
