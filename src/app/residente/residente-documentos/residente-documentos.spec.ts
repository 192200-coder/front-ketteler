import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidenteDocumentos } from './residente-documentos';

describe('ResidenteDocumentos', () => {
  let component: ResidenteDocumentos;
  let fixture: ComponentFixture<ResidenteDocumentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidenteDocumentos],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidenteDocumentos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
