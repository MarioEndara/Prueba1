import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonList, IonBadge, IonSpinner,
  IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { IncidenciaService } from '../../services/incidencia';
import { Incidencia } from '../../models/incidencia.model';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.page.html',
  styleUrls: ['./listado.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonList, IonBadge, IonSpinner,
    IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent
  ],
})
export class ListadoPage implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private router = inject(Router);

  incidencias: Incidencia[] = [];
  page: number = 1;
  limit: number = 5;
  hayMasDatos: boolean = true;
  cargando: boolean = false;
  errorMensaje: string = '';

  async ngOnInit() {
    // 1. Carga instantánea desde el almacenamiento local
    const { value } = await Preferences.get({ key: 'cache_incidencias' });
    if (value) {
      this.incidencias = JSON.parse(value);
    }
    
    // 2. Intentar actualizar desde la API
    this.cargarIncidencias(true); 
  }

  cargarIncidencias(reset: boolean = false) {
    if (this.cargando) return;
    this.cargando = true;
    this.errorMensaje = '';

    if (reset) {
      this.page = 1;
      this.hayMasDatos = true;
    }

    this.incidenciaService.getIncidencias(this.page, this.limit).subscribe({
      next: (data) => {
        if (data.length < this.limit) {
          this.hayMasDatos = false;
        }
        
        if (reset) {
          this.incidencias = data;
          Preferences.set({ key: 'cache_incidencias', value: JSON.stringify(data) });
        } else {
          this.incidencias = [...this.incidencias, ...data];
        }
        
        this.page++;
        this.cargando = false;
      },
      error: (err) => {
        this.errorMensaje = err.message;
        this.cargando = false;
      }
    });
  }

  onIonInfinite(event: any) {
    if (!this.hayMasDatos || this.cargando) {
      event.target.complete();
      return;
    }

    this.cargando = true;
    this.incidenciaService.getIncidencias(this.page, this.limit).subscribe({
      next: (data) => {
        if (data.length < this.limit) {
          this.hayMasDatos = false;
        }
        this.incidencias = [...this.incidencias, ...data];
        this.page++;
        this.cargando = false;
        event.target.complete();
      },
      error: (err) => {
        this.cargando = false;
        event.target.complete();
      }
    });
  }

  onRefresh(event: any) {
    this.cargarIncidencias(true);
    event.target.complete();
  }

  getColorEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en_proceso': return 'primary';
      case 'resuelta': return 'success';
      default: return 'medium';
    }
  }

  verDetalle(id: string) {
    this.router.navigate(['/detalle', id]);
  }
}