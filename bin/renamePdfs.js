#!/usr/bin/env node

const path = require('path')
const fs = require('fs').promises;
const crypto = require('crypto');
const pdfParse = require("pdf-parse");

const md5 = (str) => crypto.createHash('md5').update(str).digest('hex')

async function run(params) {
  const files = await fs.readdir(path.join(__dirname, '../data/pdfs'))

  // loop over files and save as hash;
  files.forEach(async filename => {
    const filePath = path.join(__dirname, '../data/pdfs/', filename);
    const fileContents = await fs.readFile(filePath);
    const {text} = await pdfParse(fileContents);

    const hash = md5(text)

    await fs.writeFile(path.join(__dirname, `../data/pdfs/${hash}.pdf`), fileContents);
  })
}

run().catch(err => console.error(err))
