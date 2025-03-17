# simplifying react-router website setup

So the first step is to migrate from remix to react-router. Then add in the react-router config the server build file config to change where the react-router will place the server file. Then install the hono server plugin for Vite, which will now replace the build server index.js file with one that can be directly run with Node.js. Now you can skip installing the react-router serve in your Docker image, making it much simpler and more robust.
