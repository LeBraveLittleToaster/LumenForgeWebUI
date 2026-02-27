import { Component } from '@angular/core';
import { InventoryApiClient } from '../../core/api/inventory/inventory-api.client';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-category',
  imports: [MatButtonModule],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category {
  constructor(private readonly api: InventoryApiClient) {}
  
  loadCategories() {
    this.api.listCategories().subscribe(categories => {
      console.log(categories);
    });
  }
}
