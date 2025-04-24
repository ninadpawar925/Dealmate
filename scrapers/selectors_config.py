

FLIPKART_SELECTORS = {
    'search_url': 'https://www.flipkart.com/search?q={query}',
    'product_container': 'div',
    'product_title': 'span',
    'product_price': 'div.Nx9bqj._4b5DiR',
    'product_link': 'a',
    'base_url': 'https://www.flipkart.com'
}

AMAZON_SELECTORS = {
    'search_url': 'https://www.amazon.in/s?k={query}',
    'product_container': 'div[data-component-type="s-search-result"]',
    'product_title': 'h2 span.a-size-medium',
    'product_price_whole': 'span.a-price-whole',
    'product_price_fraction': 'span.a-price-fraction',
    'product_link': 'h2 a.a-link-normal',
    'base_url': 'https://www.amazon.in'
}
