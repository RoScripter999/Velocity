/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2026 RoScripter999 and contributors
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

import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import type { CloudUpload } from "@velocity-types";
import { findByCodeLazy } from "@webpack";
import { Icons, useState } from "@webpack/common";

const ActionBarIcon = findByCodeLazy("Children.map", "isValidElement", "dangerous:");

const enum Methods {
    Random,
    Consistent,
    Timestamp,
    Date
}

const ANONYMISE_UPLOAD_SYMBOL = Symbol("vcAnonymise");
const tarExtMatcher = /\.tar\.\w+$/;

const settings = definePluginSettings({
    anonymiseByDefault: {
        description: "Whether to anonymise file names by default",
        type: OptionType.BOOLEAN,
        default: true
    },
    spoilerMessages: {
        description: "Spoiler messages",
        type: OptionType.BOOLEAN,
        default: false
    },
    method: {
        description: "Anonymising method",
        type: OptionType.SELECT,
        options: [
            { label: "Random Characters", value: Methods.Random, default: true },
            { label: "Consistent", value: Methods.Consistent },
            { label: "Timestamp", value: Methods.Timestamp },
            { label: "Date", value: Methods.Date }
        ]
    },
    randomisedLength: {
        description: "Random characters length",
        type: OptionType.NUMBER,
        default: 7
    },
    consistent: {
        description: "Consistent filename",
        type: OptionType.STRING,
        default: "image"
    },
    dateFormat: {
        description: "Date format (YYYY, MM, DD, HH, mm, ss, SSS are supported)",
        type: OptionType.STRING,
        default: "YYYY-MM-DD_HH-mm-ss-SSS"
    }
}, {
    randomisedLength: {
        disabled() { return this.store.method !== Methods.Random; }
    },
    consistent: {
        disabled() { return this.store.method !== Methods.Consistent; }
    },
    dateFormat: {
        disabled() { return this.store.method !== Methods.Date; }
    }
});

export default definePlugin({
    name: "AnonymiseFileNames",
    authors: [Devs.fawn],
    description: "Anonymise uploaded file names",
    tags: ["Privacy", "Utility"],
    settings,

    patches: [
        {
            find: "async uploadFiles(",
            replacement: [
                {
                    match: /async uploadFiles\((\i)\){/,
                    replace: "$&$1.forEach($self.anonymise);"
                }
            ]
        },
        {
            find: "#{intl::ATTACHMENT_UTILITIES_SPOILER}",
            replacement: {
                match: /(?<=children:\[)(?=.{10,80}tooltip:.{0,100}#{intl::ATTACHMENT_UTILITIES_SPOILER})/,
                replace: "arguments[0].canEdit!==false?$self.AnonymiseUploadButton(arguments[0]):null,"
            }
        }
    ],

    AnonymiseUploadButton: ErrorBoundary.wrap(({ upload }: { upload: CloudUpload; }) => {
        const [anonymise, setAnonymise] = useState(upload[ANONYMISE_UPLOAD_SYMBOL] ?? settings.store.anonymiseByDefault);

        function onToggleAnonymise() {
            upload[ANONYMISE_UPLOAD_SYMBOL] = !anonymise;
            setAnonymise(!anonymise);
        }

        return (
            <ActionBarIcon
                tooltip={anonymise ? "Using anonymous file name" : "Using normal file name"}
                onClick={onToggleAnonymise}
            >
                {anonymise ? Icons.EyeIcon : Icons.EyeSlashIcon}
            </ActionBarIcon>
        );
    }, { noop: true }),

    anonymise(upload: CloudUpload) {
        const originalFileName = upload.filename;
        const tarMatch = tarExtMatcher.exec(originalFileName);
        const extIdx = tarMatch?.index ?? originalFileName.lastIndexOf(".");
        const ext = extIdx !== -1 ? originalFileName.slice(extIdx) : "";
        const addSpoilerPrefix = (str: string) => settings.store.spoilerMessages ? "SPOILER_" + str : str;

        if ((upload[ANONYMISE_UPLOAD_SYMBOL] ?? settings.store.anonymiseByDefault) === false) return addSpoilerPrefix(originalFileName + ext);

        const newFilename = (() => {
            switch (settings.store.method) {
                case Methods.Random:
                    const chars = "0123456789bdfhjkmnpqrstvwxz";
                    const returnedName = Array.from(
                        { length: settings.store.randomisedLength },
                        () => chars[Math.floor(Math.random() * chars.length)]
                    ).join("") + ext;
                    return addSpoilerPrefix(returnedName);
                case Methods.Consistent:
                    return addSpoilerPrefix(settings.store.consistent + ext);
                case Methods.Timestamp:
                    return addSpoilerPrefix(Date.now().toString() + ext);
                case Methods.Date:
                    const now = new Date();
                    const format = settings.store.dateFormat
                        .replace(/YYYY/g, now.getFullYear().toString())
                        .replace(/MM/g, (now.getMonth() + 1).toString().padStart(2, "0"))
                        .replace(/DD/g, now.getDate().toString().padStart(2, "0"))
                        .replace(/HH/g, now.getHours().toString().padStart(2, "0"))
                        .replace(/mm/g, now.getMinutes().toString().padStart(2, "0"))
                        .replace(/ss/g, now.getSeconds().toString().padStart(2, "0"))
                        .replace(/SSS/g, now.getMilliseconds().toString().padStart(3, "0"));

                    return format ? addSpoilerPrefix(format + ext) : addSpoilerPrefix(Date.now().toString() + ext);
            }
        })();

        upload.filename = newFilename;
    }
});
