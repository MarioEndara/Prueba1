import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonList, IonBadge, IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/angular/standalone';
import { SeguimientoService } from '../../services/seguimiento';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.page.html',
  styleUrls: ['./seguimiento.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonList, IonBadge, IonCard, IonCardHeader, IonCardTitle, IonCardContent
  ],
})
export class SeguimientoPage {
  private seguimientoService = inject(SeguimientoService);
  private router = inject(Router);

  // Leemos directamente de la variable en memoria
  get incidencias() {
    return this.seguimientoService.incidenciasGuardadas;
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