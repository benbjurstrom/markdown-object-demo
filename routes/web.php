<?php

use App\Http\Controllers\MarkdownProcessorController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::post('/api/process-markdown', [MarkdownProcessorController::class, 'process'])->name('markdown.process');
