import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Groupdetail } from './groupdetail';

describe('Groupdetail', () => {
  let component: Groupdetail;
  let fixture: ComponentFixture<Groupdetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Groupdetail],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Groupdetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
