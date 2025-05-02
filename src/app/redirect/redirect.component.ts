import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from '../services/keycloak/keycloak.service';

@Component({
  selector: 'app-redirect',
  template: `
    <div class="redirect-spinner">Chargement...</div>
  `
})
export class RedirectComponent implements OnInit {
  constructor(
    private router: Router,
    public kc: KeycloakService
  ) {}

  async ngOnInit(): Promise<void> {
    const waitUntilReady = () => new Promise(resolve => {
      const check = () => this.kc.isReady ? resolve(true) : setTimeout(check, 50);
      check();
    });

    await waitUntilReady();

    const role = this.kc.getUserRole();
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'user') {
      this.router.navigate(['/employee']);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }
}

