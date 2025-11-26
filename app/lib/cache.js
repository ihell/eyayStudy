const cache = new Map();

export const cacheService = {
  set(key, value, ttl = 5 * 60 * 1000) { // 5 minutes
    cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  },

  get(key) {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }
    
    return item.value;
  },

  // Untuk cache common questions
  generateKey(question, subject = 'general') {
    return `${subject}:${question.toLowerCase().trim()}`;
  }
};