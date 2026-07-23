import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ResidenteHomeComponent } from './residente-home';

/**
 * Regla de negocio del motivo al marcar asistencia:
 *  - Al SALIR el motivo es obligatorio (a dónde va).
 *  - Al ENTRAR es opcional: si no elige nada se asume el retorno,
 *    pero si quiere detallar algo, se respeta lo que puso.
 */
describe('Motivo al marcar asistencia', () => {
  let componente: ResidenteHomeComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ResidenteHomeComponent],
      providers: [provideHttpClient(), provideRouter([])],
    });
    componente = TestBed.createComponent(ResidenteHomeComponent).componentInstance;
  });

  it('al ENTRAR sin elegir motivo, asume el retorno a la residencia', () => {
    componente.proximaAccion.set('entrada');
    componente.selectedMotive = '';

    expect(componente.motivoFinal).toBe('Retorno a la residencia');
  });

  it('al ENTRAR respeta el motivo si el residente sí eligió uno', () => {
    componente.proximaAccion.set('entrada');
    componente.selectedMotive = 'medico';

    expect(componente.motivoFinal).toBe('medico');
  });

  it('al SALIR usa el motivo elegido', () => {
    componente.proximaAccion.set('salida');
    componente.selectedMotive = 'clases';

    expect(componente.motivoFinal).toBe('clases');
  });

  it('con la opción "otros" usa el texto libre, sin espacios sobrantes', () => {
    componente.proximaAccion.set('salida');
    componente.selectedMotive = 'otros';
    componente.otroMotivoTexto = '  Trámite en la universidad  ';

    expect(componente.motivoFinal).toBe('Trámite en la universidad');
  });

  it('al SALIR sin motivo no inventa ninguno (el formulario lo exige)', () => {
    componente.proximaAccion.set('salida');
    componente.selectedMotive = '';

    expect(componente.motivoFinal).toBe('');
  });
});
