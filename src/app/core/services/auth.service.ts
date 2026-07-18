import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage.util';

export interface LoginResponse {
  type: 'success' | 'error' | 'warning' | 'exception';
  listMessage: string[];
  token?: string;
  userId?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'RESIDENTE' | 'GUARDIA';
  firstName?: string;
  surName?: string;
  firstLogin?: boolean;
}

export interface ChangePasswordResponse {
  type: 'success' | 'error' | 'warning' | 'exception';
  listMessage: string[];
}

const TOKEN_KEY = 'ck_token';
const USER_KEY = 'ck_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<LoginResponse | null>(this.loadUser());

  private lastPasswordUsed: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/login`, { email, password }).pipe(
      tap((response) => {
        if (response.type === 'success' && response.token) {
          safeSetItem(TOKEN_KEY, response.token);
          safeSetItem(USER_KEY, JSON.stringify(response));
          this.currentUser.set(response);
          this.lastPasswordUsed = password;
        }
      }),
    );
  }

  changePassword(newPassword: string): Observable<ChangePasswordResponse> {
    const oldPassword = this.lastPasswordUsed ?? '';
    return this.http
      .put<ChangePasswordResponse>(`${API_BASE_URL}/changepassword`, {
        oldPassword,
        newPassword,
      })
      .pipe(
        tap((response) => {
          if (response.type === 'success') {
            this.lastPasswordUsed = newPassword;
            const user = this.currentUser();
            if (user) {
              const updated = { ...user, firstLogin: false };
              safeSetItem(USER_KEY, JSON.stringify(updated));
              this.currentUser.set(updated);
            }
          }
        }),
      );
  }

  logout(): void {
    safeRemoveItem(TOKEN_KEY);
    safeRemoveItem(USER_KEY);
    this.currentUser.set(null);
    this.lastPasswordUsed = null;
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return safeGetItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return this.currentUser()?.role ?? null;
  }

  private loadUser(): LoginResponse | null {
    const raw = safeGetItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  changePasswordAdmin(
    oldPassword: string,
    newPassword: string,
  ): Observable<ChangePasswordResponse> {
    return this.http.put<ChangePasswordResponse>(`${API_BASE_URL}/changepasswordadmin`, {
      oldPassword,
      newPassword,
    });
  }
}
