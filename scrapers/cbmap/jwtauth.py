from scrapy import signals


class JWTAuthMiddleware(object):

    auth = None

    @classmethod
    def from_crawler(cls, crawler):
        o = cls()
        crawler.signals.connect(o.spider_opened, signal=signals.spider_opened)
        return o

    def spider_opened(self, spider):
        jwt = getattr(spider, 'jwt', '')
        if jwt:
            self.auth = f'Bearer {jwt}'

    def process_request(self, request, spider):
        auth = getattr(self, 'auth', None)
        if auth and b'Authorization' not in request.headers:
            request.headers[b'Authorization'] = auth
