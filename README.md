# NYC COVID-19 Testing Wait Times

This repo contains scraped data for wait times at the 56 NYC Health + Hospitals-run COVID-19
testing locations. For more information, see http://testandtrace.nyc. More information on these
locations can be found [here](https://www.nychealthandhospitals.org/covid-19-testing-sites/).

It's worth noting that *this code is pretty gross.* It was written quickly after work one day to
make sure I was saving the data, and then hastily updated when the format of ther PDFs changed to
keep the scraper working during a period I was pretty busy with work. I hope to find some time to
clean this up (see the to dos down below), but the "if it works..." mantra seems to be holding true
here --- I haven't touched the repo in a few weeks and it's scraping along just fine.

## Project Structure

```text
├── README.md
├── bin // some one-off scripts and tools
│   └── ...
├── data
│   ├── TIMESTAMP-MD5.json
│   ├── timeseries.csv // CSV containing a row for each scrape output
│   ├── latest.json // the most up-to-date scraped data
│   └── pdfs
│       ├── TIMESTAMP-MD5.pdf
│       └── ... // all PDFs scraped and saved in case of a text parsing issue
├── index.js // the main scrape function run via the GitHub cron
├── package-lock.json
└── package.json
```

## Some Notes

- Sometimes a scrape will have seemingly duplicate data. This is due to a test site providing an
  update for their wait times that is the same as the previous update (but the timestamp changes,
  generating a new hash). Since it's technically "new" data, I count it as a new scrape, though it
  can be hard to tell exactly what changed from the JSON alone.
- On 12/5, it appears the dashboard came out of "beta" and they removed the "last updated" time. All
  files were renamed to the format `$SCRAPE_TIME_UTC-$MD5_HASH` in order to preserve all versions of
  the PDF files.
- On 12/27, I updated updated the scrape function to output normalize location names and times,
  added a CSV timeseries output, and stopped writing individual JSON files for each scrape run. A 
  one-off script was used to generate this file, and it is updated each scrape.
  - All times are now in minutes. A `NR` value explicitly means "not reporting."
  - The individual `$TIMESTAMP-$MD5.JSON` files will soon be removed, keeping them for now in case 
    of disaster. The PDF files will be left alone.

## To Do

- Figure out why the cron scrape job seems to run at random times
- Consider scraping "last updated" times? Low priority.

## Inspiration

This scraping project was inspired by @simonw's post on ["Git scraping"](https://simonwillison.net/2020/Oct/9/git-scraping/).
