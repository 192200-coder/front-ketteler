import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGestionUsuarios } from './admin-gestion-usuarios';

describe('AdminGestionUsuarios', () => {
  let component: AdminGestionUsuarios;
  let fixture: ComponentFixture<AdminGestionUsuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminGestionUsuarios],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminGestionUsuarios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
