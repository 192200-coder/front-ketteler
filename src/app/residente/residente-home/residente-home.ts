import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { NetworkService } from '../../core/services/network.service';
import { API_BASE_URL } from '../../core/config/api.config';
import { Camera } from '@capacitor/camera';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';

interface FaceVerificationResponse {
  type: string;
  listMessage: string[];
  verified: boolean;
  error?: string;
  similarity: number;
  entrada: boolean | null;
}

interface RegistroAsistencia {
  entryDate: string | null;
  departureDate: string | null;
  status: boolean;
}

@Component({
  selector: 'app-residente-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './residente-home.html',
  styleUrls: ['./residente-home.css'],
})
export class ResidenteHomeComponent implements OnInit, OnDestroy {
  @ViewChild('videoPreview') videoPreview?: ElementRef<HTMLVideoElement>;

  isCorrectWifi = signal(false);
  isScanning = false;
  isFaceVerified = false;
  selectedMotive = '';
  exitTime = '--:--';
  entryTime = '--:--';

  proximaAccion = signal<'entrada' | 'salida'>('salida');

  esAppNativa = false;
  mensajeRed = signal<string | null>(null);
  mensajeRegistro = signal<string | null>(null);
  permisoCamaraDenegado = signal(false);

  private mediaStream: MediaStream | null = null;
  private fotoCapturada: Blob | null = null;
  private redActual: { ssid?: string; bssid?: string } | null = null;

  constructor(
    private router: Router,
    public authService: AuthService,
    private profileService: ProfileService,
    private networkService: NetworkService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.esAppNativa = this.networkService.esAppNativa();

    if (!this.esAppNativa) {
      this.mensajeRed.set('Para marcar tu asistencia, abre la app instalada en tu celular.');
      return;
    }

    // Primero carga el perfil, y solo cuando termina verifica la red
    this.profileService.cargarPerfil().subscribe({
      next: async () => {
        this.cargarProximaAccion();
        await this.verificarRed();
      },
    });
  }

  ngOnDestroy() {
    this.detenerCamara();
  }

  private cargarProximaAccion() {
    this.http
      .get<{ data: { content: RegistroAsistencia[] } }>(`${API_BASE_URL}/myattendance/filter`, {
        params: { page: 0, size: 1 },
      })
      .subscribe({
        next: (res) => {
          const ultimo = res.data?.content?.[0];
          if (!ultimo || ultimo.status === false) {
            this.proximaAccion.set('entrada');
          } else {
            this.proximaAccion.set('salida');
          }
        },
        error: () => {},
      });
  }

  private async verificarRed() {
    this.redActual = await this.networkService.obtenerRedActual();

    if (!this.redActual?.ssid && !this.redActual?.bssid) {
      this.isCorrectWifi.set(false);
      this.mensajeRed.set(
        'No se pudo leer la red Wi-Fi. Verifica que la Ubicación (GPS) del celular esté ACTIVADA y que hayas dado permiso de ubicación a la app (no solo el permiso de red).',
      );
      return;
    }

    const idResidence = this.profileService.getIdResidence();
    this.http
      .get<{ data: boolean }>(`${API_BASE_URL}/network/verify`, {
        params: {
          ssid: this.redActual.ssid ?? '',
          bssid: this.redActual.bssid ?? '',
          idResidence: idResidence ?? '',
        },
      })
      .subscribe({
        next: (res: any) => {
          this.isCorrectWifi.set(res.isValid === true);
        },
        error: () => {
          this.isCorrectWifi.set(false);
        },
      });
  }

  cuentaRegresiva = signal<number | null>(null);

  async startFacialScan() {
    if (!this.esAppNativa || this.isScanning || this.isFaceVerified) return;

    const permiso = await Camera.checkPermissions();
    if (permiso.camera !== 'granted') {
      const solicitado = await Camera.requestPermissions({ permissions: ['camera'] });
      if (solicitado.camera !== 'granted') {
        this.permisoCamaraDenegado.set(true);
        this.mensajeRegistro.set(
          'Necesitamos acceso a la cámara para la validación facial. Actívalo en Ajustes > Apps > Casa Ketteler > Permisos.',
        );
        return;
      }
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
    } catch (err) {
      console.error('getUserMedia error', err); // deja este log, ayuda a diagnosticar si vuelve a fallar
      this.mensajeRegistro.set('No se pudo acceder a la cámara. Revisa los permisos.');
      return;
    }

    if (this.videoPreview?.nativeElement) {
      this.videoPreview.nativeElement.srcObject = this.mediaStream;
    } else {
      this.mensajeRegistro.set('Error interno: no se encontró el elemento de video.');
      this.detenerCamara();
      return;
    }

    this.isScanning = true;
    this.cuentaRegresiva.set(5);

    const intervalo = setInterval(() => {
      const actual = this.cuentaRegresiva();
      if (actual && actual > 1) {
        this.cuentaRegresiva.set(actual - 1);
      } else {
        clearInterval(intervalo);
        this.cuentaRegresiva.set(null);
      }
    }, 1000);

    this.isScanning = true;
    setTimeout(() => this.capturarFoto(), 3500);
  }

  // NUEVO
  abrirAjustesCamara() {
    NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App,
    });
  }

  fotoPreviewUrl = signal<string | null>(null);

  private capturarFoto() {
    const video = this.videoPreview?.nativeElement;
    if (!video || video.videoWidth === 0) {
      this.mensajeRegistro.set('La cámara no entregó imagen a tiempo. Intenta de nuevo.');
      this.cancelarEscaneo();
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        this.fotoCapturada = blob;
        this.isScanning = false;
        this.isFaceVerified = !!blob;
        this.detenerCamara();

        if (blob) {
          this.fotoPreviewUrl.set(canvas.toDataURL('image/jpeg', 0.9));
        } else {
          this.mensajeRegistro.set('No se pudo capturar la foto. Intenta de nuevo.');
        }
      },
      'image/jpeg',
      0.9,
    );
  }

  private detenerCamara() {
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.mediaStream = null;
  }

  private cancelarEscaneo() {
    this.isScanning = false;
    this.detenerCamara();
  }

  registerExit() {
    const userId = this.authService.currentUser()?.userId;
    if (!userId || !this.fotoCapturada) return;

    const formData = new FormData();
    formData.append('idUser', userId);
    formData.append('description', this.selectedMotive);
    formData.append('file', this.fotoCapturada, 'asistencia.jpg');
    if (this.redActual?.ssid) formData.append('ssid', this.redActual.ssid);
    if (this.redActual?.bssid) formData.append('bssid', this.redActual.bssid);

    this.http.post<FaceVerificationResponse>(`${API_BASE_URL}/register`, formData).subscribe({
      next: (res) => {
        if (res.verified) {
          const ahora = new Date().toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
          });
          if (res.entrada) {
            this.entryTime = ahora;
            this.proximaAccion.set('salida');
          } else {
            this.exitTime = ahora;
            this.proximaAccion.set('entrada');
          }

          this.mensajeRegistro.set(
            `Registro exitoso (${res.similarity.toFixed(0)}% de coincidencia).`,
          );
          this.isFaceVerified = false;
          this.fotoCapturada = null;
          this.selectedMotive = '';
        } else {
          this.mensajeRegistro.set(
            res.error ?? 'No se pudo verificar tu identidad. Intenta nuevamente.',
          );
          this.isFaceVerified = false;
          this.fotoCapturada = null;
        }
      },
      error: () =>
        this.mensajeRegistro.set('No se pudo conectar con el servidor. Intenta nuevamente.'),
    });
  }

  logout() {
    this.authService.logout();
  }

  navigateTo(view: string) {
    if (view === 'historial') this.router.navigate(['/residente-historial']);
    else if (view === 'documentos') this.router.navigate(['/residente-documentos']);
  }
}
