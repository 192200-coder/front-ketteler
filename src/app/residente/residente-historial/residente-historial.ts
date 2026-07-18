import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/config/api.config';

interface EventoAsistencia {
  eventTimestamp: string | null;
  eventType: 'ENTRADA' | 'SALIDA' | 'INTENTO_FALLIDO';
  esAnomalia: boolean;
  motivoFallo: string | null;
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
  eventos = signal<{ fecha: string; hora: string; tipo: string; esAnomalia: boolean; motivo: string | null }[]>([]);
  cargando = signal(true);

  constructor(private router: Router, private http: HttpClient, private datePipe: DatePipe) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  private cargarHistorial() {
    this.http.get<{ data: { content: EventoAsistencia[] } }>(`${API_BASE_URL}/myattendance/filter`, {
      params: { page: 0, size: 30 }
    }).subscribe({
      next: (res) => {
        const contenido = res.data?.content ?? [];
        this.eventos.set(contenido.map(e => ({
          fecha: this.datePipe.transform(e.eventTimestamp, 'dd/MM/yyyy') ?? '-',
          hora: this.datePipe.transform(e.eventTimestamp, 'hh:mm a') ?? '-',
          tipo: this.etiquetaTipo(e.eventType),
          esAnomalia: e.esAnomalia,
          motivo: e.motivoFallo,
        })));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  private etiquetaTipo(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA': return 'Entrada';
      case 'SALIDA': return 'Salida';
      case 'INTENTO_FALLIDO': return 'Intento fallido';
      default: return tipo;
    }
  }

  goBack() {
    window.history.back();
  }

  navigateTo(view: string) {
    if (view === 'home') this.router.navigate(['/residente-home']);
    else if (view === 'documentos') this.router.navigate(['/residente-documentos']);
  }
}