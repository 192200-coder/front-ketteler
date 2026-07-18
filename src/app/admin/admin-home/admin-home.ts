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

  actividades = signal<{ nombre: string; tipo: string; hora: string }[]>([]);

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
      },
      error: () => {},
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
            (res.data?.content ?? []).map((r) => ({
              nombre: r.firstName ? `${r.firstName} ${r.surName}` : 'Desconocido',
              tipo: r.entryDate && !r.departureDate ? 'Entrada' : 'Salida',
              hora: new Date(r.entryDate ?? r.departureDate).toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            })),
          );
        },
        error: () => {},
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
