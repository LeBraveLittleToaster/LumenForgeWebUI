import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Usercreate } from './usercreate';

describe('Usercreate', () => {
  let component: Usercreate;
  let fixture: ComponentFixture<Usercreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Usercreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Usercreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
