import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDocumentosUsuario } from './admin-documentos-usuario';

describe('AdminDocumentosUsuario', () => {
  let component: AdminDocumentosUsuario;
  let fixture: ComponentFixture<AdminDocumentosUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDocumentosUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDocumentosUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
