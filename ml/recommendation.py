
import random
import re
from collections import Counter 
from models import db, User, SearchHistory 
from sqlalchemy import desc, func 
import logging 

logger = logging.getLogger(__name__)




PRODUCT_CATALOG = {
    "phone_accessory": [
        {"id": "rec_chg01", "name": "Fast Wireless Charging Pad", "price": "₹1,999", "image": "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Charger"},
        {"id": "rec_ear01", "name": "True Wireless Earbuds (TWS)", "price": "₹3,499", "image": "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Earbuds"},
        {"id": "rec_pro01", "name": "Tempered Glass Screen Protector", "price": "₹499", "image": "https://via.placeholder.com/300x200/6B7280/FFFFFF?text=ScreenGuard"},
        {"id": "rec_cas01", "name": "Clear Protective Phone Case", "price": "₹699", "image": "https://via.placeholder.com/300x200/78716C/FFFFFF?text=Case"},
    ],
    "laptop_accessory": [
        {"id": "rec_mse01", "name": "Ergonomic Wireless Mouse", "price": "₹999", "image": "https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Mouse"},
        {"id": "rec_slv01", "name": "Neoprene Laptop Sleeve (14-inch)", "price": "₹1,299", "image": "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=LaptopBag"},
        {"id": "rec_hub01", "name": "USB-C Multiport Hub (HDMI, USB-A)", "price": "₹2,499", "image": "https://via.placeholder.com/300x200/10B981/FFFFFF?text=USBHub"},
        {"id": "rec_kbd01", "name": "Compact Bluetooth Keyboard", "price": "₹2,999", "image": "https://via.placeholder.com/300x200/FACC15/FFFFFF?text=Keyboard"},
    ],
    "watch_accessory": [
         {"id": "rec_str01", "name": "Silicone Replacement Watch Strap", "price": "₹799", "image": "https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=WatchStrap"},
         {"id": "rec_sca01", "name": "Bluetooth Smart Scale", "price": "₹2,999", "image": "https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Scale"},
         {"id": "rec_chg02", "name": "Magnetic Watch Charger", "price": "₹1,499", "image": "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=WatchCharger"},
    ],
    "audio": [ 
        {"id": "rec_hdp01", "name": "Over-Ear Studio Headphones", "price": "₹8,999", "image": "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Headphones"},
        {"id": "rec_spk01", "name": "Waterproof Bluetooth Speaker", "price": "₹3,999", "image": "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Speaker"},
    ],
    "default": [ 
        {"id": "rec901", "name": "Popular Streaming Device", "price": "₹3,999", "image": "https://via.placeholder.com/300x200/78716C/FFFFFF?text=StreamDev"},
        {"id": "rec902", "name": "Smart Bulb Set (Color)", "price": "₹1,499", "image": "https://via.placeholder.com/300x200/FACC15/FFFFFF?text=SmartBulb"},
        {"id": "rec021", "name": "Wireless Mouse", "price": "₹999", "image": "https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Mouse"},
        {"id": "rec012", "name": "Bluetooth Earbuds", "price": "₹3,499", "image": "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Earbuds"},
    ]
}


KEYWORD_TO_CATEGORY = {
    "iphone": "phone_accessory", "galaxy": "phone_accessory", "pixel": "phone_accessory",
    "motorola": "phone_accessory", "oneplus": "phone_accessory", "smartphone": "phone_accessory",
    "mobile": "phone_accessory", "phone": "phone_accessory",
    "laptop": "laptop_accessory", "macbook": "laptop_accessory", "notebook": "laptop_accessory",
    "ultrabook": "laptop_accessory", "chromebook": "laptop_accessory",
    "watch": "watch_accessory", "smartwatch": "watch_accessory", "band": "watch_accessory",
    "headphones": "audio", "earbuds": "phone_accessory", "earphones": "phone_accessory", 
    "speaker": "audio", "soundbar": "audio",
    
    "charger": "phone_accessory", 
    "keyboard": "laptop_accessory",
    "mouse": "laptop_accessory",
    "case": "phone_accessory",
    "screen protector": "phone_accessory",
    "tv": "default", 
}

def _get_categories_from_history(search_terms):
    """Extracts implied categories from a list of search terms."""
    categories_found = Counter() 
    terms_processed = 0
    for term in search_terms:
        if not term: continue
        term_lower = term.lower()
        terms_processed += 1
        matched = False
        for keyword, category in KEYWORD_TO_CATEGORY.items():
            
            if re.search(r'\b' + re.escape(keyword) + r'\b', term_lower):
                categories_found[category] += 1
                matched = True
                
        
        
    logger.debug(f"Processed {terms_processed} terms, found categories: {categories_found}")
    
    return [category for category, count in categories_found.most_common()]



def get_recommendations(user_id, num_recommendations=4):
    """
    Generates simple product recommendations based on user's recent search history keywords.
    """
    try:
        
        
        history_query = db.session.query(SearchHistory.search_term)\
            .filter(SearchHistory.user_id == user_id, SearchHistory.search_term.isnot(None))\
            .order_by(SearchHistory.timestamp.desc())\
            .distinct(func.lower(SearchHistory.search_term))\
            .limit(15) 

        recent_terms = [s.search_term for s in history_query.all()]
        logger.info(f"User {user_id} recent distinct search terms: {recent_terms}")

        if not recent_terms:
            logger.info("No search history found, returning default recommendations.")
            defaults = PRODUCT_CATALOG.get('default', [])
            return random.sample(defaults, min(num_recommendations, len(defaults)))

        
        interested_categories = _get_categories_from_history(recent_terms)
        logger.info(f"User {user_id} interested categories: {interested_categories}")

        
        potential_recs = []
        if interested_categories:
            
            for category in interested_categories:
                potential_recs.extend(PRODUCT_CATALOG.get(category, []))
        
        potential_recs.extend(PRODUCT_CATALOG.get('default', []))

        
        recommendations = []
        seen_ids = set()
        recent_terms_lower_set = {term.lower() for term in recent_terms} 

        for rec in potential_recs:
            if len(recommendations) >= num_recommendations: break 

            rec_id = rec.get("id")
            rec_name_lower = rec.get("name", "").lower()

            
            if rec_id and rec_id not in seen_ids:
                 
                 is_recent_search = False
                 for recent_term in recent_terms_lower_set:
                      
                      if len(recent_term) > 3 and recent_term in rec_name_lower:
                          is_recent_search = True
                          break
                 if not is_recent_search:
                    recommendations.append(rec)
                    seen_ids.add(rec_id)

        logger.info(f"Generated {len(recommendations)} recommendations for user {user_id}")
        return recommendations

    except Exception as e:
        logger.error(f"Error generating recommendations for user {user_id}: {e}")
        
        try:
            defaults = PRODUCT_CATALOG.get('default', [])
            return random.sample(defaults, min(num_recommendations, len(defaults)))
        except:
             return [] 