"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Save, Eye, Plus, Edit3, Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Quote, AlignLeft, AlignCenter, AlignRight, Code, Undo, Redo, ChevronDown } from "lucide-react";

interface BlogPost {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    featured_image?: string;

}