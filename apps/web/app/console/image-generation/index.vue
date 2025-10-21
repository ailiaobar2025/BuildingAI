<template>
    <div class="h-full flex flex-col">
        <!-- 页面标题 -->
        <div class="mb-6">
            <h1 class="text-2xl font-bold">AI 图片生成</h1>
            <p class="mt-2 text-sm text-gray-500">使用AI根据文本描述生成图片，支持文生图和图生图</p>
        </div>

        <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 左侧：输入区域 -->
            <UCard class="h-full">
                <template #header>
                    <h2 class="text-lg font-semibold">生成设置</h2>
                </template>

                <div class="space-y-4">
                    <!-- 提示词输入 -->
                    <UFormGroup label="描述提示词" required>
                        <UTextarea
                            v-model="prompt"
                            :rows="4"
                            placeholder="请描述你想要生成的图片，例如：一只可爱的小猫在花园里玩耍"
                            :maxlength="800"
                        />
                        <template #help>
                            <div class="flex justify-between text-xs">
                                <span>请详细描述你想要的图片内容、风格等</span>
                                <span>{{ prompt.length }}/800</span>
                            </div>
                        </template>
                    </UFormGroup>

                    <!-- 参考图片 -->
                    <UFormGroup label="参考图片" help="可选，上传参考图片进行图生图（最多10张）">
                        <div class="space-y-2">
                            <div
                                v-for="(url, index) in referenceImages"
                                :key="index"
                                class="flex items-center gap-2"
                            >
                                <UInput
                                    v-model="referenceImages[index]"
                                    placeholder="请输入图片URL"
                                    class="flex-1"
                                />
                                <UButton
                                    icon="i-lucide-trash-2"
                                    color="red"
                                    variant="soft"
                                    size="sm"
                                    @click="removeReferenceImage(index)"
                                />
                            </div>
                            <UButton
                                v-if="referenceImages.length < 10"
                                icon="i-lucide-plus"
                                variant="soft"
                                size="sm"
                                @click="addReferenceImage"
                            >
                                添加参考图片
                            </UButton>
                        </div>
                    </UFormGroup>

                    <!-- 图片尺寸 -->
                    <div class="grid grid-cols-2 gap-4">
                        <UFormGroup label="宽度">
                            <UInput
                                v-model.number="width"
                                type="number"
                                placeholder="例如：1024"
                                :min="512"
                                :max="2048"
                            />
                        </UFormGroup>
                        <UFormGroup label="高度">
                            <UInput
                                v-model.number="height"
                                type="number"
                                placeholder="例如：1024"
                                :min="512"
                                :max="2048"
                            />
                        </UFormGroup>
                    </div>

                    <!-- 生成按钮 -->
                    <div class="pt-4">
                        <UButton
                            :loading="isGenerating"
                            :disabled="!prompt || isGenerating"
                            size="lg"
                            block
                            @click="handleGenerate"
                        >
                            <template v-if="isGenerating">
                                生成中... ({{ generationProgress }})
                            </template>
                            <template v-else> 开始生成 </template>
                        </UButton>
                    </div>
                </div>
            </UCard>

            <!-- 右侧：结果展示 -->
            <UCard class="h-full">
                <template #header>
                    <h2 class="text-lg font-semibold">生成结果</h2>
                </template>

                <div class="h-full flex items-center justify-center">
                    <!-- 等待状态 -->
                    <div v-if="!taskId && !generatedImages.length" class="text-center text-gray-400">
                        <div class="i-lucide-image text-6xl mx-auto mb-4" />
                        <p>在左侧输入描述开始生成图片</p>
                    </div>

                    <!-- 生成中 -->
                    <div v-else-if="isGenerating" class="text-center">
                        <div class="i-lucide-loader-2 text-6xl mx-auto mb-4 animate-spin" />
                        <p class="text-gray-600">{{ generationProgress }}</p>
                        <p class="text-sm text-gray-400 mt-2">任务ID: {{ taskId }}</p>
                    </div>

                    <!-- 生成完成 -->
                    <div v-else-if="generatedImages.length" class="w-full space-y-4">
                        <div
                            v-for="(imageUrl, index) in generatedImages"
                            :key="index"
                            class="relative group"
                        >
                            <img
                                :src="imageUrl"
                                :alt="`生成的图片 ${index + 1}`"
                                class="w-full rounded-lg shadow-lg"
                            />
                            <div
                                class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                                <div class="flex gap-2">
                                    <UButton
                                        icon="i-lucide-download"
                                        size="lg"
                                        @click="downloadImage(imageUrl, index)"
                                    >
                                        下载
                                    </UButton>
                                    <UButton
                                        icon="i-lucide-copy"
                                        variant="soft"
                                        size="lg"
                                        @click="copyImageUrl(imageUrl)"
                                    >
                                        复制链接
                                    </UButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useMessage } from "@fastbuildai/ui/composables/useMessage";

import {
    apiPollImageGeneration,
    apiSubmitImageGeneration,
    type ImageGenerationStatus,
} from "~/services/web/image-generation";

// 状态管理
const prompt = ref("");
const referenceImages = ref<string[]>([]);
const width = ref(1024);
const height = ref(1024);
const isGenerating = ref(false);
const taskId = ref("");
const generationProgress = ref("");
const generatedImages = ref<string[]>([]);

const message = useMessage();

// 添加参考图片
function addReferenceImage() {
    if (referenceImages.value.length < 10) {
        referenceImages.value.push("");
    }
}

// 移除参考图片
function removeReferenceImage(index: number) {
    referenceImages.value.splice(index, 1);
}

// 处理生成
async function handleGenerate() {
    if (!prompt.value.trim()) {
        message.error("请输入描述提示词");
        return;
    }

    try {
        isGenerating.value = true;
        generationProgress.value = "正在提交任务...";
        generatedImages.value = [];

        // 过滤空的参考图片URL
        const imageUrls = referenceImages.value.filter((url) => url.trim());

        // 提交任务
        const submitResult = await apiSubmitImageGeneration({
            prompt: prompt.value,
            imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
            width: width.value,
            height: height.value,
        });

        taskId.value = submitResult.taskId;
        generationProgress.value = "任务已提交，正在生成...";

        // 轮询查询结果
        const result = await apiPollImageGeneration(taskId.value, {
            interval: 3000,
            maxAttempts: 60,
            onProgress: (status: ImageGenerationStatus, attempt: number) => {
                const statusText = {
                    in_queue: "排队中",
                    generating: "生成中",
                    done: "完成",
                    not_found: "未找到",
                    expired: "已过期",
                };
                generationProgress.value = `${statusText[status]}... (${attempt}次)`;
            },
        });

        if (result.imageUrls && result.imageUrls.length > 0) {
            generatedImages.value = result.imageUrls;
            message.success("图片生成成功！");
        } else {
            message.error("生成失败，未返回图片");
        }
    } catch (error: any) {
        console.error("生成失败:", error);
        message.error(error.message || "图片生成失败，请重试");
    } finally {
        isGenerating.value = false;
        generationProgress.value = "";
    }
}

// 下载图片
function downloadImage(url: string, index: number) {
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated-image-${index + 1}.png`;
    link.target = "_blank";
    link.click();
    message.success("开始下载图片");
}

// 复制图片链接
async function copyImageUrl(url: string) {
    try {
        await navigator.clipboard.writeText(url);
        message.success("链接已复制到剪贴板");
    } catch {
        message.error("复制失败，请手动复制");
    }
}
</script>
