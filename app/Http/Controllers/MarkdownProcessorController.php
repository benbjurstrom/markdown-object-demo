<?php

namespace App\Http\Controllers;

use BenBjurstrom\MarkdownObject\Build\MarkdownObjectBuilder;
use BenBjurstrom\MarkdownObject\Tokenizer\TikTokenizer;
use Illuminate\Http\Request;
use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\Table\TableExtension;
use League\CommonMark\Parser\MarkdownParser;

class MarkdownProcessorController extends Controller
{
    public function process(Request $request)
    {
        $request->validate([
            'markdown' => 'required|string|max:500000',
            'filename' => 'nullable|string|max:255',
            'target' => 'nullable|integer|min:128|max:8192',
            'hardCap' => 'nullable|integer|min:256|max:16384',
        ]);

        $markdown = $request->input('markdown');
        $filename = $request->input('filename', 'demo.md');
        $target = $request->input('target', 512);
        $hardCap = $request->input('hardCap', 1024);

        try {
            // 1) Parse Markdown with CommonMark
            $env = new Environment;
            $env->addExtension(new CommonMarkCoreExtension);
            $env->addExtension(new TableExtension);

            $parser = new MarkdownParser($env);
            $doc = $parser->parse($markdown);

            // 2) Build the structured model
            $builder = new MarkdownObjectBuilder;
            $tokenizer = TikTokenizer::forModel('gpt-3.5-turbo');
            $mdObj = $builder->build($doc, $filename, $markdown, $tokenizer);

            // 3) Emit hierarchically-packed chunks
            $chunks = $mdObj->toMarkdownChunks(target: $target, hardCap: $hardCap);

            // dd($mdObj->tokenCount); // 155
            // dd($chunks[0]->tokenCount); // 163

            // Convert chunks to array for JSON response
            $chunksArray = array_map(function ($chunk) {
                return [
                    'id' => $chunk->id,
                    'breadcrumb' => $chunk->breadcrumb,
                    'tokenCount' => $chunk->tokenCount,
                    'markdown' => $chunk->markdown,
                    'sourcePosition' => [
                        'lines' => $chunk->sourcePosition->lines ? [
                            'startLine' => $chunk->sourcePosition->lines->startLine,
                            'endLine' => $chunk->sourcePosition->lines->endLine,
                        ] : null,
                        'bytes' => [
                            'startByte' => $chunk->sourcePosition->bytes->startByte,
                            'endByte' => $chunk->sourcePosition->bytes->endByte,
                        ],
                    ],
                ];
            }, $chunks);

            return response()->json([
                'success' => true,
                'markdownObject' => json_decode($mdObj->toJson()),
                'chunks' => $chunksArray,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }
}
