import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index"],
  declaration: true,
  clean: true,

  rollup: {
    emitCJS: true,
    esbuild: {
      target: "node18",
      loaders: {
        ".ts": "ts"
      }
    }
  }
});
