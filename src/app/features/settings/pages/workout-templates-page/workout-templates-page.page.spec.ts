import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutTemplatesPagePage } from './workout-templates-page.page';

describe('WorkoutTemplatesPagePage', () => {
  let component: WorkoutTemplatesPagePage;
  let fixture: ComponentFixture<WorkoutTemplatesPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutTemplatesPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
