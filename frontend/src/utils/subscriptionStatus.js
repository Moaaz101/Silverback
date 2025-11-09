/**
 * Get subscription status information for a fighter
 * @param {Object} fighter - Fighter object with subscriptionStatus and sessionsLeft
 * @returns {Object} Status information with text and styling classes
 */
export const getSubscriptionStatus = (fighter) => {
  const status = fighter.subscriptionStatus;
  
  // If we don't have subscription status yet, fall back to sessions only
  if (!status) {
    if (fighter.sessionsLeft > 5) {
      return {
        text: 'Active',
        variant: 'success',
        bgClass: 'bg-green-100',
        textClass: 'text-green-800'
      };
    } else if (fighter.sessionsLeft > 0) {
      return {
        text: 'Low Sessions',
        variant: 'warning',
        bgClass: 'bg-yellow-100',
        textClass: 'text-yellow-800'
      };
    } else {
      return {
        text: 'Expired',
        variant: 'error',
        bgClass: 'bg-red-100',
        textClass: 'text-red-800'
      };
    }
  }
  
  // Check dual expiration system
  if (status.isExpired) {
    return {
      text: 'Expired',
      variant: 'error',
      bgClass: 'bg-red-100',
      textClass: 'text-red-800'
    };
  } else if (status.isExpiringSoon) {
    return {
      text: 'Expiring Soon',
      variant: 'warning',
      bgClass: 'bg-orange-100',
      textClass: 'text-orange-800'
    };
  } else if (fighter.sessionsLeft <= 5 && fighter.sessionsLeft > 0) {
    return {
      text: 'Low Sessions',
      variant: 'warning',
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800'
    };
  } else {
    return {
      text: 'Active',
      variant: 'success',
      bgClass: 'bg-green-100',
      textClass: 'text-green-800'
    };
  }
};
