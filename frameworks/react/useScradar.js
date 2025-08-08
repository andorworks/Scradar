import { useEffect, useRef } from 'react';
import Scradar from '../../src/scradar.js';

export function useScradar(options = {}) {
  const scradarRef = useRef(null);
  
  useEffect(() => {
    scradarRef.current = new Scradar(options);
    
    return () => {
      if (scradarRef.current) {
        scradarRef.current.destroy();
        scradarRef.current = null;
      }
    };
  }, []);
  
  return scradarRef.current;
}
