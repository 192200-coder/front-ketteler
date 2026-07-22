import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent implements OnInit {
  showPassword = false;
  buttonText = 'Iniciar sesión';
  email = '';
  password = '';
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Persistencia de sesión: si ya hay una sesión guardada, entrar directo al
    // dashboard sin volver a pedir credenciales. Si el token quedó invalidado
    // (p. ej. se inició sesión en otro celular), la primera llamada al backend
    // dará 401 y el interceptor devolverá a login automáticamente.
    if (this.authService.isAuthenticated()) {
      const user = this.authService.currentUser();
      this.redirigirPorRol(user?.role, user?.firstLogin);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private redirigirPorRol(role: string | undefined, firstLogin: boolean | undefined) {
    switch (role) {
      case 'RESIDENTE':
        this.router.navigate([firstLogin ? '/residente-cambiar-contra' : '/residente-home']);
        break;
      case 'ADMIN':
      case 'SUPER_ADMIN':
        this.router.navigate(['/admin-home']);
        break;
      default:
        this.errorMessage.set('Tu cuenta no tiene un rol válido para acceder.');
    }
  }

  onLogin(event: Event) {
    event.preventDefault();
    this.errorMessage.set(null);
    this.buttonText = 'Verificando...';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.buttonText = 'Iniciar sesión';

        if (response.type !== 'success') {
          this.errorMessage.set(response.listMessage?.[0] ?? 'Credenciales incorrectas');
          return;
        }

        this.redirigirPorRol(response.role, response.firstLogin);
      },
      error: (err: HttpErrorResponse) => {
        this.buttonText = 'Iniciar sesión';
        const body = err.error as { listMessage?: string[] } | undefined;
        this.errorMessage.set(
          body?.listMessage?.[0] ?? 'No se pudo conectar con el servidor. Intenta nuevamente.',
        );
      },
    });
  }
}
