import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidenteCambiarContra } from './residente-cambiar-contra';

describe('ResidenteCambiarContra', () => {
  let component: ResidenteCambiarContra;
  let fixture: ComponentFixture<ResidenteCambiarContra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidenteCambiarContra],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidenteCambiarContra);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
