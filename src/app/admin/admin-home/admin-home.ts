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
