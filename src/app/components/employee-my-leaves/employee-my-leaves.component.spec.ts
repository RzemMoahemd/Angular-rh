import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMyLeavesComponent } from './employee-my-leaves.component';

describe('EmployeeMyLeavesComponent', () => {
  let component: EmployeeMyLeavesComponent;
  let fixture: ComponentFixture<EmployeeMyLeavesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeMyLeavesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeMyLeavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
