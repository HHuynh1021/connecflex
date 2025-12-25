// import React from 'react';

// const formatDate = (dateString: string): string => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric',
//     hour: 'numeric',
//     minute: 'numeric',
//     timeZone: 'Europe/Helsinki',
//   });
// };

// export default formatDate;

// formatDate.ts or formatDate.tsx

/**
 * Format UTC datetime to user's local timezone
 * @param dateString - ISO 8601 datetime string from Django (e.g., "2024-12-23T10:30:00Z")
 * @returns Formatted date string in user's local timezone
 */
const formatDate = (dateString: string): string => {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true // This will show AM/PM
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export default formatDate;