import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'app/services/keycloak/keycloak.service';

declare const $: any;

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}

export const ALL_ROUTES: RouteInfo[] = [
  { path: 'dahsboard', title: 'dashboard', icon: 'event', class: '' },
  { path: 'employees', title: 'Gestion Employés', icon: 'group', class: '' },
  { path: 'leaves', title: 'Gestion Congés', icon: 'event', class: '' },
  { path: 'performance', title: 'Gestion performances', icon: 'event', class: '' },

  
  //{ path: 'request-leave', title: 'request-leave', icon: 'event', class: '' },
  { path: 'dashboardemp', title: 'dashboard', icon: 'event', class: '' },
  { path: 'my-leaves', title: 'my-leaves', icon: 'event', class: '' },  
  { path: 'my-performance', title: 'my-performance', icon: 'event', class: '' },
  

  
];


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: RouteInfo[] = [];

  constructor(private kc: KeycloakService) {}

  logout() {
    this.kc.logout();
  }

  ngOnInit() {
    const role = this.kc.getUserRole();
    if (role === 'admin') {
      this.menuItems = ALL_ROUTES.filter(r => r.path === 'employees' || r.path === 'dahsboard'  || r.path === 'leaves' || r.path === 'performance' );
    } else if (role === 'user') {
      this.menuItems = ALL_ROUTES.filter(r => r.path === 'my-leaves'  || r.path === 'dashboardemp' || r.path ==='my-performance');
    }
    console.log(this.kc.keycloak.token);
  
  }

  isMobileMenu() {
    return $(window).width() <= 991;
  }
}
