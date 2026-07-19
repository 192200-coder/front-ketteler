import { environment } from '../../../environments/environment';

// La URL del backend viene del entorno activo (dev vs prod).
// Ver src/environments/environment.ts y environment.prod.ts.
export const API_BASE_URL = environment.apiBaseUrl;
