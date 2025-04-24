import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException
import time
import re
import urllib.parse
import logging

from .selectors_config import FLIPKART_SELECTORS
from .auto_selector import auto_detect_selectors, update_selector_config

logging.basicConfig(level=logging.INFO)

def search_flipkart(product_query: str, max_results: int = 5) -> list[dict]:
    results = []
    logging.info(f"FLIPKART: Fetching URL: {FLIPKART_SELECTORS['search_url'].format(query=product_query)}")

    options = uc.ChromeOptions()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("--window-size=1920,1080")
    options.add_argument('--disable-blink-features=AutomationControlled')

    
    

    driver = uc.Chrome(options=options)

    try:
        search_url = FLIPKART_SELECTORS['search_url'].format(query=urllib.parse.quote_plus(product_query))
        driver.get(search_url)
        time.sleep(3)

        html = driver.page_source

        
        new_selectors = auto_detect_selectors(html, ['iphone', '₹'])
        if new_selectors:
            update_selector_config(new_selectors, 'flipkart')
            container_selector = new_selectors['container']
            title_selector = new_selectors['title']
            price_selector = new_selectors['price']
            link_selector = new_selectors['link']
        else:
            container_selector = FLIPKART_SELECTORS['product_container']
            title_selector = FLIPKART_SELECTORS['product_title']
            price_selector = FLIPKART_SELECTORS['product_price']
            link_selector = FLIPKART_SELECTORS['product_link']

        containers = driver.find_elements(By.CSS_SELECTOR, container_selector)
        logging.info(f"FLIPKART: Found {len(containers)} product containers.")

        count = 0
        for container in containers:
            if count >= max_results:
                break
            try:
                title = container.find_element(By.CSS_SELECTOR, title_selector).text
                price_text = container.find_element(By.CSS_SELECTOR, price_selector).text
                link_element = container.find_element(By.CSS_SELECTOR, link_selector)
                link = link_element.get_attribute('href') or link_element.get_attribute('src')

                price = None
                price_match = re.search(r'[\d,]+', price_text.replace('₹', '').replace(',', ''))
                if price_match:
                    price = float(price_match.group(0).replace(',', ''))

                if title and price and link:
                    results.append({'title': title, 'price': price, 'link': link, 'source': 'Flipkart'})
                    count += 1
            except Exception as e:
                logging.warning(f"FLIPKART: Skipping container due to error: {e}")
                continue

        logging.info(f"FLIPKART: Extracted {len(results)} products.")

    except Exception as e:
        logging.error(f"FLIPKART: Scraper error: {e}")

    finally:
        driver.quit()

    return results
