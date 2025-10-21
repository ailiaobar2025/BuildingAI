<script setup lang="ts">
import { useClipboard } from "@vueuse/core";

import { useMessage } from "../composables/useMessage";

// 定义组件接收的所有属性，通过v-bind="$attrs"传递给UButton
defineOptions({ inheritAttrs: false });

interface ProButtonCopyProps {
    /** 要复制的内容 */
    content: string;
    /** 复制成功文本 */
    copiedText?: string;
    /** 默认文本 */
    defaultText?: string;
    /** 复制成功图标 */
    copiedIcon?: string;
    /** 默认图标 */
    defaultIcon?: string;
}

const props = withDefaults(defineProps<ProButtonCopyProps>(), {
    copiedText: "",
    defaultText: "",
    copiedIcon: "i-lucide-copy-check",
    defaultIcon: "i-lucide-copy",
});

const { t } = useI18n();
const { copy, copied } = useClipboard();

async function handleCopy() {
    await copy(props.content);
    useMessage().success(props.copiedText || props.defaultText || t("common.chat.messages.copied"));
}
</script>

<template>
    <UTooltip
        :text="copied ? t('common.chat.messages.copied') : t('common.chat.messages.copy')"
        :delay="100"
    >
        <UButton
            v-bind="$attrs"
            :icon="copied ? copiedIcon : defaultIcon"
            class="p-2"
            @click="handleCopy"
        >
        </UButton>
    </UTooltip>
</template>
