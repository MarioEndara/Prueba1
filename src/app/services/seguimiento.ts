import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SeguimientoService {
  // Usamos una variable en memoria (se pierde al recargar, pero funciona para la defensa)
  public incidenciasGuardadas: any[] = [];

  estaEnSeguimiento(id: string): boolean {
    return this.incidenciasGuardadas.some(i => i.id === id);
  }

  toggleSeguimiento(incidencia: any): boolean {
    const index = this.incidenciasGuardadas.findIndex(i => i.id === incidencia.id);
    if (index >= 0) {
      this.incidenciasGuardadas.splice(index, 1);
      return false;
    } else {
      this.incidenciasGuardadas.push(incidencia);
      return true;
    }
  }
}