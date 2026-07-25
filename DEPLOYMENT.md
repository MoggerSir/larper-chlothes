# Publicación de Larper Chlothes

Dominio canónico: `https://larperchlothes.larpmusic.com.mx`

> GitHub Pages es adecuado para publicar este prototipo sin transacciones
> reales. Para la tienda en producción se recomienda Cloudflare Pages u otro
> hosting comercial.

## GitHub Pages

1. Crear un repositorio nuevo para esta carpeta.
2. Subir la rama `main`.
3. En **Settings → Pages → Build and deployment**, seleccionar **GitHub Actions**.
4. En **Custom domain**, registrar `larperchlothes.larpmusic.com.mx`.
5. Cuando GitHub emita el certificado, activar **Enforce HTTPS**.

El workflow `.github/workflows/deploy.yml` construye y publica automáticamente
la landing con cada `push` a `main`.

## Cloudflare DNS

Crear inicialmente este registro en la zona `larpmusic.com.mx`:

| Tipo | Nombre | Destino | Proxy | TTL |
| --- | --- | --- | --- | --- |
| CNAME | `larperchlothes` | `MoggerSir.github.io` | Solo DNS | Auto |

No apuntar el CNAME al repositorio ni al dominio raíz. Tras verificar el dominio
y habilitar HTTPS en GitHub Pages, se puede probar el proxy naranja de
Cloudflare. Si GitHub pierde la verificación o aparece un error TLS, volver a
**Solo DNS**.

Antes de asociar el dominio, verificar `larpmusic.com.mx` en
**GitHub → Settings → Pages → Add a domain**. GitHub mostrará un TXT semejante
a este, cuyo valor exacto debe copiarse desde la interfaz:

| Tipo | Nombre | Contenido | Proxy |
| --- | --- | --- | --- |
| TXT | `_github-pages-challenge-MoggerSir` | valor proporcionado por GitHub | Solo DNS |

Este TXT debe conservarse para proteger el subdominio contra apropiaciones.

## Alternativa recomendada para producción: Cloudflare Pages

1. En **Workers & Pages**, crear una aplicación de Pages conectada al
   repositorio.
2. Usar `npm run build` como comando y `dist` como directorio de salida.
3. Elegir Node.js 24.
4. Tras el primer despliegue correcto, abrir **Custom domains** y añadir
   `larperchlothes.larpmusic.com.mx`.
5. Cloudflare creará o propondrá automáticamente el CNAME hacia
   `<proyecto>.pages.dev`. No crear ese CNAME manualmente antes de asociar el
   dominio en Pages.
