

from bs4 import BeautifulSoup
from .logger import log_info, log_error

import os

SELECTORS_CONFIG_FILE = os.path.join(os.path.dirname(__file__), 'selectors_config.py')

def auto_detect_selectors(html, keywords):
    try:
        soup = BeautifulSoup(html, 'html.parser')
        potential_containers = []

        for container in soup.find_all(['div', 'li', 'section'], recursive=True):
            text = container.get_text(separator=' ', strip=True).lower()
            if all(keyword.lower() in text for keyword in keywords):
                potential_containers.append(container)

        if not potential_containers:
            log_error("Auto-Selector: No potential containers found.")
            return None

        best_container = max(potential_containers, key=lambda c: len(c.get_text()))
        container_selector = best_container.name
        if best_container.has_attr('class'):
            container_selector += '.' + '.'.join(best_container.get('class'))

        
        title_selector = ''
        price_selector = ''
        link_selector = ''

        title_tag = best_container.find(['h2', 'h3', 'span'], string=lambda text: text and any(k.lower() in text.lower() for k in keywords))
        if title_tag:
            title_selector = title_tag.name
            if title_tag.has_attr('class'):
                title_selector += '.' + '.'.join(title_tag.get('class'))

        price_tag = best_container.find(['div', 'span'], string=lambda text: text and '₹' in text)
        if price_tag:
            price_selector = price_tag.name
            if price_tag.has_attr('class'):
                price_selector += '.' + '.'.join(price_tag.get('class'))

        link_tag = best_container.find('a', href=True)
        if link_tag:
            link_selector = 'a'
            if link_tag.has_attr('class'):
                link_selector += '.' + '.'.join(link_tag.get('class'))

        if not (title_selector and price_selector and link_selector):
            log_error(f"Auto-Selector: Incomplete detection. Title: {title_selector}, Price: {price_selector}, Link: {link_selector}")
            return None

        return {
            'container': container_selector,
            'title': title_selector,
            'price': price_selector,
            'link': link_selector
        }

    except Exception as e:
        log_error(f"Auto-Selector error: {e}")
        return None


def update_selector_config(new_selectors, site_name):
    try:
        with open(SELECTORS_CONFIG_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        def replace_line(lines, key, new_value):
            for idx, line in enumerate(lines):
                if key in line:
                    lines[idx] = f"    '{key}': '{new_value}',\n"
                    break
            return lines

        if site_name == 'flipkart':
            lines = replace_line(lines, 'product_container', new_selectors['container'])
            lines = replace_line(lines, 'product_title', new_selectors['title'])
            lines = replace_line(lines, 'product_price', new_selectors['price'])
            lines = replace_line(lines, 'product_link', new_selectors['link'])
            log_info(
                f"\nFlipkart selectors updated dynamically!\n"
                f"Container: {new_selectors['container']}\n"
                f"Title: {new_selectors['title']}\n"
                f"Price: {new_selectors['price']}\n"
                f"Link: {new_selectors['link']}"
            )

        elif site_name == 'amazon':
            lines = replace_line(lines, 'product_container', new_selectors['container'])
            lines = replace_line(lines, 'product_title', new_selectors['title'])
            lines = replace_line(lines, 'product_price_whole', new_selectors['price'])
            lines = replace_line(lines, 'product_price_fraction', '')
            lines = replace_line(lines, 'product_link', new_selectors['link'])
            log_info(
                f"\nAmazon selectors updated dynamically!\n"
                f"Container: {new_selectors['container']}\n"
                f"Title: {new_selectors['title']}\n"
                f"Price: {new_selectors['price']}\n"
                f"Link: {new_selectors['link']}"
            )

        with open(SELECTORS_CONFIG_FILE, 'w', encoding='utf-8') as f:
            f.writelines(lines)

        log_info(f"{site_name.capitalize()} selectors written to selectors_config.py ✅")

    except Exception as e:
        log_error(f"Failed to update selectors_config.py: {e}")
