import { Component } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { AuthApiClient } from '../../core/api/auth/auth-api.client';

export interface PeriodicElement {
  name: string;
  firstName: string;
  lastName: string;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {name: 'Hydrogen', weight: 1.0079, symbol: 'H', firstName: 'John', lastName: 'Doe'},
  {name: 'Helium', weight: 4.0026, symbol: 'He', firstName: 'Jane', lastName: 'Smith'},
  {name: 'Lithium', weight: 6.941, symbol: 'Li', firstName: 'Alice', lastName: 'Johnson'},
  {name: 'Beryllium', weight: 9.0122, symbol: 'Be', firstName: 'Bob', lastName: 'Brown'},
  {name: 'Boron', weight: 10.811, symbol: 'B', firstName: 'Charlie', lastName: 'Davis'},
];
@Component({
  selector: 'app-user',
  imports: [MatTableModule],
  templateUrl: './user.html',
  styleUrl: './user.css',
  providers: [AuthApiClient]
})
export class User {

  constructor(private authApiClient: AuthApiClient) {
    authApiClient.listUsers().subscribe(users => {
      console.log(users);
    });
  }
  
  displayedColumns: string[] = ['firstName', 'lastName'];
  dataSource = ELEMENT_DATA;
}
