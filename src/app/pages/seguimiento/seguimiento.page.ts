import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonList, IonBadge, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent
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
    IonList, IonBadge, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent
  ],
})
export class SeguimientoPage implements OnInit {
  private seguimientoService = inject(SeguimientoService);
  private incidenciaService = inject(IncidenciaService);
  private router = inject(Router);

  incidencias: Incidencia[] = [];
  cargando = true;

  // Se ejecuta cada vez que entras a la pestaña
  async ionViewWillEnter() {
    await this.cargarSeguimiento();
  }

  ngOnInit() {
    // Lo dejamos vacío porque usamos ionViewWillEnter para que se actualice siempre
  }

  async cargarSeguimiento() {
    this.cargando = true;
    const ids = await this.seguimientoService.obtenerIds();
    
    if (ids.length === 0) {
      this.incidencias = [];
      this.cargando = false;
      return;
    }

    // Descargamos todas las incidencias y filtramos solo las que están en seguimiento
    // (En un caso real, se haría una consulta por ID, pero para MockAPI es más rápido así)
    this.incidenciaService.getIncidencias(1, 100).subscribe({
      next: (data) => {
        this.incidencias = data.filter(inc => ids.includes(inc.id));
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar seguimiento:', err);
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