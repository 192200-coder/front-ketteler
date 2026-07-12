import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/config/api.config';

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
  styleUrls: ['./admin-gestion-usuarios.css']
})
export class AdminGestionUsuariosComponent implements OnInit {
  usuarios = signal<UsuarioApi[]>([]);
  cargando = signal(false);
  mensaje = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando.set(true);
    this.http.get<{ data: UsuarioApi[] }>(`${API_BASE_URL}/indexuser`).subscribe({
      next: (res) => { this.usuarios.set(res.data ?? []); this.cargando.set(false); },
      error: () => { this.mensaje.set('No se pudo cargar la lista de usuarios.'); this.cargando.set(false); }
    });
  }

  editarUsuario(idUser: string) {
    this.router.navigate(['/admin-editar-usuario'], { queryParams: { id: idUser } });
  }

  eliminarUsuario(idUser: string) {
    if (!confirm('¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer.')) return;

    this.http.delete(`${API_BASE_URL}/deleteuser/${idUser}`).subscribe({
      next: () => {
        this.mensaje.set('Usuario eliminado correctamente.');
        this.cargarUsuarios();
      },
      error: () => this.mensaje.set('No se pudo eliminar el usuario.')
    });
  }

  resetearPassword(idUser: string) {
    if (!confirm('Se generará una nueva contraseña temporal y se enviará por correo al usuario. ¿Continuar?')) return;

    this.http.post(`${API_BASE_URL}/resetpassword/${idUser}`, {}).subscribe({
      next: () => this.mensaje.set('Contraseña restablecida. Se envió por correo al usuario.'),
      error: () => this.mensaje.set('No se pudo restablecer la contraseña.')
    });
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
      next: () => this.mensaje.set('Documento de entrada registrado correctamente.'),
      error: () => this.mensaje.set('No se pudo subir el documento de entrada.')
    });

    input.value = '';
  }
}