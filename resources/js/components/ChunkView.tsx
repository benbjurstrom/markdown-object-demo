import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { File } from 'lucide-react';
import { Fragment } from 'react';

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

interface ChunkViewProps {
    chunks: Chunk[];
}

export default function ChunkView({ chunks }: ChunkViewProps) {
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-auto rounded-none p-0 outline -outline-offset-1 outline-solid">
            {chunks.map((chunk) => (
                <>
                    <div className="flex flex-col gap-2 border-r p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                    <span className="font-medium">Chunk:</span> {chunk.id}
                                </span>
                                <span className="text-muted-foreground text-xs">{chunk.tokenCount} tokens</span>
                            </span>
                            {chunk.sourcePosition.lines && (
                                <span className="flex items-center gap-1">
                                    <span className="font-medium">Line:</span> {chunk.sourcePosition.lines.startLine}
                                </span>
                            )}
                        </div>
                        <Breadcrumb>
                            <BreadcrumbList>
                                {chunk.breadcrumb.map((crumb, index) => (
                                    <Fragment key={index}>
                                        {index > 0 && <BreadcrumbSeparator />}
                                        <BreadcrumbItem>
                                            {index === chunk.breadcrumb.length - 1 ? (
                                                <BreadcrumbPage className="flex items-center gap-1.5">
                                                    {index === 0 && <File className="text-foreground size-3" />}
                                                    {crumb}
                                                </BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink className="flex items-center gap-1.5">
                                                    {index === 0 && <File className="text-foreground size-3" />}
                                                    {crumb}
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                    </Fragment>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div key={chunk.id} className="text-card-foreground flex flex-col gap-6 border border-t-gray-400 py-6">
                        <div className="px-6">
                            <pre className="bg-muted overflow-x-auto font-mono text-xs break-words whitespace-pre-wrap">{chunk.markdown}</pre>
                        </div>
                    </div>
                </>
            ))}
        </div>
    );
}
