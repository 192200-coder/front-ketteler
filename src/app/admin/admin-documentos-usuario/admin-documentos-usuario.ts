// src/app/admin/admin-documentos-usuario/admin-documentos-usuario.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/config/api.config';
import { FormsModule } from '@angular/forms';
import { DescargaService } from '../../core/services/descarga.service';
import { esExitoso, primerMensaje } from '../../core/utils/storage.util';

interface DocumentoGeneral {
  idDocumentGeneral: string;
  type: string;
  nameDocumentGeneral: string;
  extensionDocumentGeneral: string;
  status: string;
  observations?: string;
}

interface DocumentoRenuncia {
  idDocumentResignation: string;
  nameDocumentResignation?: string; // carta firmada que subió el residente
  formatFileName?: string; // formato en blanco que asignó el admin
  status: string;
  observations?: string;
}

interface DocumentoEntrada {
  idDocumentEnter: string;
  nameDocumentEnter: string;
  extensionDocumentEnter: string;
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

  // ¿Ya se le asignó un formato en blanco al residente? (para el texto del botón)
  formatoAsignado(): boolean {
    return !!this.documentoRenuncia()?.formatFileName;
  }
  cargando = signal(false);
  mensaje = signal<string | null>(null);

  observacionEditando = signal<string | null>(null);
  observacionTexto = '';
  mostrarFormSubida = signal(false);
  tipoDocumento = '';
  archivoSeleccionado: File | null = null;
  archivoNombre = '';

  documentosEntrada = signal<DocumentoEntrada[]>([]);
  mostrarFormRenuncia = signal(false);
  archivoRenuncia: File | null = null;
  archivoRenunciaNombre = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private descargaService: DescargaService,
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
      .get<{ data: DocumentoEntrada[] }>(`${API_BASE_URL}/documententer/${this.idUser}`)
      .subscribe({
        next: (res) => this.documentosEntrada.set(res.data ?? []),
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
        next: (res: any) => {
          if (!esExitoso(res)) {
            this.mensaje.set(primerMensaje(res, 'No se pudo actualizar el documento.'));
            return;
          }
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
        next: (res: any) => {
          if (!esExitoso(res)) {
            this.mensaje.set(primerMensaje(res, 'No se pudo actualizar la renuncia.'));
            return;
          }
          this.mensaje.set('Renuncia actualizada.');
          this.cargarDocumentos();
        },
        error: () => this.mensaje.set('No se pudo actualizar la renuncia.'),
      });
  }

  descargarGeneral(doc: DocumentoGeneral) {
    this.descargaService.descargar(
      `${API_BASE_URL}/documents/download/${doc.idDocumentGeneral}`,
      `${doc.nameDocumentGeneral}.${doc.extensionDocumentGeneral}`,
      (msg) => this.mensaje.set(msg),
      'No se pudo descargar el documento.',
    );
  }

  descargarRenuncia(idDocument: string) {
    this.descargaService.descargar(
      `${API_BASE_URL}/resignation/download/${idDocument}`,
      `renuncia-${idDocument}`,
      (msg) => this.mensaje.set(msg),
      'No se pudo descargar la renuncia.',
    );
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
        next: (res: any) => {
          if (!esExitoso(res)) {
            this.mensaje.set(primerMensaje(res, 'No se pudo guardar la observación.'));
            return;
          }
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
        next: (res: any) => {
          if (!esExitoso(res)) {
            this.mensaje.set(primerMensaje(res, 'No se pudo guardar la observación.'));
            return;
          }
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
      next: (res: any) => {
        if (!esExitoso(res)) {
          this.mensaje.set(primerMensaje(res, 'No se pudo subir el documento.'));
          return;
        }
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
      next: (res: any) => {
        if (!esExitoso(res)) {
          this.mensaje.set(primerMensaje(res, 'No se pudo asignar el formato.'));
          return;
        }
        this.mensaje.set('Formato de renuncia asignado al residente.');
        this.toggleFormRenuncia();
        this.cargarDocumentos();
      },
      error: () => this.mensaje.set('No se pudo asignar el formato.'),
    });
  }

  actualizarEstadoEntrada(idDocument: string, status: 'APROBADO' | 'RECHAZADO') {
    this.http
      .patch(`${API_BASE_URL}/documententer/${idDocument}/status`, null, {
        params: { status, observations: '' },
      })
      .subscribe({
        next: (res: any) => {
          if (!esExitoso(res)) {
            this.mensaje.set(primerMensaje(res, 'No se pudo actualizar el documento.'));
            return;
          }
          this.mensaje.set('Documento actualizado.');
          this.cargarDocumentos();
        },
        error: () => this.mensaje.set('No se pudo actualizar el documento.'),
      });
  }

  confirmarObservacionEntrada(idDocument: string) {
    this.http
      .patch(`${API_BASE_URL}/documententer/${idDocument}/status`, null, {
        params: { status: 'OBSERVADO', observations: this.observacionTexto },
      })
      .subscribe({
        next: (res: any) => {
          if (!esExitoso(res)) {
            this.mensaje.set(primerMensaje(res, 'No se pudo guardar la observación.'));
            return;
          }
          this.mensaje.set('Observación guardada.');
          this.cancelarObservacion();
          this.cargarDocumentos();
        },
        error: () => this.mensaje.set('No se pudo guardar la observación.'),
      });
  }

  descargarEntrada(doc: DocumentoEntrada) {
    this.descargaService.descargar(
      `${API_BASE_URL}/documententer/download/${doc.idDocumentEnter}`,
      `${doc.nameDocumentEnter}`,
      (msg) => this.mensaje.set(msg),
      'No se pudo descargar el documento.',
    );
  }
}
