// Primitives
export { Button, buttonVariants, type ButtonProps } from "./primitives/button/button.js";
export { Input, type InputProps } from "./primitives/input/input.js";
export { Label, type LabelProps } from "./primitives/label/label.js";
export { Textarea, type TextareaProps } from "./primitives/textarea/textarea.js";
export { Checkbox, type CheckboxProps } from "./primitives/checkbox/checkbox.js";
export { Switch, type SwitchProps } from "./primitives/switch/switch.js";
export { Badge, badgeVariants, type BadgeProps } from "./primitives/badge/badge.js";
export { Separator, type SeparatorProps } from "./primitives/separator/separator.js";
export {
	Select,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectLabel,
	SelectItem,
	SelectSeparator,
} from "./primitives/select/select.js";
export { RadioGroup, RadioGroupItem } from "./primitives/radio-group/radio-group.js";
export { Slider } from "./primitives/slider/slider.js";
export { Toggle, toggleVariants } from "./primitives/toggle/toggle.js";
export { ToggleGroup, ToggleGroupItem } from "./primitives/toggle-group/toggle-group.js";
export { Avatar, AvatarImage, AvatarFallback } from "./primitives/avatar/avatar.js";
export { Skeleton } from "./primitives/skeleton/skeleton.js";
export { Empty, emptyVariants, type EmptyProps } from "./primitives/empty/empty.js";
export { Loading, loadingVariants, type LoadingProps } from "./primitives/loading/loading.js";
export { ErrorState, errorStateVariants, type ErrorStateProps } from "./primitives/error-state/error-state.js";
export { Tag, tagVariants, type TagProps } from "./primitives/tag/tag.js";
export { Progress } from "./primitives/progress/progress.js";
export { ScrollArea, ScrollBar } from "./primitives/scroll-area/scroll-area.js";
export { AspectRatio } from "./primitives/aspect-ratio/aspect-ratio.js";

// Layout primitives
export {
	Container,
	containerVariants,
	type ContainerProps,
} from "./primitives/container/container.js";
export { Stack, stackVariants, type StackProps } from "./primitives/stack/stack.js";
export { Cluster, clusterVariants, type ClusterProps } from "./primitives/cluster/cluster.js";
export { Grid, gridVariants, type GridProps } from "./primitives/grid/grid.js";
export { Spacer, spacerVariants, type SpacerProps } from "./primitives/spacer/spacer.js";

// Components
export {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "./components/card/card.js";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/tabs/tabs.js";
export {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "./components/accordion/accordion.js";
export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
} from "./components/dialog/dialog.js";
export {
	AlertDialog,
	AlertDialogPortal,
	AlertDialogOverlay,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
} from "./components/alert-dialog/alert-dialog.js";
export {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuGroup,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuRadioGroup,
} from "./components/dropdown-menu/dropdown-menu.js";
export {
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverAnchor,
} from "./components/popover/popover.js";
export {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "./components/tooltip/tooltip.js";
export {
	Form,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
	FormField,
	useFormField,
} from "./components/form/form.js";
export { Alert, AlertTitle, AlertDescription, alertVariants } from "./components/alert/alert.js";
export { Toaster, toast } from "./components/sonner/sonner.js";
export {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from "./components/collapsible/collapsible.js";
export { HoverCard, HoverCardTrigger, HoverCardContent } from "./components/hover-card/hover-card.js";
export {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuCheckboxItem,
	ContextMenuRadioItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuGroup,
	ContextMenuPortal,
	ContextMenuRadioGroup,
} from "./components/context-menu/context-menu.js";
export {
	Menubar,
	MenubarMenu,
	MenubarTrigger,
	MenubarContent,
	MenubarItem,
	MenubarLabel,
	MenubarSeparator,
	MenubarShortcut,
	MenubarGroup,
	MenubarPortal,
	MenubarRadioGroup,
} from "./components/menubar/menubar.js";
export {
	navigationMenuTriggerStyle,
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuContent,
	NavigationMenuTrigger,
	NavigationMenuLink,
	NavigationMenuIndicator,
	NavigationMenuViewport,
} from "./components/navigation-menu/navigation-menu.js";
export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
} from "./components/breadcrumb/breadcrumb.js";
export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
} from "./components/table/table.js";
export { DataTable, type DataTableProps } from "./components/data-table/data-table.js";
export {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "./components/pagination/pagination.js";
export { Calendar } from "./components/calendar/calendar.js";
export { DatePicker, type DatePickerProps } from "./components/date-picker/date-picker.js";
export {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
	InputOTPSeparator,
	type InputOTPProps,
} from "./components/input-otp/input-otp.js";
export {
	Command,
	CommandDialog,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandShortcut,
	CommandSeparator,
} from "./components/command/command.js";
export { Combobox, type ComboboxOption, type ComboboxProps } from "./components/combobox/combobox.js";
export { ColorPicker, type ColorPickerProps } from "./components/color-picker/color-picker.js";
export {
	formatHslTriplet,
	hexToHslTriplet,
	hslToRgb,
	hslTripletToHex,
	parseHslTriplet,
	rgbToHsl,
	type HslTriplet,
	type RgbColor,
} from "./lib/color.js";
export {
	MultiCombobox,
	type MultiComboboxOption,
	type MultiComboboxProps,
} from "./components/multi-combobox/multi-combobox.js";
export {
	Stepper,
	type StepperProps,
	type StepperStep,
	type StepStatus,
} from "./components/stepper/stepper.js";
export {
	Timeline,
	type TimelineEvent,
	type TimelineProps,
	type TimelineStatus,
} from "./components/timeline/timeline.js";
export {
	Dropzone,
	type DropzoneProps,
	type DropzoneRenderState,
} from "./components/dropzone/dropzone.js";
export {
	TimePicker,
	type TimePickerProps,
} from "./components/time-picker/time-picker.js";
export {
	FileTree,
	type FileTreeNode,
	type FileTreeProps,
} from "./components/file-tree/file-tree.js";
export { Tree, type TreeNode, type TreeProps } from "./components/tree/tree.js";
export {
	Toolbar,
	ToolbarButton,
	ToolbarLink,
	ToolbarSeparator,
	ToolbarToggleGroup,
	ToolbarToggleItem,
	toolbarVariants,
	type ToolbarProps,
} from "./components/toolbar/toolbar.js";
export {
	Sheet,
	SheetPortal,
	SheetOverlay,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetFooter,
	SheetTitle,
	SheetDescription,
} from "./components/sheet/sheet.js";
export {
	Drawer,
	DrawerPortal,
	DrawerOverlay,
	DrawerTrigger,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitle,
	DrawerDescription,
} from "./components/drawer/drawer.js";
export {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from "./components/resizable/resizable.js";
export {
	SidebarProvider,
	Sidebar,
	SidebarTrigger,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarItem,
	useSidebar,
} from "./components/sidebar/sidebar.js";

// AI
export type { Role, ToolCallState } from "./ai/types.js";
export { Message, messageVariants, type MessageProps } from "./ai/message/message.js";
export { MessageList, type MessageListProps } from "./ai/message-list/message-list.js";
export { Composer, type ComposerProps } from "./ai/composer/composer.js";
export {
	SpeechRecognition,
	type SpeechRecognitionProps,
} from "./ai/speech-recognition/speech-recognition.js";
export { Terminal, type TerminalProps } from "./ai/terminal/terminal.js";
export { Canvas, type CanvasProps } from "./ai/canvas/canvas.js";
export { AudioPlayer, type AudioPlayerProps } from "./ai/audio-player/audio-player.js";
export { AudioWaveform, type AudioWaveformProps } from "./ai/audio-waveform/audio-waveform.js";
export { Diagram, type DiagramProps } from "./ai/diagram/diagram.js";
export {
	LoadingIndicator,
	loadingIndicatorVariants,
	type LoadingIndicatorProps,
} from "./ai/loading-indicator/loading-indicator.js";
export { Suggestion, type SuggestionProps } from "./ai/suggestion/suggestion.js";
export { ToolCall, type ToolCallProps } from "./ai/tool-call/tool-call.js";
export { Reasoning, type ReasoningProps } from "./ai/reasoning/reasoning.js";
export { MessageActions, type MessageActionsProps } from "./ai/message-actions/message-actions.js";
export { Citation, type CitationProps } from "./ai/citation/citation.js";
export { Markdown, type MarkdownProps } from "./ai/markdown/markdown.js";
export {
	CodeBlock,
	type CodeBlockProps,
	type SupportedLang,
} from "./ai/code-block/code-block.js";
export {
	CodeBlockCopy,
	type CodeBlockCopyProps,
} from "./ai/code-block/code-block-copy.js";
export {
	Attachment,
	attachmentVariants,
	type AttachmentFile,
	type AttachmentProps,
} from "./ai/attachment/attachment.js";
export { Sources, type SourcesProps, type SourceRef } from "./ai/sources/sources.js";
export { InlineCitation, type InlineCitationProps } from "./ai/inline-citation/inline-citation.js";
export { Task, type TaskProps, type TaskStep } from "./ai/task/task.js";
export { Shimmer, type ShimmerProps } from "./ai/shimmer/shimmer.js";
export { Branch, type BranchProps } from "./ai/branch/branch.js";
export { Plan, type PlanProps, type PlanStep } from "./ai/plan/plan.js";
export {
	Conversation,
	type ConversationProps,
	type ConversationMessage,
} from "./ai/conversation/conversation.js";
export {
	ChainOfThought,
	type ChainOfThoughtProps,
	type ChainOfThoughtStep,
} from "./ai/chain-of-thought/chain-of-thought.js";

// Artifacts — typed React diagram primitives.
// Hierarchy family heavy peers (d3-hierarchy, d3-shape) and Flow-family
// d3-sankey are optional and lazy-loaded; Funnel, Pyramid, Flowchart are
// pure SVG with no peer.
export { MindMap, type MindMapNode, type MindMapProps } from "./artifacts/mind-map/mind-map.js";
export { TreeMap, type TreeMapNode, type TreeMapProps } from "./artifacts/tree-map/tree-map.js";
export { OrgChart, type OrgNode, type OrgChartProps } from "./artifacts/org-chart/org-chart.js";
export { Sunburst, type SunburstNode, type SunburstProps } from "./artifacts/sunburst/sunburst.js";
export { Dendrogram, type DendrogramNode, type DendrogramProps } from "./artifacts/dendrogram/dendrogram.js";
export {
	Sankey,
	type SankeyLink,
	type SankeyNode,
	type SankeyProps,
} from "./artifacts/sankey/sankey.js";
export { Funnel, type FunnelProps, type FunnelStage } from "./artifacts/funnel/funnel.js";
export { Pyramid, type PyramidProps, type PyramidTier } from "./artifacts/pyramid/pyramid.js";
export {
	Flowchart,
	type FlowchartEdge,
	type FlowchartNode,
	type FlowchartProps,
} from "./artifacts/flowchart/flowchart.js";
export { Venn, type VennProps, type VennSet } from "./artifacts/venn/venn.js";
export {
	Chord,
	type ChordHoverPayload,
	type ChordNode,
	type ChordProps,
} from "./artifacts/chord/chord.js";
export { Arc, type ArcEdge, type ArcNode, type ArcProps } from "./artifacts/arc/arc.js";
export { Matrix, type MatrixNode, type MatrixProps } from "./artifacts/matrix/matrix.js";
export {
	TimeAxis,
	type TimeAxisEvent,
	type TimeAxisProps,
} from "./artifacts/time-axis/time-axis.js";
export { Gantt, type GanttProps, type GanttTask } from "./artifacts/gantt/gantt.js";
export {
	Sequence,
	type SequenceActor,
	type SequenceMessage,
	type SequenceProps,
} from "./artifacts/sequence/sequence.js";
// Artifacts — study-family primitives
export { Flashcard, type FlashcardProps } from "./artifacts/flashcard/flashcard.js";
export { Cloze, type ClozePart, type ClozeProps } from "./artifacts/cloze/cloze.js";
export {
	ImageOcclusion,
	type ImageOcclusionProps,
	type OcclusionRegion,
} from "./artifacts/image-occlusion/image-occlusion.js";
export { Quiz, type QuizOption, type QuizProps } from "./artifacts/quiz/quiz.js";
export {
	CompareTable,
	type CompareAttribute,
	type CompareSubject,
	type CompareTableProps,
} from "./artifacts/compare-table/compare-table.js";
export { Deck, type DeckCard, type DeckProps } from "./artifacts/deck/deck.js";
export {
	SpacedRepetition,
	type SpacedRepetitionProps,
	type SrsRating,
} from "./artifacts/spaced-repetition/spaced-repetition.js";

// Blocks — page-level compositions (auth flows, landing sections, app shells).
export type {
	AuthAdapter,
	AuthAdapterResult,
	AuthForgotPasswordProps,
	AuthOtpIntent,
	AuthResetPasswordProps,
	AuthSignInSocialProvider,
	AuthSignInSplitProps,
	AuthSignUpCardProps,
	AuthSignUpCardSocialProvider,
	AuthSocialProvider,
	AuthVerifyEmailProps,
	AuthVerifyOtpProps,
} from "./blocks/index.js";
export {
	AuthForgotPassword,
	AuthResetPassword,
	AuthSignInSplit,
	AuthSignUpCard,
	AuthVerifyEmail,
	AuthVerifyOtp,
	mockAuthAdapter,
} from "./blocks/index.js";

// Schemas live in `@hex-core/components/schemas` (1.4.0+) so the runtime
// barrel doesn't pull in the `@hex-core/registry` type at the consumer's
// declaration boundary. Tooling that needs the manifest imports from
// `@hex-core/components/schemas` and installs `@hex-core/registry`.

// Utilities
export { cn } from "./lib/utils.js";
