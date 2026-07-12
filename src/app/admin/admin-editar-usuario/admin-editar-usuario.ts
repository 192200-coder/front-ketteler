import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/config/api.config';

interface UsuarioDetalle {
  idUser: string;
  firstName: string;
  surName: string;
  email: string;
  idResidence: string;
  cellPhoneNumber: number;
  cellPhoneEmergency: number;
  active: boolean;
}

@Component({
  selector: 'app-admin-editar-usuario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-editar-usuario.html',
  styleUrls: ['./admin-editar-usuario.css'],
})
export class AdminEditarUsuarioComponent implements OnInit {
  idUser = '';
  idResidence = '';
  firstName = '';
  surName = '';
  email = '';
  password = ''; // se deja vacío = no se cambia
  cellPhoneNumber: number | null = null;
  cellPhoneEmergency: number | null = null;
  active = true;

  cargando = signal(true);
  guardando = signal(false);
  mensaje = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.idUser = this.route.snapshot.queryParamMap.get('id') ?? '';
    if (!this.idUser) {
      this.mensaje.set('No se especificó qué usuario editar.');
      this.cargando.set(false);
      return;
    }
    this.cargarUsuario();
  }

  private cargarUsuario() {
    this.http.get<{ data: UsuarioDetalle }>(`${API_BASE_URL}/showuser/${this.idUser}`).subscribe({
      next: (res) => {
        const u = res.data;
        if (u) {
          this.idResidence = u.idResidence;
          this.firstName = u.firstName;
          this.surName = u.surName;
          this.email = u.email;
          this.cellPhoneNumber = u.cellPhoneNumber;
          this.cellPhoneEmergency = u.cellPhoneEmergency;
          this.active = u.active;
        }
        this.cargando.set(false);
      },
      error: () => {
        this.mensaje.set('No se pudo cargar la información del usuario.');
        this.cargando.set(false);
      }
    });
  }

  guardarCambios() {
    this.guardando.set(true);

    const body: any = {
      idResidence: this.idResidence,
      firstName: this.firstName,
      surName: this.surName,
      email: this.email,
      cellPhoneNumber: this.cellPhoneNumber ?? 0,
      cellPhoneEmergency: this.cellPhoneEmergency ?? 0
    };

    if (this.password) {
      body.password = this.password;
    }

    this.http.put<{ type: string; listMessage: string[] }>(`${API_BASE_URL}/updateuser/${this.idUser}`, body).subscribe({
      next: (res) => {
        this.guardando.set(false);
        if (res.type === 'success') {
          this.router.navigate(['/admin-gestion-usuarios']);
        } else {
          this.mensaje.set(res.listMessage?.[0] ?? 'No se pudo actualizar el usuario.');
        }
      },
      error: () => {
        this.guardando.set(false);
        this.mensaje.set('No se pudo conectar con el servidor. Intenta nuevamente.');
      }
    });
  }

  toggleEstado() {
    const nuevoEstado = !this.active;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    if (!confirm(`¿Seguro que quieres ${accion} a este usuario?`)) return;

    this.http.patch<{ type: string; listMessage: string[] }>(
      `${API_BASE_URL}/deactivateuser/${this.idUser}`,
      { active: nuevoEstado }
    ).subscribe({
      next: (res) => {
        if (res.type === 'success') {
          this.active = nuevoEstado;
          this.mensaje.set(nuevoEstado ? 'Usuario activado.' : 'Usuario desactivado.');
        } else {
          this.mensaje.set(res.listMessage?.[0] ?? 'No se pudo cambiar el estado.');
        }
      },
      error: () => this.mensaje.set('No se pudo conectar con el servidor.')
    });
  }
}