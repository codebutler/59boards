import scrapy

from cbmap.utils import parse_calendarjs


class QueensCb2Spider(scrapy.Spider):
    name = 'queens-cb5'
    title = 'Queens CB5'
    start_urls = [
        'http://www1.nyc.gov/assets/queenscb5/js/calendar_events.js'
    ]

    def parse(self, response):
        for item in parse_calendarjs(response):
            yield item
