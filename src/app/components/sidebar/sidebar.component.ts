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
  { path: 'dahsboard', title: 'Tableau de bord', icon: 'dashboard', class: '' },
  { path: 'employees', title: 'Employés', icon: 'group', class: '' },
  { path: 'leaves', title: 'Congés', icon: 'date_range', class: '' },
  { path: 'performance', title: 'Performances', icon: 'assessment', class: '' },

  
  //{ path: 'request-leave', title: 'request-leave', icon: 'event', class: '' },
  { path: 'dashboardemp', title: 'Mon Profil', icon: 'person', class: '' },
  { path: 'my-leaves', title: 'Mes Congés', icon: 'date_range', class: '' },  
  { path: 'my-performance', title: 'Mes Performances', icon: 'assessment', class: '' },
  

  
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
