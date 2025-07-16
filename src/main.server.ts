import { enableProdMode } from '@angular/core';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { AppServerModule } from './app/app.server.module';

enableProdMode();

export { AppServerModule, ngExpressEngine };
