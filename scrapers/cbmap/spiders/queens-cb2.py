import re
from datetime import date
from datetime import datetime
from time import mktime

import scrapy
from bs4 import BeautifulSoup
from parsedatetime import parsedatetime
from pytz import timezone

from cbmap.items import CalEventItem


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

                event_date = self.__parse_date(parts[0])
                event_time, event_summary = self.__parse_text(parts[1])

                if event_time:
                    event_dt = datetime.combine(event_date, event_time) \
                        .astimezone(timezone('US/Eastern'))
                else:
                    event_dt = event_date

                yield CalEventItem(
                    date=event_dt,
                    summary=event_summary,
                    location='',
                    description=''
                )

    @staticmethod
    def __parse_date(text) -> date:
        return datetime.strptime(text, '%m/%d/%Y').date()  # 2/8/2017

    def __parse_text(self, text) -> (str, str, str):
        event_time = None
        soup = BeautifulSoup(text, 'html.parser')
        for token in soup.stripped_strings:
            if not event_time:
                found_date, result = self.cal.parse(token)
                if result:
                    event_time = datetime.fromtimestamp(mktime(found_date)).time()
                    break
        return event_time, ' '.join(soup.stripped_strings)
