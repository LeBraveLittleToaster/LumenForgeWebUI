import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RentalActionView, RentalApiClient, RentalActionLogView, RentalProcessView } from '@lumenforge/api-client';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import {
  formatDateTime,
  getActionLabel,
  getCurrentStage,
  getCustomerDisplay,
  getHistoryLabel,
  getHistoryTimestamp,
  getProcessGuid,
  getRentalNotes,
  getRentalPurpose,
  getRentalSubtitle,
  getRentalTitle,
  getRequestedEnd,
  getRequestedStart,
  normalizeActionType,
} from './rental-process.utils';

interface GraphNode {
  id: string;
  label: string;
  subtitle: string;
  x: number;
  y: number;
  width: number;
  height: number;
  variant: 'history' | 'current' | 'available';
  route: any[] | null;
}

interface GraphEdge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed: boolean;
}

@Component({
  selector: 'app-rental-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Rental Process</h1>
          <p class="page-subtitle">Inspect the process graph, completed history, and available actions for the current stage.</p>
        </div>
        <div class="page-header-actions">
          <button mat-stroked-button routerLink="/rental">
            <mat-icon>arrow_back</mat-icon>
            Back to Rentals
          </button>
        </div>
      </div>

      @if (rentalLoading) {
        <div class="detail-status-panel">
          <mat-spinner diameter="40"></mat-spinner>
          <p class="muted">Loading rental process...</p>
        </div>
      }

      @if (rentalError) {
        <mat-card appearance="outlined" class="detail-status-panel error-card">
          <mat-card-content>
            <p>{{ rentalError }}</p>
            <button mat-stroked-button (click)="loadRental()">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          </mat-card-content>
        </mat-card>
      }

      @if (rental) {
        <div class="detail-layout">
          <mat-card appearance="outlined" class="overview-card">
            <mat-card-header>
              <mat-card-title>{{ getRentalTitle(rental) }}</mat-card-title>
              <mat-card-subtitle>{{ getRentalSubtitle(rental) }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="kv-grid">
                <div><strong>Process GUID:</strong> {{ getProcessGuid(rental) }}</div>
                <div><strong>Current Stage:</strong> {{ getCurrentStage(rental) }}</div>
                <div><strong>Customer:</strong> {{ getCustomerDisplay(rental) }}</div>
                <div><strong>Requested Start:</strong> {{ formatDateTime(getRequestedStart(rental)) }}</div>
                <div><strong>Requested End:</strong> {{ formatDateTime(getRequestedEnd(rental)) }}</div>
                <div><strong>Available Actions:</strong> {{ availableActions.length }}</div>
              </div>

              <div class="notes-block">
                <h3>Purpose</h3>
                <p>{{ getRentalPurpose(rental) }}</p>
                <h3>Notes</h3>
                <p>{{ getRentalNotes(rental) }}</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="outlined" class="graph-card">
            <mat-card-header>
              <mat-card-title>Process Graph</mat-card-title>
              <mat-card-subtitle>Completed actions are solid nodes. Available next actions branch out as translucent nodes.</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="graph-scroll">
                <div class="graph-canvas" [style.width.px]="graphWidth" [style.height.px]="graphHeight">
                  <svg class="graph-edges" [attr.viewBox]="'0 0 ' + graphWidth + ' ' + graphHeight" preserveAspectRatio="none">
                    @for (edge of graphEdges; track trackEdge($index, edge)) {
                      <line
                        [attr.x1]="edge.x1"
                        [attr.y1]="edge.y1"
                        [attr.x2]="edge.x2"
                        [attr.y2]="edge.y2"
                        [attr.stroke-dasharray]="edge.dashed ? '7 6' : null">
                      </line>
                    }
                  </svg>

                  @for (node of graphNodes; track trackNode($index, node)) {
                    <a
                      class="graph-node"
                      [class.graph-node--current]="node.variant === 'current'"
                      [class.graph-node--available]="node.variant === 'available'"
                      [style.left.px]="node.x"
                      [style.top.px]="node.y"
                      [style.width.px]="node.width"
                      [style.height.px]="node.height"
                      [routerLink]="node.route ?? ['/rental', processGuid]">
                      <strong>{{ node.label }}</strong>
                      <span>{{ node.subtitle }}</span>
                    </a>
                  }
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title>Available Actions</mat-card-title>
              <mat-card-subtitle>Each action opens a dedicated page for the required data entry.</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              @if (availableActions.length === 0) {
                <p class="muted">The API did not return any available actions for the current stage.</p>
              } @else {
                <div class="action-list">
                  @for (action of availableActions; track normalizeActionType(action)) {
                    <a mat-stroked-button [routerLink]="actionRoute(action)">{{ getActionLabel(action) }}</a>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>

          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title>History</mat-card-title>
              <mat-card-subtitle>Audit trail returned by the overview API.</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              @if (history.length === 0) {
                <p class="muted">No history entries were returned.</p>
              } @else {
                <div class="history-list">
                  @for (entry of history.slice().reverse(); track $index) {
                    <div class="history-row">
                      <strong>{{ getHistoryLabel(entry) }}</strong>
                      <span>{{ formatDateTime(entry.performed_at) }}</span>
                    </div>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styleUrl: './rental-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ngZone = inject(NgZone);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly changeRef = inject(ChangeDetectorRef);

  processGuid = '';
  rental: RentalProcessView | null = null;
  availableActions: RentalActionView[] = [];
  history: RentalActionLogView[] = [];
  rentalLoading = true;
  rentalError = '';
  graphNodes: GraphNode[] = [];
  graphEdges: GraphEdge[] = [];
  graphWidth = 320;
  graphHeight = 180;

  private readonly rentalApiClient = inject(RentalApiClient);

  ngOnInit(): void {
    this.processGuid = this.route.snapshot.paramMap.get('processGuid') ?? '';
    if (!this.processGuid) {
      this.rentalError = 'No rental id was provided.';
      return;
    }

    this.loadRental();
    this.changeRef.detectChanges();
  }

  loadRental(): void {
    this.rentalLoading = true;
    this.rentalError = '';

    forkJoin({
      rental: this.rentalApiClient.getRental(this.processGuid, ['checklists', 'extensions', 'damage_reports']).pipe(
        catchError(() => of(null))
      ),
      actions: this.rentalApiClient.listAvailableActions(this.processGuid).pipe(
        catchError(() => of([] as RentalActionView[]))
      ),
      history: this.rentalApiClient.listRentalHistory(this.processGuid, { limit: 100, offset: 0 }).pipe(
        catchError(() => of({ list: [] as RentalActionLogView[], total: 0 }))
      ),
    }).pipe(
      finalize(() => {
        console.log('Finished loading rental details');
        this.ngZone.run(() => {
          this.rentalLoading = false;
          this.cd.markForCheck();
        });
        console.log('Loaded rental details:', { rental: this.rental, availableActions: this.availableActions, history: this.history });
      })
    ).subscribe({
      next: result => {
        if (!result.rental) {
          this.rental = null;
          this.rentalError = 'Rental details could not be loaded.';
          return;
        }

        this.rental = result.rental;
        this.availableActions = result.actions;
        this.history = [...result.history.list].sort((left, right) => {
          const leftTime = new Date(getHistoryTimestamp(left) ?? 0).getTime();
          const rightTime = new Date(getHistoryTimestamp(right) ?? 0).getTime();
          return leftTime - rightTime;
        });
        this.rebuildGraph();
      },
      error: () => {
        this.rental = null;
        this.rentalError = 'Rental details could not be loaded.';
      }
    });
  }

  actionRoute(action: RentalActionView): any[] {
    return ['/rental', this.processGuid, 'actions', normalizeActionType(action)];
  }

  trackNode(_: number, node: GraphNode): string {
    return node.id;
  }

  trackEdge(_: number, edge: GraphEdge): string {
    return edge.id;
  }

  private rebuildGraph(): void {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeWidth = 180;
    const nodeHeight = 78;
    const startX = 30;
    const historyY = 70;
    const columnGap = 230;
    const branchStartY = 20;
    const branchGap = 110;

    this.history.forEach((entry, index) => {
      nodes.push({
        id: `history-${index}`,
        label: getHistoryLabel(entry),
        subtitle: formatDateTime(getHistoryTimestamp(entry)),
        x: startX + (index * columnGap),
        y: historyY,
        width: nodeWidth,
        height: nodeHeight,
        variant: 'history',
        route: null,
      });
    });

    const currentNodeX = startX + (this.history.length * columnGap);
    nodes.push({
      id: 'current',
      label: getCurrentStage(this.rental),
      subtitle: 'Current stage',
      x: currentNodeX,
      y: historyY,
      width: nodeWidth,
      height: nodeHeight,
      variant: 'current',
      route: null,
    });

    for (let index = 1; index < this.history.length; index += 1) {
      const previous = nodes[index - 1];
      const current = nodes[index];
      edges.push({
        id: `edge-history-${index}`,
        x1: previous.x + previous.width,
        y1: previous.y + (previous.height / 2),
        x2: current.x,
        y2: current.y + (current.height / 2),
        dashed: false,
      });
    }

    if (this.history.length > 0) {
      const previous = nodes[this.history.length - 1];
      const current = nodes[nodes.length - 1];
      edges.push({
        id: 'edge-current',
        x1: previous.x + previous.width,
        y1: previous.y + (previous.height / 2),
        x2: current.x,
        y2: current.y + (current.height / 2),
        dashed: false,
      });
    }

    this.availableActions.forEach((action, index) => {
      const actionNode: GraphNode = {
        id: `available-${normalizeActionType(action)}`,
        label: getActionLabel(action),
        subtitle: 'Available action',
        x: currentNodeX + columnGap,
        y: branchStartY + (index * branchGap),
        width: nodeWidth,
        height: nodeHeight,
        variant: 'available',
        route: this.actionRoute(action),
      };
      nodes.push(actionNode);

      const currentNode = nodes.find(node => node.id === 'current')!;
      edges.push({
        id: `edge-${actionNode.id}`,
        x1: currentNode.x + currentNode.width,
        y1: currentNode.y + (currentNode.height / 2),
        x2: actionNode.x,
        y2: actionNode.y + (actionNode.height / 2),
        dashed: true,
      });
    });

    this.graphNodes = nodes;
    this.graphEdges = edges;
    this.graphWidth = (nodes.at(-1)?.x ?? startX) + nodeWidth + 30;
    this.graphHeight = Math.max(200, ...nodes.map(node => node.y + node.height + 30));
  }

  protected readonly formatDateTime = formatDateTime;
  protected readonly getActionLabel = getActionLabel;
  protected readonly getCurrentStage = getCurrentStage;
  protected readonly getCustomerDisplay = getCustomerDisplay;
  protected readonly getHistoryLabel = getHistoryLabel;
  protected readonly getProcessGuid = getProcessGuid;
  protected readonly getRentalNotes = getRentalNotes;
  protected readonly getRentalPurpose = getRentalPurpose;
  protected readonly getRentalSubtitle = getRentalSubtitle;
  protected readonly getRentalTitle = getRentalTitle;
  protected readonly getRequestedEnd = getRequestedEnd;
  protected readonly getRequestedStart = getRequestedStart;
  protected readonly normalizeActionType = normalizeActionType;
}
