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
import { convertFileToBase64, getEntryDisplay, getEntrySubtext } from "./utils";


export function SoundSettings() {
    const [currentTab, setCurrentTab] = useState<"users" | "guilds">("users");
    const [entries, setEntries] = useState<SoundEntry[]>(getSoundEntries());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [sliderKey, setSliderKey] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [form, setForm] = useState({ id: "", name: "", note: "", soundUrl: "", filename: "", volume: 0.5, displayNameMode: false, error: false });

    const saveEntries = (newEntries: SoundEntry[]) => {
        setEntries(newEntries);
        saveSoundEntries(newEntries);
    };

    const playSound = (soundUrl: string, volume: number, entryId: string) => {
        if (playingId === entryId && audioRef.current?.paused === false) {
            audioRef.current.pause();
            setPlayingId(null);
            return;
        }

        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = soundUrl;
        audioRef.current.volume = volume;
        audioRef.current.play();
        setPlayingId(entryId);
        audioRef.current.onended = () => setPlayingId(null);
    };

    const handleFileUpload = async (file: File) => {
        const validTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"];
        if (!validTypes.includes(file.type)) {
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
        const isUser = currentTab === "users";
        const primaryId = form.displayNameMode ? form.name : form.id;

        if (!primaryId || !form.soundUrl) return;

        const isDuplicate = entries.some(entry => {
            if (editingId === entry.id) return false;
            if (isUser) {
                return form.displayNameMode
                    ? entry.displayName === primaryId && entry.type === "user"
                    : entry.userId === primaryId && entry.type === "user";
            }
            return entry.guildId === primaryId && entry.type === "guild";
        });

        if (isDuplicate) {
            setForm(prev => ({ ...prev, error: true }));
            return;
        }

        const createUserEntry = (): SoundEntry => ({
            id: `user_${Date.now()}`,
            type: "user",
            userId: form.displayNameMode ? "" : form.id.trim(),
            displayName: form.displayNameMode ? form.name.trim() : "",
            userLabel: form.note.trim(),
            guildId: "",
            guildName: "",
            soundUrl: form.soundUrl.trim(),
            filename: form.filename,
            volume: form.volume
        });

        const createGuildEntry = (): SoundEntry => ({
            id: `guild_${Date.now()}`,
            type: "guild",
            userId: "",
            displayName: "",
            userLabel: "",
            guildId: form.id.trim(),
            guildName: form.name.trim(),
            soundUrl: form.soundUrl.trim(),
            filename: form.filename,
            volume: form.volume
        });

        const newEntries = editingId
            ? entries.map(entry => {
                if (entry.id !== editingId) return entry;
                return {
                    ...entry,
                    ...(isUser
                        ? {
                            userId: form.displayNameMode ? "" : form.id.trim(),
                            displayName: form.displayNameMode ? form.name.trim() : "",
                            userLabel: form.note.trim()
                        }
                        : {
                            guildId: form.id.trim(),
                            guildName: form.name.trim()
                        }),
                    soundUrl: form.soundUrl.trim(),
                    filename: form.filename,
                    volume: form.volume
                };
            })
            : [...entries, isUser ? createUserEntry() : createGuildEntry()];

        saveEntries(newEntries);
        resetForm();
    };

    const resetForm = () => {
        setForm({ id: "", name: "", note: "", soundUrl: "", filename: "", volume: 0.5, displayNameMode: false, error: false });
        setSliderKey(prev => prev + 1);
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        saveEntries(entries.filter(entry => entry.id !== id));
    };

    const handleTabChange = (tab: "users" | "guilds") => {
        setCurrentTab(tab);
        resetForm();
    };

    const isUserTab = currentTab === "users";
    const filteredEntries = entries.filter(e => (isUserTab ? e.type === "user" : e.type === "guild"));
    const isValidForm = (isUserTab && form.displayNameMode ? form.name : form.id) && form.soundUrl;

    return (
        <>
            <TabBar type="top" look="brand" selectedItem={currentTab} onItemSelect={handleTabChange} >
                <TabBar.Item id="users">{getIntlMessage("USERS")} ({entries.filter(e => e.type === "user").length})</TabBar.Item>
                <TabBar.Item id="guilds">{getIntlMessage("SERVERS")} ({entries.filter(e => e.type === "guild").length})</TabBar.Item>
            </TabBar>

            <Flex flexDirection="column" gap="12px" >
                <Flex flexDirection="column" gap="8px" className={Margins.bottom8}>
                    <TextInput
                        placeholder={isUserTab ? "User ID (required)" : "Server ID (required)"}
                        value={form.displayNameMode ? form.name : form.id}
                        label={editingId ? `Edit ${isUserTab ? "User" : "Server"} Sound` : `Add ${isUserTab ? "User" : "Server"} Sound`}
                        error={form.error ? `this ${isUserTab ? "user" : "guild"} already exists` : ""}
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
                <div className={Margins.bottom8} style={{ position: "relative" }}>
                    <Buttons.Button text={form.filename ? `File: ${form.filename}` : "Upload sound"} />
                    <FilePicker
                        filters={[{ name: "Sound file", extensions: ["mp3", "wav", "ogg", "m4a"] }]}
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                        }}
                    />
                </div>
                <Flex flexDirection="column" gap="4px">
                    <Flex flexDirection="row" gap="8px">
                        <Text variant="text-sm/normal" >
                            Volume: {(form.volume * 100).toFixed(0)}%
                        </Text>
                        <Slider
                            key={sliderKey}
                            minValue={0}
                            maxValue={1}
                            keyboardStep={0.05}
                            initialValue={form.volume}
                            asValueChanges={val => setForm(prev => ({ ...prev, volume: val }))}
                        />
                    </Flex>
                    <Buttons.ButtonGroup gap="8" direction="horizontal">
                        <Buttons.Button
                            onClick={handleAddOrUpdate}
                            size="sm"
                            disabled={!isValidForm}
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
                    <Text variant="text-sm/bold" color="text-muted">
                        {getIntlMessage("NO_SOUNDS")}
                    </Text>
                ) : (
                    <Flex flexDirection="column" gap="8px" style={editingId ? { paddingLeft: "12px", opacity: 0.95 } : undefined}>
                        {filteredEntries.map(entry => (
                            <Flex justifyContent="space-between" alignItems="center" key={entry.id} style={editingId === entry.id ? { opacity: 0.5 } : undefined}>
                                <section style={{ flex: 1, minWidth: 0 }}>
                                    <Text variant="text-md/semibold">
                                        {getEntryDisplay(entry, isUserTab)}
                                    </Text>
                                    <Paragraph color="text-muted">
                                        {getEntrySubtext(entry, isUserTab)}
                                    </Paragraph>
                                    <Paragraph color="text-muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        File: {entry.filename || (entry.soundUrl.startsWith("data:") ? "Uploaded file" : entry.soundUrl.substring(0, 40))}
                                        {!entry.filename && entry.soundUrl.length > 40 && !entry.soundUrl.startsWith("data:") ? "..." : ""}
                                    </Paragraph>
                                    <Paragraph color="text-muted">
                                        Volume: {(entry.volume * 100).toFixed(0)}%
                                    </Paragraph>
                                </section>

                                <Flex flexDirection="column" gap="8px">
                                    {editingId === entry.id ? (
                                        <Paragraph>Currently Editing</Paragraph>
                                    ) : (
                                        <Buttons.ButtonGroup fullWidth direction="horizontal">
                                            <Buttons.Button
                                                onClick={() => playSound(entry.soundUrl, entry.volume, entry.id)}
                                                size="sm"
                                                text={playingId === entry.id ? `⏸ ${getIntlMessage("STOP")}` : `▶ ${getIntlMessage("PLAY")}`} />
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
