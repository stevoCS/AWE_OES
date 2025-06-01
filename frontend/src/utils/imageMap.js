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
import mountainbikeImg from '../assets/mountainbike.png';
import vacuumImg from '../assets/vacuum-cleaner.png';
import segwayImg from '../assets/segway.png';
import webcamImg from '../assets/webcam.png';
import podcastMicImg from '../assets/podcast-microphone-kit.png';
import agvImg from '../assets/Automated Guided Vehicle.png';

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
  '/src/assets/mountainbike.png': mountainbikeImg,
  '/src/assets/vacuum-cleaner.png': vacuumImg,
  '/src/assets/segway.png': segwayImg,
  '/src/assets/webcam.png': webcamImg,
  '/src/assets/podcast-microphone-kit.png': podcastMicImg,
  '/src/assets/Automated Guided Vehicle.png': agvImg,
  // Add alternative paths for backward compatibility
  'laptop.png': laptopImg,
  'Phone.png': phoneImg,
  'Speaker.png': speakerImg,
  'smartwatch.png': smartwatchImg,
  'Wireless mouse.png': mouseImg,
  'Well charger.png': chargerImg,
  'VR Headset.png': vrImg,
  'Keyboard.png': keyboardImg,
  'mountainbike.png': mountainbikeImg,
  'vacuum-cleaner.png': vacuumImg,
  'segway.png': segwayImg,
  'webcam.png': webcamImg,
  'podcast-microphone-kit.png': podcastMicImg,
  'Automated Guided Vehicle.png': agvImg,
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
  // exact match
  'UltraBook Pro 15': laptopImg,
  'TechPhone X': phoneImg,
  'SoundMax Speaker': speakerImg,
  'SmartWatch Pro': smartwatchImg,
  'Wireless Pro Mouse': mouseImg,
  'Fast Charger 65W': chargerImg,
  'VR Headset Pro': vrImg,
  'Mechanical Keyboard': keyboardImg,
  
  // new products exact match
  'Mountain Bike Pro X1': mountainbikeImg,
  'Smart Vacuum Cleaner Robot': vacuumImg,
  'Electric Segway Scooter': segwayImg,
  '4K Webcam Pro': webcamImg,
  'Podcast Microphone Kit': podcastMicImg,
  'Automated Guided Vehicle': agvImg,
  
  // english product name match (backend data)
  'Premium Ultrabook Laptop': laptopImg,
  'Smartphone': phoneImg,
  'Wireless Bluetooth Speaker': speakerImg,
  'Smart Fitness Watch': smartwatchImg,
  'Wireless Gaming Mouse': mouseImg,
  'Universal Phone Charger': chargerImg,
  'Virtual Reality Headset': vrImg,
  'Gaming Mechanical Keyboard': keyboardImg,
  'iPhone 15 Pro': phoneImg,
  'MacBook Pro M3': laptopImg,
  'SoundWave Speaker': speakerImg,
  'Smart Watch Pro': smartwatchImg,
  'Wireless Mouse': mouseImg,
  
  // Partial keyword matching (lowercase)
  'ultrabook': laptopImg,
  'laptop': laptopImg,
  'premium': laptopImg,
  'macbook': laptopImg,
  'phone': phoneImg,
  'smartphone': phoneImg,
  'iphone': phoneImg,
  'speaker': speakerImg,
  'bluetooth': speakerImg,
  'soundmax': speakerImg,
  'soundwave': speakerImg,
  'watch': smartwatchImg,
  'smartwatch': smartwatchImg,
  'fitness': smartwatchImg,
  'mouse': mouseImg,
  'gaming': mouseImg,
  'wireless': mouseImg, // default wireless points to mouse
  'charger': chargerImg,
  'universal': chargerImg,
  'fast': chargerImg,
  'vr': vrImg,
  'headset': vrImg,
  'virtual': vrImg,
  'reality': vrImg,
  'keyboard': keyboardImg,
  'mechanical': keyboardImg,
  'bike': mountainbikeImg,
  'mountain': mountainbikeImg,
  'bicycle': mountainbikeImg,
  'cycle': mountainbikeImg,
  'vacuum': vacuumImg,
  'cleaner': vacuumImg,
  'robot': vacuumImg, // default robot points to vacuum cleaner
  'segway': segwayImg,
  'scooter': segwayImg,
  'electric': segwayImg, // default electric points to segway
  'webcam': webcamImg,
  'camera': webcamImg,
  '4k': webcamImg,
  'streaming': webcamImg,
  'microphone': podcastMicImg,
  'mic': podcastMicImg,
  'podcast': podcastMicImg,
  'recording': podcastMicImg,
  'studio': podcastMicImg,
  'agv': agvImg,
  'automated': agvImg,
  'guided': agvImg,
  'vehicle': agvImg,
  'industrial': agvImg,
  
  // Generic matching patterns
  'pro': laptopImg, // default pro points to laptop
  'tech': phoneImg, // default tech points to phone
  'smart': smartwatchImg, // default smart points to smartwatch
};

// Dynamic image cache for admin uploaded images
const dynamicImageCache = new Map();

// Function to add dynamically uploaded image to the system
export const addDynamicImage = (imagePath, imageUrl) => {
  console.log('Adding dynamic image mapping:', imagePath, '->', imageUrl);
  dynamicImageCache.set(imagePath, imageUrl);
  // Also add to the main imageMap for immediate access
  imageMap[imagePath] = imageUrl;
};

// Function to check if an image path represents a dynamically uploaded file
const isDynamicImagePath = (imagePath) => {
  return imagePath && (
    imagePath.includes('/assets/products/') ||
    imagePath.startsWith('/src/assets/products/') ||
    imagePath.startsWith('/src/assets/') ||
    imagePath.startsWith('http') ||
    dynamicImageCache.has(imagePath)
  );
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
    productId: item.productId,
    product_name: item.product_name,
    images: item.images,
    image: item.image
  });
  
  // Method 1: Try to get image from item.images array
  if (item.images && item.images.length > 0) {
    const imagePath = item.images[0];
    console.log('Checking images array, first image:', imagePath);
    
    // Check if it's a dynamic (admin uploaded) image
    if (isDynamicImagePath(imagePath)) {
      console.log('Found dynamic image path:', imagePath);
      
      // If it's a full URL, return as is
      if (imagePath.startsWith('http')) {
        console.log('Returning full URL:', imagePath);
        return imagePath;
      }
      
      // Fix the path: Convert /src/assets/ to /assets/products/
      if (imagePath.startsWith('/src/assets/')) {
        const filename = imagePath.split('/').pop();
        const correctedPath = `/assets/products/${filename}`;
        console.log('Corrected image path:', correctedPath);
        return correctedPath;
      }
      
      // If it already starts with /assets/products/, return as is
      if (imagePath.startsWith('/assets/products/')) {
        console.log('Returning correct public path:', imagePath);
        return imagePath;
      }
      
      // Check dynamic cache
      if (dynamicImageCache.has(imagePath)) {
        const cachedUrl = dynamicImageCache.get(imagePath);
        console.log('Found cached dynamic image:', cachedUrl);
        return cachedUrl;
      }
    }
    
    // Look up in static image mapping
    const imageUrl = imageMap[imagePath];
    if (imageUrl) {
      console.log('Found image in static imageMap:', imageUrl);
      return imageUrl;
    }
  }
  
  // Method 2: Try to get image from item.image property
  if (item.image && item.image !== '/api/placeholder/150/150') {
    // Check if it's a dynamic image
    if (isDynamicImagePath(item.image)) {
      console.log('Found dynamic image in item.image:', item.image);
      
      if (item.image.startsWith('http')) {
        return item.image;
      }
      
      // Fix the path: Convert /src/assets/ to /assets/products/
      if (item.image.startsWith('/src/assets/')) {
        const filename = item.image.split('/').pop();
        const correctedPath = `/assets/products/${filename}`;
        console.log('Corrected item.image path:', correctedPath);
        return correctedPath;
      }
      
      if (item.image.startsWith('/assets/products/')) {
        return item.image;
      }
      
      if (dynamicImageCache.has(item.image)) {
        return dynamicImageCache.get(item.image);
      }
    }
    
    const imageUrl = imageMap[item.image];
    if (imageUrl) {
      console.log('Found image from item.image property:', imageUrl);
      return imageUrl;
    }
  }
  
  // Method 3: Try product ID mapping
  if (item.id || item.productId) {
    const productId = item.id || item.productId;
    const imageUrl = productIdImageMap[productId.toString()];
    if (imageUrl) {
      console.log('Found image by product ID:', productId, '->', imageUrl);
      return imageUrl;
    }
  }
  
  // Method 4: Try product name mapping (multiple variations)
  const productNames = [
    item.name,
    item.product_name,
  ].filter(Boolean);
  
  for (const productName of productNames) {
    if (!productName) continue;
    
    // Direct name match
    let imageUrl = productNameImageMap[productName];
    if (imageUrl) {
      console.log('Found image by exact product name:', productName, '->', imageUrl);
      return imageUrl;
    }
    
    // Partial name match (case-insensitive) - improved algorithm
    const nameLower = productName.toLowerCase();
    console.log('Trying partial match for:', nameLower);
    
    // First try to match longer keywords
    const sortedKeys = Object.keys(productNameImageMap)
      .filter(key => key.length > 3) // Filter out keywords that are too short
      .sort((a, b) => b.length - a.length); // Sort by length in descending order
    
    for (const key of sortedKeys) {
      const keyLower = key.toLowerCase();
      if (nameLower.includes(keyLower) || keyLower.includes(nameLower)) {
        console.log('Found image by partial product name match:', nameLower, 'matches', keyLower, '->', productNameImageMap[key]);
        return productNameImageMap[key];
      }
    }
    
    // If long keywords don't match, try short keywords
    const shortKeys = Object.keys(productNameImageMap)
      .filter(key => key.length <= 3);
    
    for (const key of shortKeys) {
      const keyLower = key.toLowerCase();
      if (nameLower.includes(keyLower)) {
        console.log('Found image by short keyword match:', nameLower, 'contains', keyLower, '->', productNameImageMap[key]);
        return productNameImageMap[key];
      }
    }
  }
  
  // Method 5: Intelligent guessing based on common patterns
  const allNames = productNames.join(' ').toLowerCase();
  if (allNames.includes('laptop') || allNames.includes('book') || allNames.includes('computer') || allNames.includes('macbook')) {
    console.log('Intelligent guess: laptop image for:', allNames);
    return laptopImg;
  }
  if (allNames.includes('phone') || allNames.includes('mobile') || allNames.includes('cell') || allNames.includes('iphone')) {
    console.log('Intelligent guess: phone image for:', allNames);
    return phoneImg;
  }
  if (allNames.includes('speaker') || allNames.includes('audio') || allNames.includes('sound')) {
    console.log('Intelligent guess: speaker image for:', allNames);
    return speakerImg;
  }
  if (allNames.includes('watch') || allNames.includes('fitness') || allNames.includes('wearable')) {
    console.log('Intelligent guess: smartwatch image for:', allNames);
    return smartwatchImg;
  }
  if (allNames.includes('mouse') || allNames.includes('click')) {
    console.log('Intelligent guess: mouse image for:', allNames);
    return mouseImg;
  }
  if (allNames.includes('charger') || allNames.includes('power') || allNames.includes('cable')) {
    console.log('Intelligent guess: charger image for:', allNames);
    return chargerImg;
  }
  if (allNames.includes('vr') || allNames.includes('virtual') || allNames.includes('headset')) {
    console.log('Intelligent guess: VR headset image for:', allNames);
    return vrImg;
  }
  if (allNames.includes('keyboard') || allNames.includes('typing') || allNames.includes('mechanical')) {
    console.log('Intelligent guess: keyboard image for:', allNames);
    return keyboardImg;
  }
  if (allNames.includes('bike') || allNames.includes('bicycle') || allNames.includes('mountain') || allNames.includes('cycle')) {
    console.log('Intelligent guess: mountain bike image for:', allNames);
    return mountainbikeImg;
  }
  if (allNames.includes('vacuum') || allNames.includes('cleaner') || allNames.includes('robot')) {
    console.log('Intelligent guess: vacuum cleaner image for:', allNames);
    return vacuumImg;
  }
  if (allNames.includes('segway') || allNames.includes('scooter') || allNames.includes('electric')) {
    console.log('Intelligent guess: segway scooter image for:', allNames);
    return segwayImg;
  }
  if (allNames.includes('webcam') || allNames.includes('camera') || allNames.includes('4k') || allNames.includes('streaming')) {
    console.log('Intelligent guess: webcam image for:', allNames);
    return webcamImg;
  }
  if (allNames.includes('microphone') || allNames.includes('mic') || allNames.includes('podcast') || allNames.includes('recording')) {
    console.log('Intelligent guess: podcast microphone image for:', allNames);
    return podcastMicImg;
  }
  if (allNames.includes('agv') || allNames.includes('automated') || allNames.includes('guided') || allNames.includes('vehicle') || allNames.includes('industrial')) {
    console.log('Intelligent guess: AGV image for:', allNames);
    return agvImg;
  }
  
  // If no image found, log the issue and return null
  console.warn('Image not found for item:', {
    id: item.id,
    name: item.name,
    product_name: item.product_name,
    productId: item.productId,
    images: item.images,
    image: item.image,
    availableImageMappings: Object.keys(imageMap),
    availableIdMappings: Object.keys(productIdImageMap),
    availableNameMappings: Object.keys(productNameImageMap),
    dynamicCacheSize: dynamicImageCache.size
  });
  
  return null;
};

// Helper function to get all available images
export const getAllImages = () => {
  return Object.values(imageMap);
};

// Helper function to check if image exists
export const hasImage = (imagePath) => {
  return imagePath && (imageMap[imagePath] !== undefined || dynamicImageCache.has(imagePath) || isDynamicImagePath(imagePath));
};

// Function to clear dynamic cache (useful for testing)
export const clearDynamicImageCache = () => {
  dynamicImageCache.clear();
  console.log('Dynamic image cache cleared');
};

// Function to get cache status
export const getDynamicImageCacheInfo = () => {
  return {
    size: dynamicImageCache.size,
    keys: Array.from(dynamicImageCache.keys())
  };
};

export default imageMap; 