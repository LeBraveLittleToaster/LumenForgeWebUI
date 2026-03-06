import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Groupcreate } from './groupcreate';

describe('Groupcreate', () => {
  let component: Groupcreate;
  let fixture: ComponentFixture<Groupcreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Groupcreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Groupcreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
