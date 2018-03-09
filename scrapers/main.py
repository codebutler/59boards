import argparse

from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings


def run_spiders(spiders=None):
    setting = get_project_settings()
    process = CrawlerProcess(setting)
    if not spiders:
        spiders = process.spiders.list()
    for spider_name in spiders:
        process.crawl(spider_name)
    process.start()


parser = argparse.ArgumentParser(description='CBMap Scrapers!')
parser.add_argument('--all', action='store_true', help='Run all spiders')
parser.add_argument('--spider', action='append', help='Run specified spider')

args = parser.parse_args()

run_spiders(None if args.all else args.spider)
