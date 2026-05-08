/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2025 Velocitcs and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import stylistic from "@stylistic/eslint-plugin";
import pathAlias from "eslint-plugin-path-alias";
import react from "eslint-plugin-react";
import header from "eslint-plugin-simple-header";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist", "browser"] },
    {
        files: ["src/**/*.{ts,tsx,js,jsx,mjs,mts}", "eslint.config.mjs"],
        settings: {
            react: { version: "18" }
        },
        ...react.configs.flat.recommended,
        rules: {
            ...react.configs.flat.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react/display-name": "off",
            "react/no-unescaped-entities": "off"
        }
    },
    {
        files: ["src/**/*.{ts,tsx,js,jsx,mjs,mts}", "eslint.config.mjs"],
        plugins: {
            "@stylistic": stylistic,
            "@typescript-eslint": tseslint.plugin,
            "simple-header": header,
            "simple-import-sort": simpleImportSort,
            "unused-imports": unusedImports,
            "path-alias": pathAlias
        },
        settings: {
            "import/resolver": {
                map: [
                    ["@webpack", "./src/webpack"],
                    ["@webpack/common", "./src/webpack/common"],
                    ["@utils", "./src/utils"],
                    ["@api", "./src/api"],
                    ["@components", "./src/components"]
                ]
            }
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: ["./tsconfig.json"],
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            "simple-header/header": [
                "error",
                {
                    files: ["scripts/header.txt"],
                    templates: {
                        author: [".*", "Velocitcs and contributors"]
                    }
                }
            ],

            // Stylistic
            "@stylistic/jsx-quotes": ["error", "prefer-double"],
            "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
            "@stylistic/no-mixed-spaces-and-tabs": "error",
            "@stylistic/arrow-parens": ["error", "as-needed"],
            "@stylistic/eol-last": ["error", "always"],
            "@stylistic/no-multi-spaces": "error",
            "@stylistic/no-trailing-spaces": "error",
            "@stylistic/no-whitespace-before-property": "error",
            "@stylistic/semi": ["error", "always"],
            "@stylistic/semi-style": ["error", "last"],
            "@stylistic/space-in-parens": ["error", "never"],
            "@stylistic/block-spacing": ["error", "always"],
            "@stylistic/object-curly-spacing": ["error", "always"],
            "@stylistic/spaced-comment": ["error", "always", { markers: ["!"] }],
            "@stylistic/no-extra-semi": "error",

            // Core ESLint
            "yoda": "error",
            "eqeqeq": ["error", "always", { null: "ignore" }],
            "prefer-const": ["error", { destructuring: "all" }],
            "prefer-spread": "error",
            // These are old deprecated browser globals which may be used by mistake, e.g. `addEventListener(e => console.log(event))`
            "no-restricted-globals": ["error", "event", "name"],
            "comma-dangle": ["error", "never"],
            "no-duplicate-imports": "error",
            "@typescript-eslint/dot-notation": [
                "error",
                {
                    allowPrivateClassPropertyAccess: true,
                    allowProtectedClassPropertyAccess: true
                }
            ],

            // Plugins
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            "unused-imports/no-unused-imports": "error"
        }
    }
);
