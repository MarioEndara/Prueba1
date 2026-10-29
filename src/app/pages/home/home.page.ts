import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonList, IonBadge, IonSpinner,
  IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonMenuToggle
} from '@ionic/angular/standalone';
import { IncidenciaService } from '../../services/incidencia';
import { Incidencia } from '../../models/incidencia.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonList, IonBadge, IonSpinner,
    IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonMenuToggle
  ],
})
export class HomePage implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private router = inject(Router);

  incidencias: Incidencia[] = [];
  page: number = 1;
  limit: number = 5;
  hayMasDatos: boolean = true;
  cargando: boolean = false;
  errorMensaje: string = '';

  ngOnInit() {
    this.cargarIncidencias(true);
  }

  cargarIncidencias(reset: boolean = false) {
    if (this.cargando || (!this.hayMasDatos && !reset)) return;

    this.cargando = true;
    this.errorMensaje = '';

    if (reset) {
      this.page = 1;
      this.hayMasDatos = true;
      this.incidencias = [];
    }

    this.incidenciaService.getIncidencias(this.page, this.limit).subscribe({
      next: (data) => {
        if (data.length < this.limit) {
          this.hayMasDatos = false;
        }
        this.incidencias = [...this.incidencias, ...data];
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
    if (!this.hayMasDatos) {
      event.target.complete();
      return;
    }

    this.incidenciaService.getIncidencias(this.page, this.limit).subscribe({
      next: (data) => {
        if (data.length < this.limit) {
          this.hayMasDatos = false;
        }
        this.incidencias = [...this.incidencias, ...data];
        this.page++;
        event.target.complete();
      },
      error: (err) => {
        this.errorMensaje = err.message;
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