import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from './services/keycloak/keycloak.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit(): void {
    const role = this.keycloakService.getUserRole(); // 👈 ta méthode existante
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'user') {
      this.router.navigate(['/employee']);
    }
  }
}
