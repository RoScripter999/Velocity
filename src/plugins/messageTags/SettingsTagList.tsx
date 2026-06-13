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

import { Card } from "@components/Card";
import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { Buttons, Icons, Text } from "@webpack/common";

import { openCreateTagModal } from "./CreateTagModal";
import { removeTag, settings } from "./settings";

export function SettingsTagList() {
    const { tagsList } = settings.use(["tagsList"]);

    return (
        <section className={Margins.top8}>
            <Text variant="text-md/semibold">Registered Tags</Text>
            <Flex flexDirection="column" gap="0.5em" className={Margins.top8}>
                {Object.values(tagsList).map(tag => (
                    <Card key={tag.name} className="vc-customCommands-card">
                        <Paragraph variant="text-md/medium">{tag.name}</Paragraph>

                        <div>
                            <Buttons.IconButton variant="secondary" icon={Icons.PencilIcon} onClick={() => openCreateTagModal(tag)} />
                            <Buttons.IconButton variant="critical-secondary" icon={Icons.TrashIcon} onClick={() => removeTag(tag.name)} />
                        </div>
                    </Card>
                ))}
                <Buttons.Button text="Create Tag" onClick={() => openCreateTagModal()} />
            </Flex>
        </section>
    );
}
