import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TrucoArgentum';
  trackClick() {
  if ((window as any).fbq) {
    (window as any).fbq('track', 'Lead');
  }
}
}
