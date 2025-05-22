import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PressureFormComponent } from './pressure-form.component';

describe('PressureFormComponent', () => {
  let component: PressureFormComponent;
  let fixture: ComponentFixture<PressureFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PressureFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PressureFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
