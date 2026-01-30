# LumenForge Web UI (Angular)

This project is the Angular + Angular Material port of the LumenForge Web UI. It provides the same navigation structure as the previous React app, using Angular routing and Material layout components.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:4200`.

### Build for production

```bash
npm run build
```

## Docker

```bash
docker build -t lumenforge-webui .
docker run -p 3000:3000 lumenforge-webui
```

The production image serves the compiled Angular build from `dist/lumenforge-webui`.
