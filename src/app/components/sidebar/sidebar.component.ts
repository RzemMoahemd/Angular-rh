import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'app/services/keycloak/keycloak.service';

declare const $: any

declare interface RouteInfo {
  path: string
  title: string
  icon: string
  class: string
}

export const ALL_ROUTES: RouteInfo[] = [
  // Admin Routes
  { path: "dashboard", title: "Tableau de bord", icon: "dashboard", class: "" },
  { path: "employees", title: "Employés", icon: "group", class: "" },
  { path: "leaves", title: "Congés", icon: "date_range", class: "" },
  { path: "performance", title: "Performances", icon: "assessment", class: "" },
  { path: "job-requests", title: "Offres d'emploi", icon: "work", class: "" },
  { path: "applications", title: "Candidatures", icon: "assignment", class: "" },

  // Employee Routes
  { path: "dashboardemp", title: "Mon Profil", icon: "person", class: "" },
  { path: "my-leaves", title: "Mes Congés", icon: "date_range", class: "" },
  { path: "my-performance", title: "Mes Performances", icon: "assessment", class: "" },
  { path: "jobs", title: "Offres d'emploi", icon: "work", class: "" },
  { path: "my-applications", title: "Mes candidatures", icon: "assignment", class: "" },
]

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit {
  menuItems: RouteInfo[] = []

  constructor(private kc: KeycloakService) {}

  logout() {
    this.kc.logout()
  }

  ngOnInit() {
    const role = this.kc.getUserRole() // Assuming getUserRole returns a single string like 'admin' or 'user'

    if (role === "admin") {
      this.menuItems = ALL_ROUTES.filter(
        (r) =>
          r.path === "dashboard" ||
          r.path === "employees" ||
          r.path === "leaves" ||
          r.path === "performance" ||
          r.path === "job-requests" ||
          r.path === "applications",
      )
    } else if (role === "user") {
      this.menuItems = ALL_ROUTES.filter(
        (r) =>
          r.path === "my-leaves" ||
          r.path === "dashboardemp" ||
          r.path === "my-performance" ||
          r.path === "jobs" ||
          r.path === "my-applications",
      )
    } else {
      this.menuItems = [] // Handle cases where the role is not recognized
    }

    console.log(this.kc.keycloak.token)
  }

  isMobileMenu() {
    return $(window).width() <= 991
  }
}

