const { defineConfig } = require("vite");

export default defineConfig ({
    build: {
        // Build in root as Github pages is hosting the entire repo for access to ./Database/... !! 
        outDir: '.', 
        // Don't remove previous builds since we are in the root directory and it will destroy everything AAAAAA
        emptyOutDir: false
    }
})