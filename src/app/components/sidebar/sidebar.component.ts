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
  { path: 'employees', title: 'Gestion Employés', icon: 'group', class: '' },
  { path: 'leaves', title: 'Gestion Congés', icon: 'event', class: '' },
  { path: 'dahsboard', title: 'dashboard', icon: 'event', class: '' },
  { path: 'my-leaves', title: 'my-leaves', icon: 'event', class: '' },
  { path: 'request-leave', title: 'request-leave', icon: 'event', class: '' },
  { path: 'dashboardemp', title: 'dashboard', icon: 'event', class: '' },

  
];


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: RouteInfo[] = [];

  constructor(private kc: KeycloakService) {}

  ngOnInit() {
    const role = this.kc.getUserRole();
    if (role === 'admin') {
      this.menuItems = ALL_ROUTES.filter(r => r.path === 'employees' || r.path === 'dahsboard'  || r.path === 'leaves');
    } else if (role === 'user') {
      this.menuItems = ALL_ROUTES.filter(r => r.path === 'my-leaves' || r.path === 'request-leave' || r.path === 'dashboardemp');
    }
    console.log(this.kc.keycloak.token);
  }

  isMobileMenu() {
    return $(window).width() <= 991;
  }
}
