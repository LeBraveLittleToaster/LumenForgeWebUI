import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-action-container',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './action-container.html',
  styleUrl: './action-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionContainerComponent {
  private readonly route = inject(ActivatedRoute);

  readonly title = input('');
  readonly description = input('');

  readonly processGuid = this.route.snapshot.paramMap.get('processGuid') ?? '';
}
