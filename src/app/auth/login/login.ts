import { Component, signal } from '@angular/core';
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
export class LoginComponent {
  showPassword = false;
  buttonText = 'Iniciar sesión';
  email = '';
  password = '';
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
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

        switch (response.role) {
          case 'RESIDENTE':
            this.router.navigate([
              response.firstLogin ? '/residente-cambiar-contra' : '/residente-home',
            ]);
            break;
          case 'ADMIN':
          case 'SUPER_ADMIN':
            this.router.navigate(['/admin-home']);
            break;
          default:
            this.errorMessage.set('Tu cuenta no tiene un rol válido para acceder.');
        }
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
