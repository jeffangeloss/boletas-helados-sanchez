# Helados Donofrio POS (PWA)

Aplicacion web instalable (PWA) para registrar pedidos en la manana, sobras en la tarde y calcular cobros sin errores de boletas antiguas. Pensada para tablet o PC en modo kiosko.

## Requisitos
- Node.js 20.19+ / 22.12+ / 24+
- pnpm (recomendado) o npm

## Instalacion rapida (npm)
```bash
npm install
cp .env.example .env.local
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Instalacion rapida (pnpm)
```bash
pnpm install
cp .env.example .env.local
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

En `.env.local` puedes cambiar `SESSION_SECRET` y el nombre de la app.

Abre `http://localhost:3000` y listo.

## Roles y acceso
- OPERADOR: solo puede usar Pedido (manana), Cierre/Cobro (tarde) y ver historial basico del vendedor.
- ADMIN (Jeff): todo lo anterior + gestion de productos, precios, vendedores, reportes y configuracion de bateria.
- PIN:
  - Jeff (ADMIN): `1414`
  - Papa/Mama (OPERADOR): `0000`
- El boton "Admin" es discreto y pide PIN para ingresar.

## Fotos de vendedores (opcional)
- Coloca las fotos en `public/vendors/<CODIGO>.jpg` o `public/vendors/<CODIGO>.png`.
- Ejemplo: si el vendedor tiene codigo `V003`, el archivo debe llamarse `public/vendors/V003.jpg`.
- La foto se muestra en Pedido, Cierre y en la boleta impresa.

## Flujo de trabajo
1) **Pedido (manana)**  
   Selecciona vendedor, revisa sobras de ayer y registra pedido de hoy.
2) **Cierre/Cobro (tarde)**  
   Registra sobras de hoy, el sistema calcula vendidas y subtotal por producto.  
   Se aplica cargo de bateria y se marca como COBRADO o A CUENTA.

## Reglas clave
- `vendidas = pedido_hoy + sobras_ayer - sobras_hoy`
- `subtotal = vendidas * precio_usado`
- `total = suma(subtotales) + bateria`
- Sobras de ayer se autollenan con la ultima sobras de ese vendedor.
- Precios se congelan por boleta (historico no cambia).
- Si sobras_hoy > sobras_ayer + pedido_hoy, se pide confirmacion y motivo.

## Admin: cambiar precios
1) Entra a **Admin** (PIN de Jeff).
2) En **Productos**, escribe el nuevo precio y fecha efectiva.
3) Guarda. Ese precio aplica solo a boletas futuras.

## Admin: reportes y export
- **Reporte del dia**: totales, baterias, boletas pagadas/deuda y top productos.
- **Reporte del dia**: incluye top vendedores por monto.
- **Export CSV**: rango de fechas y descarga en `.csv`.

## PWA y modo kiosko
- La app genera un `manifest.json` y puede instalarse desde el navegador.
- SQLite es local, por lo que funciona offline de manera basica.

## Comandos utiles
```bash
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

