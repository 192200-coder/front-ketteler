import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCrearUsuario } from './admin-crear-usuario';

describe('AdminCrearUsuario', () => {
  let component: AdminCrearUsuario;
  let fixture: ComponentFixture<AdminCrearUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCrearUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCrearUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
