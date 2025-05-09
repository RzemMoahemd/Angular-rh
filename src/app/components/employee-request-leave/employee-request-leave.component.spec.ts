import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeRequestLeaveComponent } from './employee-request-leave.component';

describe('EmployeeRequestLeaveComponent', () => {
  let component: EmployeeRequestLeaveComponent;
  let fixture: ComponentFixture<EmployeeRequestLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeRequestLeaveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeRequestLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
