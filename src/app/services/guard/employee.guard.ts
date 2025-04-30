// src/app/services/guard/employee.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../keycloak/keycloak.service';

export const employeeGuard: CanActivateFn = () => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);
  const role = keycloakService.getUserRole();
  if (role !== 'user') {
    router.navigate(['/unauthorized']);
    return false;
  }
  return true;
};
