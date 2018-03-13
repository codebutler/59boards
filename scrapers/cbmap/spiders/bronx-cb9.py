from datetime import datetime

import scrapy
from bs4 import BeautifulSoup
from parsedatetime import parsedatetime

from cbmap.items import CalEventItem


class BronxCb9Spider(scrapy.Spider):
    name = 'bronx-cb9'
    title = 'Bronx CB9'
    start_urls = [
        'http://www1.nyc.gov/site/bronxcb9/calendar/calendar.page'
    ]

    cal = parsedatetime.Calendar()

    def parse(self, response):
        soup = BeautifulSoup(response.text, 'lxml')
        list_items = soup.select('.about-description li')
        for li in list_items:
            title_elm = li.select_one('b')

            summary = ''.join(title_elm.stripped_strings)
            datetime_text = ''.join(title_elm.find_previous_siblings(text=True)).strip()
            location = ''.join(title_elm.find_next_siblings(text=True)).strip()

            event_dt = datetime.strptime(datetime_text, '%A, %B %d, %I%p').replace(year=datetime.now().year)

            yield CalEventItem(
                date=event_dt,
                summary=summary,
                description=None,
                location=location
            )
