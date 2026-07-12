import { Injectable } from '@angular/core';

export interface RedActual {
  ssid?: string;
  bssid?: string;
}

@Injectable({ providedIn: 'root' })
export class NetworkService {
  esAppNativa(): boolean {
    if (typeof window === 'undefined') return false;
    const cap = (window as any).Capacitor;
    return !!cap?.isNativePlatform?.();
  }

  async obtenerRedActual(): Promise<RedActual | null> {
    if (!this.esAppNativa()) return null;

    try {
      const { CapacitorWifi } = await import('@capgo/capacitor-wifi');

      const permiso = await CapacitorWifi.checkPermissions();
      if (permiso.location !== 'granted') {
        const solicitado = await CapacitorWifi.requestPermissions({ permissions: ['location'] });
        if (solicitado.location !== 'granted') return null;
      }

      const info = await CapacitorWifi.getWifiInfo();

      // Android devuelve estos valores "placeholder" cuando la Ubicación
      // del sistema está apagada o no se pudo resolver por otra razón.
      const noResuelto =
        !info.ssid || info.ssid === '<unknown ssid>' || info.bssid === '02:00:00:00:00:00';

      if (noResuelto) {
        throw new Error('UBICACION_DESACTIVADA');
      }

      return { ssid: info.ssid, bssid: info.bssid };
    } catch (error) {
      console.error('No se pudo obtener la información de red', error);
      return null;
    }
  }
}
