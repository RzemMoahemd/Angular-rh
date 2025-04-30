import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { UserProfil } from './user-profile';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {

  private _keycloak: Keycloak | undefined;
  private _profile: UserProfil | undefined;

  get keycloak() {
    if (!this._keycloak){
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

  constructor() { }



  async init ():Promise<void>{
    const authenticated:boolean = await this.keycloak?.init({
      onLoad: 'login-required',
    });

    if(authenticated){
      this._profile = (await this.keycloak?.loadUserProfile()) as UserProfil;
      this._profile.token = this.keycloak?.token;
      console.log('Token:', this._profile.token);
    }
  }

  login (){
    return this.keycloak?.login();
  }

  logout(){
    return this.keycloak?.logout({redirectUri: 'http:localhost:4200'});
  }


  getUserRole(): string | null {
    const tokenParsed = this.keycloak?.tokenParsed;
    if (tokenParsed && tokenParsed['realm_access']?.roles) {
      const roles: string[] = tokenParsed['realm_access'].roles;
      if (roles.includes('admin')) {
        return 'admin';
      } else if (roles.includes('user')) {
        return 'user'; 
      }
    }
    return null;
  }


}
