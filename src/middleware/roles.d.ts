import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
export declare const requireRole: (allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=roles.d.ts.map