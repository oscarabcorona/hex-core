import type { ComponentType } from "react";
import { AccordionDemo } from "../app/demos/accordion-demo";
import { AlertDemo } from "../app/demos/alert-demo";
import { AlertDialogDemo } from "../app/demos/alert-dialog-demo";
import { AspectRatioDemo } from "../app/demos/aspect-ratio-demo";
import { AvatarDemo } from "../app/demos/avatar-demo";
import { BadgeDemo } from "../app/demos/badge-demo";
import { BreadcrumbDemo } from "../app/demos/breadcrumb-demo";
import { ButtonDemo } from "../app/demos/button-demo";
import { CalendarDemo } from "../app/demos/calendar-demo";
import { CardDemo } from "../app/demos/card-demo";
import { CheckboxDemo } from "../app/demos/checkbox-demo";
import { ClusterDemo } from "../app/demos/cluster-demo";
import { CollapsibleDemo } from "../app/demos/collapsible-demo";
import { ColorPickerDemo } from "../app/demos/color-picker-demo";
import { ComboboxDemo } from "../app/demos/combobox-demo";
import { CommandDemo } from "../app/demos/command-demo";
import { ContainerDemo } from "../app/demos/container-demo";
import { ContextMenuDemo } from "../app/demos/context-menu-demo";
import { DataTableDemo } from "../app/demos/data-table-demo";
import { DatePickerDemo } from "../app/demos/date-picker-demo";
import { DialogDemo } from "../app/demos/dialog-demo";
import { DrawerDemo } from "../app/demos/drawer-demo";
import { DropzoneDemo } from "../app/demos/dropzone-demo";
import { DropdownMenuDemo } from "../app/demos/dropdown-menu-demo";
import { FileTreeDemo } from "../app/demos/file-tree-demo";
import { FormDemo } from "../app/demos/form-demo";
import { GridDemo } from "../app/demos/grid-demo";
import { HoverCardDemo } from "../app/demos/hover-card-demo";
import { InputDemo } from "../app/demos/input-demo";
import { InputOTPDemo } from "../app/demos/input-otp-demo";
import { LabelDemo } from "../app/demos/label-demo";
import { MenubarDemo } from "../app/demos/menubar-demo";
import { MultiComboboxDemo } from "../app/demos/multi-combobox-demo";
import { NavigationMenuDemo } from "../app/demos/navigation-menu-demo";
import { PaginationDemo } from "../app/demos/pagination-demo";
import { PopoverDemo } from "../app/demos/popover-demo";
import { ProgressDemo } from "../app/demos/progress-demo";
import { RadioGroupDemo } from "../app/demos/radio-group-demo";
import { ResizableDemo } from "../app/demos/resizable-demo";
import { ScrollAreaDemo } from "../app/demos/scroll-area-demo";
import { SelectDemo } from "../app/demos/select-demo";
import { SeparatorDemo } from "../app/demos/separator-demo";
import { SheetDemo } from "../app/demos/sheet-demo";
import { SidebarDemo } from "../app/demos/sidebar-demo";
import { SkeletonDemo } from "../app/demos/skeleton-demo";
import { SliderDemo } from "../app/demos/slider-demo";
import { SonnerDemo } from "../app/demos/sonner-demo";
import { SpacerDemo } from "../app/demos/spacer-demo";
import { StackDemo } from "../app/demos/stack-demo";
import { StepperDemo } from "../app/demos/stepper-demo";
import { SwitchDemo } from "../app/demos/switch-demo";
import { TableDemo } from "../app/demos/table-demo";
import { TabsDemo } from "../app/demos/tabs-demo";
import { TextareaDemo } from "../app/demos/textarea-demo";
import { TimePickerDemo } from "../app/demos/time-picker-demo";
import { TimelineDemo } from "../app/demos/timeline-demo";
import { ToggleDemo } from "../app/demos/toggle-demo";
import { ToggleGroupDemo } from "../app/demos/toggle-group-demo";
import { TooltipDemo } from "../app/demos/tooltip-demo";
import { AttachmentDemo } from "../app/demos/attachment-demo";
import { CitationDemo } from "../app/demos/citation-demo";
import { CodeBlockDemo } from "../app/demos/code-block-demo";
import { ComposerDemo } from "../app/demos/composer-demo";
import { EmptyDemo } from "../app/demos/empty-demo";
import { ErrorStateDemo } from "../app/demos/error-state-demo";
import { LoadingDemo } from "../app/demos/loading-demo";
import { LoadingIndicatorDemo } from "../app/demos/loading-indicator-demo";
import { MarkdownDemo } from "../app/demos/markdown-demo";
import { MessageDemo } from "../app/demos/message-demo";
import { MessageActionsDemo } from "../app/demos/message-actions-demo";
import { MessageListDemo } from "../app/demos/message-list-demo";
import { ReasoningDemo } from "../app/demos/reasoning-demo";
import { SuggestionDemo } from "../app/demos/suggestion-demo";
import { TagDemo } from "../app/demos/tag-demo";
import { ToolCallDemo } from "../app/demos/tool-call-demo";
import { ToolbarDemo } from "../app/demos/toolbar-demo";
import { TreeDemo } from "../app/demos/tree-demo";

/**
 * Map of component slug → rendered demo component.
 *
 * Static imports are intentional: each docs route is statically generated via
 * `generateStaticParams`, so Next already produces a per-route chunk that
 * only pulls in the demo that route renders. Switching to `next/dynamic` in
 * the Server Component path does NOT split further (per Next 16 lazy-loading
 * docs) and adds an RSC Suspense wrapper around server demos for no gain.
 */
export const demos: Record<string, ComponentType> = {
	accordion: AccordionDemo,
	alert: AlertDemo,
	"alert-dialog": AlertDialogDemo,
	"aspect-ratio": AspectRatioDemo,
	avatar: AvatarDemo,
	badge: BadgeDemo,
	breadcrumb: BreadcrumbDemo,
	button: ButtonDemo,
	calendar: CalendarDemo,
	card: CardDemo,
	checkbox: CheckboxDemo,
	cluster: ClusterDemo,
	collapsible: CollapsibleDemo,
	"color-picker": ColorPickerDemo,
	combobox: ComboboxDemo,
	command: CommandDemo,
	container: ContainerDemo,
	"context-menu": ContextMenuDemo,
	"data-table": DataTableDemo,
	"date-picker": DatePickerDemo,
	dialog: DialogDemo,
	drawer: DrawerDemo,
	"dropdown-menu": DropdownMenuDemo,
	dropzone: DropzoneDemo,
	"file-tree": FileTreeDemo,
	form: FormDemo,
	grid: GridDemo,
	"hover-card": HoverCardDemo,
	input: InputDemo,
	"input-otp": InputOTPDemo,
	label: LabelDemo,
	menubar: MenubarDemo,
	"multi-combobox": MultiComboboxDemo,
	"navigation-menu": NavigationMenuDemo,
	pagination: PaginationDemo,
	popover: PopoverDemo,
	progress: ProgressDemo,
	"radio-group": RadioGroupDemo,
	resizable: ResizableDemo,
	"scroll-area": ScrollAreaDemo,
	select: SelectDemo,
	separator: SeparatorDemo,
	sheet: SheetDemo,
	sidebar: SidebarDemo,
	skeleton: SkeletonDemo,
	slider: SliderDemo,
	sonner: SonnerDemo,
	spacer: SpacerDemo,
	stack: StackDemo,
	stepper: StepperDemo,
	switch: SwitchDemo,
	table: TableDemo,
	tabs: TabsDemo,
	textarea: TextareaDemo,
	"time-picker": TimePickerDemo,
	timeline: TimelineDemo,
	toggle: ToggleDemo,
	"toggle-group": ToggleGroupDemo,
	tooltip: TooltipDemo,
	attachment: AttachmentDemo,
	citation: CitationDemo,
	"code-block": CodeBlockDemo,
	composer: ComposerDemo,
	empty: EmptyDemo,
	"error-state": ErrorStateDemo,
	loading: LoadingDemo,
	"loading-indicator": LoadingIndicatorDemo,
	markdown: MarkdownDemo,
	message: MessageDemo,
	"message-actions": MessageActionsDemo,
	"message-list": MessageListDemo,
	reasoning: ReasoningDemo,
	suggestion: SuggestionDemo,
	tag: TagDemo,
	"tool-call": ToolCallDemo,
	toolbar: ToolbarDemo,
	tree: TreeDemo,
};

/**
 * Look up a demo component by registry slug.
 * @param slug - The component's registry name (e.g. "button")
 * @returns The demo component, or undefined if no demo exists
 */
export function getDemo(slug: string): ComponentType | undefined {
	return demos[slug];
}
