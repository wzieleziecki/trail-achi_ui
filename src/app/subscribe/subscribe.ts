import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // <-- WAŻNE
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { DataService } from '../data';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subscribe.html',
  styleUrls: ['./subscribe.css']
})
export class SubscribeComponent implements OnInit, AfterViewInit, OnDestroy {
  currentSection: 'map' | 'subscribe' = 'map';
  registrationForm!: FormGroup;
  loading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  private map!: L.Map;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dataService: DataService,
    @Inject(PLATFORM_ID) private platformId: Object // Wstrzyknięcie informacji o platformie
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const formElement = document.getElementById('formSection');
      if (formElement) {
        const rect = formElement.getBoundingClientRect();
        this.currentSection = rect.top < 200 ? 'subscribe' : 'map';
      }
    }
  }

  scrollTo(sectionId: string) {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 70;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngAfterViewInit(): void {
    // Odpalamy mapę TYLKO w przeglądarce i po krótkim timeout, żeby DOM zdążył się "wykuć"
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initMap();
        this.loadMapData();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.remove(); }
  }

  private initMap(): void {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return; // Zabezpieczenie przed błędem "container not found"

    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map('map', {
      scrollWheelZoom: false,
      dragging: true
    }).setView([52.06, 19.48], 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);


    this.map.invalidateSize();
  }

  private loadMapData(): void {
    this.dataService.getPoints().subscribe({
      next: (geojsonData: any) => {
        if (!geojsonData || !this.map) return;
        const geoJsonLayer = L.geoJSON(geojsonData, {
          onEachFeature: (feature: any, layer: any) => {
            const p = feature.properties;
            const badgesHtml = p.badges ? p.badges.map((b: string) => `🏆 ${b}`).join('<br>') : '';
            layer.bindPopup(`
              <div style="font-family: 'Inter', sans-serif;">
                <strong style="color: #fc4c02;">⛰️ ${p.name}</strong><br>
                <span>Wysokość: ${p.elevation || '---'} m</span><br>
                <div style="margin-top: 5px; font-size: 11px;">${badgesHtml}</div>
              </div>
            `);
          }
        }).addTo(this.map);

        if (geoJsonLayer.getBounds().isValid()) {
          this.map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
        }
      },
      error: (err: any) => console.error('Błąd pobierania danych mapy:', err)
    });
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.errorMessage = 'Proszę podać poprawny adres e-mail.';
      return;
    }
    this.loading = true;
    this.authService.registerUser(this.registrationForm.value.email).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '🎉 Super! Link aktywacyjny został wysłany.';
        this.registrationForm.disable();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.status === 409 ? 'ℹ️ Masz już u nas konto!' : '⚠️ Problem z serwerem.';
      }
    });
  }
}
