# pip install beautifulsoup4 parsedatetime
from datetime import date
from datetime import datetime
from datetime import time
from time import mktime

import re
import scrapy
from bs4 import BeautifulSoup
from parsedatetime import parsedatetime


class QueensCb2Spider(scrapy.Spider):
    name = 'queens-cb2'
    start_urls = [
        'http://www.nyc.gov/html/qnscb2/includes/scripts/calendar.js'
    ]

    cal = parsedatetime.Calendar()

    def parse(self, response):
        for line in response.text.splitlines():
            if line.startswith('calEvents[calEvents.length]'):
                js_str = line.split(' = ')[1]
                js_str = bytes(js_str, 'utf-8').decode("unicode_escape")
                js_str = re.sub(r'";?$', '', js_str)
                js_str = re.sub(r'^"', '', js_str)

                parts = js_str.split('|')

                soup = BeautifulSoup(parts[1], 'html.parser')

                event_date = self.parse_date(parts[0])
                event_time = self.parse_time(soup.stripped_strings)
                event_title = self.parse_soup(soup)

                if event_time:
                    dt = datetime.combine(event_date, event_time)
                else:
                    dt = event_date

                yield {
                    'date': dt,
                    'title': event_title
                }

    def parse_date(self, text) -> date:
        return datetime.strptime(text, '%m/%d/%Y').date()  # 2/8/2017

    def parse_time(self, texts) -> time:
        for text in texts:
            date, result = self.cal.parse(text)
            if result:
                return datetime.fromtimestamp(mktime(date)).time()

    def parse_soup(self, soup):
        print(list(soup.stripped_strings))
        for child in soup.descendants:
            print(child)