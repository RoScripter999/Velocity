const banRules = [
    { filter: /^(node:)?(fs|path|child_process|os|crypto|util)$/, message: "Cannot import node inbuilt modules in browser code. You need to use a native.ts file" },
    { filter: /^react$/, message: "Cannot import from react. React and hooks should be imported from @webpack/common" },
    { filter: /^electron(\/.*)?$/, message: "Cannot import electron in browser code. You need to use a native.ts file" },
    { filter: /^ts-pattern$/, message: "Cannot import from ts-pattern. match and P should be imported from @webpack/common" },
];

export default {
    rules: {
        "no-restricted-imports": {
            meta: {
                type: "problem",
                fixable: "code",
                messages: {
                    noSrcSubpath: "Import from '{{fixed}}' directly, not through '/src'.",
                    bannedImport: "{{message}}"
                }
            },
            create(context) {
                const path = context.filename.toLowerCase();
                const skipBans = path.includes("native") || path.includes("main") || path.includes("preload");

                return {
                    ImportDeclaration(node) {
                        const source = node.source.value;
                        if (typeof source !== "string") return;

                        if (!skipBans && node.importKind !== "type") {
                            const banned = banRules.find(rule => rule.filter.test(source));
                            if (banned) return context.report({ node: node.source, messageId: "bannedImport", data: { message: banned.message } });
                        }

                        // vscode tends to do this for some reason
                        if (source.startsWith("@velocity-types/src")) {
                            const fixed = source.replace("@velocity-types/src", "@velocity-types");
                            context.report({ node: node.source, messageId: "noSrcSubpath", data: { fixed }, fix: f => f.replaceText(node.source, `"${fixed}"`) });
                        }
                    },
                };
            },
        },
    },
};
