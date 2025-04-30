import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../keycloak/keycloak.service';

export const adminGuard: CanActivateFn = () => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);
  const role = keycloakService.getUserRole();
  if (role !== 'admin') {
    router.navigate(['/unauthorized']); // 🔁 ou page d'erreur
    return false;
  }
  return true;
};