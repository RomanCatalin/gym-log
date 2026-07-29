import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HotbarPage } from './hotbar.page';

describe('HotbarPage', () => {
  let component: HotbarPage;
  let fixture: ComponentFixture<HotbarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HotbarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
