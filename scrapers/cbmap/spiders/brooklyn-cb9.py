import re
from datetime import datetime

import scrapy
from bs4 import BeautifulSoup
from pytz import timezone

from cbmap import utils
from cbmap.items import CalEventItem


class BrooklynCb9(scrapy.Spider):
    name = 'brooklyn-cb9'
    title = 'Brooklyn CB9'

    start_urls = [
        'http://www.communitybrd9bklyn.org/meetings/boardmeetings/',
        'http://www.communitybrd9bklyn.org/meetings/committeemeetings/'
    ]

    def parse(self, response):
        soup = BeautifulSoup(response.text, 'lxml')
        more_info_links = soup.select('.meeting_info a')
        for link in more_info_links:
            yield scrapy.Request(response.urljoin(link['href']), callback=self.parseEvent)

    def parseEvent(self, response):
        soup = BeautifulSoup(response.text, 'lxml')

        elems = soup.select('.meeting_wrap p')
        data = {key.string.rstrip(':').strip(): val.string.strip()
                for key, val in (elem.children for elem in elems)}

        date_str = data['Date']
        time_str = data['Time']
        venue = data['Venue']
        address = data['Address']

        if not date_str or not time_str:
            return

        date_str = utils.strip_date_ords(date_str)
        time_str = time_str.replace('.', '')

        event_date = datetime.strptime(date_str, '%B %d, %Y').date()
        event_time = datetime.strptime(time_str, '%I:%M %p').time()

        event_dt = timezone('US/Eastern').localize(datetime.combine(event_date, event_time))
        event_summary = soup.select('.et_main_title')[0].text.strip()
        event_description = response.url
        event_location = '\n'.join([x for x in (venue, address) if x])

        yield CalEventItem(
            date=event_dt,
            summary=event_summary,
            description=event_description,
            location=event_location
        )
