import {
  defineConfig
} from 'vite';

import react
  from '@vitejs/plugin-react';


export default defineConfig({

  plugins: [

    react()

  ],


  server: {

    proxy: {

      /*
       * =====================================
       * BACKEND API
       * =====================================
       *
       * Frontend:
       *
       * /api/dashboard/summary
       * /api/library
       * /api/google/auth
       * /api/health/database
       *
       * Backend:
       *
       * /dashboard/summary
       * /library
       * /google/auth
       * /health/database
       */

      '/api': {

        target:
            'http://localhost:3000',

        changeOrigin:
            true,

        secure:
            false,


        /*
         * Remove somente o prefixo /api.
         *
         * Exemplo:
         *
         * /api/library
         *
         * vira:
         *
         * /library
         */

        rewrite:
            path =>
                path.replace(
                    /^\/api/,
                    ''
                )

      }

    }

  }

});