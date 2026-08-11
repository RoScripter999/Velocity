/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2025 RoScripter999 and contributors
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

import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { getIntlMessage } from "@utils/discord";
import { Buttons, FilePicker, Icons, Slider, TabBar, Text, TextInput, Toasts, useRef, useState } from "@webpack/common";

import { getSoundEntries, saveSoundEntries, type SoundEntry } from "../settings";
import { convertFileToBase64, getEntryDisplay, getEntrySubtext, makeEmptyForm } from "./utils";

export function SoundSettings() {
    const [currentTab, setCurrentTab] = useState<"users" | "guilds">("users");
    const [entries, setEntries] = useState<SoundEntry[]>(getSoundEntries());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [sliderKey, setSliderKey] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [form, setForm] = useState(makeEmptyForm());

    const isUserTab = currentTab === "users";
    const primaryId = form.displayNameMode ? form.name : form.id;
    const filteredEntries = entries.filter(e => e.type === (isUserTab ? "user" : "guild"));
    const userCount = entries.filter(e => e.type === "user").length;
    const guildCount = entries.length - userCount;

    const saveEntries = (newEntries: SoundEntry[]) => {
        setEntries(newEntries);
        saveSoundEntries(newEntries);
    };

    const handleDelete = (id: string) => {
        saveEntries(entries.filter(entry => entry.id !== id));
    };

    const resetForm = () => {
        setForm(makeEmptyForm());
        setSliderKey(prev => prev + 1);
        setEditingId(null);
    };

    const playSound = (soundUrl: string, volume: number, entryId: string) => {
        if (playingId === entryId && !audioRef.current?.paused) {
            audioRef.current!.pause();
            setPlayingId(null);
            return;
        }

        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = soundUrl;
        audioRef.current.volume = volume;
        audioRef.current.play();
        audioRef.current.onended = () => setPlayingId(null);
        setPlayingId(entryId);
    };

    const handleFileUpload = async (file: File | undefined) => {
        if (!file) return;

        if (!["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"].includes(file.type)) {
            Toasts.show({ message: "Only audio files are allowed", type: Toasts.Type.FAILURE, id: Toasts.genId() });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            Toasts.show({ message: "File size too large! Maximum 10MB", type: Toasts.Type.FAILURE, id: Toasts.genId() });
            return;
        }

        try {
            const base64 = await convertFileToBase64(file);
            setForm(prev => ({ ...prev, soundUrl: base64, filename: file.name }));
        } catch {
            Toasts.show({ message: "Error reading file", type: Toasts.Type.FAILURE, id: Toasts.genId() });
        }
    };

    const handleEdit = (entry: SoundEntry) => {
        const isUser = entry.type === "user";
        setForm({
            id: entry.userId || entry.guildId,
            name: isUser ? entry.displayName?.trim() || "" : entry.guildName?.trim() || "",
            note: entry.userLabel?.trim() || "",
            soundUrl: entry.soundUrl.trim(),
            filename: entry.filename || "",
            volume: entry.volume,
            displayNameMode: isUser && !!entry.displayName && !entry.userId,
            error: false
        });
        setSliderKey(prev => prev + 1);
        setEditingId(entry.id);
    };

    const handleAddOrUpdate = () => {
        if (!primaryId || !form.soundUrl) return;

        const isDuplicate = entries.some(entry => {
            if (editingId === entry.id) return false;
            if (isUserTab) return form.displayNameMode
                ? entry.displayName === primaryId && entry.type === "user"
                : entry.userId === primaryId && entry.type === "user";
            return entry.guildId === primaryId && entry.type === "guild";
        });

        if (isDuplicate) {
            setForm(prev => ({ ...prev, error: true }));
            return;
        }

        const sharedFields = {
            soundUrl: form.soundUrl.trim(),
            filename: form.filename,
            volume: form.volume
        };

        const newEntries = editingId
            ? entries.map(entry => entry.id !== editingId ? entry : {
                ...entry,
                ...(isUserTab
                    ? { userId: form.displayNameMode ? "" : form.id.trim(), displayName: form.displayNameMode ? form.name.trim() : "", userLabel: form.note.trim() }
                    : { guildId: form.id.trim(), guildName: form.name.trim() }),
                ...sharedFields
            })
            : [...entries, isUserTab
                ? { id: `user_${Date.now()}`, type: "user" as const, userId: form.displayNameMode ? "" : form.id.trim(), displayName: form.displayNameMode ? form.name.trim() : "", userLabel: form.note.trim(), guildId: "", guildName: "", ...sharedFields }
                : { id: `guild_${Date.now()}`, type: "guild" as const, userId: "", displayName: "", userLabel: "", guildId: form.id.trim(), guildName: form.name.trim(), ...sharedFields }
            ];

        saveEntries(newEntries);
        resetForm();
    };

    const handleTabChange = (tab: "users" | "guilds") => {
        setCurrentTab(tab);
        resetForm();
    };

    const getFileLabel = (entry: SoundEntry) => {
        if (entry.filename) return entry.filename;
        if (entry.soundUrl.startsWith("data:")) return "Uploaded file";
        return entry.soundUrl.length > 40 ? `${entry.soundUrl.substring(0, 40)}...` : entry.soundUrl;
    };

    return (
        <>
            <TabBar type="top" look="brand" selectedItem={currentTab} onItemSelect={handleTabChange}>
                <TabBar.Item id="users">{getIntlMessage("USERS")} ({userCount})</TabBar.Item>
                <TabBar.Item id="guilds">{getIntlMessage("SERVERS")} ({guildCount})</TabBar.Item>
            </TabBar>

            <Flex flexDirection="column" gap="12px">
                <Flex flexDirection="column" gap="8px" className={Margins.bottom8}>
                    <TextInput
                        required
                        placeholder={isUserTab ? "User ID" : "Server ID"}
                        value={primaryId}
                        label={`${editingId ? "Edit" : "Add"} ${isUserTab ? "User" : "Server"} Sound`}
                        error={form.error ? `This ${isUserTab ? "user" : "guild"} already exists` : ""}
                        onChange={val => {
                            const filtered = val.replace(/[^0-9]/g, "");
                            setForm(prev => form.displayNameMode
                                ? { ...prev, name: filtered, error: false }
                                : { ...prev, id: filtered, error: false }
                            );
                        }}
                    />
                    {isUserTab && (
                        <TextInput
                            placeholder="Note (optional, for display only)"
                            value={form.note}
                            onChange={val => setForm(prev => ({ ...prev, note: val }))}
                        />
                    )}
                </Flex>

                <Flex alignItems="center" gap="8px" className={Margins.bottom8}>
                    <FilePicker
                        filename={form.filename}
                        placeholder="Choose a sound"
                        buttonText="Upload Sound"
                        filters={[{ name: "Sound file", extensions: ["mp3", "wav", "ogg", "m4a"] }]}
                        onFileSelect={handleFileUpload}
                    />
                </Flex>

                <Flex flexDirection="column" gap="4px">
                    <Flex flexDirection="row" gap="8px">
                        <Text variant="text-sm/normal">Volume: {(form.volume * 100).toFixed(0)}%</Text>
                        <Slider
                            key={sliderKey}
                            minValue={0}
                            maxValue={1}
                            keyboardStep={0.05}
                            initialValue={form.volume}
                            asValueChanges={val => setForm(prev => ({ ...prev, volume: val }))}
                        />
                    </Flex>
                    <Buttons.ButtonGroup direction="horizontal">
                        <Buttons.Button
                            onClick={handleAddOrUpdate}
                            size="sm"
                            disabled={!primaryId || !form.soundUrl}
                            variant="primary"
                            text={editingId ? "Update Notification" : "Add Notification"}
                        />
                        {editingId && (
                            <Buttons.Button
                                onClick={resetForm}
                                size="sm"
                                variant="secondary"
                                text={getIntlMessage("CANCEL")}
                            />
                        )}
                    </Buttons.ButtonGroup>
                </Flex>

                {filteredEntries.length === 0 ? (
                    <Text variant="text-sm/bold" color="text-muted">{getIntlMessage("NO_SOUNDS")}</Text>
                ) : (
                    <Flex flexDirection="column" gap="8px" style={editingId ? { paddingLeft: "12px", opacity: 0.95 } : undefined}>
                        {filteredEntries.map(entry => (
                            <Flex justifyContent="space-between" alignItems="center" key={entry.id} style={editingId === entry.id ? { opacity: 0.5 } : undefined}>
                                <section style={{ flex: 1, minWidth: 0 }}>
                                    <Text variant="text-md/semibold">{getEntryDisplay(entry, isUserTab)}</Text>
                                    <Paragraph color="text-muted">{getEntrySubtext(entry, isUserTab)}</Paragraph>
                                    <Paragraph color="text-muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        File: {getFileLabel(entry)}
                                    </Paragraph>
                                    <Paragraph color="text-muted">Volume: {(entry.volume * 100).toFixed(0)}%</Paragraph>
                                </section>

                                <Flex flexDirection="column" gap="8px">
                                    {editingId === entry.id ? (
                                        <Paragraph>Currently Editing</Paragraph>
                                    ) : (
                                        <Buttons.ButtonGroup fullWidth direction="horizontal">
                                            <Buttons.Button
                                                onClick={() => playSound(entry.soundUrl, entry.volume, entry.id)}
                                                size="sm"
                                                text={playingId === entry.id ? `⏸ ${getIntlMessage("STOP")}` : `▶ ${getIntlMessage("PLAY")}`}
                                            />
                                            <Buttons.Button
                                                onClick={() => handleEdit(entry)}
                                                size="sm"
                                                icon={Icons.PencilIcon}
                                                text={getIntlMessage("EDIT")}
                                            />
                                            <Buttons.Button
                                                onClick={() => handleDelete(entry.id)}
                                                variant="critical-primary"
                                                size="sm"
                                                icon={Icons.TrashIcon}
                                                text={getIntlMessage("DELETE")}
                                            />
                                        </Buttons.ButtonGroup>
                                    )}
                                </Flex>
                            </Flex>
                        ))}
                    </Flex>
                )}
            </Flex>
        </>
    );
}
