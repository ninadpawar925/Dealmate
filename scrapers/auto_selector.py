import re
import logging
import os

SELECTORS_CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'selectors_config.py')

def auto_detect_selectors(html, keywords=None):
    if not html:
        return None

    keywords = keywords or []
    container_selector = None
    title_selector = None
    price_selector = None
    link_selector = None

    try:
        
        container_match = re.search(r'<div[^>]*class="([^"]+)"', html)
        container_selector = f"div.{container_match.group(1).strip().replace(' ', '.')}" if container_match else 'div'

        
        title_match = re.search(r'<span[^>]*class="([^"]+)"[^>]*>([^<]*({}[^<]*)+)</span>'.format('|'.join(keywords)), html, re.IGNORECASE)
        title_selector = f"span.{title_match.group(1).strip().replace(' ', '.')}" if title_match else 'span'

        
        price_match = re.search(r'<div[^>]*class="([^"]+)"[^>]*>\s*₹[\d,]+', html)
        price_selector = f"div.{price_match.group(1).strip().replace(' ', '.')}" if price_match else None

        
        link_match = re.search(r'<a[^>]*class="([^"]+)"[^>]*href="', html)
        link_selector = f"a.{link_match.group(1).strip().replace(' ', '.')}" if link_match else 'a'

        logging.info(f"\nContainer: {container_selector}\nTitle: {title_selector}\nPrice: {price_selector}\nLink: {link_selector}")

    except Exception as e:
        logging.error(f"Auto-detect selectors error: {e}")
        return None

    if container_selector and title_selector and price_selector and link_selector:
        return {
            'container': container_selector,
            'title': title_selector,
            'price': price_selector,
            'link': link_selector
        }

    return None

def update_selector_config(new_selectors, site='flipkart'):
    logging.info(f"Updating selectors for {site}...")

    try:
        with open(SELECTORS_CONFIG_PATH, 'r', encoding='utf-8') as file:
            lines = file.readlines()

        site_upper = site.upper()
        inside_block = False
        new_lines = []

        for line in lines:
            if line.strip().startswith(f"{site_upper}_SELECTORS ="):
                inside_block = True

            if inside_block and line.strip().startswith('}'):
                inside_block = False

            if inside_block:
                if "'product_container'" in line:
                    line = f"    'product_container': '{new_selectors['container']}',\n"
                elif "'product_title'" in line:
                    line = f"    'product_title': '{new_selectors['title']}',\n"
                elif "'product_price'" in line or "'product_price_whole'" in line:
                    line = f"    'product_price': '{new_selectors['price']}',\n"
                elif "'product_link'" in line:
                    line = f"    'product_link': '{new_selectors['link']}',\n"

            new_lines.append(line)

        with open(SELECTORS_CONFIG_PATH, 'w', encoding='utf-8') as file:
            file.writelines(new_lines)

        logging.info(f"{site.capitalize()} selectors written to selectors_config.py ✅")

    except Exception as e:
        logging.error(f"Failed to update selectors_config.py: {e}")
