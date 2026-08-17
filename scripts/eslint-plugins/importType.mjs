
export default {
    rules: {
        "no-value-type-imports": {
            meta: {
                type: "problem",
                fixable: "code",
                schema: [],
                messages: {
                    useImportType: "All imports from '{{source}}' are types only, use `import type`.",
                    markTypeOnly: "'{{name}}' is only used as a type, mark it with `import type`."
                }
            },
            create(context) {
                const sourceCode = context.sourceCode;

                function getUsage(name, scope) {
                    const variable = scope.variables.find(v => v.name === name);
                    if (!variable || !variable.references.length) return "unused";

                    const usedAsValue = variable.references.some(ref => {
                        const parent = ref.identifier.parent;
                        if (!parent) return false;
                        if (parent.type.startsWith("Import")) return false;
                        if (parent.type.startsWith("TS") && parent.type.includes("Type")) return false;
                        return true;
                    });

                    return usedAsValue ? "value" : "type";
                }

                return {
                    ImportDeclaration(node) {
                        if (node.importKind === "type") return;

                        const hasDefault = node.specifiers.some(s => s.type === "ImportDefaultSpecifier");
                        const named = node.specifiers.filter(s => s.type === "ImportSpecifier");
                        if (!named.length) return;

                        const scope = sourceCode.getScope(node);
                        const usage = named.map(s => ({ specifier: s, usage: s.importKind === "type" ? "type" : getUsage(s.local.name, scope) }));

                        const relevant = usage.filter(u => u.usage !== "unused");
                        if (!relevant.length) return;

                        const allTypeOnly = !hasDefault && relevant.every(u => u.usage === "type");

                        if (allTypeOnly) {
                            context.report({
                                node,
                                messageId: "useImportType",
                                data: { source: node.source.value },
                                fix(fixer) {
                                    const fixes = [fixer.insertTextAfter(sourceCode.getFirstToken(node), " type")];
                                    for (const specifier of named) {
                                        if (specifier.importKind === "type") {
                                            const typeToken = sourceCode.getFirstToken(specifier);
                                            const nextToken = sourceCode.getTokenAfter(typeToken);
                                            fixes.push(fixer.removeRange([typeToken.range[0], nextToken.range[0]]));
                                        }
                                    }
                                    return fixes;
                                }
                            });
                            return;
                        }

                        for (const { specifier, usage: u } of usage) {
                            if (u !== "type" || specifier.importKind === "type") continue;
                            context.report({
                                node: specifier,
                                messageId: "markTypeOnly",
                                data: { name: specifier.local.name },
                                fix: fixer => fixer.insertTextBefore(specifier.imported, "type ")
                            });
                        }
                    }
                };
            }
        }
    }
};
