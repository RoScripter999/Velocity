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

import { Card } from "@components/Card";
import { FormSwitch } from "@components/FormSwitch";
import { Grid } from "@components/Grid";
import * as Icons from "@components/Icons";
import { Margins } from "@components/margins";
import { SectionHeader, SettingsTab } from "@components/settings";
import { classNameFactory } from "@utils/css";
import { pluralise } from "@utils/misc";
import { IconComponent } from "@utils/types";
import { Forms, Icons as WebpackIcons, SearchBar, Text, useState } from "@webpack/common";

import { openIconInfoModal } from "./InfoModal";

const cl = classNameFactory("vc-icon-preview-");

function IconsTab() {
    const [filters, setFilter] = useState({
        search: "",
        includeWebpack: false
    });

    const source = filters.includeWebpack
        ? { ...Icons, ...WebpackIcons }
        : Icons;


    const filteredIcons = Object.entries(source).filter(([name, value]) =>
        typeof value === "function" &&
        value.prototype === undefined &&
        name.toLowerCase().includes(filters.search.toLowerCase())
    ) as [string, IconComponent][];

    const iconsNumber = Object.entries(filteredIcons).length;

    return (
        <SettingsTab>
            <Text className={Margins.bottom8} variant="heading-md/semibold">Filters</Text>
            <SearchBar
                placeholder="Search icons..."
                query={filters.search}
                onClear={() => setFilter(prev => ({ ...prev, search: "" }))}
                onChange={val => setFilter(prev => ({ ...prev, search: val }))}
                autoFocus
            />
            <FormSwitch
                className={Margins.top16}
                title="Include Webpack Icons"
                value={filters.includeWebpack}
                onChange={v => setFilter(prev => ({ ...prev, includeWebpack: v }))}
                hideBorder
            />

            <Forms.FormDivider gap={16} />

            <SectionHeader tag="h2" title="Icons" description={pluralise(iconsNumber, "Total Icon")} />

            <Grid gap="16px" columns={5} style={{ padding: "8px 0" }}>
                {filteredIcons.map(([name, IconComponent]) => {
                    if (typeof IconComponent !== "function") return null;

                    return (
                        <Card
                            key={name}
                            className={cl("card")}
                            onClick={() => openIconInfoModal(name, IconComponent)}
                        >
                            <IconComponent size="md" />
                            <Text tag="span" className={cl("name")}>
                                {name.replace(/([A-Z])/g, " $1").trim()}
                            </Text>
                        </Card>
                    );
                })}
            </Grid>
        </SettingsTab>
    );
}

export default (IS_DEV ? IconsTab : null) as any;
