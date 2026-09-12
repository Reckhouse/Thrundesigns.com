# Basis transcoder

The JavaScript wrapper is patched by `node scripts/patch-basis-csp.cjs` to replace
Emscripten's two dynamically generated binding invokers with ordinary closures.
The matching WebAssembly binary is unchanged. This lets KTX2 model textures
decode under the production CSP without allowing `unsafe-eval`.

After updating the wrapper, rerun the patch and `node --test scripts/basis-csp.test.cjs`.
Verify actual model rendering in a production build (development CSP permits
evaluation and cannot detect this regression).
