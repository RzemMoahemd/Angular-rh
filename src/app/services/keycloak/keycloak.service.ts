import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { UserProfil } from './user-profile';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private _keycloak?: Keycloak;
  private _profile?: UserProfil;
  private _ready = false;

  get isReady(): boolean {
    return this._ready;
  }

  get keycloak(): Keycloak {
    if (!this._keycloak) {
      this._keycloak = new Keycloak({
        url: 'http://localhost:8061',
        realm: 'gestion-rh',
        clientId: 'rh'
      });
    }
    return this._keycloak;
  }

  get profile(): UserProfil | undefined {
    return this._profile;
  }

  async init(): Promise<boolean> {
    const authenticated = await this.keycloak.init({ onLoad: 'login-required' });
    if (authenticated) {
      this._profile = await this.keycloak.loadUserProfile() as UserProfil;
      this._profile.token = this.keycloak.token;
    }
    this._ready = true;
    return authenticated;
  }
  

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: 'http://localhost:4200' });
  }

  getUserRole(): 'admin' | 'user' | null {
    const tokenParsed = this.keycloak?.tokenParsed;

    if (tokenParsed && tokenParsed['realm_access']?.roles) {
      const roles: string[] = tokenParsed['realm_access'].roles;
      if (roles.includes('admin')) return 'admin';
      if (roles.includes('user')) return 'user';
    }

    return null;
  }
}
