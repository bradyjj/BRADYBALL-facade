import { Component, OnInit } from '@angular/core';

interface CRTEffects {
    scanlines: boolean;
    flicker: boolean;
    phosphor: boolean;
    glow: boolean;
    rollingScan: boolean;
}

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    isSettingsOpen = false;

    crtEffects: CRTEffects = {
        scanlines: true,
        flicker: true,
        phosphor: true,
        glow: true,
        rollingScan: true,
    };

    ngOnInit() {
        console.log('Header component initialized');

        // Load saved settings from localStorage
        const saved = localStorage.getItem('bradyball-crt-effects');
        if (saved) {
            this.crtEffects = JSON.parse(saved);
            console.log('Loaded CRT effects:', this.crtEffects);
        }
        this.applyCRTEffects();
    }

    toggleEffect(effect: keyof CRTEffects) {
        this.crtEffects[effect] = !this.crtEffects[effect];
        this.applyCRTEffects();
        this.saveSettings();
    }

    private applyCRTEffects() {
        console.log('Applying CRT effects:', this.crtEffects);

        // Apply effects to document body
        document.body.classList.toggle('crt-scanlines-disabled', !this.crtEffects.scanlines);
        document.body.classList.toggle('crt-flicker-disabled', !this.crtEffects.flicker);
        document.body.classList.toggle('crt-phosphor-disabled', !this.crtEffects.phosphor);
        document.body.classList.toggle('crt-glow-disabled', !this.crtEffects.glow);
        document.body.classList.toggle('crt-rolling-scan-disabled', !this.crtEffects.rollingScan);

        console.log('Body classes:', document.body.classList.toString());
    }

    private saveSettings() {
        localStorage.setItem('bradyball-crt-effects', JSON.stringify(this.crtEffects));
    }

    toggleSettings() {
        this.isSettingsOpen = !this.isSettingsOpen;
    }
}