import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    {
        ignores: [
            "**/node_modules/**",
            "**/lib/**",
            "**/dist/**",
            "**/build/**",
            "**/generated/**",
            "packages/proto/src/generated/**",
            "**/coverage/**",
        ],
    },
    js.configs.recommended,
    {
        files: ["packages/*/src/**/*.ts", "packages/*/tests/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: ["./packages/*/tsconfig.json"],
                tsconfigRootDir: import.meta.dirname,
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
        },
        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/explicit-function-return-type": "off",
        },
    },
];
