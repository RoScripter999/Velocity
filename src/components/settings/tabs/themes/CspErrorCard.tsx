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

import { requestCspOverride } from "@api/Csp";
import { Settings } from "@api/Settings";
import { ErrorCard } from "@components/ErrorBoundary";
import { Link } from "@components/Link";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { SectionHeader } from "@components/settings";
import { CspBlockedUrls, useCspErrors } from "@utils/cspViolations";
import { getIntlMessage } from "@utils/discord";
import { classes } from "@utils/misc";
import { relaunch } from "@utils/native";
import { useForceUpdater } from "@utils/react";
import { Buttons, ConfirmModal, Forms, openModal } from "@webpack/common";

export function CspErrorCard() {
    if (IS_WEB) return null;

    const errors = useCspErrors();
    const forceUpdate = useForceUpdater();

    if (!errors.length) return null;

    const isImgurHtmlDomain = (url: string) => url.startsWith("https://imgur.com/");

    const allowUrl = async (url: string) => {
        const { origin: baseUrl, host } = new URL(url);

        const result = await requestCspOverride(baseUrl, ["connect-src", "img-src", "style-src", "font-src"], "Velocity Themes");
        if (result !== "ok") return;

        CspBlockedUrls.forEach(url => {
            if (new URL(url).host === host) {
                CspBlockedUrls.delete(url);
            }
        });

        forceUpdate();

        openModal(props => (
            <ConfirmModal
                {...props}
                title="Restart Required"
                subtitle="A restart is required to apply this change"
                confirmText="Restart now"
                cancelText="Later!"
                variant="primary"
                onConfirm={relaunch}
            />
        ));
    };

    const hasImgurHtmlDomain = errors.some(isImgurHtmlDomain);

    const removeUrl = (url: string) => {
        CspBlockedUrls.delete(url);
        Settings.themes.onlineThemes = (Settings.themes.onlineThemes ?? [])
            .filter(link => link.name !== url)
            .map(link => ({
                name: String(link.name),
                themeActivationModes: link.themeActivationModes ?? "always",
                enabled: link.enabled !== false
            }));

        forceUpdate();
    };
    return (
        <ErrorCard className="vc-settings-card">
            <SectionHeader
                tag="h5"
                title="Blocked Resources"
                gap={{ bottom: 8 }}
                description={(
                    <>
                        Some images, styles, or fonts were blocked because they come from disallowed domains.
                        <br /><br />
                        It is highly recommended to move them to GitHub or Imgur. But you may also allow domains if you fully trust them.
                        <br /><br />
                        After allowing a domain, you have to fully close (from tray / task manager) and restart Discord to apply the change.
                    </>
                )}
            />

            <Forms.FormTitle>Blocked URLs</Forms.FormTitle>
            <div className="vc-settings-themes-csp-list">
                {errors.map((url, i) => (
                    <div key={url}>
                        {i !== 0 && <Forms.FormDivider className={Margins.bottom8} />}
                        <div className="vc-settings-themes-csp-row">
                            <Link href={url}>{url}</Link>
                            <Buttons.ButtonGroup direction="horizontal" justify="end">
                                <Buttons.Button text={getIntlMessage("ALLOW")} onClick={() => allowUrl(url)} disabled={isImgurHtmlDomain(url)} />
                                <Buttons.Button text={getIntlMessage("REMOVE")} onClick={() => removeUrl(url)} disabled={isImgurHtmlDomain(url)} />
                            </Buttons.ButtonGroup>
                        </div>
                    </div>
                ))}
            </div>

            {hasImgurHtmlDomain && (
                <>
                    <Forms.FormDivider className={classes(Margins.top8, Margins.bottom16)} />
                    <Paragraph>
                        Imgur links should be direct links in the form of <code>https://i.imgur.com/...</code>
                    </Paragraph>
                    <Paragraph>To obtain a direct link, right-click the image and select "Copy image address".</Paragraph>
                </>
            )}
        </ErrorCard>
    );
}
