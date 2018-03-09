from datetime import datetime
from typing import Optional

import bleach
import scrapy
from pytz import timezone

from cbmap.items import CalEventItem


class BrooklynCb6Spider(scrapy.Spider):
    name = "brooklyn-cb6"
    start_urls = [
        'http://www1.nyc.gov/site/brooklyncb6/calendar/calendar.page'
    ]

    def parse(self, response):
        for elm in response.css('.about-description > h3'):
            yield CalEventItem(
                date=self.__parse_date(elm.xpath('text()').extract_first()),
                summary=elm.xpath('following-sibling::h4[1]/text()').extract_first(),
                location=' '.join(elm.xpath('following-sibling::p[1]/text()').extract()),
                description=self.__clean_html(elm.xpath('following-sibling::ul[1]').extract_first())
            )

    @staticmethod
    def __parse_date(text: str) -> datetime:
        return datetime.strptime(text, '%B %d, %I:%M%p') \
            .replace(year=datetime.now().year) \
            .astimezone(timezone('US/Eastern'))

    @staticmethod
    def __clean_html(html: str) -> Optional[str]:
        if html:
            return bleach.clean(html)
        return None
