import scrapy

from cbmap.utils import parse_calendarjs


class BrooklynCb1Spider(scrapy.Spider):
    name = 'bronx-cb5'
    title = 'Bronx CB5'
    start_urls = [
        'http://www1.nyc.gov/assets/bronxcb5/js/calendar_events.js'
    ]

    def parse(self, response):
        for item in parse_calendarjs(response):
            yield item
