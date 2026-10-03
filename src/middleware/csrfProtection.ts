import { Request, Response, NextFunction } from 'express';

/**
 * Enforces anti-CSRF measures by verifying that all state-changing requests 
 * (POST, PUT, PATCH, DELETE) carry a custom header (e.g., X-Requested-With).
 * Standard cross-origin requests cannot easily set custom headers without passing a CORS preflight.
 */
export const requireCsrfHeader = (req: Request, res: Response, next: NextFunction) => {
  // Only apply to state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  // Skip CSRF check for public auth endpoints (like login)
  if (req.path === '/auth/login' || req.path === '/api/auth/login') {
    return next();
  }
  
  if (stateChangingMethods.includes(req.method)) {
    // Check for standard anti-CSRF custom headers
    const hasRequestedWith = req.headers['x-requested-with'] === 'XMLHttpRequest';
    const hasCustomHeader = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
    
    // If the request uses a Bearer token in the Authorization header, CSRF is naturally mitigated 
    // because the token is manually attached via frontend JavaScript, proving origin intent.
    const hasBearer = req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer ');

    if (!hasRequestedWith && !hasCustomHeader && !hasBearer) {
      return res.status(403).json({ 
        message: 'Forbidden: Missing Anti-CSRF Header. State-changing requests must include X-Requested-With, X-CSRF-Token, or use Bearer Authorization.' 
      });
    }
  }

  next();
};
