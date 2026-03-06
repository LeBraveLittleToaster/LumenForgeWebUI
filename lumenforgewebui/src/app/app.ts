import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from './shared/toolbar/toolbar';

@Component({
  selector: 'app-root',
  imports: [Toolbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('lumenforgewebui');
}
