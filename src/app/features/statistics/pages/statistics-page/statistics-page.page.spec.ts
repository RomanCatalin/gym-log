import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatisticsPagePage } from './statistics-page.page';

describe('StatisticsPagePage', () => {
  let component: StatisticsPagePage;
  let fixture: ComponentFixture<StatisticsPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticsPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
