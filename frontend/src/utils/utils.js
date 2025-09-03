


export const formatTime = (time24h) => {
  // If time is already in 12-hour format or invalid, return as is
  if (!time24h || !time24h.includes(':')) return time24h;
  
  try {
    // Parse hours and minutes from 24h format (e.g., "14:30")
    const [hours24, minutes] = time24h.split(':');
    const hours24Num = parseInt(hours24, 10);
    
    // Convert to 12-hour format
    const period = hours24Num >= 12 ? 'PM' : 'AM';
    const hours12 = hours24Num % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hours12}:${minutes} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time24h; // Return original format if parsing fails
  }
};
