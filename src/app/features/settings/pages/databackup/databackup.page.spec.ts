import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatabackupPage } from './databackup.page';

describe('DatabackupPage', () => {
  let component: DatabackupPage;
  let fixture: ComponentFixture<DatabackupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabackupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
