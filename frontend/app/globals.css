@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-display: "Fraunces", serif;
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;

  --bg: 246 246 248; /* off-white premium, nunca branco puro */
  --surface: 255 255 255;
  --surface-raised: 255 255 255;
  --text-primary: 23 23 26;
  --text-secondary: 108 108 116;
  --border: 228 228 233;
  --accent: 10 132 255; /* azul Apple, subtil */
}

.dark {
  --bg: 15 16 18; /* grafite, nunca preto absoluto */
  --surface: 26 27 31; /* carvão */
  --surface-raised: 33 34 39;
  --text-primary: 245 245 247;
  --text-secondary: 142 142 150;
  --border: 40 41 46; /* linha subtil sobre grafite */
  --accent: 10 132 255;
}

@layer base {
  * {
    @apply border-[rgb(var(--border))];
  }
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-[rgb(var(--bg))] text-[rgb(var(--text-primary))] font-sans antialiased;
    transition: background-color 0.3s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }
  ::selection {
    @apply bg-signal/30;
  }
  :focus-visible {
    outline: 2px solid rgb(var(--accent));
    outline-offset: 2px;
    border-radius: 4px;
  }
  button, a {
    transition: all 0.18s cubic-bezier(0.22, 1, 0.36, 1);
  }
  input, textarea, select {
    transition: box-shadow 0.18s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.18s ease;
  }
  input:focus, textarea:focus, select:focus {
    box-shadow: 0 0 0 3px rgb(var(--accent) / 0.15);
  }
}

@layer utilities {
  .text-muted {
    color: rgb(var(--text-secondary));
  }
  .bg-surface {
    background-color: rgb(var(--surface));
  }
  .bg-surface-raised {
    background-color: rgb(var(--surface-raised));
  }
  /* Vidro fosco — usado com moderação: sidebar, modais, command palette, painéis flutuantes */
  .glass {
    background-color: rgb(var(--surface) / 0.72);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
  }
  .glass-strong {
    background-color: rgb(var(--surface) / 0.88);
    backdrop-filter: blur(32px) saturate(1.5);
    -webkit-backdrop-filter: blur(32px) saturate(1.5);
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
