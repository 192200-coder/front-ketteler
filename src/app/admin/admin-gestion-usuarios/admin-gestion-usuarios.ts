import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/config/api.config';
import { esExitoso, primerMensaje } from '../../core/utils/storage.util';

interface UsuarioApi {
  idUser: string;
  firstName: string;
  surName: string;
  email: string;
  role: string;
  active: boolean;
}

@Component({
  selector: 'app-admin-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-gestion-usuarios.html',
  styleUrls: ['./admin-gestion-usuarios.css'],
})
export class AdminGestionUsuariosComponent implements OnInit {
  usuarios = signal<UsuarioApi[]>([]);
  cargando = signal(false);
  mensaje = signal<string | null>(null);

  // Modal de contraseña reseteada
  passwordReseteada = signal<string | null>(null);
  usuarioReseteado = signal<string | null>(null);
  copiado = signal(false);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando.set(true);
    this.http.get<{ data: UsuarioApi[] }>(`${API_BASE_URL}/indexuser`).subscribe({
      next: (res) => {
        this.usuarios.set(res.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.mensaje.set('No se pudo cargar la lista de usuarios.');
        this.cargando.set(false);
      },
    });
  }

  editarUsuario(idUser: string) {
    this.router.navigate(['/admin-editar-usuario'], { queryParams: { id: idUser } });
  }

  eliminarUsuario(idUser: string) {
    if (!confirm('¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer.'))
      return;

    this.http.delete(`${API_BASE_URL}/deleteuser/${idUser}`).subscribe({
      next: (res: any) => {
        if (!esExitoso(res)) {
          this.mensaje.set(primerMensaje(res, 'No se pudo eliminar el usuario.'));
          return;
        }
        this.mensaje.set('Usuario eliminado correctamente.');
        this.cargarUsuarios();
      },
      error: () => this.mensaje.set('No se pudo eliminar el usuario.'),
    });
  }

  resetearPassword(idUser: string, nombreUsuario: string) {
    if (!confirm('Se generará una nueva contraseña temporal para este usuario. ¿Continuar?'))
      return;

    this.http.post(`${API_BASE_URL}/resetpassword/${idUser}`, {}).subscribe({
      next: (res: any) => {
        if (!esExitoso(res)) {
          this.mensaje.set(primerMensaje(res, 'No se pudo restablecer la contraseña.'));
          return;
        }
        this.usuarioReseteado.set(nombreUsuario);
        this.passwordReseteada.set(res.temporalPassword ?? null);
      },
      error: () => this.mensaje.set('No se pudo restablecer la contraseña.'),
    });
  }

  copiarPasswordReseteada() {
    const texto = `Usuario: ${this.usuarioReseteado()}\nContraseña temporal: ${this.passwordReseteada()}`;
    navigator.clipboard.writeText(texto).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    });
  }

  cerrarModalPassword() {
    this.passwordReseteada.set(null);
    this.usuarioReseteado.set(null);
    this.copiado.set(false);
  }

  verDocumentos(idUser: string) {
    this.router.navigate(['/admin-documentos-usuario'], { queryParams: { id: idUser } });
  }

  subirDocumentoEntrada(idUser: string, event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    const formData = new FormData();
    formData.append('idUser', idUser);
    formData.append('file', file);

    this.http.post(`${API_BASE_URL}/registerdocumententer`, formData).subscribe({
      next: (res: any) => {
        if (!esExitoso(res)) {
          this.mensaje.set(primerMensaje(res, 'No se pudo subir el documento de entrada.'));
          return;
        }
        this.mensaje.set('Documento de entrada registrado correctamente.');
      },
      error: () => this.mensaje.set('No se pudo subir el documento de entrada.'),
    });

    input.value = '';
  }
}
