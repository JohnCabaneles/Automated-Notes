<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class NotesController extends Controller
{
    /**
     * Display the note builder page.
     */
    public function builder(): Response
    {
        return Inertia::render('notes/builder');
    }
}
