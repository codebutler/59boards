# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://doc.scrapy.org/en/latest/topics/item-pipeline.html
import hashlib
import json
from datetime import timedelta, datetime
from typing import IO

import os
from icalendar import Calendar, Event
from scrapy.exporters import JsonItemExporter

from cbmap.items import CalEventItem
from cbmap.serialize import json_default

OUTPUT_DIR = os.path.join(os.path.realpath(os.path.dirname(__file__)), '../output')


class IdPipeline(object):
    def process_item(self, item, spider):
        if 'id' not in item:
            item['id'] = hashlib.md5(json.dumps(dict(item), default=json_default).encode('utf-8')).hexdigest()
        return item


class MissingSummaryPipeline(object):
    def process_item(self, item, spider):
        if item.get('summary', None) is None:
            item['summary'] = f'{spider.title} Meeting'
        return item


class CounterPipeline(object):
    count = 0

    def open_spider(self, spider):
        self.count = 0

    def process_item(self, item, spider):
        self.count = self.count + 1

    def close_spider(self, spider):
        if self.count == 0:
            raise Exception(f'No events found for spider: {spider.name}')


class JsonWriterPipeline(object):
    file: IO = None
    exporter: JsonItemExporter = None

    def open_spider(self, spider):
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        self.file = open(os.path.join(OUTPUT_DIR, f'{spider.name}.json'), 'wb')
        self.exporter = JsonItemExporter(
            self.file,
            encoding='utf-8',
            indent=2,
            default=json_default)
        self.exporter.start_exporting()

    def process_item(self, item, spider):
        self.exporter.export_item(item)
        return item

    def close_spider(self, spider):
        self.exporter.finish_exporting()
        self.file.close()


class ICalWriterPipeline(object):
    cal: Calendar = None

    def open_spider(self, spider):
        self.cal = Calendar()
        self.cal.add('X-WR-CALNAME', spider.title)
        self.cal.add('summary', spider.title)
        self.cal.add('prodid', '-//59Boards//59Boards//EN')
        self.cal.add('version', '2.0')

    def process_item(self, item: CalEventItem, spider):
        event = Event()
        event.add('uid', item['id'])
        event.add('summary', self.__add_disclaimer_summary(item['summary']))
        event.add('description', self.__add_disclaimer_description(item['description']))
        event.add('location', item['location'])
        event.add('dtstamp', datetime.utcnow())
        event.add('dtstart', item['date'])
        event.add('dtend', item['date'] + timedelta(hours=2))
        self.cal.add_component(event)
        return item

    def close_spider(self, spider):
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        file = open(os.path.join(OUTPUT_DIR, f'{spider.name}.ics'), 'wb')
        file.write(self.cal.to_ical())
        file.close()

    @staticmethod
    def __add_disclaimer_summary(text: str) -> str:
        return ' '.join((x for x in (text, '[CHECK WEBSITE]') if x))

    @staticmethod
    def __add_disclaimer_description(text: str) -> str:
        disclaimer = 'NOTE: This event was automatically generated, check website to verify.' \
                     '\nReport issues at https://github.com/codebutler/59boards/issues'
        return '\n'.join((x for x in (text, disclaimer) if x))

