import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionRentalCard } from './action-rental-card';

describe('ActionRentalCard', () => {
  let component: ActionRentalCard;
  let fixture: ComponentFixture<ActionRentalCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionRentalCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionRentalCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
