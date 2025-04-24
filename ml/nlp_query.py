





import spacy
import logging

logger = logging.getLogger(__name__)


try:
    nlp = spacy.load("en_core_web_sm")
    logger.info("spaCy model 'en_core_web_sm' loaded.")
except OSError:
    logger.error("spaCy model 'en_core_web_sm' not found. Download it: python -m spacy download en_core_web_sm")
    nlp = None
except ImportError:
     logger.error("spaCy not installed? Run 'pip install spacy'")
     nlp = None


def extract_product_entities(query):
    """
    
    """
    if not nlp or not query:
        return None

    try:
        doc = nlp(query)
        entities = {'PRODUCT': [], 'ORG': [], 'CARDINAL': [], 'QUANTITY': [], 'GPE': []} 

        
        for ent in doc.ents:
            
            
            if ent.label_ in entities:
                 entities[ent.label_].append(ent.text)

        
        search_term = query 
        if entities.get('ORG') and entities.get('PRODUCT'):
             search_term = f"{entities['ORG'][0]} {entities['PRODUCT'][0]}" 
        elif entities.get('PRODUCT'):
             search_term = entities['PRODUCT'][0]
        elif entities.get('ORG'): 
             search_term = entities['ORG'][0]

        
        

        logger.info(f"NLP extracted entities: {entities} -> Derived search: '{search_term}'")

        return {
            "original_query": query,
            "derived_search_term": search_term, 
            "entities": entities,
            
        }

    except Exception as e:
        logger.error(f"Error during NLP query processing: {e}")
        return None



if __name__ == '__main__':
    test_queries = [
        "Find the best price for the Apple iPhone 15 Pro 256GB",
        "cheap dell laptops under 50000",
        "sony noise cancelling headphones wh-1000xm5",
        "show me deals on nike running shoes size 10",
    ]
    for q in test_queries:
        result = extract_product_entities(q)
        print(f"\nQuery: '{q}'")
        if result:
            print(f"  -> Derived Term: '{result['derived_search_term']}'")
            print(f"  -> Entities: {result['entities']}")
        else:
            print("  -> NLP processing failed or disabled.")