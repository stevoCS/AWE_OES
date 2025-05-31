// Product image mapping utility
// Maps product image paths to actual imported image files

// Import all product images
import laptopImg from '../assets/laptop.png';
import phoneImg from '../assets/Phone.png';
import speakerImg from '../assets/Speaker.png';
import smartwatchImg from '../assets/smartwatch.png';
import mouseImg from '../assets/Wireless mouse.png';
import chargerImg from '../assets/Well charger.png';
import vrImg from '../assets/VR Headset.png';
import keyboardImg from '../assets/Keyboard.png';

// Create image mapping
export const imageMap = {
  '/src/assets/laptop.png': laptopImg,
  '/src/assets/Phone.png': phoneImg,
  '/src/assets/Speaker.png': speakerImg,
  '/src/assets/smartwatch.png': smartwatchImg,
  '/src/assets/Wireless mouse.png': mouseImg,
  '/src/assets/Well charger.png': chargerImg,
  '/src/assets/VR Headset.png': vrImg,
  '/src/assets/Keyboard.png': keyboardImg,
  // Add alternative paths for backward compatibility
  'laptop.png': laptopImg,
  'Phone.png': phoneImg,
  'Speaker.png': speakerImg,
  'smartwatch.png': smartwatchImg,
  'Wireless mouse.png': mouseImg,
  'Well charger.png': chargerImg,
  'VR Headset.png': vrImg,
  'Keyboard.png': keyboardImg,
};

// Product ID to image mapping (for better fallback support)
export const productIdImageMap = {
  '1': laptopImg,           // UltraBook Pro 15
  '2': phoneImg,            // TechPhone X
  '3': speakerImg,          // SoundMax Speaker
  '4': smartwatchImg,       // SmartWatch Pro
  '5': mouseImg,            // Wireless Pro Mouse
  '6': chargerImg,          // Fast Charger 65W
  '7': vrImg,               // VR Headset Pro
  '8': keyboardImg,         // Mechanical Keyboard
};

// Product name to image mapping (for better fallback support)
export const productNameImageMap = {
  'UltraBook Pro 15': laptopImg,
  'TechPhone X': phoneImg,
  'SoundMax Speaker': speakerImg,
  'SmartWatch Pro': smartwatchImg,
  'Wireless Pro Mouse': mouseImg,
  'Fast Charger 65W': chargerImg,
  'VR Headset Pro': vrImg,
  'Mechanical Keyboard': keyboardImg,
  // Add partial name matching
  'ultrabook': laptopImg,
  'laptop': laptopImg,
  'phone': phoneImg,
  'speaker': speakerImg,
  'watch': smartwatchImg,
  'mouse': mouseImg,
  'charger': chargerImg,
  'vr': vrImg,
  'headset': vrImg,
  'keyboard': keyboardImg,
};

// Helper function to get product image URL
export const getProductImageUrl = (item) => {
  if (!item) {
    console.log('getProductImageUrl: No item provided');
    return null;
  }
  
  console.log('getProductImageUrl called with item:', {
    id: item.id,
    name: item.name,
    images: item.images,
    image: item.image
  });
  
  // Method 1: Try to get image from item.images array
  if (item.images && item.images.length > 0) {
    const imagePath = item.images[0];
    console.log('Checking images array, first image:', imagePath);
    
    // Look up in image mapping
    const imageUrl = imageMap[imagePath];
    if (imageUrl) {
      console.log('Found image in imageMap:', imageUrl);
      return imageUrl;
    }
  }
  
  // Method 2: Try to get image from item.image property
  if (item.image && item.image !== '/api/placeholder/150/150') {
    const imageUrl = imageMap[item.image];
    if (imageUrl) {
      console.log('Found image from item.image property:', imageUrl);
      return imageUrl;
    }
  }
  
  // Method 3: Try product ID mapping
  if (item.id) {
    const imageUrl = productIdImageMap[item.id.toString()];
    if (imageUrl) {
      console.log('Found image by product ID:', item.id, '->', imageUrl);
      return imageUrl;
    }
  }
  
  // Method 4: Try product name mapping
  if (item.name) {
    // Direct name match
    let imageUrl = productNameImageMap[item.name];
    if (imageUrl) {
      console.log('Found image by exact product name:', item.name, '->', imageUrl);
      return imageUrl;
    }
    
    // Partial name match (case-insensitive)
    const nameLower = item.name.toLowerCase();
    for (const [key, img] of Object.entries(productNameImageMap)) {
      if (nameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nameLower)) {
        console.log('Found image by partial product name match:', nameLower, 'matches', key, '->', img);
        return img;
      }
    }
  }
  
  // If no image found, log the issue and return null
  console.warn('Image not found for item:', {
    id: item.id,
    name: item.name,
    images: item.images,
    image: item.image,
    availableImageMappings: Object.keys(imageMap),
    availableIdMappings: Object.keys(productIdImageMap),
    availableNameMappings: Object.keys(productNameImageMap)
  });
  
  return null;
};

// Helper function to get all available images
export const getAllImages = () => {
  return Object.values(imageMap);
};

// Helper function to check if image exists
export const hasImage = (imagePath) => {
  return imagePath && imageMap[imagePath] !== undefined;
};

export default imageMap; 