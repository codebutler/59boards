import logging
import os

from raven.conf import setup_logging
from raven.handlers.logging import SentryHandler

BOT_NAME = 'cbmap'

SPIDER_MODULES = ['cbmap.spiders']
NEWSPIDER_MODULE = 'cbmap.spiders'

ROBOTSTXT_OBEY = True

DOWNLOADER_MIDDLEWARES = {
    'cbmap.jwtauth.JWTAuthMiddleware': 100
}

ITEM_PIPELINES = {
    'cbmap.pipelines.IdPipeline': 300,
    'cbmap.pipelines.MissingSummaryPipeline': 350,
    'cbmap.pipelines.JsonWriterPipeline': 400,
    'cbmap.pipelines.ICalWriterPipeline': 500,
    'cbmap.pipelines.CounterPipeline': 500,
}

SENTRY_DSN = os.getenv('SENTRY_DSN', None)
if SENTRY_DSN:
    handler = SentryHandler(SENTRY_DSN, level=logging.ERROR)
    setup_logging(handler)
