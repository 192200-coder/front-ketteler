// src/app/residente/residente-documentos/residente-documentos.ts
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { API_BASE_URL } from '../../core/config/api.config';

type Tab = 'subir' | 'misdocs' | 'renuncia';

interface DocumentoItem {
  idDocumentGeneral?: string;
  idDocumentResignation?: string;
  type?: string;
  nameDocumentGeneral?: string;
  status: string;
  observations?: string;
  downloadable: boolean;
}

@Component({
  selector: 'app-residente-documentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './residente-documentos.html',
  styleUrls: ['./residente-documentos.css'],
})
export class ResidenteDocumentosComponent implements OnInit {
  activeTab = signal<Tab>('subir');

  filePagoName = '';
  fileNotasName = '';
  fileRenunciaName = '';
  private filePago: File | null = null;
  private fileNotas: File | null = null;
  private fileRenuncia: File | null = null;

  misDocumentos = signal<DocumentoItem[]>([]);
  miRenuncia = signal<DocumentoItem | null>(null);
  loadingDocs = signal(false);
  mensaje = signal<string | null>(null);

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // precargamos "Mis docs" para que no se sienta vacío al cambiar de tab
    this.cargarMisDocumentos();
  }

  goBack() {
    window.history.back();
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    if (tab === 'misdocs') this.cargarMisDocumentos();
  }

  triggerFileInput(inputId: string) {
    document.getElementById(inputId)?.click();
  }

  onFileSelected(event: Event, type: 'pago' | 'notas' | 'renuncia') {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxBytes = 10 * 1024 * 1024; // 10 MB

    if (!tiposPermitidos.includes(file.type)) {
      this.mensaje.set('Solo se permiten archivos PDF, JPG o PNG.');
      input.value = '';
      return;
    }
    if (file.size > maxBytes) {
      this.mensaje.set('El archivo no puede superar los 10 MB.');
      input.value = '';
      return;
    }

    this.mensaje.set(null);
    if (type === 'pago') {
      this.filePago = file;
      this.filePagoName = file.name;
    } else if (type === 'notas') {
      this.fileNotas = file;
      this.fileNotasName = file.name;
    } else {
      this.fileRenuncia = file;
      this.fileRenunciaName = file.name;
    }
  }

  uploadDocument(type: 'pago' | 'notas') {
    const file = type === 'pago' ? this.filePago : this.fileNotas;
    const userId = this.authService.currentUser()?.userId;
    if (!file || !userId) return;

    const formData = new FormData();
    formData.append('idUser', userId);
    formData.append('type', type === 'pago' ? 'PAGO' : 'NOTAS');
    formData.append('file', file);

    this.http.post(`${API_BASE_URL}/registerdocumentgeneral`, formData).subscribe({
      next: () => {
        this.mensaje.set(`Documento subido. Quedará pendiente de validación del administrador.`);
        if (type === 'pago') {
          this.filePagoName = '';
          this.filePago = null;
        } else {
          this.fileNotasName = '';
          this.fileNotas = null;
        }
      },
      error: () => this.mensaje.set('No se pudo subir el documento. Intenta nuevamente.'),
    });
  }

  uploadRenuncia() {
    const userId = this.authService.currentUser()?.userId;
    if (!this.fileRenuncia || !userId) return;

    const formData = new FormData();
    formData.append('idUser', userId);
    formData.append('file', this.fileRenuncia);

    this.http.post(`${API_BASE_URL}/registerdocumentresignation`, formData).subscribe({
      next: () => {
        this.mensaje.set('Carta de renuncia enviada. El administrador la revisará.');
        this.fileRenunciaName = '';
        this.fileRenuncia = null;
      },
      error: () => this.mensaje.set('No se pudo enviar el documento. Intenta nuevamente.'),
    });
  }

  private cargarMisDocumentos() {
    this.loadingDocs.set(true);
    this.http.get<{ data: DocumentoItem[] }>(`${API_BASE_URL}/mydocuments`).subscribe({
      next: (res) => {
        this.misDocumentos.set(res.data ?? []);
        this.loadingDocs.set(false);
      },
      error: () => this.loadingDocs.set(false),
    });
    this.http.get<{ data: DocumentoItem | null }>(`${API_BASE_URL}/myresignation`).subscribe({
      next: (res) => this.miRenuncia.set(res.data ?? null),
      error: () => {},
    });
  }

  navigateTo(view: string) {
    if (view === 'home') this.router.navigate(['/residente-home']);
    else if (view === 'historial') this.router.navigate(['/residente-historial']);
  }

  badgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APROBADO':
        return 'badge-status badge-aprobado';
      case 'RECHAZADO':
        return 'badge-status badge-rechazado';
      case 'OBSERVADO':
        return 'badge-status badge-observado';
      default:
        return 'badge-status badge-pendiente';
    }
  }

  descargarDocumento(idDocument: string) {
    window.open(`${API_BASE_URL}/documents/download/${idDocument}`, '_blank');
  }

  descargarFormatoRenuncia() {
    window.open(`${API_BASE_URL}/resignation/format/download`, '_blank');
  }
}
