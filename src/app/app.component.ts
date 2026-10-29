import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar,
  IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, listOutline, bookmarkOutline, addCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    CommonModule, IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar,
    IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, RouterLink
  ]
})
export class AppComponent {
  menuItems = [
    { title: 'Inicio', url: '/home', icon: 'home-outline' },
    { title: 'Incidencias', url: '/listado', icon: 'list-outline' },
    { title: 'Seguimiento', url: '/seguimiento', icon: 'bookmark-outline' },
    { title: 'Registrar', url: '/registro', icon: 'add-circle-outline' }
  ];

  constructor() {
    addIcons({ homeOutline, listOutline, bookmarkOutline, addCircleOutline });
  }
}