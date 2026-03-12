// auth-api/src/lib/auth-api.client.ts
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { toHttpParams } from './http-params';

import { AUTH_API_BASE_URL } from '../core/tokens';
import { ListQueryDto } from './models/query';
import { Guid } from '../core/common';
import { GroupView, ListView, UserView } from './models/views';
import { AddGroupDto, AddKcUserDto, AssignGroupRolesDto, AssignUserToGroupDto, Permissions, UpdateGroupDto, UpdateUserDto } from './models/dtos';

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

  updateUser(userKcId: string, dto: UpdateUserDto): Observable<UserView> {
    return this.http.patch<UserView>(this.url(`/api/v1/auth/users/${userKcId}`), dto);
  }

  getUserRoles(userKcId: string): Observable<Permissions[]> {
    return this.http.get<Permissions[]>(this.url(`/api/v1/auth/users/${userKcId}/roles`));
  }

  deleteUser(userKcId: string): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/auth/users/${userKcId}`));
  }

  getUser(userKcId: string, withGroups: boolean = false): Observable<UserView> {
    let url  = `/api/v1/auth/users/${userKcId}` + (withGroups ? '?include=groups' : '');
    return this.http.get<UserView>(this.url(url));
  }

  listUsers(query: ListQueryDto = {}): Observable<ListView<UserView>> {
    return this.http.get<ListView<UserView>>(
      this.url('/api/v1/auth/users'),
      { params: toHttpParams({ search: query.search ?? undefined, limit: query.limit, offset: query.offset }) }
    );
  }

  listUserGroups(userKcId: string): Observable<GroupView[]> {
    return this.http.get<GroupView[]>(this.url(`/api/v1/auth/users/${userKcId}/groups`));
  }

  listRoles(userKcId: string): Observable<Permissions[]> {
    return this.http.get<Permissions[]>(this.url(`/api/v1/auth/users/${userKcId}/roles`));
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

  getGroup(groupGuid: string, include?: string): Observable<GroupView> {
    const query = include ? `?include=${encodeURIComponent(include)}` : '';
    return this.http.get<GroupView>(this.url(`/api/v1/auth/groups/${groupGuid}${query}`));
  }

  listGroups(query: ListQueryDto = {}): Observable<ListView<GroupView>> {
    return this.http.get<ListView<GroupView>>(
      this.url('/api/v1/auth/groups'),
      { params: toHttpParams({ search: query.search ?? undefined, limit: query.limit, offset: query.offset }) }
    );
  }

  assignUserToGroup(groupGuid: string, dto: AssignUserToGroupDto): Observable<GroupView> {
    return this.http.put<GroupView>(this.url(`/api/v1/auth/groups/${groupGuid}/users`), dto);
  }

  getGroupUsers(groupGuid: string, query: ListQueryDto = {}): Observable<ListView<UserView>> {
    return this.http.get<ListView<UserView>>(
      this.url(`/api/v1/auth/groups/${groupGuid}/users`),
      { params: toHttpParams({ search: query.search ?? undefined, limit: query.limit, offset: query.offset }) }
    );
  }

  assignGroupRoles(groupGuid: string, dto: AssignGroupRolesDto): Observable<GroupView> {
    return this.http.put<GroupView>(this.url(`/api/v1/auth/groups/${groupGuid}/roles`), dto);
  }

  removeUserFromGroup(groupGuid: string, userKcId: string): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/auth/groups/${groupGuid}/users/${userKcId}`));
  }

  getGroupRoles(groupGuid: string): Observable<Permissions[]> {
    return this.http.get<Permissions[]>(this.url(`/api/v1/auth/groups/${groupGuid}/roles`));
  }
}
