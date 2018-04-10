import scrapy
from bs4 import BeautifulSoup
from icalendar import Calendar

from cbmap.items import CalEventItem


class QueensCb3Spider(scrapy.Spider):
    name = 'queens-cb3'
    title = 'Queens CB3'
    start_urls = [
        'http://www.cb3qn.nyc.gov/calendar'
    ]

    def parse(self, response):
        soup = BeautifulSoup(response.text, 'lxml')

        event_links = soup.select('td.feature-cal-inmonth a.feature-cal-inmonth')
        for link in event_links:
            href = link['href']
            if 'c_eid=' in href:
                yield scrapy.Request(response.urljoin(href), callback=self.parse_event)

        depth = response.meta['depth'] or 0
        if depth == 0:
            next_month_link = soup.find('img', src='/wego/images/next_arrow.gif').parent
            request = scrapy.Request(response.urljoin(next_month_link['href']))
            request.meta['depth'] = depth + 1
            yield request

    def parse_event(self, response):
        soup = BeautifulSoup(response.text, 'lxml')

        ical_link = soup.find('a', text='download calendar file')

        request = scrapy.Request(response.urljoin(ical_link['href']), callback=self.parse_event_ical)

        map_link = soup.find('a', text='Map')
        if map_link:
            request.meta['location'] = ', '.join(
                (x.string.strip()
                 for x in reversed(list(map_link.previous_siblings))
                 if x.string and x.string.strip()))

        yield request

    def parse_event_ical(self, response):
        cal = Calendar.from_ical(response.body_as_unicode())
        for vevent in cal.subcomponents:
            event_dt = vevent.get('DTSTART').dt
            event_summary = vevent.get('SUMMARY')
            event_description = vevent.get('DESCRIPTION')
            event_location = response.meta.get('location', None)

            if event_summary == 'Alternate Side Parking Rules Suspended':
                continue

            yield CalEventItem(
                date=event_dt,
                summary=event_summary,
                description=event_description,
                location=event_location
            )

