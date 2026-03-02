// inventory-api/src/lib/inventory-api.client.ts
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { toHttpParams } from './http-params';

import { AUTH_API_BASE_URL } from './token';
import { ListQueryDto } from './models/query';
import { Guid } from './common/common';
import { GroupView, UserView } from './models/views';
import { AddGroupDto, AddKcUserDto, AssignGroupRolesDto, AssignUserToGroupDto, Role, UpdateGroupDto, UpdateUserDto } from './models/dtos';

@Injectable({ providedIn: 'root' })
export class AuthApiClient {
  constructor(
    private readonly http: HttpClient,
    @Inject(AUTH_API_BASE_URL) private readonly baseUrl: string
  ) {}

  private url(path: string): string {
    const b = this.baseUrl?.replace(/\/+$/, '') ?? '';
    const p = path.startsWith('/') ? path : `/${path}`;
    const url = `${b}${p}`;
    console.log(`AuthApiClient: constructed URL: ${url}`);
    return url;
  }

  // -------------------------
  // Users (api/v1/auth/users)
  // -------------------------
  registerUser(dto: AddKcUserDto): Observable<UserView> {
    return this.http.put<UserView>(this.url('/api/v1/auth/users'), dto);
  }

  /*
  TODO: implement remaining endpoints
  updateUser(userKcId: string, dto: UpdateUserDto): Observable<UserView> {
    return this.http.patch<UserView>(this.url(`/api/v1/auth/users/${userKcId}`), dto);
  }
  */

  deleteUser(userKcId: string): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/auth/users/${userKcId}`));
  }

  getUser(userKcId: string): Observable<UserView> {
    return this.http.get<UserView>(this.url(`/api/v1/auth/users/${userKcId}`));
  }

  listUsers(query: ListQueryDto = {}): Observable<UserView[]> {
    return this.http.get<UserView[]>(
      this.url('/api/v1/auth/users'),
      { params: toHttpParams({ search: query.search ?? undefined, limit: query.limit, offset: query.offset }) }
    );
  }

  listUserGroups(userKcId: string): Observable<GroupView[]> {
    return this.http.get<GroupView[]>(this.url(`/api/v1/auth/users/${userKcId}/groups`));
  }

  listRoles(userKcId: string): Observable<Role[]> {
    return this.http.get<Role[]>(this.url(`/api/v1/auth/users/${userKcId}/roles`));
  }

  // -------------------------
  // Groups (api/v1/auth/groups)
  // -------------------------
  createGroup(dto: AddGroupDto): Observable<GroupView> {
    return this.http.put<GroupView>(this.url('/api/v1/auth/groups'), dto);
  }

  updateGroup(groupGuid: string, dto: UpdateGroupDto): Observable<GroupView> {
    return this.http.patch<GroupView>(this.url(`/api/v1/auth/groups/${groupGuid}`), dto);
  }

  deleteGroup(groupGuid: string): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/auth/groups/${groupGuid}`));
  }

  getGroup(groupGuid: string): Observable<GroupView> {
    return this.http.get<GroupView>(this.url(`/api/v1/auth/groups/${groupGuid}`));
  }

  listGroups(query: ListQueryDto = {}): Observable<GroupView[]> {
    return this.http.get<GroupView[]>(
      this.url('/api/v1/auth/groups'),
      { params: toHttpParams({ search: query.search ?? undefined, limit: query.limit, offset: query.offset }) }
    );
  }

  assignUserToGroup(groupGuid: string, dto: AssignUserToGroupDto): Observable<GroupView> {
    return this.http.put<GroupView>(this.url(`/api/v1/auth/groups/${groupGuid}/users`), dto);
  }

  getGroupUsers(groupGuid: string): Observable<UserView[]> {
    return this.http.get<UserView[]>(this.url(`/api/v1/auth/groups/${groupGuid}/users`));
  }
  removeUserFromGroup(groupGuid: string, userKcId: string): Observable<GroupView> {
    return this.http.delete<GroupView>(this.url(`/api/v1/auth/groups/${groupGuid}/users/${userKcId}`));
  }
  
  assignGroupRoles(groupGuid: string, dto: AssignGroupRolesDto): Observable<GroupView> {
    return this.http.put<GroupView>(this.url(`/api/v1/auth/groups/${groupGuid}/roles`), dto);
  }

  getGroupRoles(groupGuid: string): Observable<Role[]> {
    return this.http.get<Role[]>(this.url(`/api/v1/auth/groups/${groupGuid}/roles`));
  }
}