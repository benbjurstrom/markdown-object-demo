# Markdown Object Demo

A demo application showcasing the PHP library [markdown-object](https://github.com/benbjurstrom/markdown-object).

![markdown-object-demo test_(1280x720) (1)](https://github.com/user-attachments/assets/2f69026a-24d3-4b44-a656-40b3a62af2be)

## What is Markdown Object?

Markdown Object is a PHP library that intelligently parses and chunks Markdown documents for use in Retrieval-Augmented Generation (RAG) systems and embedding models. It maintains semantic coherence while splitting documents into manageable pieces.

## Quick Start

Clone the repository:

```bash
git clone https://github.com/benbjurstrom/markdown-object-demo.git
cd markdown-object-demo
```

Install PHP dependencies:

```bash
composer install
```

Install JavaScript dependencies:

```bash
npm install
```

Build frontend assets:

```bash
npm run build
```

Start the development server:

```bash
php artisan serve
```

Then visit `http://localhost:8000` in your browser.

## Features

### Real-time Markdown Processing

- Parse markdown instantly as you type
- Visual feedback with processing indicators
- Configurable chunking parameters

### Intelligent Chunking

- Hierarchical chunking that maintains document structure
- Configurable target token size (128-8192)
- Hard cap limits to prevent oversized chunks (256-16384)
- Accurate token counting for embedding models

### Multiple View Modes

**Chunks View**

- See your markdown split into semantic chunks
- View token counts per chunk
- Track source line positions
- Copy all chunks in a text-friendly format
- Breadcrumb navigation showing document hierarchy

**JSON View**

- Inspect the complete structured markdown object
- Collapsible tree view
- Copy individual values
- Size indicators for arrays and objects
