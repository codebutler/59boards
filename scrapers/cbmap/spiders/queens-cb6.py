import itertools
from datetime import datetime
from urllib.parse import urljoin

import scrapy
from bs4 import BeautifulSoup

from cbmap.items import CalEventItem


class QueensCb6Spider(scrapy.Spider):
    name = 'queens-cb6'
    title = 'Queens CB6'
    start_urls = [
        'http://www1.nyc.gov/site/queenscb6/news/upcoming-events.page'
    ]

    def parse(self, response):
        soup = BeautifulSoup(response.text, 'lxml')
        title_elms = soup.select('.about-description h2, .about-description h3')

        for elm in title_elms:
            siblings = list(itertools.islice(
                filter(
                    lambda x: x.encode().strip() and x.name != 'br',
                    elm.next_siblings),
                3))

            # Ensure next 3 elements (ignoring whitespace/<br>s) are text.
            if len(siblings) != 3 or not all([x.name is None for x in siblings]):
                continue

            summary_text = elm.text
            date_text = str(siblings[0]).strip()
            time_text = str(siblings[1]).strip()
            location_text = str(siblings[2]).strip()

            agenda_elm = elm.find_next_sibling('a')
            agenda_href = urljoin(self.start_urls[0], agenda_elm.attrs['href'])
            agenda_text = agenda_elm.text
            description_text = f'<a href="{agenda_href}>{agenda_text}</a>'

            event_date = self.__parse_date(date_text)
            event_time = self.__parse_time(time_text)
            event_dt = datetime.combine(event_date, event_time)

            yield CalEventItem(
                date=event_dt,
                summary=summary_text,
                description=description_text,
                location=location_text
            )

    @staticmethod
    def __parse_date(date_text):
        try:
            return datetime.strptime(date_text, '%A, %B %d, %Y').date()
        except ValueError:
            return datetime.strptime(date_text, '%A %B %d, %Y').date()

    @staticmethod
    def __parse_time(time_text):
        if '-' in time_text:
            time_text = time_text.split('-')[0].strip()
        if ' ' in time_text:
            time_text = time_text.split(' ')[0].strip()
        return datetime.strptime(time_text, '%I:%M%p').time()
