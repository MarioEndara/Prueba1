import { Component, OnInit, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton
} from '@ionic/angular/standalone';
import { IncidenciaService } from '../../services/incidencia';
import { Incidencia } from '../../models/incidencia.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton],
})
export class HomePage implements OnInit {
  private incidenciaService = inject(IncidenciaService);

  ngOnInit() {
    this.incidenciaService.getIncidencias(1, 5).subscribe({
      next: (data: Incidencia[]) => {
        console.log('✅ Datos recibidos de MockAPI:', data);
      },
      error: (err) => {
        console.error('❌ Error al conectar:', err.message);
      }
    });
  }
}