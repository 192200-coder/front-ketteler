import { describe, it, expect } from 'vitest';
import { fechaLocalISO } from './admin-reportes';

/**
 * Regresión del bug "los reportes salen vacíos en el rango diario".
 *
 * La fecha se calculaba con toISOString(), que convierte a UTC. En Perú (UTC-5),
 * a partir de las 19:00 locales eso devolvía el DÍA SIGUIENTE, así que el reporte
 * consultaba mañana y siempre salía vacío al probarlo de noche.
 */
describe('Fecha del reporte (debe usar hora local, no UTC)', () => {
  it('de noche NO adelanta al día siguiente', () => {
    // 23 de julio, 22:30 hora local. En UTC-5 esto es el 24 en UTC: el bug original.
    const nocheDelVeintitres = new Date(2026, 6, 23, 22, 30, 0);

    expect(fechaLocalISO(nocheDelVeintitres)).toBe('2026-07-23');
  });

  it('de madrugada NO retrocede al día anterior', () => {
    const madrugadaDelVeintitres = new Date(2026, 6, 23, 0, 15, 0);

    expect(fechaLocalISO(madrugadaDelVeintitres)).toBe('2026-07-23');
  });

  it('rellena con ceros el mes y el día', () => {
    const primeroDeEnero = new Date(2026, 0, 5, 12, 0, 0);

    expect(fechaLocalISO(primeroDeEnero)).toBe('2026-01-05');
  });

  it('coincide con la fecha local del dispositivo', () => {
    const ahora = new Date();
    const esperado = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(
      ahora.getDate(),
    ).padStart(2, '0')}`;

    expect(fechaLocalISO(ahora)).toBe(esperado);
  });
});
