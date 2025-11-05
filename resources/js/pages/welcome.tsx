import ChunkView from '@/components/ChunkView';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Head } from '@inertiajs/react';
import { Check, Copy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';

interface SourcePosition {
    lines: {
        startLine: number;
        endLine: number;
    } | null;
    bytes: {
        startByte: number;
        endByte: number;
    };
}

interface Chunk {
    id: number;
    breadcrumb: string[];
    tokenCount: number;
    markdown: string;
    sourcePosition: SourcePosition;
}

interface ProcessedData {
    success: boolean;
    markdownObject: any;
    chunks: Chunk[];
    error?: string;
}

const DEFAULT_MARKDOWN = `# Getting Started

Welcome to the Markdown Object demo! This tool helps you visualize how markdown is parsed and chunked.

## Features

### Real-time Processing
Type or paste markdown in the left pane and see the results instantly.

### Hierarchical Chunking
The markdown is intelligently split into chunks that maintain semantic coherence.

### Token Counting
Each chunk includes accurate token counts for embedding models.

## Example Content

Here's a code block:

\`\`\`javascript
function hello() {
    console.log('Hello, world!');
}
\`\`\`

And a table:

| Feature | Description |
|---------|-------------|
| Fast | Real-time processing |
| Smart | Context-aware chunking |
| Accurate | Token counting |

## Try It Out

Edit this markdown or paste your own to see how it's processed!`;

export default function Welcome() {
    const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
    const [filename, setFilename] = useState<string>('demo.md');
    const [target, setTarget] = useState<number>(512);
    const [hardCap, setHardCap] = useState<number>(1024);
    const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const processMarkdown = useCallback(async (text: string, file: string, targetTokens: number, hardCapTokens: number) => {
        if (!text.trim()) {
            setProcessedData(null);
            setError(null);
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch('/api/process-markdown', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    markdown: text,
                    filename: file,
                    target: targetTokens,
                    hardCap: hardCapTokens,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setProcessedData(data);
            } else {
                setError(data.error || 'An error occurred while processing the markdown');
            }
        } catch (err) {
            setError('Failed to process markdown: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setIsProcessing(false);
        }
    }, []);

    // Debounced effect for processing markdown
    useEffect(() => {
        const timer = setTimeout(() => {
            processMarkdown(markdown, filename, target, hardCap);
        }, 500);

        return () => clearTimeout(timer);
    }, [markdown, filename, target, hardCap, processMarkdown]);

    // Process default markdown on mount
    useEffect(() => {
        processMarkdown(DEFAULT_MARKDOWN, 'demo.md', 512, 1024);
    }, []);

    const copyAllChunks = useCallback(() => {
        if (!processedData?.chunks) {
            return;
        }

        const formattedChunks = processedData.chunks
            .map((chunk) => {
                const header = `Chunk: ${chunk.id} | ${chunk.tokenCount} tokens | Line: ${chunk.sourcePosition.lines?.startLine || 'N/A'}`;
                const breadcrumb = chunk.breadcrumb.join(' > ');
                const separator = '='.repeat(80);
                return `${separator}\n${header}\n${breadcrumb}\n${separator}\n\n${chunk.markdown}\n`;
            })
            .join('\n\n');

        navigator.clipboard.writeText(formattedChunks).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [processedData]);

    return (
        <>
            <Head title="Markdown Object Demo" />
            <div className="bg-background flex h-screen w-full flex-col">
                <header className="border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Markdown Object Demo</h1>
                            <a href="https://github.com/benbjurstrom/markdown-object" className="text-muted-foreground text-sm">
                                https://github.com/benbjurstrom/markdown-object
                            </a>
                        </div>
                        {isProcessing && (
                            <Badge variant="secondary" className="animate-pulse">
                                Processing...
                            </Badge>
                        )}
                    </div>
                </header>

                <ResizablePanelGroup direction="horizontal" className="flex-1">
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <div className="flex h-full flex-col p-6">
                            <div className="mb-2 flex h-9 items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Input
                                        id="filename"
                                        type="text"
                                        value={filename}
                                        onChange={(e) => setFilename(e.target.value)}
                                        placeholder="demo.md"
                                        className="h-7 w-40 font-mono text-xs focus-visible:ring-0"
                                    />
                                    <Label htmlFor="target">target:</Label>
                                    <Input
                                        id="target"
                                        type="number"
                                        value={target}
                                        onChange={(e) => setTarget(Number(e.target.value))}
                                        placeholder="512"
                                        min="128"
                                        max="8192"
                                        className="h-7 w-20 font-mono text-xs focus-visible:ring-0"
                                        title="Target tokens"
                                    />
                                    <Label htmlFor="hardCap">cap:</Label>
                                    <Input
                                        id="hardCap"
                                        type="number"
                                        value={hardCap}
                                        onChange={(e) => setHardCap(Number(e.target.value))}
                                        placeholder="1024"
                                        min="256"
                                        max="16384"
                                        className="h-7 w-20 font-mono text-xs focus-visible:ring-0"
                                        title="Hard cap tokens"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{markdown.length} chars</Badge>
                                </div>
                            </div>
                            <Textarea
                                value={markdown}
                                onChange={(e) => setMarkdown(e.target.value)}
                                placeholder="Enter your markdown here..."
                                className="flex-1 resize-none rounded-none font-mono text-sm focus-visible:ring-0"
                            />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel defaultSize={50} minSize={30}>
                        <div className="flex h-full flex-col p-6">
                            {error ? (
                                <div className="flex h-full items-center justify-center p-6">
                                    <Card className="border-destructive w-full max-w-md">
                                        <CardHeader>
                                            <CardTitle className="text-destructive">Error</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm">{error}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : processedData ? (
                                <Tabs defaultValue="chunks" className="flex h-full flex-col gap-0">
                                    <div className="mb-2 flex h-9 items-center justify-between">
                                        <TabsList>
                                            <TabsTrigger value="chunks">Chunks ({processedData.chunks.length})</TabsTrigger>
                                            <TabsTrigger value="json">JSON</TabsTrigger>
                                        </TabsList>
                                        <Button onClick={copyAllChunks} variant="outline" size="sm" className="gap-2">
                                            {copied ? (
                                                <>
                                                    <Check className="h-4 w-4" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4" />
                                                    Copy Chunks
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <TabsContent value="json" className="flex min-h-0 flex-1 flex-col">
                                        <Card className="flex min-h-0 flex-1 flex-col overflow-auto rounded-none p-4">
                                            <JsonView
                                                src={processedData.markdownObject}
                                                theme="default"
                                                collapsed={6}
                                                enableClipboard={true}
                                                displaySize={true}
                                            />
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="chunks" className="flex min-h-0 flex-1 flex-col">
                                        <ChunkView chunks={processedData.chunks} />
                                    </TabsContent>
                                </Tabs>
                            ) : (
                                <div className="text-muted-foreground flex h-full items-center justify-center">
                                    <p>Enter markdown to see the processed output</p>
                                </div>
                            )}
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </>
    );
}
