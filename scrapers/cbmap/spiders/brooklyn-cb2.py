import calendar
import re
from datetime import datetime

import scrapy
from bs4 import BeautifulSoup
from bs4 import Tag
from bs4.element import NavigableString

from cbmap.items import CalEventItem

DAY_NAMES = list(calendar.day_name)
MONTH_NAMES = list(calendar.month_name)[1:]


class BrooklynCb2Spider(scrapy.Spider):
    name = 'brooklyn-cb2'
    title = 'Brooklyn CB2'
    start_urls = [
        'http://www.nyc.gov/html/bkncb2/html/calendar/calendar.shtml'
    ]

    def parse(self, response):
        soup = BeautifulSoup(response.text, 'lxml')
        tag = soup.select('.highlight_bodytext')[0]  # type: Tag
        lines = []
        current = ""

        for child in tag.descendants:  # type: Tag
            if isinstance(child, NavigableString):
                current += child.string.strip('\n').replace(u'\xa0', ' ')
            if child.name == 'br':
                if current:
                    lines.append(current)
                current = ""
        if current:
            lines.append(current)

        lines = [line.strip() for line in lines if line.strip()]

        current_month = None
        current_day = None
        current_year = None
        text_buffer = []

        for index, text in enumerate(lines):
            tokens = re.split(r'\W+', text)
            is_date = tokens[0] in DAY_NAMES and tokens[1] in MONTH_NAMES and tokens[2].isdigit()
            is_year = tokens[0] in MONTH_NAMES and tokens[1].isdigit()
            is_last = index == len(lines) - 1
            if is_date:
                current_month = MONTH_NAMES.index(tokens[1]) + 1
                current_day = int(tokens[2])
            elif is_year:
                current_year = int(tokens[1])
            else:
                text_buffer.append(text)
            if (is_date or is_year or is_last) and text_buffer:
                title = text_buffer[0]
                location = text_buffer[1]
                yield CalEventItem(
                    date=datetime(year=current_year, month=current_month, day=current_day),
                    summary=title,
                    location=location
                )
                text_buffer = []


