export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      await delay(1000 * Math.pow(2, i));
      console.log(`Retry attempt ${i + 1}...`);
    }
  }
};
