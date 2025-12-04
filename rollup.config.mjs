import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { builtinModules } from "module";

const config = [
  // ESM Build
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      format: "esm",
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: "src",
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      resolve({
        preferBuiltins: true,
        extensions: [".js", ".ts"],
      }),
      commonjs(),
      json(),
    ],
  },
  // CJS Build
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      resolve({
        preferBuiltins: true,
        extensions: [".js", ".ts"],
      }),
      commonjs(),
      json(),
    ],
  },
  // Types
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "esm",
    },
    plugins: [
      dts({
        respectExternal: true,
        compilerOptions: {
          removeComments: false,
        },
      }),
    ],
    external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
  },
];

export default config;
