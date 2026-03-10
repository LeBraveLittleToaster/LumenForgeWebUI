import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'lumenforge-theme';
  readonly isDark = signal(false);

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    this.applyDark(stored === 'dark' || (stored === null && prefersDark));
  }

  toggle() {
    this.applyDark(!this.isDark());
  }

  private applyDark(dark: boolean) {
    this.isDark.set(dark);
    document.documentElement.classList.toggle('dark-mode', dark);
    localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
  }
}
