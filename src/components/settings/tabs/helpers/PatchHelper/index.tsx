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

import { CodeBlock } from "@components/CodeBlock";
import { Flex } from "@components/Flex";
import { HeadingTertiary } from "@components/Heading";
import { Margins } from "@components/margins";
import { SettingsTab } from "@components/settings/tabs/SectionSettings";
import { debounce } from "@shared/debounce";
import { copyWithToast } from "@utils/discord";
import { stripIndent } from "@utils/text";
import { ReplaceFn } from "@utils/types";
import { search } from "@webpack";
import { Buttons, Forms, TextInput, useMemo, useState } from "@webpack/common";

import { FullPatchInput } from "./FullPatchInput";
import { PatchPreview } from "./PatchPreview";
import { ReplacementInput } from "./ReplacementInput";

const findCandidates = debounce(function ({ find, setModule, setError }) {
    const candidates = search(find);
    const keys = Object.keys(candidates);
    const len = keys.length;

    if (len === 0)
        setError("No match. Perhaps that module is lazy loaded?");
    else if (len !== 1)
        setError("Multiple matches. Please refine your filter");
    else
        setModule([keys[0], candidates[keys[0]]]);
});

function PatchHelper() {
    const [find, setFind] = useState("");
    const [match, setMatch] = useState("");
    const [replacement, setReplacement] = useState<string | ReplaceFn>("");

    const [parsedFind, setParsedFind] = useState<string | RegExp | string[]>("");

    const [findError, setFindError] = useState<string>();
    const [matchError, setMatchError] = useState<string>();
    const [replacementError, setReplacementError] = useState<string>();

    const [module, setModule] = useState<[number, Function]>();

    const code = useMemo(() => {
        const find = parsedFind instanceof RegExp ? parsedFind.toString() : JSON.stringify(parsedFind);
        const replace = typeof replacement === "function" ? replacement.toString() : JSON.stringify(replacement);

        return stripIndent`
            {
                find: ${find},
                replacement: {
                    match: /${match.replace(/(?<!\\)\//g, "\\/")}/,
                    replace: ${replace}
                }
            }
        `;
    }, [parsedFind, match, replacement]);

    function onFindChange(v: string) {
        setFind(v);

        try {
            let parsedFind = v as string | RegExp;
            if (/^\/.+?\/$/.test(v)) parsedFind = new RegExp(v.slice(1, -1));

            setFindError(void 0);
            setParsedFind(parsedFind);

            if (v.length) {
                findCandidates({ find: parsedFind, setModule, setError: setFindError });
            }
        } catch (e: any) {
            setFindError((e as Error).message);
        }
    }

    function onMatchChange(v: string) {
        setMatch(v);

        try {
            new RegExp(v);
            setMatchError(void 0);
        } catch (e: any) {
            setMatchError((e as Error).message);
        }
    }

    return (
        <SettingsTab>
            <Flex flexDirection="column" gap={12}>
                <FullPatchInput
                    setFind={onFindChange}
                    setParsedFind={setParsedFind}
                    setMatch={onMatchChange}
                    setReplacement={setReplacement}
                />

                <TextInput
                    label="Find"
                    type="text"
                    value={find}
                    onChange={onFindChange}
                    error={findError}
                />

                <TextInput
                    label="Match"
                    type="text"
                    value={match}
                    onChange={onMatchChange}
                    error={matchError}
                />

                <ReplacementInput
                    replacement={replacement}
                    setReplacement={setReplacement}
                    replacementError={replacementError}
                />
            </Flex>

            <Forms.FormDivider gap={5} />
            {module && (
                <PatchPreview
                    module={module}
                    match={match}
                    replacement={replacement}
                    setReplacementError={setReplacementError}
                />
            )}

            {!!(find && match && replacement) && (
                <>
                    <HeadingTertiary className={Margins.top20}>Code</HeadingTertiary>
                    <CodeBlock lang="js" content={code} />
                    <Flex className={Margins.top16}>
                        <Buttons.Button text="Copy to Clipboard" onClick={() => copyWithToast(code)} />
                        <Buttons.Button text="Copy as Codeblock" onClick={() => copyWithToast("```ts\n" + code + "\n```")} />
                    </Flex>
                </>
            )}
        </SettingsTab>
    );
}

export default (IS_DEV ? PatchHelper : null) as any;
