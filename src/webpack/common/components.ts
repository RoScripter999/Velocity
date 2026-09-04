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

import { VelocityIcon } from "@components/Icons";
import { LazyComponent } from "@utils/lazyReact";
import type * as t from "@velocity-types";
import { filters, find, findCssClassesLazy, mapMangledCssClasses, mapMangledModuleLazy, proxyLazyWebpack, waitFor } from "@webpack";

import { waitForComponent } from "./internal";

export const Text = waitForComponent<t.Text>("Text", filters.componentByCode('="div",selectable:'));

export let Icons: t.Icons = new Proxy({} as t.Icons, { get: () => VelocityIcon });
export function setIcons(component: t.Icons) {
    Icons = component;
}

export const Forms: t.Forms = {
    FormTitle: waitForComponent("FormTitle", filters.componentByCode('="legend"===', '="h5"')),
    FormDivider: waitForComponent("FormDivider", filters.componentByCode("{className:", /{marginTop:\i/)),
    FormSection: waitForComponent("FormSection", filters.componentByCode("data-migration-pending", "titleId:", "errorId:", "isFocused:"))
};

export const Buttons: t.Buttons = {
    Button: waitForComponent("Button", filters.componentByCode('"data-mana-component"', "lineClamp:1")),
    IconButton: waitForComponent("IconButton", filters.componentByCode(/,{...\i\,text/, "fullWidth:!")),
    ToggleIconButton: waitForComponent("ToggleIconButton", filters.componentByCode('"data-mana-component":"toggle-icon-button"')),
    TextButton: waitForComponent("TextButton", filters.componentByCode('"data-mana-component":"text-button"', "variant:")),
    ButtonGroup: waitForComponent("ButtonGroup", filters.componentByCode('"data-align"', '"data-direction"'))
};

export const Select = waitForComponent<t.Select>("Select", filters.componentByCode('"data-mana-component":"select"'));

export const CheckboxGroup = waitForComponent<t.CheckboxGroup>("CheckboxGroup", filters.componentByCode('"data-mana-component":"checkbox-group"'));

export const LoadingIndicator = waitForComponent<t.LoadingIndicator>("LoadingIndicator", filters.componentByCode("wanderingCubes", "spinningCircle"));

export const Tooltip = waitForComponent<t.Tooltip>("Tooltip", filters.componentByCode("this.renderTooltip()]"));
export const RichTooltip = waitForComponent<t.RichTooltip>("RichTooltip", filters.componentByCode("!0,richTooltipPadding:"));

export const TextInput = waitForComponent<t.TextInput>("TextInput", filters.componentByCode('"data-mana-component":"text-input"'));
export const SearchBar = waitForComponent<t.SearchBar>("SearchBar", filters.componentByCode("query:", "size:", "autoFocus"));
export const TextArea = waitForComponent<t.TextArea>("TextArea", filters.componentByCode('"data-mana-component":"text-area"'));
export const SearchableSelect = waitForComponent<t.SearchableSelect>("SearchableSelect", filters.componentByCode('??"single"==='));
export const Slider = waitForComponent<t.Slider>("Slider", filters.componentByCode("markDash", "this.renderMark("));
export const HelpMessage = waitForComponent<t.HelpMessage>("HelpMessage", filters.componentByCode("messageType:", "textColor:", "children:"));
export const HiddenVisually = waitForComponent<t.HiddenVisually>("HiddenVisually", filters.componentByCode('="span",showOnFocus'));
export const Field = waitForComponent<t.Field>("Field", filters.componentByCode('"fieldset":"div"'));
export const FieldSet = waitForComponent<t.FieldSet>("FieldSet", filters.componentByCode('"fieldset",{...'));
export const Popout = waitForComponent<t.Popout>("Popout", filters.componentByCode("ref:this.ref,", "renderPopout:this.renderPopout,"));
export const Dialog = waitForComponent<t.Dialog>("Dialog", filters.componentByCode("inDialog:!0"));
export const Clickable = waitForComponent<t.Clickable>("Clickable", filters.componentByCode("this.context?this.renderNonInteractive():"));
export const Avatar = waitForComponent<t.Avatar>("Avatar", filters.componentByCode(".size-1.375*"));

export let FilePicker: t.FilePicker = () => null;
export function setFilePicker(component: t.FilePicker) {
    FilePicker = component;
}

export let ColorPicker: t.ColorPicker = () => null;
export function setColorPicker(component: t.ColorPicker) {
    ColorPicker = component;
}

export let RoleMemberPopout: t.RoleMemberPopout = () => null;
export function setRoleMemberPopout(component: t.RoleMemberPopout) {
    RoleMemberPopout = component;
}

export let Tabs: t.Tabs = () => null;
export function setTabs(component: t.Tabs) {
    Tabs = component;
}

export const UserSummaryItem = waitForComponent("UserSummaryItem", filters.componentByCode("defaultRenderUser", "showDefaultAvatarsForNullUsers"));
export const TagGroup = waitForComponent<t.TagGroup>("TagGroup", filters.componentByCode(".map(", ",disallowEmptySelection"));

export let createScroller: ((scrollbarClassName: string, fadeClassName: string, customThemeClassName: string) => t.ScrollerThin) | undefined;
export function setCreateScroller(cs: NonNullable<typeof createScroller>) {
    createScroller = cs;
}

export let createListScroller: (scrollBarClassName: string, fadeClassName: string, someOtherClassIdkMan: string, resizeObserverClass: typeof ResizeObserver) => t.ListScrollerThin;
waitFor(filters.byCode("getScrollerNode:", "resizeObserver:", "sectionHeight:"), m => createListScroller = m);

const listScrollerClassnames = ["thin", "auto", "fade"] as const;
export const scrollerClasses = findCssClassesLazy("thin", "auto", "fade", "customTheme", "none");

const isListScroller = filters.byClassNames(...listScrollerClassnames);
const isNotNormalScroller = filters.byClassNames("customTheme");
export const listScrollerClasses = proxyLazyWebpack(() => {
    const mod = find(m => isListScroller(m) && !isNotNormalScroller(m), { topLevelOnly: true });
    if (!mod) return {} as Record<typeof listScrollerClassnames[number], string>;

    return mapMangledCssClasses(mod, listScrollerClassnames);
});

export const ScrollerNone = LazyComponent(() => createScroller?.(scrollerClasses.none, scrollerClasses.fade, scrollerClasses.customTheme)!);
export const ScrollerThin = LazyComponent(() => createScroller?.(scrollerClasses.thin, scrollerClasses.fade, scrollerClasses.customTheme)!);
export const ScrollerAuto = LazyComponent(() => createScroller?.(scrollerClasses.auto, scrollerClasses.fade, scrollerClasses.customTheme)!);

export const ListScrollerThin = LazyComponent(() => createListScroller(listScrollerClasses.thin, listScrollerClasses.fade, "", ResizeObserver));
export const ListScrollerAuto = LazyComponent(() => createListScroller(listScrollerClasses.auto, listScrollerClasses.fade, "", ResizeObserver));

export const FocusLock = waitForComponent<t.FocusLock>("FocusLock", filters.componentByCode(".containerRef,{keyboardModeEnabled:"));

export let useToken: t.useToken;
waitFor(m => {
    if (typeof m !== "function") {
        return false;
    }

    const str = String(m);
    return str.includes(".resolve({theme:") && str.includes('"refresh-fast-follow-avatars"') && !str.includes("useMemo");
}, m => useToken = m);

export const Timestamp = waitForComponent<t.Timestamp>("Timestamp", filters.componentByCode("#{intl::MESSAGE_EDITED_TIMESTAMP_A11Y_LABEL}"));
export const OAuth2AuthorizeModal = waitForComponent("OAuth2AuthorizeModal", filters.componentByCode("hasContentBackground", "nextStep", "onClose?.()"));

export const Animations = mapMangledModuleLazy(".assign({colorNames:", {
    Transition: filters.componentByCode('["items","children"]', ",null,"),
    animated: filters.byProps("div", "text")
});
