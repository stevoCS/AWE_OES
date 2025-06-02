/**
* Date and time processing utility functions 
* Unifying the logic of time display on the frontend.
 */

/**
 * Format order date
 * @param {string|Date} dateString - date string or Date object
 * @param {object} options - format options
 * @returns {string} formatted date string
 */
export const formatOrderDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  try {
    let date;
    
    // handle different types of input
    if (dateString instanceof Date) {
      date = dateString;
    } else if (typeof dateString === 'string') {
      // handle ISO string, ensure correct timezone parsing
      if (dateString.includes('T') || dateString.includes('Z')) {
        date = new Date(dateString);
      } else {
        // if it's a simple date string, add timezone information
        date = new Date(dateString + 'T00:00:00.000Z');
      }
    } else {
      return 'Invalid Date';
    }
    
    // check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return dateString.toString();
    }
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // default format options
    const defaultOptions = {
      showRelative: true,
      showTime: true,
      ...options
    };
    
    // time format options
    const timeOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    
    const dateOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    // if relative time display is enabled and within the last 7 days
    if (defaultOptions.showRelative && diffDays <= 7) {
      if (diffDays === 0) {
        return defaultOptions.showTime 
          ? `Today, ${date.toLocaleTimeString('en-US', timeOptions)}`
          : 'Today';
      } else if (diffDays === 1) {
        return defaultOptions.showTime 
          ? `Yesterday, ${date.toLocaleTimeString('en-US', timeOptions)}`
          : 'Yesterday';
      } else {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        return defaultOptions.showTime 
          ? `${dayName}, ${date.toLocaleTimeString('en-US', timeOptions)}`
          : dayName;
      }
    }
    
    // for older dates, display full date
    if (defaultOptions.showTime) {
      return `${date.toLocaleDateString('en-US', dateOptions)}, ${date.toLocaleTimeString('en-US', timeOptions)}`;
    } else {
      return date.toLocaleDateString('en-US', dateOptions);
    }
    
  } catch (error) {
    console.error('Error formatting date:', error, 'Input:', dateString);
    return dateString?.toString() || 'Invalid Date';
  }
};

/**
 * Format simple date (only display date, no time)
 * @param {string|Date} dateString - date string or Date object
 * @returns {string} formatted date string
 */
export const formatSimpleDate = (dateString) => {
  return formatOrderDate(dateString, { showRelative: false, showTime: false });
};

/**
* Format timestamp to relative time
 * @param {string|Date} dateString - date string or Date object
 * @returns {string} relative time string
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const diffTime = now - date;
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return formatSimpleDate(dateString);
    }
    
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid Date';
  }
};

/**
 * Check if the date is today
 * @param {string|Date} dateString - date string or Date object
 * @returns {boolean} whether it is today
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.toDateString() === today.toDateString();
  } catch (error) {
    return false;
  }
};

/**
* Get timezone offset information
 * @returns {object} timezone information
 */
export const getTimezoneInfo = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? '+' : '-';
  
  return {
    offset,
    offsetString: `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    name: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}; 