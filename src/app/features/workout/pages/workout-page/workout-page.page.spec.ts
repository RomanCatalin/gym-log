import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutPagePage } from './workout-page.page';

describe('WorkoutPagePage', () => {
  let component: WorkoutPagePage;
  let fixture: ComponentFixture<WorkoutPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
