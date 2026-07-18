import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { safeGetItem, safeRemoveItem } from '../utils/storage.util';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = safeGetItem('ck_token');
  const router = inject(Router);

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && token) {
        safeRemoveItem('ck_token');
        safeRemoveItem('ck_user');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};