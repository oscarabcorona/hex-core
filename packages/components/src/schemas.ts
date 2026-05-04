/**
 * Schema re-exports — design-time metadata used by `@hex-core/mcp`,
 * `@hex-core/cli`, the docs site's prop-table renderer, and any other
 * tooling that wants typed access to the component manifest.
 *
 * Lives in its own entry so the main runtime barrel
 * (`@hex-core/components`) does NOT pull in `@hex-core/registry`'s
 * `ComponentSchemaDefinition` type. With registry as an optional peer
 * (1.4.0+), runtime consumers shouldn't have to install registry just to
 * get types for `<Button />`. Tooling consumers that do need the schemas
 * import from `@hex-core/components/schemas` and install
 * `@hex-core/registry` alongside.
 */

export { buttonSchema } from "./primitives/button/button.schema.js";
export { inputSchema } from "./primitives/input/input.schema.js";
export { labelSchema } from "./primitives/label/label.schema.js";
export { textareaSchema } from "./primitives/textarea/textarea.schema.js";
export { checkboxSchema } from "./primitives/checkbox/checkbox.schema.js";
export { switchSchema } from "./primitives/switch/switch.schema.js";
export { badgeSchema } from "./primitives/badge/badge.schema.js";
export { separatorSchema } from "./primitives/separator/separator.schema.js";
export { cardSchema } from "./components/card/card.schema.js";
export { tabsSchema } from "./components/tabs/tabs.schema.js";
export { accordionSchema } from "./components/accordion/accordion.schema.js";
export { dialogSchema } from "./components/dialog/dialog.schema.js";
export { alertDialogSchema } from "./components/alert-dialog/alert-dialog.schema.js";
export { dropdownMenuSchema } from "./components/dropdown-menu/dropdown-menu.schema.js";
export { popoverSchema } from "./components/popover/popover.schema.js";
export { tooltipSchema } from "./components/tooltip/tooltip.schema.js";
export { selectSchema } from "./primitives/select/select.schema.js";
export { radioGroupSchema } from "./primitives/radio-group/radio-group.schema.js";
export { sliderSchema } from "./primitives/slider/slider.schema.js";
export { toggleSchema } from "./primitives/toggle/toggle.schema.js";
export { toggleGroupSchema } from "./primitives/toggle-group/toggle-group.schema.js";
export { formSchema } from "./components/form/form.schema.js";
export { avatarSchema } from "./primitives/avatar/avatar.schema.js";
export { skeletonSchema } from "./primitives/skeleton/skeleton.schema.js";
export { progressSchema } from "./primitives/progress/progress.schema.js";
export { scrollAreaSchema } from "./primitives/scroll-area/scroll-area.schema.js";
export { aspectRatioSchema } from "./primitives/aspect-ratio/aspect-ratio.schema.js";
export { containerSchema } from "./primitives/container/container.schema.js";
export { stackSchema } from "./primitives/stack/stack.schema.js";
export { clusterSchema } from "./primitives/cluster/cluster.schema.js";
export { gridSchema } from "./primitives/grid/grid.schema.js";
export { spacerSchema } from "./primitives/spacer/spacer.schema.js";
export { collapsibleSchema } from "./components/collapsible/collapsible.schema.js";
export { hoverCardSchema } from "./components/hover-card/hover-card.schema.js";
export { contextMenuSchema } from "./components/context-menu/context-menu.schema.js";
export { menubarSchema } from "./components/menubar/menubar.schema.js";
export { navigationMenuSchema } from "./components/navigation-menu/navigation-menu.schema.js";
export { breadcrumbSchema } from "./components/breadcrumb/breadcrumb.schema.js";
export { alertSchema } from "./components/alert/alert.schema.js";
export { sonnerSchema } from "./components/sonner/sonner.schema.js";
export { tableSchema } from "./components/table/table.schema.js";
export { dataTableSchema } from "./components/data-table/data-table.schema.js";
export { paginationSchema } from "./components/pagination/pagination.schema.js";
export { calendarSchema } from "./components/calendar/calendar.schema.js";
export { datePickerSchema } from "./components/date-picker/date-picker.schema.js";
export { inputOTPSchema } from "./components/input-otp/input-otp.schema.js";
export { commandSchema } from "./components/command/command.schema.js";
export { comboboxSchema } from "./components/combobox/combobox.schema.js";
export { multiComboboxSchema } from "./components/multi-combobox/multi-combobox.schema.js";
export { stepperSchema } from "./components/stepper/stepper.schema.js";
export { timelineSchema } from "./components/timeline/timeline.schema.js";
export { dropzoneSchema } from "./components/dropzone/dropzone.schema.js";
export { timePickerSchema } from "./components/time-picker/time-picker.schema.js";
export { fileTreeSchema } from "./components/file-tree/file-tree.schema.js";
export { colorPickerSchema } from "./components/color-picker/color-picker.schema.js";
export { sheetSchema } from "./components/sheet/sheet.schema.js";
export { drawerSchema } from "./components/drawer/drawer.schema.js";
export { resizableSchema } from "./components/resizable/resizable.schema.js";
export { sidebarSchema } from "./components/sidebar/sidebar.schema.js";

// Tier-1 gap batch (1.5.x+)
export { emptySchema } from "./primitives/empty/empty.schema.js";
export { loadingSchema } from "./primitives/loading/loading.schema.js";
export { errorStateSchema } from "./primitives/error-state/error-state.schema.js";
export { tagSchema } from "./primitives/tag/tag.schema.js";
export { treeSchema } from "./components/tree/tree.schema.js";
export { toolbarSchema } from "./components/toolbar/toolbar.schema.js";
export { attachmentSchema } from "./ai/attachment/attachment.schema.js";

// AI primitives
export type { Role, ToolCallState } from "./ai/types.js";
export { messageSchema } from "./ai/message/message.schema.js";
export { messageListSchema } from "./ai/message-list/message-list.schema.js";
export { composerSchema } from "./ai/composer/composer.schema.js";
export { loadingIndicatorSchema } from "./ai/loading-indicator/loading-indicator.schema.js";
export { suggestionSchema } from "./ai/suggestion/suggestion.schema.js";
export { toolCallSchema } from "./ai/tool-call/tool-call.schema.js";
export { reasoningSchema } from "./ai/reasoning/reasoning.schema.js";
export { messageActionsSchema } from "./ai/message-actions/message-actions.schema.js";
export { citationSchema } from "./ai/citation/citation.schema.js";
export { markdownSchema } from "./ai/markdown/markdown.schema.js";
export { codeBlockSchema } from "./ai/code-block/code-block.schema.js";

// Artifacts — hierarchy-family diagram primitives (1.8.0+)
export { mindMapSchema } from "./artifacts/mind-map/mind-map.schema.js";
export { treeMapSchema } from "./artifacts/tree-map/tree-map.schema.js";
export { orgChartSchema } from "./artifacts/org-chart/org-chart.schema.js";
export { sunburstSchema } from "./artifacts/sunburst/sunburst.schema.js";
export { dendrogramSchema } from "./artifacts/dendrogram/dendrogram.schema.js";
