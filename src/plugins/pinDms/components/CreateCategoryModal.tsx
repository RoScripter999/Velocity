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

import { classNameFactory } from "@utils/css";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, type ModalProps, ModalRoot, openModalLazy } from "@utils/modal";
import { extractAndLoadChunksLazy, findComponentByCodeLazy } from "@webpack";
import { Buttons, ColorPicker, Forms, Text, TextInput, Toasts, useMemo, useState } from "@webpack/common";

import { DEFAULT_COLOR, SWATCHES } from "../constants";
import { categoryLen, createCategory, getCategory } from "../data";

interface ColorPickerWithSwatchesProps {
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
    modalProps: ModalProps;
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

    const onSave = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        category.name = name;
        category.color = color;

        if (!categoryId) {
            createCategory(category);
        }

        modalProps.onClose();
    };

    return (
        <ModalRoot {...modalProps}>
            <ModalHeader>
                <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>{categoryId ? "Edit" : "New"} Category</Text>
                <ModalCloseButton onClick={modalProps.onClose} />
            </ModalHeader>

            <form onSubmit={onSave}>
                <ModalContent className={cl("content")}>
                    <Forms.FormSection title="Name">
                        <TextInput
                            value={name}
                            onChange={e => setName(e)}
                        />
                    </Forms.FormSection>
                    <Forms.FormDivider />
                    <Forms.FormSection title="Color">
                        <ColorPickerWithSwatches
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
                    </Forms.FormSection>
                </ModalContent>
                <ModalFooter>
                    <Buttons.Button text={categoryId ? "Save Catergory" : "Create Catergory"} type="submit" onClick={onSave} disabled={!name} />
                </ModalFooter>
            </form>
        </ModalRoot>
    );
}

export const openCategoryModal = (categoryId: string | null, channelId: string | null) =>
    openModalLazy(async () => {
        await requireSettingsModal();
        return modalProps => <NewCategoryModal categoryId={categoryId} modalProps={modalProps} initialChannelId={channelId} />;
    });
