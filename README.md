# 59Boards: NYC Community Board Map & Meetings Calendar Scraper

New York City's government includes a system of 59 community board districts that offer a way for the public to get involved with local politics. Many New Yorkers don't know they exist, and the process to get involved can seem overwhelming.

Most boards don't provide an easy way to get notified of upcoming meetings, making participation difficult. 59Boards [scrapes](https://en.wikipedia.org/wiki/Web_scraping) event information from board websites and provides a feed for your calendar app's subscription feature.

## Chat
Join us in `#app-59boards` on the [Beta NYC Slack](http://slack.beta.nyc/).

## frontend

```
$ cd frontend
$ npm install
$ npm start
```

## scrapers
```
$ ln -s ../../scrapers/output frontend/public/scraper-data
$ cd scrapers
$ pip install virtualenv
$ virtualenv venv
$ . venv/bin/activate
$ pip install pipenv
$ pipenv install
$ python main.py --all
```

You'll also need [tabula-server](https://github.com/codebutler/tabula-server/) running on localhost:4000 for the PDF scrapers to work.

## License

This project is licensed under the terms of the [MIT license](/LICENSE).
