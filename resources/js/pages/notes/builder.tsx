import { AlertError } from '@/components/alert-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { workTypes, type NoteSection } from '@/data/note-templates';
import { useClipboard } from '@/hooks/use-clipboard';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckIcon, ChevronDownIcon, ClipboardIcon, PencilIcon, RotateCcwIcon, SaveIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notes',
        href: '/notes/builder',
    },
    {
        title: 'Builder',
        href: '/notes/builder',
    },
];

export default function NotesBuilder() {
    const [selectedWorkType, setSelectedWorkType] = useState<string>('affirm-card');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
    const [caseId, setCaseId] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedNotes, setEditedNotes] = useState<string>('');
    const [copied, setCopied] = useState<boolean>(false);
    const [, copyToClipboard] = useClipboard();

    const currentWorkType = useMemo(
        () => workTypes.find((wt) => wt.id === selectedWorkType),
        [selectedWorkType]
    );

    const currentSection = useMemo(
        () => currentWorkType?.sections.find((s) => s.id === selectedSection),
        [currentWorkType, selectedSection]
    );

    // Reset copied state after 2 seconds
    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => {
                setCopied(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const handleOptionToggle = (sectionId: string, optionText: string) => {
        setSelectedOptions((prev) => {
            const sectionOptions = prev[sectionId] || [];
            const isSelected = sectionOptions.includes(optionText);

            if (isSelected) {
                return {
                    ...prev,
                    [sectionId]: sectionOptions.filter((o) => o !== optionText),
                };
            } else {
                return {
                    ...prev,
                    [sectionId]: [...sectionOptions, optionText],
                };
            }
        });
    };

    const generateNotes = (): string => {
        if (!currentWorkType) return '';

        const allSelections: string[] = [];

        currentWorkType.sections.forEach((section) => {
            const sectionSelections = selectedOptions[section.id] || [];
            allSelections.push(...sectionSelections);
        });

        if (allSelections.length === 0) return '';

        // Remove trailing " | " or " |" from each selection, then join with " | "
        const cleanedSelections = allSelections.map(text => {
            // Replace * with actual case ID if provided
            const replacedText = caseId ? text.replace(/\*/g, caseId) : text;
            return replacedText.replace(/\s*\|\s*$/, '').trim();
        });
        return cleanedSelections.join(' | ');
    };

    const generatedNotes = useMemo(() => generateNotes(), [selectedOptions, currentWorkType, caseId]);

    // Show edited notes if they exist and we're not currently generating new ones
    const displayedNotes = editedNotes || generatedNotes;

    const handleReset = () => {
        setSelectedOptions({});
        setCaseId('');
        setSelectedSection('');
        setIsEditing(false);
        setEditedNotes('');
    };

    const handleCopy = async () => {
        const success = await copyToClipboard(displayedNotes);
        if (success) {
            setCopied(true);
        }
    };

    const handleEdit = () => {
        // If there are no edited notes yet, start with the generated notes
        if (!editedNotes) {
            setEditedNotes(generatedNotes);
        }
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedNotes('');
    };

    const groupOptionsByCategory = (section: NoteSection) => {
        const categorized: Record<string, typeof section.options> = {};
        const uncategorized: typeof section.options = [];

        section.options.forEach((option) => {
            if (option.category) {
                if (!categorized[option.category]) {
                    categorized[option.category] = [];
                }
                categorized[option.category].push(option);
            } else {
                uncategorized.push(option);
            }
        });

        return { categorized, uncategorized };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Note Builder" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Automated Note Builder</h1>
                        <p className="text-sm text-muted-foreground">
                            Select options to generate formatted review notes
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleReset} size="sm">
                            <RotateCcwIcon className="mr-2 size-4" />
                            Reset
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Left Column - Options */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Work Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select value={selectedWorkType} onValueChange={setSelectedWorkType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select work type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {workTypes.map((workType) => (
                                            <SelectItem key={workType.id} value={workType.id}>
                                                {workType.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {currentWorkType && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Section</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currentWorkType.sections.map((section) => {
                                                const hasSelections = (selectedOptions[section.id] || []).length > 0;
                                                return (
                                                    <SelectItem key={section.id} value={section.id}>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span>{section.title}</span>
                                                            {hasSelections && (
                                                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                                    {(selectedOptions[section.id] || []).length}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        )}

                        {currentSection && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">{currentSection.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(() => {
                                        const { categorized, uncategorized } = groupOptionsByCategory(currentSection);
                                        return (
                                            <>
                                                {/* Uncategorized options */}
                                                {uncategorized.length > 0 && (
                                                    <div className="space-y-3">
                                                        {uncategorized.map((option, idx) => {
                                                            const isChecked = (
                                                                selectedOptions[currentSection.id] || []
                                                            ).includes(option.text);
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-start gap-3"
                                                                >
                                                                    <Checkbox
                                                                        id={`${currentSection.id}-${idx}`}
                                                                        checked={isChecked}
                                                                        onCheckedChange={() =>
                                                                            handleOptionToggle(currentSection.id, option.text)
                                                                        }
                                                                    />
                                                                    <Label
                                                                        htmlFor={`${currentSection.id}-${idx}`}
                                                                        className="cursor-pointer text-sm leading-relaxed"
                                                                    >
                                                                        {option.text}
                                                                    </Label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Categorized options */}
                                                {Object.entries(categorized).map(([category, options], catIdx) => (
                                                    <div key={catIdx}>
                                                        {(uncategorized.length > 0 || catIdx > 0) && <Separator />}
                                                        <div className="space-y-3 pt-3">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                                {category}
                                                            </p>
                                                            {options.map((option, idx) => {
                                                                const isChecked = (
                                                                    selectedOptions[currentSection.id] || []
                                                                ).includes(option.text);
                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex items-start gap-3"
                                                                    >
                                                                        <Checkbox
                                                                            id={`${currentSection.id}-${category}-${idx}`}
                                                                            checked={isChecked}
                                                                            onCheckedChange={() =>
                                                                                handleOptionToggle(
                                                                                    currentSection.id,
                                                                                    option.text
                                                                                )
                                                                            }
                                                                        />
                                                                        <Label
                                                                            htmlFor={`${currentSection.id}-${category}-${idx}`}
                                                                            className="cursor-pointer text-sm leading-relaxed"
                                                                        >
                                                                            {option.text}
                                                                        </Label>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Preview */}
                    <div className="sticky top-4 h-fit space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Case ID</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Enter Case ID"
                                    value={caseId}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Only allow numbers
                                        if (value === '' || /^\d+$/.test(value)) {
                                            setCaseId(value);
                                        }
                                    }}
                                />
                                <p className="mt-2 text-xs text-muted-foreground">
                                    This will replace all * in the generated notes (numbers only)
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle>Generated Notes</CardTitle>
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleSaveEdit}
                                            >
                                                <SaveIcon className="mr-2 size-4" />
                                                Save
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleEdit}
                                            disabled={!generatedNotes}
                                        >
                                            <PencilIcon className="mr-2 size-4" />
                                            Edit
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopy}
                                        disabled={!displayedNotes}
                                    >
                                        {copied ? (
                                            <>
                                                <CheckIcon className="mr-2 size-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <ClipboardIcon className="mr-2 size-4" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {displayedNotes || isEditing ? (
                                    isEditing ? (
                                        <Textarea
                                            value={editedNotes}
                                            onChange={(e) => setEditedNotes(e.target.value)}
                                            className="min-h-[calc(100vh-20rem)] font-mono text-xs"
                                            placeholder="Edit your notes here..."
                                        />
                                    ) : (
                                        <pre className="max-h-[calc(100vh-20rem)] overflow-auto rounded-lg bg-muted p-4 text-xs whitespace-pre-wrap break-words">
                                            {displayedNotes}
                                        </pre>
                                    )
                                ) : (
                                    <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
                                        <p className="text-sm text-muted-foreground">
                                            Select options to generate notes
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
