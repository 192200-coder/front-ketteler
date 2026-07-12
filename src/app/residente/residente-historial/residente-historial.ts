import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/config/api.config';

interface RegistroAsistencia {
  entryDate: string | null;
  departureDate: string | null;
  status: boolean;
}

@Component({
  selector: 'app-residente-historial',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './residente-historial.html',
  styleUrls: ['./residente-historial.css']
})
export class ResidenteHistorialComponent implements OnInit {
  asistencias = signal<{ fecha: string; entrada: string; salida: string; estado: string }[]>([]);
  cargando = signal(true);

  constructor(private router: Router, private http: HttpClient, private datePipe: DatePipe) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  private cargarHistorial() {
    this.http.get<{ data: { content: RegistroAsistencia[] } }>(`${API_BASE_URL}/myattendance/filter`, {
      params: { page: 0, size: 30 }
    }).subscribe({
      next: (res) => {
        const contenido = res.data?.content ?? [];
        this.asistencias.set(contenido.map(r => ({
          fecha: this.datePipe.transform(r.entryDate, 'dd/MM/yyyy') ?? '-',
          entrada: this.datePipe.transform(r.entryDate, 'hh:mm a') ?? '-',
          salida: r.departureDate ? (this.datePipe.transform(r.departureDate, 'hh:mm a') ?? '-') : '-',
          estado: r.status ? 'Dentro' : 'Completo'
        })));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  goBack() {
    window.history.back();
  }

  navigateTo(view: string) {
    if (view === 'home') this.router.navigate(['/residente-home']);
    else if (view === 'documentos') this.router.navigate(['/residente-documentos']);
  }
}