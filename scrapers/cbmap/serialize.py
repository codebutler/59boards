import datetime

import pytz

DATE_FORMAT = "%Y-%m-%d"
TIME_FORMAT = "%H:%M:%SZ"


# https://github.com/scrapy/scrapy/issues/2087
def json_default(obj):
    if isinstance(obj, datetime.datetime):
        return obj.astimezone(pytz.utc).strftime("%sT%s" % (DATE_FORMAT, TIME_FORMAT))
    elif isinstance(obj, datetime.date):
        return obj.strftime("%s" % DATE_FORMAT)
    else:
        raise TypeError(f"Type {type(obj)} not serializable")
