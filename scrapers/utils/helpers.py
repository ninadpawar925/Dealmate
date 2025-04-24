import undetected_chromedriver as uc
import logging
import csv
from models import SearchHistory, db

logger = logging.getLogger()

def setup_logging():
    logging.basicConfig(
        filename='scraper.log',
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
    )

def create_driver():
    options = uc.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-dev-shm-usage')
    return uc.Chrome(options=options)

def get_page_html(driver, url):
    driver.get(url)
    return driver.page_source

def export_history_to_csv():
    with open('history.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'User ID', 'Query', 'Results'])
        for record in SearchHistory.query.all():
            writer.writerow([record.id, record.user_id, record.query, record.results])
