import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { API_BASE_URL } from '../../core/config/api.config';

interface KpiResponse {
  totalResidentes: number;
  presentes: number;
  ausentes: number;
  fecha: string;
  type: string;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-home.html',
  styleUrls: ['./admin-home.css'],
})
export class AdminHomeComponent implements OnInit {
  totalResidentes = signal(0);
  presentes = signal(0);
  ausentes = signal(0);

  actividades = signal<{ nombre: string; tipo: string; hora: string; esAnomalia: boolean }[]>([]);

  cargandoKpis = signal(true);
  cargandoActividades = signal(true);

  // Respaldo manual del sistema
  respaldando = signal(false);
  mensajeRespaldo = signal<string | null>(null);
  respaldoFallo = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.profileService.cargarPerfil().subscribe({
      next: () => {
        this.cargarKpis();
        this.cargarActividades();
      },
    });
  }

  private cargarKpis() {
    const idResidence = this.profileService.getIdResidence();
    const params: any = {};
    if (idResidence) params.idResidence = idResidence;

    this.http.get<KpiResponse>(`${API_BASE_URL}/attendance/kpi`, { params }).subscribe({
      next: (res) => {
        this.totalResidentes.set(res.totalResidentes ?? 0);
        this.presentes.set(res.presentes ?? 0);
        this.ausentes.set(res.ausentes ?? 0);
        this.cargandoKpis.set(false);
      },
      error: () => this.cargandoKpis.set(false),
    });
  }

  private cargarActividades() {
    this.http
      .get<{ data: { content: any[] } }>(`${API_BASE_URL}/attendance/filter`, {
        params: { page: 0, size: 5, sort: 'desc' },
      })
      .subscribe({
        next: (res) => {
          this.actividades.set(
            (res.data?.content ?? []).map((ev) => ({
              nombre: ev.firstName ? `${ev.firstName} ${ev.surName}` : 'Desconocido',
              tipo: this.etiquetaTipo(ev.eventType),
              esAnomalia: ev.esAnomalia ?? false,
              hora: ev.eventTimestamp
                ? new Date(ev.eventTimestamp).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '--:--',
            })),
          );
          this.cargandoActividades.set(false);
        },
        error: () => this.cargandoActividades.set(false),
      });
  }

  private etiquetaTipo(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA':
        return 'Entrada';
      case 'SALIDA':
        return 'Salida';
      case 'INTENTO_FALLIDO':
        return 'Intento fallido';
      default:
        return tipo ?? '—';
    }
  }

  // Genera un respaldo en el momento (util antes de una actualizacion).
  respaldarAhora() {
    if (this.respaldando()) return;

    this.respaldando.set(true);
    this.mensajeRespaldo.set(null);

    this.http.post<{ type: string; listMessage: string[] }>(`${API_BASE_URL}/backup`, {}).subscribe({
      next: (res) => {
        this.respaldando.set(false);
        this.respaldoFallo.set(res.type !== 'success');
        this.mensajeRespaldo.set((res.listMessage ?? []).join(' · '));
      },
      error: () => {
        this.respaldando.set(false);
        this.respaldoFallo.set(true);
        this.mensajeRespaldo.set('No se pudo generar el respaldo. Revisa que el sistema esté activo.');
      },
    });
  }

  goToGestionarUsuarios() {
    this.router.navigate(['/admin-gestion-usuarios']);
  }

  verReportesAlert() {
    this.router.navigate(['/admin-reportes']);
  }

  logout() {
    this.authService.logout();
  }

  irACambiarContrasena() {
    this.router.navigate(['/admin-cambiar-contrasena']);
  }
}
