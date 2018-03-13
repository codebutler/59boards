import re
from datetime import date, datetime
from time import mktime

from bs4 import BeautifulSoup
from parsedatetime import parsedatetime
from pytz import timezone

from cbmap.items import CalEventItem


def parse_calendarjs(response):
    for line in response.text.splitlines():
        if line.startswith('calEvents[calEvents.length]'):
            js_str = line.split(' = ')[1].lstrip()
            js_str = bytes(js_str, 'utf-8').decode("unicode_escape")
            js_str = re.sub(r'[\'"];?$', '', js_str)
            js_str = re.sub(r'^[\'"]', '', js_str)

            parts = js_str.split('|')

            event_date = parse_date(parts[0])
            event_time, event_summary = parse_text(parts[1])

            if event_time:
                event_dt = timezone('US/Eastern').localize(datetime.combine(event_date, event_time))
            else:
                event_dt = event_date

            yield CalEventItem(
                date=event_dt,
                summary=event_summary,
                location='',
                description=''
            )


def parse_date(text) -> date:
    return datetime.strptime(text, '%m/%d/%Y').date()  # 2/8/2017


cal = parsedatetime.Calendar()


def parse_text(text) -> (str, str, str):
    event_time = None
    soup = BeautifulSoup(text, 'html.parser')
    for token in soup.stripped_strings:
        result, flag = cal.parse(token)
        if flag == 2:
            event_time = datetime.fromtimestamp(mktime(result)).time()
            break
    return event_time, ' '.join(soup.stripped_strings)
