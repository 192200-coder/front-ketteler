// src/app/admin/admin-documentos-usuario/admin-documentos-usuario.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/config/api.config';
import { FormsModule } from '@angular/forms';

interface DocumentoGeneral {
  idDocumentGeneral: string;
  type: string;
  nameDocumentGeneral: string;
  status: string;
  observations?: string;
}

interface DocumentoRenuncia {
  idDocumentResignation: string;
  nameDocumentResignation?: string;
  status: string;
  observations?: string;
}

@Component({
  selector: 'app-admin-documentos-usuario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-documentos-usuario.html',
  styleUrls: [
    '../admin-gestion-usuarios/admin-gestion-usuarios.css',
    './admin-documentos-usuario.css',
  ],
})
export class AdminDocumentosUsuarioComponent implements OnInit {
  idUser = '';
  documentosGenerales = signal<DocumentoGeneral[]>([]);
  documentoRenuncia = signal<DocumentoRenuncia | null>(null);
  cargando = signal(false);
  mensaje = signal<string | null>(null);

  observacionEditando = signal<string | null>(null); // id del doc en edición
  observacionTexto = '';
  mostrarFormSubida = signal(false);
  tipoDocumento = '';
  archivoSeleccionado: File | null = null;
  archivoNombre = '';

  mostrarFormRenuncia = signal(false);
  archivoRenuncia: File | null = null;
  archivoRenunciaNombre = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.idUser = this.route.snapshot.queryParamMap.get('id') ?? '';
    if (this.idUser) this.cargarDocumentos();
  }

  cargarDocumentos() {
    this.cargando.set(true);
    this.http
      .get<{ data: DocumentoGeneral[] }>(`${API_BASE_URL}/documents/${this.idUser}`)
      .subscribe({
        next: (res) => this.documentosGenerales.set(res.data ?? []),
        error: () => {},
      });
    this.http
      .get<{ data: DocumentoRenuncia | null }>(`${API_BASE_URL}/resignation/${this.idUser}`)
      .subscribe({
        next: (res) => {
          this.documentoRenuncia.set(res.data ?? null);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }

  actualizarEstadoGeneral(idDocument: string, status: 'APROBADO' | 'RECHAZADO') {
    this.http
      .patch(`${API_BASE_URL}/documents/${idDocument}/status`, null, {
        params: { status, observations: '' },
      })
      .subscribe({
        next: () => {
          this.mensaje.set('Documento actualizado.');
          this.cargarDocumentos();
        },
        error: () => this.mensaje.set('No se pudo actualizar el documento.'),
      });
  }

  actualizarEstadoRenuncia(idDocument: string, status: 'APROBADO' | 'RECHAZADO') {
    this.http
      .patch(`${API_BASE_URL}/resignation/${idDocument}/status`, null, {
        params: { status, observations: '' },
      })
      .subscribe({
        next: () => {
          this.mensaje.set('Renuncia actualizada.');
          this.cargarDocumentos();
        },
        error: () => this.mensaje.set('No se pudo actualizar la renuncia.'),
      });
  }

  descargarGeneral(idDocument: string) {
    window.open(`${API_BASE_URL}/documents/download/${idDocument}`, '_blank');
  }

  descargarRenuncia(idDocument: string) {
    window.open(`${API_BASE_URL}/resignation/download/${idDocument}`, '_blank');
  }

  volver() {
    this.router.navigate(['/admin-gestion-usuarios']);
  }

  iniciarObservacion(id: string) {
    this.observacionEditando.set(id);
    this.observacionTexto = '';
  }

  cancelarObservacion() {
    this.observacionEditando.set(null);
    this.observacionTexto = '';
  }

  confirmarObservacionGeneral(idDocument: string) {
    this.http
      .patch(`${API_BASE_URL}/documents/${idDocument}/status`, null, {
        params: { status: 'OBSERVADO', observations: this.observacionTexto },
      })
      .subscribe({
        next: () => {
          this.mensaje.set('Observación guardada.');
          this.cancelarObservacion();
          this.cargarDocumentos();
        },
        error: () => this.mensaje.set('No se pudo guardar la observación.'),
      });
  }

  confirmarObservacionRenuncia(idDocument: string) {
    this.http
      .patch(`${API_BASE_URL}/resignation/${idDocument}/status`, null, {
        params: { status: 'OBSERVADO', observations: this.observacionTexto },
      })
      .subscribe({
        next: () => {
          this.mensaje.set('Observación guardada.');
          this.cancelarObservacion();
          this.cargarDocumentos();
        },
        error: () => this.mensaje.set('No se pudo guardar la observación.'),
      });
  }

  toggleFormSubida() {
    this.mostrarFormSubida.set(!this.mostrarFormSubida());
    this.tipoDocumento = '';
    this.archivoSeleccionado = null;
    this.archivoNombre = '';
  }

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!tiposPermitidos.includes(file.type)) {
      this.mensaje.set('Solo PDF, JPG o PNG.');
      input.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.mensaje.set('El archivo no puede superar 10 MB.');
      input.value = '';
      return;
    }

    this.mensaje.set(null);
    this.archivoSeleccionado = file;
    this.archivoNombre = file.name;
  }

  subirDocumentoAdmin() {
    if (!this.archivoSeleccionado || !this.tipoDocumento || !this.idUser) return;

    const formData = new FormData();
    formData.append('idUser', this.idUser);
    formData.append('type', this.tipoDocumento);
    formData.append('file', this.archivoSeleccionado);

    this.http.post(`${API_BASE_URL}/registerdocumentgeneral`, formData).subscribe({
      next: () => {
        this.mensaje.set('Documento subido correctamente.');
        this.toggleFormSubida();
        this.cargarDocumentos();
      },
      error: () => this.mensaje.set('No se pudo subir el documento.'),
    });
  }

  toggleFormRenuncia() {
    this.mostrarFormRenuncia.set(!this.mostrarFormRenuncia());
    this.archivoRenuncia = null;
    this.archivoRenunciaNombre = '';
  }

  onArchivoRenunciaSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!tiposPermitidos.includes(file.type)) {
      this.mensaje.set('Solo PDF, JPG o PNG.');
      input.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.mensaje.set('El archivo no puede superar 10 MB.');
      input.value = '';
      return;
    }

    this.mensaje.set(null);
    this.archivoRenuncia = file;
    this.archivoRenunciaNombre = file.name;
  }

  subirFormatoRenuncia() {
    if (!this.archivoRenuncia || !this.idUser) return;

    const formData = new FormData();
    formData.append('idUser', this.idUser);
    formData.append('file', this.archivoRenuncia);

    this.http.post(`${API_BASE_URL}/assignresignation`, formData).subscribe({
      next: () => {
        this.mensaje.set('Formato de renuncia asignado al residente.');
        this.toggleFormRenuncia();
        this.cargarDocumentos();
      },
      error: () => this.mensaje.set('No se pudo asignar el formato.'),
    });
  }
}
