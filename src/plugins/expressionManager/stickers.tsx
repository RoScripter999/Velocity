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

import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { Span } from "@components/Span";
import { classNameFactory } from "@utils/css";
import { copyWithToast, getGuildAcronym } from "@utils/discord";
import { useForceUpdater } from "@utils/react";
import type { Guild, GuildSticker, Sticker, StickerItem } from "@velocity-types";
import { PremiumType, StickerFormatType } from "@velocity-types/enums";
import { DefaultExtractAndLoadChunksRegex, extractAndLoadChunksLazy, findComponentByCodeLazy } from "@webpack";
import { AuthenticationStore, Clickable, Constants, FluxDispatcher, GuildStore, Icons, IconUtils, Menu, Modal, openModalLazy, PermissionsBits, PermissionStore, type React, RestAPI, showToast, StickersStore, Text, TextInput, Tooltip, useMemo, UserStore, useState } from "@webpack/common";

import { buildCloneItem, logger, settings } from ".";

const cl = classNameFactory("vc-expressionManager-");

const loadCreateStickerModal = extractAndLoadChunksLazy(
    ["CREATE_STICKER_MODAL", "#{intl::STICKER_PICKER_CREATE_STICKER}"],
    new RegExp(`\\.CREATE_STICKER_MODAL.{0,100}?${DefaultExtractAndLoadChunksRegex.source}`)
);
const CreateStickerModal = findComponentByCodeLazy("#{intl::GUILD_STICKER_INVALID_STICKER}");

type PartialSticker = StickerItem & Partial<Sticker>;

const StickerExtMap = {
    [StickerFormatType.PNG]: "png",
    [StickerFormatType.APNG]: "png",
    [StickerFormatType.LOTTIE]: "json",
    [StickerFormatType.GIF]: "gif"
} as const;

const PremiumTierStickerLimitMap = {
    0: 5,
    1: 15,
    2: 30,
    3: 60
} as const;

const MAX_STICKER_SIZE_BYTES = 512 * 1024;

export const formatStickerURL = (sticker: StickerItem, size: number) =>
    `${location.protocol}${window.GLOBAL_ENV.MEDIA_PROXY_ENDPOINT}/stickers/${sticker.id}.${StickerExtMap[sticker.format_type]}?size=${size}&lossless=true&animated=true`;

function getGuildMaxStickerSlots(guild: Guild): number {
    if (guild.features.has("MORE_STICKERS") && guild.premiumTier === PremiumType.TIER_0)
        return 120;

    return PremiumTierStickerLimitMap[guild.premiumTier] ?? PremiumTierStickerLimitMap[0];
}

async function fetchSticker(id: string) {
    const cached = StickersStore.getStickerById(id);
    if (cached) return cached;

    const { body } = await RestAPI.get(Constants.Endpoints.STICKER(id));

    FluxDispatcher.dispatch({
        type: "STICKER_FETCH_SUCCESS",
        sticker: body
    });

    return body as GuildSticker;
}

async function fetchBlob(sticker: PartialSticker) {
    for (let size = 4096; size >= 16; size /= 2) {
        const url = formatStickerURL(sticker, size);
        const res = await fetch(url);

        if (!res.ok)
            throw new Error(`Failed to fetch ${url}: ${res.status}`);

        const contentLength = res.headers.get("Content-Length");
        if (Number(contentLength) > MAX_STICKER_SIZE_BYTES) {
            await res.body?.cancel();
            continue;
        }

        const blob = await res.blob();
        if (blob.size <= MAX_STICKER_SIZE_BYTES)
            return blob;
    }

    throw new Error(`Failed to fetch sticker within size limit of ${MAX_STICKER_SIZE_BYTES / 1024}KiB`);
}

async function doClone(guildId: string, sticker: PartialSticker) {
    try {
        const data = new FormData();
        data.append("name", sticker.name);
        data.append("file", await fetchBlob(sticker));
        data.append("tags", sticker.tags ?? "👻"); // cannot be empty
        data.append("description", sticker.description ?? "");

        const { body } = await RestAPI.post({
            url: Constants.Endpoints.GUILD_STICKER_PACKS(guildId),
            body: data
        });

        FluxDispatcher.dispatch({
            type: "GUILD_STICKERS_CREATE_SUCCESS",
            guildId,
            sticker: {
                ...body,
                user: UserStore.getCurrentUser()
            }
        });

        showToast({ text: `Successfully cloned ${sticker.name} to ${GuildStore.getGuild(guildId)?.name ?? "your server"}!`, variant: "success" });
    } catch (e: any) {
        let message = "Something went wrong (check console!)";
        try {
            message = JSON.parse(e.text).message;
        } catch { }

        logger.error(`Failed to clone ${sticker.name} to guild ${guildId}`, e);
        showToast({ text: `Failed to clone: ${message}`, variant: "critical" });
    }
}

function getAcronymFontSize(s: string) {
    // Font size array from Discord. We currently use XLarge, commented out is Large
    // [18, 18, 16, 16, 14, 12, 10]
    const sizes = [20, 20, 18, 18, 16, 14, 12];
    return sizes[s.length] ?? 4;
}

function getGuildCandidates() {
    const meId = AuthenticationStore.getId();

    return GuildStore.getGuildsArray().filter(g => {
        const canCreate = g.ownerId === meId ||
            (PermissionStore.getGuildPermissions({ id: g.id }) & PermissionsBits.CREATE_GUILD_EXPRESSIONS) === PermissionsBits.CREATE_GUILD_EXPRESSIONS;
        if (!canCreate) return false;

        const stickerSlots = getGuildMaxStickerSlots(g);
        const stickers = StickersStore.getStickersByGuildId(g.id);

        return !stickers || stickers.length < stickerSlots;
    }).sort((a, b) => a.name.localeCompare(b.name));
}

export function CloneModal({ sticker }: { sticker: PartialSticker; }) {
    const [isCloning, setIsCloning] = useState(false);
    const [name, setName] = useState(sticker.name);

    const isNameInvalid = name.length < 2 || name.length > 30;

    const [guildCandidatesDep, refreshGuildCandidates] = useForceUpdater(true);
    const guilds = useMemo(() => getGuildCandidates(), [guildCandidatesDep]);

    return (
        <>
            <TextInput
                label="Custom Name"
                value={name}
                onChange={v => {
                    sticker.name = v;
                    setName(v);
                }}
                error={isNameInvalid ? "Name must be between 2 and 30 characters and only contain alphanumeric characters" : undefined}
            />

            <Flex flexWrap="wrap" justifyContent="center" alignItems="center" className={Margins.top16}>
                {guilds.map(g => (
                    <Tooltip key={g.id} text={g.name}>
                        {tooltipProps =>
                            <Clickable
                                {...tooltipProps}
                                aria-disabled={isCloning || isNameInvalid}
                                className={cl("guild")}
                                data-is-cloning={isCloning || isNameInvalid}
                                onClick={() => {
                                    if (isCloning || isNameInvalid) return;

                                    setIsCloning(true);
                                    doClone(g.id, sticker).finally(() => {
                                        refreshGuildCandidates();
                                        setIsCloning(false);
                                    });
                                }}
                            >
                                {g.icon ? (
                                    <img
                                        aria-hidden
                                        className={cl("guild-icon")}
                                        src={IconUtils.getGuildIconURL({
                                            id: g.id,
                                            icon: g.icon,
                                            canAnimate: true,
                                            size: 512
                                        })}
                                        alt={g.name}
                                    />
                                ) : (
                                    <Span className={cl("guild-acronym")} style={{ fontSize: getAcronymFontSize(getGuildAcronym(g)) }}>
                                        {getGuildAcronym(g)}
                                    </Span>
                                )}
                            </Clickable>
                        }
                    </Tooltip>
                ))}
            </Flex>
        </>
    );
}

function openCloneStickerModal(stickerData: PartialSticker) {
    openModalLazy(async () => {
        const sticker = await fetchSticker(stickerData.id)
            .catch(e => stickerData)
            .then(sticker => ({ ...sticker })); // Clone so we can safely mutate it

        return modalProps => (
            <Modal
                {...modalProps}
                title={
                    <Flex gap="0.5em" alignItems="center">
                        <img
                            role="presentation"
                            aria-hidden
                            draggable={false}
                            src={formatStickerURL(sticker, 128)}
                            alt=""
                            height={24}
                            width={24}
                        />
                        <Text>Clone `{sticker.name}`</Text>
                    </Flex>
                }
            >
                <CloneModal sticker={sticker} />
            </Modal>
        );
    });
}

export const buildCloneStickerItem = (sticker: StickerItem) =>
    buildCloneItem("Sticker", () => openCloneStickerModal(sticker));

export const editSticker = (sticker: StickerItem, guildId: string) =>
    openModalLazy(async () => {
        await loadCreateStickerModal();
        return modalProps =>
            <CreateStickerModal
                {...modalProps}
                sticker={sticker}
                guildId={guildId}
            />;
    });

export function buildStickerLinkItems(sticker: StickerItem, ParentComponent = Menu.MenuGroup) {
    if (!settings.store.stickerCopyAndOpen) return null;

    return (
        <ParentComponent key="vc-em-sticker-links">
            <Menu.MenuItem
                id="vc-copy-sticker-link"
                key="vc-copy-sticker-link"
                label="Copy Sticker Link"
                leadingAccessory={{ type: "icon", icon: Icons.LinkIcon }}
                action={() => copyWithToast(formatStickerURL(sticker, 512), "Link copied!")}
            />

            <Menu.MenuItem
                id="vc-open-sticker-link"
                key="vc-open-sticker-link"
                label="Open Sticker Link"
                leadingAccessory={{ type: "icon", icon: Icons.LinkIcon }}
                trailingIndicator={{ type: "icon", icon: Icons.LinkExternalMediumIcon }}
                action={() => VelocityNative.native.openExternal(formatStickerURL(sticker, 512))}
            />
        </ParentComponent>
    );
}
