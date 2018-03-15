import scrapy
from icalendar import Calendar
from pytz import timezone

from cbmap.items import CalEventItem


class BronxCb2Spider(scrapy.Spider):
    name = 'bronx-cb2'
    title = 'Bronx CB2'

    start_urls = [
        'http://bxcb2.org/events/?ical=1&tribe_display=month'
    ]

    def parse(self, response):
        cal = Calendar.from_ical(response.body_as_unicode())
        for vevent in cal.subcomponents:
            event_dt = timezone('US/Eastern').localize(vevent.get('DTSTART').dt)
            event_id = vevent.get('UID')
            event_summary = vevent.get('SUMMARY')
            event_location = vevent.get('LOCATION')
            event_url = vevent.get('URL')
            yield CalEventItem(
                id=event_id,
                date=event_dt,
                summary=event_summary,
                description=event_url,
                location=event_location
            )

