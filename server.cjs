// server.cjs
const express = require('express');
const { createSSRApp } = require('vue');
const { renderToString } = require('@vue/server-renderer');

const app = express();

// Serve static files
app.use(express.static('dist'));

// Handle SSR
app.get('*', async (req, res) => {
  const ssrApp = createSSRApp(await import('./src/App.vue')); // Adjust path if necessary

  // Dynamically import the router
  const { createRouter } = await import('./src/router/index.js'); // Adjust path if necessary
  const router = createRouter();
  
  ssrApp.use(router);
  router.push(req.originalUrl);
  
  await router.isReady();
  
  const html = await renderToString(ssrApp);
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Vue SSR App</title>
      </head>
      <body>
        <div id="app">${html}</div>
        <script type="module" src="/src/main.js"></script>
      </body>
    </html>
  `);
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
