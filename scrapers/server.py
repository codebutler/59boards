import os
import threading
import time

import schedule


# https://github.com/dbader/schedule/issues/69
class ScheduleThread(threading.Thread):
    def __init__(self, *pargs, **kwargs):
        super().__init__(*pargs, daemon=True, name="scheduler", **kwargs)

    def run(self):
        while True:
            schedule.run_pending()
            time.sleep(schedule.idle_seconds())


def scraper_job():
    os.system("python main.py --all")


print("cbmap scraper startup!")

schedule.every(6).hours.do(scraper_job)

schedule_thread = ScheduleThread()
schedule_thread.start()

scraper_job()

schedule_thread.join()
