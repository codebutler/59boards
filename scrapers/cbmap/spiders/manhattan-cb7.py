import scrapy

from cbmap.utils import parse_calendarjs


class BrooklynCb1Spider(scrapy.Spider):
    name = 'manhattan-cb7'
    title = 'Manhattan CB7'
    start_urls = [
        'http://www1.nyc.gov/assets/manhattancb7/js/pages/calendar_events.js'
    ]

    def parse(self, response):
        for item in parse_calendarjs(response):
            yield item
