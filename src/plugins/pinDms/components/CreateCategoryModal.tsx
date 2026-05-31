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

import { classNameFactory } from "@utils/css";
import type { ModalPropsRender } from "@velocity-types";
import { extractAndLoadChunksLazy, findComponentByCodeLazy } from "@webpack";
import { ColorPicker, Forms, Modal, openModalLazy, TextInput, Toasts, useMemo, useState } from "@webpack/common";

import { DEFAULT_COLOR, SWATCHES } from "../constants";
import { categoryLen, createCategory, getCategory } from "../data";

interface ColorPickerWithSwatchesProps {
    className?: string;
    defaultColor: number;
    colors: number[];
    value: number;
    disabled?: boolean;
    onChange(value: number | null): void;
    renderDefaultButton?: () => React.ReactNode;
    renderCustomButton?: () => React.ReactNode;
}

const ColorPickerWithSwatches = findComponentByCodeLazy<ColorPickerWithSwatchesProps>('id:"color-picker"');

const requireSettingsModal = extractAndLoadChunksLazy(['type:"USER_SETTINGS_MODAL_OPEN"']);

const cl = classNameFactory("vc-pindms-modal-");

interface Props {
    categoryId: string | null;
    initialChannelId: string | null;
    modalProps: ModalPropsRender;
}

function useCategory(categoryId: string | null, initalChannelId: string | null) {
    const category = useMemo(() => {
        if (categoryId) {
            return getCategory(categoryId);
        } else if (initalChannelId) {
            return {
                id: Toasts.genId(),
                name: `Pin Category ${categoryLen() + 1}`,
                color: DEFAULT_COLOR,
                collapsed: false,
                channels: [initalChannelId]
            };
        }
    }, [categoryId, initalChannelId]);

    return category;
}

export function NewCategoryModal({ categoryId, modalProps, initialChannelId }: Props) {
    const category = useCategory(categoryId, initialChannelId);
    if (!category) return null;

    const [name, setName] = useState(category.name);
    const [color, setColor] = useState(category.color);

    const onSave = () => {
        category.name = name;
        category.color = color;

        if (!categoryId) {
            createCategory(category);
        }

        modalProps.onClose();
    };

    return (
        <Modal
            {...modalProps}
            title={`${categoryId ? "Edit" : "New"} Category`}
            actions={[{
                text: categoryId ? "Save" : "Create",
                variant: "primary",
                onClick: onSave,
                disabled: !name
            }]}
        >
            <div className={cl("content")}>
                <section>
                    <TextInput
                        label="Name"
                        value={name}
                        onChange={e => setName(e)}
                    />
                </section>
                <section>
                    <Forms.FormTitle>Color</Forms.FormTitle>
                    <ColorPickerWithSwatches
                        className={cl("color-picker")}
                        key={category.id}
                        defaultColor={DEFAULT_COLOR}
                        colors={SWATCHES}
                        onChange={c => setColor(c!)}
                        value={color}
                        renderDefaultButton={() => null}
                        renderCustomButton={() => (
                            <ColorPicker
                                color={color}
                                onChange={c => setColor(c!)}
                                key={category.id}
                                showEyeDropper={false}
                            />
                        )}
                    />
                </section>
            </div>
        </Modal>
    );
}

export const openCategoryModal = (categoryId: string | null, channelId: string | null) =>
    openModalLazy(async () => {
        await requireSettingsModal();
        return modalProps => <NewCategoryModal categoryId={categoryId} modalProps={modalProps} initialChannelId={channelId} />;
    });
