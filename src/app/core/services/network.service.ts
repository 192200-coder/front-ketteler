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
      console.log('[NetworkService] permiso actual:', permiso); // ← diagnóstico

      if (permiso.location !== 'granted') {
        const solicitado = await CapacitorWifi.requestPermissions({ permissions: ['location'] });
        console.log('[NetworkService] permiso solicitado:', solicitado); // ← diagnóstico
        if (solicitado.location !== 'granted') return null;
      }

      const info = await CapacitorWifi.getWifiInfo();
      console.log('[NetworkService] info wifi cruda:', info); // ← diagnóstico

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
