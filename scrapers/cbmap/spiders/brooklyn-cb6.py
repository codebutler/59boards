from datetime import datetime
from typing import Optional

import bleach
import scrapy
from bs4 import BeautifulSoup
from pytz import timezone

from cbmap.items import CalEventItem


class BrooklynCb6Spider(scrapy.Spider):
    name = 'brooklyn-cb6'
    title = 'Brooklyn CB6'
    start_urls = [
        'http://www1.nyc.gov/site/brooklyncb6/calendar/calendar.page'
    ]

    def parse(self, response):
        soup = BeautifulSoup(response.text, 'lxml')

        for tag in soup.select('.about-description > h3'):
            # Find index of next event header.
            all_siblings = tag.select('~ *')
            next_header = tag.select_one('~ hr, ~ h3, ~ h2')

            # Find all siblings up to next header (or end of document if last event).
            event_tags = tag.select('~ *', limit=all_siblings.index(next_header)) \
                if next_header else all_siblings

            # Use <h3> text as date.
            event_date = self.__parse_date(tag.string)

            # Find first <h4> sibling.
            event_summary = next((t.string for t in event_tags if t.name == 'h4'), None)

            # If not found, look for first <p> sibling where all children are <b>.
            if not event_summary:
                event_summary = next((t.string for t in event_tags
                                      if t.name == 'p' and t.string and all(c.name == 'b' for c in t.children)), None)

            # Find first <p> sibling where all children are not <b>.
            event_location = next((', '.join(t.stripped_strings) for t in event_tags
                                   if t.name == 'p' and all(c.name != 'b' for c in t.children)), None)

            # Find first <ul> sibling and capture entire html.
            event_description = next((self.__clean_html(str(t)) for t in event_tags if t.name == 'ul'), None)

            yield CalEventItem(
                date=event_date,
                summary=event_summary,
                location=event_location,
                description=event_description
            )

    @staticmethod
    def __parse_date(text: str) -> datetime:
        return timezone('US/Eastern').localize(
            datetime.strptime(text, '%B %d, %I:%M%p').replace(year=datetime.now().year))

    @staticmethod
    def __clean_html(html: str) -> Optional[str]:
        if html:
            return bleach.clean(html)
        return None
