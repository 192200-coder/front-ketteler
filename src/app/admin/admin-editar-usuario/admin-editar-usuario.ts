// src/app/admin/admin-editar-usuario/admin-editar-usuario.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/config/api.config';
import { esExitoso, primerMensaje } from '../../core/utils/storage.util';

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
  password = '';
  cellPhoneNumber: number | null = null;
  cellPhoneEmergency: number | null = null;
  active = true;

  fotosSeleccionadas: File[] = [];
  subiendoFotos = signal(false);
  reportePhotos = signal<{ archivo: string; calidad: string; mensaje: string; nitidez?: number }[]>(
    [],
  );

  cargando = signal(true);
  guardando = signal(false);
  mensaje = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
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
          this.idResidence = u.idResidence ?? '';
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
      },
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
      cellPhoneEmergency: this.cellPhoneEmergency ?? 0,
    };

    if (this.password) {
      body.password = this.password;
    }

    this.http.put(`${API_BASE_URL}/updateuser/${this.idUser}`, body).subscribe({
      next: (res: any) => {
        this.guardando.set(false);
        if (esExitoso(res)) {
          this.router.navigate(['/admin-gestion-usuarios']);
        } else {
          this.mensaje.set(primerMensaje(res, 'No se pudo actualizar el usuario.'));
        }
      },
      error: () => {
        this.guardando.set(false);
        this.mensaje.set('No se pudo conectar con el servidor. Intenta nuevamente.');
      },
    });
  }

  toggleEstado() {
    const nuevoEstado = !this.active;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    if (!confirm(`¿Seguro que quieres ${accion} a este usuario?`)) return;

    this.http
      .patch(`${API_BASE_URL}/deactivateuser/${this.idUser}`, { active: nuevoEstado })
      .subscribe({
        next: (res: any) => {
          if (esExitoso(res)) {
            this.active = nuevoEstado;
            this.mensaje.set(nuevoEstado ? 'Usuario activado.' : 'Usuario desactivado.');
          } else {
            this.mensaje.set(primerMensaje(res, 'No se pudo cambiar el estado.'));
          }
        },
        error: () => this.mensaje.set('No se pudo conectar con el servidor.'),
      });
  }

  onFotosSeleccionadas(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const tiposPermitidos = ['image/jpeg', 'image/png'];
    const archivosValidos: File[] = [];

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      if (!tiposPermitidos.includes(file.type)) {
        this.mensaje.set('Solo se permiten imágenes JPG o PNG.');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.mensaje.set('Cada foto debe pesar máximo 10 MB.');
        continue;
      }
      archivosValidos.push(file);
    }
    this.fotosSeleccionadas = archivosValidos;
  }

  subirFotos() {
    if (!this.fotosSeleccionadas.length || !this.idUser) return;
    this.subiendoFotos.set(true);

    const formData = new FormData();
    formData.append('idUser', this.idUser);
    this.fotosSeleccionadas.forEach((file) => formData.append('files', file));

    this.http.post<any>(`${API_BASE_URL}/registerphoto`, formData).subscribe({
      next: (res) => {
        this.subiendoFotos.set(false);
        if (!esExitoso(res)) {
          this.mensaje.set(primerMensaje(res, 'No se pudieron subir las fotos.'));
          return;
        }
        this.reportePhotos.set(res.photoQualityReport ?? []);
        this.mensaje.set('Fotos procesadas correctamente.');
        this.fotosSeleccionadas = [];
      },
      error: () => {
        this.subiendoFotos.set(false);
        this.mensaje.set('No se pudo conectar con el servidor.');
      },
    });
  }

  badgeCalidad(calidad: string): string {
    if (calidad === 'OPTIMA') return 'badge badge-activo';
    if (calidad === 'ACEPTABLE') return 'badge badge-rol';
    return 'badge badge-ausente';
  }
}
