import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/config/api.config';
import { FormsModule } from '@angular/forms';
import { DescargaService } from '../../core/services/descarga.service';

interface AttendanceEvent {
  idAtendance: string;
  firstName: string | null;
  surName: string | null;
  eventTimestamp: string | null;
  eventType: 'ENTRADA' | 'SALIDA' | 'INTENTO_FALLIDO';
  esAnomalia: boolean;
  motivoFallo: string | null;
  serverSimilarity: number | null;
}

interface UsuarioFiltro {
  idUser: string;
  firstName: string;
  surName: string;
}

type RangoReporte = 'diario' | 'semanal' | 'mensual';

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-reportes.html',
  styleUrls: ['./admin-reportes.css'],
})
export class AdminReportesComponent implements OnInit {
  rango = signal<RangoReporte>('diario');
  fechaSeleccionada = new Date().toISOString().split('T')[0];
  reportes = signal<AttendanceEvent[]>([]);
  cargando = signal(false);

  // RF-30: filtro por residente
  usuarios = signal<UsuarioFiltro[]>([]);
  idUserFiltro = '';
  tipoFiltro = ''; // '', 'ENTRADA', 'SALIDA', 'INTENTO_FALLIDO'

  // RF-31: paginación y ordenamiento
  paginaActual = signal(0);
  totalPaginas = signal(1);
  paginasArray = signal<number[]>([]);
  readonly tamanioPagina = 10;
  ordenDesc = signal(true);

  constructor(
    private http: HttpClient,
    private descargaService: DescargaService,
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.consultar();
  }

  private cargarUsuarios() {
    this.http.get<{ data: UsuarioFiltro[] }>(`${API_BASE_URL}/indexuser`).subscribe({
      next: (res) => this.usuarios.set(res.data ?? []),
      error: () => {},
    });
  }

  setRango(rango: RangoReporte) {
    this.rango.set(rango);
    this.paginaActual.set(0);
    this.consultar();
  }

  onFechaChange() {
    this.paginaActual.set(0);
    this.consultar();
  }

  onFiltroCambio() {
    this.paginaActual.set(0);
    this.consultar();
  }

  toggleOrden() {
    this.ordenDesc.set(!this.ordenDesc());
    this.consultar();
  }

  irPagina(pagina: number) {
    this.paginaActual.set(pagina);
    this.consultar();
  }

  private calcularRangoFechas(): { fechaInicio: string; fechaFin: string } {
    const base = new Date(this.fechaSeleccionada);
    const fin = new Date(base);

    if (this.rango() === 'semanal') {
      base.setDate(base.getDate() - 6);
    } else if (this.rango() === 'mensual') {
      base.setDate(1);
      fin.setMonth(fin.getMonth() + 1, 0);
    }

    return {
      fechaInicio: base.toISOString().split('T')[0],
      fechaFin: fin.toISOString().split('T')[0],
    };
  }

  private buildParams(): Record<string, string> {
    const { fechaInicio, fechaFin } = this.calcularRangoFechas();
    const params: Record<string, string> = {
      fechaInicio,
      fechaFin,
      page: String(this.paginaActual()),
      size: String(this.tamanioPagina),
      sort: this.ordenDesc() ? 'desc' : 'asc',
    };
    if (this.idUserFiltro) params['idUser'] = this.idUserFiltro;
    if (this.tipoFiltro) params['tipo'] = this.tipoFiltro;
    return params;
  }

  consultar() {
    this.cargando.set(true);
    this.http
      .get<{ data: { content: AttendanceEvent[]; totalPages: number } }>(
        `${API_BASE_URL}/attendance/filter`,
        { params: this.buildParams() },
      )
      .subscribe({
        next: (res) => {
          this.reportes.set(res.data?.content ?? []);
          this.totalPaginas.set(res.data?.totalPages ?? 1);
          this.paginasArray.set(Array.from({ length: res.data?.totalPages ?? 1 }, (_, i) => i));
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }

  // RF-32: exportación con filtros activos
  descargar(formato: 'excel' | 'pdf') {
    const params = new URLSearchParams(this.buildParams());
    params.delete('page');
    params.delete('size');

    const url = `${API_BASE_URL}/attendance/export?format=${formato}&${params.toString()}`;
    const extension = formato === 'excel' ? 'xlsx' : 'pdf';
    const nombrePorDefecto = `reporte-asistencia-${this.rango()}-${this.fechaSeleccionada}.${extension}`;

    // Usa el servicio compartido: en móvil guarda el archivo con Filesystem y abre el
    // Share nativo. Un <a download> no funciona dentro del WebView de Capacitor.
    this.descargaService.descargar(
      url,
      nombrePorDefecto,
      (mensaje) => alert(mensaje),
      'No se pudo generar el reporte. Intenta nuevamente.',
    );
  }

  onTipoCambio() {
    this.paginaActual.set(0);
    this.consultar();
  }

  etiquetaTipo(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA': return 'Entrada';
      case 'SALIDA': return 'Salida';
      case 'INTENTO_FALLIDO': return 'Intento fallido';
      default: return tipo;
    }
  }

  claseTipo(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA': return 'badge badge-completo';
      case 'SALIDA': return 'badge badge-rol';
      case 'INTENTO_FALLIDO': return 'badge badge-ausente';
      default: return 'badge';
    }
  }
}
