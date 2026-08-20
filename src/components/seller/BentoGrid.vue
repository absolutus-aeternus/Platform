<template>
  <div class="bento-grid">
    <slot />
  </div>

</template>

<style>
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 0;
}

/* Semantic grid placement classes */
.bento-stat     { grid-column: span 1; }
.bento-chart    { grid-column: span 2; grid-row: span 2; }
.bento-actions  { grid-column: span 2; }
.bento-table    { grid-column: span 4; }
.bento-alerts   { grid-column: span 4; }
.bento-half     { grid-column: span 2; }
.bento-full     { grid-column: span 4; }

/* Tablet */
@media (max-width: 1023px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .bento-stat     { grid-column: span 1; }
  .bento-chart    { grid-column: span 2; grid-row: span 1; }
  .bento-actions  { grid-column: span 2; }
  .bento-table    { grid-column: span 2; }
  .bento-alerts   { grid-column: span 2; }
  .bento-half     { grid-column: span 2; }
  .bento-full     { grid-column: span 2; }
}

/* Mobile */
@media (max-width: 639px) {
  .bento-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .bento-stat,
  .bento-chart,
  .bento-actions,
  .bento-table,
  .bento-alerts,
  .bento-half,
  .bento-full {
    grid-column: span 1;
  }
}
</style>
