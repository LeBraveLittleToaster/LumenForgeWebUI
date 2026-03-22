import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCreate } from './groupcreate';

describe('Groupcreate', () => {
  let component: GroupCreate;
  let fixture: ComponentFixture<GroupCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
