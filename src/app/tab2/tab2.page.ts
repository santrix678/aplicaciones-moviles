import { Component } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardSubtitle, 
  IonCardTitle, 
  IonCardContent, 
  IonChip, 
  IonLabel, 
  IonProgressBar, 
  IonRow, 
  IonItem, 
  IonIcon, 
  IonButton 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, checkmarkCircleOutline, locationOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonCard, 
    IonCardHeader, 
    IonCardSubtitle, 
    IonCardTitle, 
    IonCardContent, 
    IonChip, 
    IonLabel, 
    IonProgressBar, 
    IonRow, 
    IonItem, 
    IonIcon, 
    IonButton
  ]
})
export class Tab2Page {
  constructor() {
    addIcons({ timeOutline, checkmarkCircleOutline, locationOutline });
  }
}
