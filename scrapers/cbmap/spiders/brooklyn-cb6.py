import hashlib
import json
from datetime import datetime

import bleach
import scrapy


def parse_date(text: str) -> int:
    return int(datetime.strptime(text, '%B %d, %I:%M%p').replace(year=datetime.now().year).strftime('%s'))


class BrooklynCb6Spider(scrapy.Spider):
    name = "brooklyn-cb6"
    start_urls = [
        'http://www1.nyc.gov/site/brooklyncb6/calendar/calendar.page'
    ]

    def parse(self, response):
        for elm in response.css('.about-description > h3'):
            item = {
                'date': parse_date(elm.xpath('text()').extract_first()),
                'title': elm.xpath('following-sibling::h4[1]/text()').extract_first(),
                'address': elm.xpath('following-sibling::p[1]/text()').extract(),
                'agenda': bleach.clean(elm.xpath('following-sibling::ul[1]').extract_first())
            }
            item['id'] = hashlib.md5(json.dumps(item).encode('utf-8')).hexdigest()
            yield item
