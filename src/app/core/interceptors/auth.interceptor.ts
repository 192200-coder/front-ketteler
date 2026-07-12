import { HttpInterceptorFn } from '@angular/common/http';
import { safeGetItem } from '../utils/storage.util';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = safeGetItem('ck_token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
