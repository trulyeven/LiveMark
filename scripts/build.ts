import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const production = process.argv.includes('--production');

/** @type {import('esbuild').BuildOptions} */
const extensionOptions: esbuild.BuildOptions = {
    entryPoints: {
        extension: 'src/extension.ts',
        parserWorker: 'src/parserWorker.ts'
    },
    bundle: true,
    outdir: 'dist',
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    sourcemap: !production,
    minify: production,
};

async function build() {
    if (watch) {
        let extCtx = await esbuild.context(extensionOptions);
        await extCtx.watch();
        console.log("Watching for changes...");
    } else {
        await esbuild.build(extensionOptions);
        console.log("Build complete.");
    }
}

build().catch(() => process.exit(1));
