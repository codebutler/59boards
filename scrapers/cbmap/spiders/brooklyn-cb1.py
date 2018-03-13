import scrapy

from cbmap.utils import parse_calendarjs


class BrooklynCb1Spider(scrapy.Spider):
    name = 'brooklyn-cb1'
    title = 'Queens CB1'
    start_urls = [
        'http://www.nyc.gov/html/bkncb1/includes/scripts/calendar.js'
    ]

    def parse(self, response):
        for item in parse_calendarjs(response):
            yield item
