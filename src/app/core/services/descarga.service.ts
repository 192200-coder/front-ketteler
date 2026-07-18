import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Injectable({ providedIn: 'root' })
export class DescargaService {
  constructor(private http: HttpClient) {}

  descargar(url: string, nombrePorDefecto: string, onError: (mensaje: string) => void, fallbackError: string) {
    this.http
      .get(url, { responseType: 'blob', observe: 'response' })
      .subscribe({
        next: (res) => this.procesarBlob(res, nombrePorDefecto),
        error: (err: HttpErrorResponse) => this.manejarError(err, fallbackError, onError),
      });
  }

  private async procesarBlob(res: HttpResponse<Blob>, nombrePorDefecto: string) {
    const disposition = res.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : nombrePorDefecto;
    const blob = res.body as Blob;

    if (Capacitor.isNativePlatform()) {
      const base64 = await this.blobToBase64(blob);
      const resultado = await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Cache,
      });
      await Share.share({ title: filename, url: resultado.uri });
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // quita el prefijo "data:...;base64,"
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private manejarError(err: HttpErrorResponse, fallback: string, onError: (mensaje: string) => void) {
    if (err.error instanceof Blob) {
      err.error.text().then((text) => {
        try {
          const parsed = JSON.parse(text);
          onError(parsed.listMessage?.[0] ?? fallback);
        } catch {
          onError(fallback);
        }
      });
    } else {
      onError(fallback);
    }
  }
}