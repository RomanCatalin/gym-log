import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsPagePage } from './settings-page.page';

describe('SettingsPagePage', () => {
  let component: SettingsPagePage;
  let fixture: ComponentFixture<SettingsPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
