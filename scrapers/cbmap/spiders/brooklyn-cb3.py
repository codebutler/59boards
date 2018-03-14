import json
import os
import urllib.parse
from datetime import datetime

import scrapy

from cbmap.items import CalEventItem

DEV_TABULA_URL = 'http://localhost:4000/scrape'
DEV_TABULA_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0YWJ1bGFzZXJ2ZXIiLCJpYX' \
                   'QiOjE1MjEwNTkyNTUsImV4cCI6MTU1MjU5NTI2NiwiYXVkIjoidGFidWxhc2VydmVyIiwic' \
                   '3ViIjoidGFidWxhc2VydmVyIn0.d_3_pDKA4ihwriTkueA_u5CDuntndY1Vqly37jVJXcU'


class BrooklynCb3Spider(scrapy.Spider):
    name = 'brooklyn-cb3'
    title = 'Brooklyn CB3'

    tabula_url = os.environ.get('TABULA_URL', DEV_TABULA_URL)
    jwt = os.environ.get('TABULA_TOKEN', DEV_TABULA_TOKEN)

    pdf_url = 'http://www1.nyc.gov/assets/brooklyncb3/downloads/pdf/committee_meetings_2018_calendar.pdf'

    start_urls = [
        f'{tabula_url}/?{urllib.parse.urlencode({"url":pdf_url})}'
    ]

    def parse(self, response):
        pdf = json.loads(response.body_as_unicode())

        data = pdf['pages'][0]['tables'][0]['data']
        for event in data:
            committee = event['COMMITTEE']
            chair = event['CHAIR/VICE-CHAIR/CO-CHAIR']
            time = event['TIME']
            date = event['DATE']

            event_time = datetime.strptime(time, '%I:%M %p').time()
            event_date = datetime.strptime(date, '%d-%b-%y').date()
            event_dt = datetime.combine(event_date, event_time)

            yield CalEventItem(
                date=event_dt,
                summary=committee,
                description=chair,
                location=None
            )

