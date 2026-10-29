import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonList, IonBadge, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton
} from '@ionic/angular/standalone';
import { SeguimientoService } from '../../services/seguimiento';
import { IncidenciaService } from '../../services/incidencia';
import { Incidencia } from '../../models/incidencia.model';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.page.html',
  styleUrls: ['./seguimiento.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonList, IonBadge, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton
  ],
})
export class SeguimientoPage {
  private seguimientoService = inject(SeguimientoService);
  private incidenciaService = inject(IncidenciaService);
  private router = inject(Router);

  incidencias: Incidencia[] = [];
  cargando = true;
  errorMensaje = '';

  // Se ejecuta cada vez que entras a la pestaña
  async ionViewWillEnter() {
    await this.cargarSeguimiento();
  }

  async cargarSeguimiento() {
    this.cargando = true;
    this.errorMensaje = '';
    
    const ids = await this.seguimientoService.obtenerIds();
    
    if (ids.length === 0) {
      this.incidencias = [];
      this.cargando = false;
      return;
    }

    // Pedimos las incidencias a la API
    this.incidenciaService.getIncidencias(1, 100).subscribe({
      next: (data) => {
        // Filtramos solo las que están en la lista de seguimiento
        this.incidencias = data.filter(inc => ids.includes(inc.id));
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar seguimiento:', err);
        this.errorMensaje = 'No se pudo conectar con el servidor para cargar los detalles.';
        this.cargando = false;
      }
    });
  }

  verDetalle(id: string) {
    this.router.navigate(['/detalle', id]);
  }

  getColorEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en_proceso': return 'primary';
      case 'resuelta': return 'success';
      default: return 'medium';
    }
  }
}