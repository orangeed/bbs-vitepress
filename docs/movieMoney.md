---
layout: false
head:
  - - link
    - rel: preconnect
      href: https://fonts.googleapis.com
  - - link
    - rel: preconnect
      href: https://fonts.gstatic.com
      crossorigin: ""
  - - link
    - rel: stylesheet
      href: https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap
  - - script
    - {}
    - |
      (function() {
        var saved = localStorage.getItem('vitepress-theme-appearance');
        if (saved === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
          localStorage.setItem('vitepress-theme-appearance', 'dark');
        }
      })();
---

<script setup lang="ts">
import MovieMoney from './components/CinemaBoxOffice.vue'
</script>

<MovieMoney apiKey='54e17a11b869adc4b782905be71335fb'/>
