import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonButton, IonIcon, IonRefresher, IonRefresherContent, IonCardContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { listOutline, addCircleOutline, bookmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonRefresherContent, IonRefresher, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonButton, IonIcon
  ],
})
export class HomePage {
  private router = inject(Router);

  constructor() {
    addIcons({ listOutline, addCircleOutline, bookmarkOutline });
  }

  irAListado() {
    this.router.navigate(['/listado']);
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }

  irASeguimiento() {
    this.router.navigate(['/seguimiento']);
  }
}