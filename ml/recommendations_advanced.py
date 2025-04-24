



import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)



SIMULATED_PRODUCTS = [
    {'id': 'p001', 'name': 'iPhone 15 Blue 128GB', 'description': 'Latest Apple smartphone blue color 128gb storage A16 bionic chip', 'category': 'phone'},
    {'id': 'p002', 'name': 'Samsung S24 Ultra Gray 256GB', 'description': 'Samsung flagship android smartphone gray color 256gb storage powerful camera S-Pen', 'category': 'phone'},
    {'id': 'p003', 'name': 'Dell XPS 13 Laptop', 'description': 'Dell ultrabook laptop lightweight windows 13-inch intel core i7', 'category': 'laptop'},
    {'id': 'p004', 'name': 'MacBook Air M2', 'description': 'Apple laptop macbook air lightweight M2 chip retina display', 'category': 'laptop'},
    {'id': 'p005', 'name': 'Sony WH-1000XM5 Headphones', 'description': 'Sony wireless bluetooth headphones noise cancelling audio quality over-ear', 'category': 'audio'},
    {'id': 'p006', 'name': 'Apple AirPods Pro 2', 'description': 'Apple wireless bluetooth earbuds noise cancelling spatial audio lightning case', 'category': 'audio'},
    {'id': 'rec_chg01', 'name': "Fast Wireless Charging Pad", 'description': 'Qi wireless charger pad fast charging for phone iphone samsung', 'category': 'phone_accessory'},
    {'id': 'rec_mse01', 'name': "Ergonomic Wireless Mouse", 'description': 'Computer mouse wireless bluetooth ergonomic design office use', 'category': 'laptop_accessory'},
    
]
products_df = pd.DataFrame(SIMULATED_PRODUCTS)
products_df['description'] = products_df['description'].fillna('') 





tfidf_vectorizer = TfidfVectorizer(stop_words='english')
try:
    
    tfidf_matrix = tfidf_vectorizer.fit_transform(products_df['description'])
    
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    logger.info("TF-IDF matrix and cosine similarity calculated.")
except Exception as e:
    logger.error(f"Error initializing TF-IDF/Cosine Sim: {e}")
    tfidf_matrix = None
    cosine_sim = None



def get_content_based_recommendations(product_ids, num_recommendations=4):
    """
    Generates content-based recommendations using cosine similarity on product descriptions.

    Args:
        product_ids (list): List of product IDs the user has interacted with (e.g., from recent history).
        num_recommendations (int): Number of recommendations to return.

    Returns:
        list: List of recommended product dictionaries.
    """
    if cosine_sim is None or product_ids is None or not product_ids:
        logger.warning("Cannot generate content-based recs: model not ready or no input IDs.")
        
        return random.sample(SIMULATED_PRODUCTS, min(num_recommendations, len(SIMULATED_PRODUCTS)))

    try:
        
        indices = products_df[products_df['id'].isin(product_ids)].index

        if len(indices) == 0:
            logger.warning(f"Input product IDs {product_ids} not found in catalog for content-based recs.")
            return random.sample(SIMULATED_PRODUCTS, min(num_recommendations, len(SIMULATED_PRODUCTS)))

        
        
        sim_scores = cosine_sim[indices].sum(axis=0)

        
        
        sorted_indices = sim_scores.argsort()[::-1]

        
        recommended_indices = []
        for idx in sorted_indices:
            if idx not in indices:
                recommended_indices.append(idx)
            if len(recommended_indices) >= num_recommendations:
                break

        
        recommendations = products_df.iloc[recommended_indices].to_dict('records')
        logger.info(f"Generated {len(recommendations)} content-based recommendations based on {product_ids}")
        return recommendations

    except Exception as e:
        logger.error(f"Error generating content-based recommendations: {e}")
        
        return random.sample(SIMULATED_PRODUCTS, min(num_recommendations, len(SIMULATED_PRODUCTS)))



if __name__ == '__main__':
    
    seed_product_ids = ['p001', 'p006']
    recs = get_content_based_recommendations(seed_product_ids, num_recommendations=3)
    print("\nContent-Based Recommendations:")
    for rec in recs:
        print(f"- {rec.get('name')} (ID: {rec.get('id')})")