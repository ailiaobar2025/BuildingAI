<script lang="ts" setup>
import { Color } from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import Placeholder from "@tiptap/extension-placeholder";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { Editor, EditorContent } from "@tiptap/vue-3";
import { Markdown } from "tiptap-markdown";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";

import { apiUploadFile } from "@/services/common";

const emits = defineEmits<{
    (event: "update:modelValue", value: string): void;
}>();

const { t } = useI18n();

const props = withDefaults(
    defineProps<{
        /**
         * 受控内容，HTML 字符串或 Markdown 字符串
         */
        modelValue: string;
        /**
         * 自定义样式类
         */
        customClass?: string;
        /**
         * 占位提示
         */
        placeholder?: string;
        /**
         * 是否启用 Markdown 模式
         */
        enableMarkdown?: boolean;
        /**
         * 输出格式：'html' | 'markdown'
         */
        outputFormat?: "html" | "markdown";
    }>(),
    {
        customClass: "",
        placeholder: "console-common.proEditor.placeholder",
        enableMarkdown: true,
        outputFormat: "html",
    },
);

const content = computed<string>({
    get: () => props.modelValue,
    set: (val: string) => emits("update:modelValue", val),
});

const editor = shallowRef<any | null>(null);
const uiRefresh = ref(0);

onMounted(() => {
    const extensions = [
        StarterKit,
        Underline,
        Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
        Image,
        Placeholder.configure({ placeholder: t(props.placeholder) }),
        Color.configure({ types: [TextStyle.name, ListItem.name] }),
        TextStyle,
    ];

    // 如果启用 Markdown 模式，添加 Markdown 扩展
    if (props.enableMarkdown) {
        extensions.push(
            Markdown.configure({
                html: true, // 允许 HTML 标签
                tightLists: true, // 紧密列表
                bulletListMarker: "-", // 无序列表标记
                linkify: false, // 自动链接检测
                breaks: false, // 换行符转换为 <br>
                transformPastedText: false, // 粘贴文本时转换为 Markdown
                transformCopiedText: false, // 复制文本时转换为 Markdown
            }),
        );
    }

    editor.value = new Editor({
        extensions,
        content: content.value || "",
        autofocus: false,
        injectCSS: false,
        editorProps: {
            // 使用原生浏览器样式，移除排版增强
            attributes: { class: "focus:outline-none" },
        },
        onUpdate: ({ editor }: { editor: any }) => {
            if (props.outputFormat === "markdown" && props.enableMarkdown) {
                // 尝试获取 Markdown 格式
                try {
                    const markdown = editor.storage.markdown?.getMarkdown();
                    content.value = markdown || editor.getHTML();
                } catch {
                    // 如果获取 Markdown 失败，回退到 HTML
                    content.value = editor.getHTML();
                }
            } else {
                content.value = editor.getHTML();
            }
        },
    });

    // 首次渲染后自动聚焦到末尾，优化编辑体验
    nextTick(() => {
        editor.value?.commands.focus("end");
    });

    // 监听编辑器状态变化以刷新工具栏激活/禁用态
    const bump = () => (uiRefresh.value = (uiRefresh.value + 1) % 1_000_000);
    editor.value?.on("selectionUpdate", bump);
    editor.value?.on("transaction", bump);
    editor.value?.on("update", bump);
});

onBeforeUnmount(() => {
    editor.value?.destroy();
    editor.value = null;
});

// 外部变更时同步到编辑器
watch(
    () => content.value,
    (val) => {
        if (!editor.value) return;
        if (val !== editor.value.getHTML()) {
            editor.value.commands.setContent(val || "", false);
        }
    },
);

async function handlePickAndInsertImage() {
    if (!editor.value) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpg,.jpeg,.png,.gif,.webp";
    input.multiple = true;
    input.onchange = async () => {
        const files = Array.from(input.files || []);
        if (!files.length) return;
        const uploaded = await Promise.all(
            files.map(
                (file) =>
                    new Promise<{ url: string }>((resolve, reject) => {
                        apiUploadFile({ file, description: "editor" })
                            .then((res) => resolve(res))
                            .catch((err) => reject(err));
                    }),
            ),
        );
        uploaded.forEach(({ url }) => {
            editor.value!.chain().focus().setImage({ src: url }).run();
        });
    };
    input.click();
}

function toggleMark(mark: "bold" | "italic" | "strike" | "underline") {
    if (!editor.value) return;
    const chain = editor.value.chain().focus();
    if (mark === "bold") chain.toggleBold().run();
    if (mark === "italic") chain.toggleItalic().run();
    if (mark === "strike") chain.toggleStrike().run();
    if (mark === "underline") chain.toggleUnderline().run();
}

function setParagraph() {
    editor.value?.chain().focus().setParagraph().run();
}
function setHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
    editor.value?.chain().focus().toggleHeading({ level }).run();
}
function toggleBulletList() {
    editor.value?.chain().focus().toggleBulletList().run();
}
function toggleOrderedList() {
    editor.value?.chain().focus().toggleOrderedList().run();
}
function toggleBlockquote() {
    editor.value?.chain().focus().toggleBlockquote().run();
}
function toggleCodeBlock() {
    editor.value?.chain().focus().toggleCodeBlock().run();
}
function clearMarks() {
    editor.value?.chain().focus().unsetAllMarks().run();
}
function clearNodes() {
    editor.value?.chain().focus().clearNodes().run();
}
function insertHorizontalRule() {
    editor.value?.chain().focus().setHorizontalRule().run();
}
function insertHardBreak() {
    editor.value?.chain().focus().setHardBreak().run();
}
function toggleInlineCode() {
    editor.value?.chain().focus().toggleCode().run();
}
function setTextColor(color: string) {
    editor.value?.chain().focus().setColor(color).run();
}
function undo() {
    editor.value?.chain().focus().undo().run();
}
function redo() {
    editor.value?.chain().focus().redo().run();
}

/**
 * 获取 Markdown 格式的内容
 */
function getMarkdownContent(): string {
    if (!editor.value) return "";

    // 如果安装了 Markdown 扩展，可以获取 Markdown 格式
    try {
        return editor.value.storage.markdown?.getMarkdown() || editor.value.getHTML();
    } catch {
        // 如果没有 Markdown 扩展或方法不存在，返回 HTML
        return editor.value.getHTML();
    }
}

/**
 * 获取当前内容（根据 outputFormat 决定格式）
 */
function getCurrentContent(): string {
    if (!editor.value) return "";

    if (props.outputFormat === "markdown" && props.enableMarkdown) {
        return getMarkdownContent();
    } else {
        return editor.value.getHTML();
    }
}

/**
 * 设置 Markdown 格式的内容
 */
function setMarkdownContent(markdown: string) {
    if (!editor.value) return;

    try {
        editor.value.commands.setContent(markdown);
    } catch {
        // 回退到设置 HTML 内容
        editor.value.commands.setContent(markdown);
    }
}

/**
 * 插入 Markdown 语法快捷方式
 */
function insertMarkdownSyntax(type: "bold" | "italic" | "code" | "link" | "image" | "heading") {
    if (!editor.value) return;

    const selection = editor.value.state.selection;
    const selectedText = editor.value.state.doc.textBetween(selection.from, selection.to);

    let before = "";
    let after = "";
    let placeholder = "";

    switch (type) {
        case "bold":
            before = "**";
            after = "**";
            placeholder = "粗体文本";
            break;
        case "italic":
            before = "*";
            after = "*";
            placeholder = "斜体文本";
            break;
        case "code":
            before = "`";
            after = "`";
            placeholder = "代码";
            break;
        case "link":
            before = "[";
            after = "](url)";
            placeholder = "链接文本";
            break;
        case "image":
            before = "![";
            after = "](url)";
            placeholder = "图片描述";
            break;
        case "heading":
            before = "# ";
            after = "";
            placeholder = "标题";
            break;
    }

    const textToInsert = selectedText || placeholder;
    const fullText = before + textToInsert + after;

    editor.value.commands.insertContent(fullText);
}

// 暴露方法给父组件使用
defineExpose({
    editor,
    getMarkdownContent,
    setMarkdownContent,
    insertMarkdownSyntax,
    getCurrentContent,
});
</script>

<template>
    <div
        class="fb-editor rounded-md border border-gray-200/60 dark:border-gray-700/60"
        :class="customClass"
    >
        <!-- 工具栏 -->
        <div
            class="flex flex-wrap items-center gap-1 border-b border-gray-200/60 p-2 dark:border-gray-700/60"
        >
            <!-- 行内样式 -->
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('bold') ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleBold().run()"
                @click="toggleMark('bold')"
            >
                B
            </UButton>
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('italic') ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleItalic().run()"
                @click="toggleMark('italic')"
            >
                <i>I</i>
            </UButton>
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('underline') ? 'soft' : 'ghost'"
                @click="toggleMark('underline')"
            >
                <u>U</u>
            </UButton>
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('strike') ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleStrike().run()"
                @click="toggleMark('strike')"
            >
                <s>S</s>
            </UButton>
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('code') ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleCode().run()"
                @click="toggleInlineCode"
            >
                <UIcon name="i-lucide-code" size="16" />
            </UButton>
            <span class="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700"></span>

            <!-- 段落与标题 -->
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('paragraph') ? 'soft' : 'ghost'"
                @click="setParagraph"
                >P</UButton
            >
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('heading', { level: 1 }) ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleHeading({ level: 1 }).run()"
                @click="setHeading(1)"
                >H1</UButton
            >
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('heading', { level: 2 }) ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleHeading({ level: 2 }).run()"
                @click="setHeading(2)"
                >H2</UButton
            >
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('heading', { level: 3 }) ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleHeading({ level: 3 }).run()"
                @click="setHeading(3)"
                >H3</UButton
            >
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('heading', { level: 4 }) ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleHeading({ level: 4 }).run()"
                @click="setHeading(4)"
                >H4</UButton
            >
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('heading', { level: 5 }) ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleHeading({ level: 5 }).run()"
                @click="setHeading(5)"
                >H5</UButton
            >
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('heading', { level: 6 }) ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleHeading({ level: 6 }).run()"
                @click="setHeading(6)"
                >H6</UButton
            >
            <span class="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700"></span>

            <!-- 列表/引用/代码块 -->
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('bulletList') ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleBulletList().run()"
                @click="toggleBulletList"
                ><UIcon name="i-lucide-list" size="16"
            /></UButton>
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('orderedList') ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleOrderedList().run()"
                @click="toggleOrderedList"
                ><UIcon name="i-lucide-list-ordered" size="16"
            /></UButton>
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('blockquote') ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleBlockquote().run()"
                @click="toggleBlockquote"
                >“”</UButton
            >
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('codeBlock') ? 'soft' : 'ghost'"
                :disabled="!editor?.can().chain().focus().toggleCodeBlock().run()"
                @click="toggleCodeBlock"
                ><UIcon name="i-lucide-code-xml" size="16"
            /></UButton>
            <span class="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700"></span>

            <!-- 图片与清理 -->
            <UButton size="xs" color="neutral" variant="soft" @click="handlePickAndInsertImage">{{
                t("console-common.proEditor.img")
            }}</UButton>
            <UButton size="xs" color="neutral" variant="ghost" @click="clearMarks">{{
                t("console-common.proEditor.clearMarks")
            }}</UButton>
            <UButton size="xs" color="neutral" variant="ghost" @click="clearNodes">{{
                t("console-common.proEditor.clearNodes")
            }}</UButton>
            <span class="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700"></span>

            <!-- 撤销/重做 与 分隔 -->
            <UButton
                color="neutral"
                size="xs"
                :variant="'ghost'"
                :disabled="!editor?.can().chain().focus().undo().run()"
                @click="undo"
                >{{ t("console-common.proEditor.undo") }}</UButton
            >
            <UButton
                color="neutral"
                size="xs"
                :variant="'ghost'"
                :disabled="!editor?.can().chain().focus().redo().run()"
                @click="redo"
                >{{ t("console-common.proEditor.redo") }}</UButton
            >
            <span class="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700"></span>

            <!-- 水平线/硬回车/颜色示例 -->
            <UButton size="xs" color="neutral" :variant="'ghost'" @click="insertHorizontalRule"
                >HR</UButton
            >
            <UButton size="xs" color="neutral" :variant="'ghost'" @click="insertHardBreak"
                >BR</UButton
            >
            <UButton
                color="neutral"
                size="xs"
                :variant="editor?.isActive('textStyle', { color: '#958DF1' }) ? 'soft' : 'ghost'"
                @click="setTextColor('#958DF1')"
                >{{ t("console-common.proEditor.purple") }}</UButton
            >
        </div>

        <!-- 编辑区域 -->
        <div class="min-h-48 p-3">
            <EditorContent v-if="editor" class="tiptap" :editor="editor as any" />
        </div>
    </div>
</template>

<style lang="scss">
/* Editor scoped base styles: avoid global CSS overrides */
.fb-editor {
    .tiptap {
        line-height: 1.7 !important;
        word-wrap: break-word !important;

        &:focus {
            outline: none !important;
        }

        p {
            margin: 0 0 0.75rem !important;
        }
        p:last-child {
            margin-bottom: 0 !important;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            margin: 1rem 0 0.5rem !important;
            font-weight: 600 !important;
            line-height: 1.2 !important;
        }
        h1 {
            font-size: 1.5rem !important;
        }
        h2 {
            font-size: 1.35rem !important;
        }
        h3 {
            font-size: 1.2rem !important;
        }
        h4 {
            font-size: 1.1rem !important;
        }
        h5,
        h6 {
            font-size: 1rem !important;
        }

        ul,
        ol {
            padding-left: 1.25rem !important;
            margin: 0.5rem 0 0.75rem !important;
        }
        ul {
            list-style: disc !important;
        }
        ol {
            list-style: decimal !important;
        }
        li {
            margin: 0.25rem 0 !important;
        }

        a {
            color: #2563eb !important; /* blue-600 */
            text-decoration: underline !important;
            text-underline-offset: 2px !important;
        }
        a:hover {
            opacity: 0.9 !important;
        }

        code {
            font-family:
                ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
                "Courier New", monospace !important;
            background-color: #f3f4f6 !important; /* gray-100 */
            border-radius: 4px !important;
            padding: 0.15em 0.35em !important;
            font-size: 0.9em !important;
        }
        pre {
            background-color: #111827 !important; /* gray-900 */
            color: #e5e7eb !important; /* gray-200 */
            border-radius: 6px !important;
            padding: 0.75rem 1rem !important;
            overflow: auto !important;
            margin: 0.75rem 0 1rem !important;
        }
        pre code {
            background: transparent !important;
            color: inherit !important;
            padding: 0 !important;
            font-size: 0.95em !important;
        }

        blockquote {
            border-left: 3px solid #e5e7eb !important; /* gray-200 */
            padding-left: 0.75rem !important;
            margin: 0.75rem 0 !important;
            color: inherit !important;
        }

        hr {
            border: 0 !important;
            border-top: 1px solid #e5e7eb !important; /* gray-200 */
            margin: 1rem 0 !important;
        }

        img {
            max-width: 100% !important;
            height: auto !important;
            border-radius: 6px !important;
            display: inline-block !important;
        }

        table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin: 0.75rem 0 !important;
        }
        th,
        td {
            border: 1px solid #e5e7eb !important; /* gray-200 */
            padding: 0.5rem 0.75rem !important;
            text-align: left !important;
        }
        thead th {
            background: #f9fafb !important; /* gray-50 */
        }

        /* Placeholder support (tiptap Placeholder extension) */
        .is-empty::before {
            content: attr(data-placeholder);
            color: #9ca3af; /* gray-400 */
            float: left;
            height: 0;
            pointer-events: none;
        }
    }
}
</style>
