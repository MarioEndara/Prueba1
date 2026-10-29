import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class SeguimientoService {
  private KEY = 'incidencias_seguimiento';

  // Obtener todos los IDs guardados
  async obtenerIds(): Promise<string[]> {
    const { value } = await Preferences.get({ key: this.KEY });
    return value ? JSON.parse(value) : [];
  }

  // Verificar si una incidencia está en seguimiento
  async estaEnSeguimiento(id: string): Promise<boolean> {
    const ids = await this.obtenerIds();
    return ids.includes(id);
  }

  // Agregar o quitar de seguimiento
  async toggleSeguimiento(id: string): Promise<boolean> {
    let ids = await this.obtenerIds();
    if (ids.includes(id)) {
      ids = ids.filter(i => i !== id);
      await Preferences.set({ key: this.KEY, value: JSON.stringify(ids) });
      return false; // Ya no está en seguimiento
    } else {
      ids.push(id);
      await Preferences.set({ key: this.KEY, value: JSON.stringify(ids) });
      return true; // Ahora está en seguimiento
    }
  }
}