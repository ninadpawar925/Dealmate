
from google.cloud import vision
import logging

logger = logging.getLogger(__name__)

def identify_product_in_image(image_content):
   
    try:
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=image_content)

        
        response = client.object_localization(image=image)
        objects = response.localized_object_annotations
        logger.info(f"Vision API: Found {len(objects)} objects.")
        if response.error.message:
            raise Exception(f"Vision API Error: {response.error.message}")

        if objects:
             
             
             best_object = max(objects, key=lambda obj: obj.score)
             logger.info(f"Vision API: Best object guess: {best_object.name} (Score: {best_object.score:.2f})")
             
             
             return best_object.name 
        else:
            logger.warning("Vision API: No objects localized in the image.")
            return None

        
        
        

        
        
        
        

    except Exception as e:
        logger.error(f"Error calling Google Cloud Vision API: {e}")
        
        return None


if __name__ == '__main__':
    
    
    try:
        with open('test_image.jpg', 'rb') as image_file:
            content = image_file.read()
            product_name = identify_product_in_image(content)
            if product_name:
                print(f"Identified Product: {product_name}")
            else:
                print("Could not identify product.")
    except FileNotFoundError:
        print("Error: test_image.jpg not found. Cannot run example.")
    except Exception as e:
        print(f"An error occurred: {e}")