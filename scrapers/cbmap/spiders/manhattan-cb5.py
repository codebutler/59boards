from datetime import datetime

import scrapy
from bs4 import BeautifulSoup
from pytz import timezone

from cbmap import utils
from cbmap.items import CalEventItem


class ManhattanCb5Spider(scrapy.Spider):
    name = 'manhattan-cb5'
    title = 'Manhattan CB5'
    start_urls = [
        'https://www.cb5.org/cb5m/calendar'
    ]

    def parse(self, response):
        soup = BeautifulSoup(response.text, 'lxml')

        depth = response.meta['depth'] or 0

        event_elms = soup.select('#Events div.event')
        for elm in event_elms:
            event_summary = ' '.join(elm.select_one('h2').stripped_strings)
            info = list(elm.select_one('.info').stripped_strings)
            event_dt = self.__parse_dt(info[0])
            event_location = '\n'.join(info[1:])
            event_desc = '\n'.join(
                (utils.clean_html(str(e))
                 for e in elm.select_one('.info').find_next_siblings()
                 if e.attrs.get('class') != ['up']))
            yield CalEventItem(
                date=event_dt,
                summary=event_summary,
                description=event_desc,
                location=event_location
            )

        if depth == 0:
            link = soup.select_one('.peernav .next a')
            request = scrapy.Request(link['href'])
            request.meta['depth'] = depth + 1
            yield request

    @staticmethod
    def __parse_dt(text):
        text = utils.strip_date_ords(text)
        dt = datetime.strptime(text, "%A, %B %d, %Y, at %I:%M%p")
        return timezone('US/Eastern').localize(dt)
