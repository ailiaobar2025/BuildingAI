<template>
    <div class="flex h-full flex-col bg-gray-50 dark:bg-gray-900">
        <!-- 页面标题 -->
        <div class="mb-6 px-6 pt-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1
                        class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent"
                    >
                        即梦 AI 图片生成 4.0
                    </h1>
                    <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        多图输入输出 | 智能编辑 | 4K超高清 | 组图生成
                    </p>
                </div>
                <UButton
                    icon="i-lucide-help-circle"
                    variant="soft"
                    color="neutral"
                    @click="showHelp = !showHelp"
                >
                    使用指南
                </UButton>
            </div>
        </div>

        <!-- 使用指南卡片 -->
        <UCard
            v-if="showHelp"
            class="mx-6 mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
        >
            <div class="space-y-3 text-sm">
                <h3 class="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
                    <div class="i-lucide-lightbulb text-lg" />
                    Prompt 编写建议
                </h3>
                <ul class="ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
                    <li>用连贯的自然语言描述画面内容（主体+行为+环境），用短词语描述美学风格</li>
                    <li>
                        <strong>组图生成</strong
                        >：使用"一系列""组图""生成几张图"等提示词（最多15张）
                    </li>
                    <li>
                        <strong>文字准确</strong
                        >：把想要生成的文字内容用""引号包裹，如：标题为"即梦4.0"
                    </li>
                    <li>
                        <strong>比例智能</strong
                        >：可在提示词中说明用途，系统自动推理最佳比例，如"用于PPT封面背景"
                    </li>
                </ul>
                <div class="mt-3 flex flex-wrap gap-2">
                    <UButton
                        v-for="example in promptExamples"
                        :key="example"
                        size="xs"
                        variant="soft"
                        color="info"
                        @click="prompt = example"
                    >
                        {{ example.substring(0, 20) }}...
                    </UButton>
                </div>
            </div>
        </UCard>

        <div class="grid flex-1 grid-cols-1 gap-6 overflow-hidden px-6 pb-6 xl:grid-cols-3">
            <!-- 左侧：输入区域 -->
            <UCard class="h-full overflow-y-auto xl:col-span-1">
                <template #header>
                    <div class="flex items-center gap-2">
                        <div class="i-lucide-settings-2 text-xl text-purple-600" />
                        <h2 class="text-lg font-semibold">生成设置</h2>
                    </div>
                </template>

                <div class="space-y-5">
                    <!-- 提示词输入 -->
                    <UFormGroup label="描述提示词" required>
                        <UTextarea
                            v-model="prompt"
                            :rows="5"
                            placeholder="例如：一只可爱的小猫在花园里玩耍，阳光明媚，油画风格
提示：用连贯的自然语言描述，重要文字用引号包裹"
                            :maxlength="800"
                            class="font-mono text-sm"
                        />
                        <template #help>
                            <div class="flex justify-between text-xs">
                                <span class="text-gray-500">支持中英文，详细描述更准确</span>
                                <span
                                    :class="
                                        prompt.length > 700 ? 'text-orange-600' : 'text-gray-500'
                                    "
                                >
                                    {{ prompt.length }}/800
                                </span>
                            </div>
                        </template>
                    </UFormGroup>

                    <!-- 参考图片 -->
                    <UFormGroup>
                        <template #label>
                            <div class="flex items-center gap-2">
                                <span>参考图片</span>
                                <UBadge color="info" variant="soft" size="xs">
                                    图生图 / 多图组合
                                </UBadge>
                            </div>
                        </template>
                        <template #help>
                            <span class="text-xs text-gray-500">
                                支持最多10张参考图，可用于风格参考、组合编辑、智能替换等
                            </span>
                        </template>
                        <div class="mt-2 space-y-2">
                            <div
                                v-for="(url, index) in referenceImages"
                                :key="index"
                                class="flex items-center gap-2"
                            >
                                <div class="w-6 flex-none text-xs text-gray-500">
                                    {{ index + 1 }}
                                </div>
                                <UInput
                                    v-model="referenceImages[index]"
                                    placeholder="请输入图片URL或拖拽上传"
                                    class="flex-1"
                                    size="sm"
                                />
                                <UButton
                                    icon="i-lucide-x"
                                    color="error"
                                    variant="ghost"
                                    size="sm"
                                    @click="removeReferenceImage(index)"
                                />
                            </div>
                            <UButton
                                v-if="referenceImages.length < 10"
                                icon="i-lucide-plus"
                                variant="soft"
                                size="sm"
                                block
                                @click="addReferenceImage"
                            >
                                添加参考图片 ({{ referenceImages.length }}/10)
                            </UButton>
                        </div>
                    </UFormGroup>

                    <!-- 高级选项 -->
                    <div class="border-t border-gray-200 pt-4 dark:border-gray-700">
                        <button
                            type="button"
                            class="flex w-full items-center justify-between text-left font-medium text-gray-900 transition-colors hover:text-purple-600 dark:text-gray-100 dark:hover:text-purple-400"
                            @click="showAdvanced = !showAdvanced"
                        >
                            <span class="text-sm">高级选项</span>
                            <div
                                class="i-lucide-chevron-down text-lg transition-transform"
                                :class="{ 'rotate-180': showAdvanced }"
                            />
                        </button>
                    </div>

                    <div
                        v-show="showAdvanced"
                        class="mt-4 space-y-6 border-l-2 border-purple-200 pl-4 dark:border-purple-800"
                    >
                        <!-- 图片比例 -->
                        <div class="space-y-3">
                            <div class="flex items-start gap-2">
                                <div class="i-lucide-aspect-ratio text-purple-600 dark:text-purple-400 text-lg flex-shrink-0 mt-0.5" />
                                <div class="flex-1">
                                    <div class="font-medium text-sm text-gray-900 dark:text-gray-100">
                                        图片比例
                                    </div>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        选择预设比例或自定义尺寸，支持最高 4K 分辨率
                                    </p>
                                </div>
                            </div>
                            <div class="grid grid-cols-3 gap-2">
                                <button
                                    v-for="ratio in aspectRatios"
                                    :key="ratio.label"
                                    type="button"
                                    class="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                                    :class="selectedRatio === ratio.label 
                                        ? 'bg-purple-600 text-white shadow-md' 
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                                    @click="selectRatio(ratio)"
                                >
                                    {{ ratio.label }}
                                </button>
                            </div>
                            <div class="grid grid-cols-2 gap-3 pt-2">
                                <div>
                                    <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                                        宽度 (px)
                                    </label>
                                    <UInput
                                        v-model.number="width"
                                        type="number"
                                        placeholder="1024"
                                        :min="512"
                                        :max="4096"
                                        size="sm"
                                    />
                                </div>
                                <div>
                                    <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                                        高度 (px)
                                    </label>
                                    <UInput
                                        v-model.number="height"
                                        type="number"
                                        placeholder="1024"
                                        :min="512"
                                        :max="4096"
                                        size="sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- 生成数量 -->
                        <div class="space-y-3">
                            <div class="flex items-start gap-2">
                                <div class="i-lucide-copy-plus text-purple-600 dark:text-purple-400 text-lg flex-shrink-0 mt-0.5" />
                                <div class="flex-1">
                                    <div class="font-medium text-sm text-gray-900 dark:text-gray-100">
                                        生成数量
                                    </div>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        一次生成 1-15 张图片，支持组图和批量创作
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <UInput
                                    v-model.number="imageCount"
                                    type="number"
                                    :min="1"
                                    :max="15"
                                    size="sm"
                                    class="w-24"
                                />
                                <span class="text-sm text-gray-600 dark:text-gray-400">张</span>
                                <span class="text-xs text-gray-400 dark:text-gray-500">
                                    （使用组图提示词可智能调整）
                                </span>
                            </div>
                        </div>

                        <!-- 参考强度 -->
                        <div class="space-y-3">
                            <div class="flex items-start gap-2">
                                <div class="i-lucide-sliders-horizontal text-purple-600 dark:text-purple-400 text-lg flex-shrink-0 mt-0.5" />
                                <div class="flex-1">
                                    <div class="font-medium text-sm text-gray-900 dark:text-gray-100">
                                        参考图影响强度
                                    </div>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        控制参考图对生成结果的影响程度，值越大越接近参考图
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="flex-1 flex items-center gap-3">
                                    <span class="text-xs text-gray-500 dark:text-gray-400 w-12">低 0</span>
                                    <input
                                        v-model.number="scale"
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                    <span class="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">高 1</span>
                                </div>
                                <div class="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div class="i-lucide-gauge text-purple-600 dark:text-purple-400" />
                                    <span class="text-sm font-semibold text-purple-600 dark:text-purple-400 min-w-[2rem] text-center">
                                        {{ scale.toFixed(1) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- 提示 -->
                        <div class="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <div class="i-lucide-lightbulb text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <p class="text-xs text-amber-700 dark:text-amber-300">
                                <strong>智能提示：</strong>在提示词中说明用途（如"PPT封面"、"海报"），系统会自动推理最佳比例和数量
                            </p>
                        </div>
                    </div>

                    <!-- 生成按钮 -->
                    <div class="pt-2">
                        <UButton
                            :loading="isGenerating"
                            :disabled="!prompt || isGenerating"
                            size="lg"
                            block
                            icon="i-lucide-sparkles"
                            class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            @click="handleGenerate"
                        >
                            <template v-if="isGenerating">
                                <span class="flex items-center gap-2">
                                    <div class="i-lucide-loader-2 animate-spin" />
                                    {{ generationProgress }}
                                </span>
                            </template>
                            <template v-else> 开始生成图片 </template>
                        </UButton>
                    </div>
                </div>
            </UCard>

            <!-- 右侧：结果展示 -->
            <UCard class="h-full overflow-y-auto xl:col-span-2">
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="i-lucide-image text-xl text-pink-600" />
                            <h2 class="text-lg font-semibold">生成结果</h2>
                            <UBadge v-if="generatedImages.length" color="success" variant="soft">
                                {{ generatedImages.length }} 张
                            </UBadge>
                        </div>
                        <UButton
                            v-if="generatedImages.length"
                            icon="i-lucide-trash-2"
                            variant="soft"
                            color="error"
                            size="sm"
                            @click="clearResults"
                        >
                            清空结果
                        </UButton>
                    </div>
                </template>

                <div class="h-full min-h-[500px]">
                    <!-- 等待状态 -->
                    <div
                        v-if="!taskId && !generatedImages.length"
                        class="flex h-full items-center justify-center"
                    >
                        <div class="text-center text-gray-400">
                            <div class="i-lucide-sparkles mx-auto mb-6 text-8xl opacity-30" />
                            <h3 class="mb-2 text-xl font-semibold text-gray-600 dark:text-gray-400">
                                开始你的AI创作之旅
                            </h3>
                            <p class="text-sm">在左侧输入描述，让即梦4.0为你生成精美图片</p>
                            <div class="mx-auto mt-8 grid max-w-md grid-cols-2 gap-4 text-left">
                                <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                                    <div class="i-lucide-zap mb-2 text-2xl text-purple-600" />
                                    <h4
                                        class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                    >
                                        文生图
                                    </h4>
                                    <p class="text-xs text-gray-500">用自然语言描述，即可生成</p>
                                </div>
                                <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                                    <div class="i-lucide-layers mb-2 text-2xl text-pink-600" />
                                    <h4
                                        class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                    >
                                        多图组合
                                    </h4>
                                    <p class="text-xs text-gray-500">最多10张参考图智能组合</p>
                                </div>
                                <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                                    <div class="i-lucide-wand-2 mb-2 text-2xl text-blue-600" />
                                    <h4
                                        class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                    >
                                        智能编辑
                                    </h4>
                                    <p class="text-xs text-gray-500">增删改替，深度理解意图</p>
                                </div>
                                <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                                    <div class="i-lucide-maximize mb-2 text-2xl text-green-600" />
                                    <h4
                                        class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                    >
                                        4K超高清
                                    </h4>
                                    <p class="text-xs text-gray-500">最高支持4096x4096分辨率</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 生成中 -->
                    <div v-else-if="isGenerating" class="flex h-full items-center justify-center">
                        <div class="max-w-md text-center">
                            <div class="relative mb-8 inline-block">
                                <div
                                    class="i-lucide-sparkles animate-pulse text-8xl text-purple-600"
                                />
                                <div
                                    class="i-lucide-sparkles absolute inset-0 animate-ping text-8xl text-pink-600 opacity-20"
                                />
                            </div>
                            <h3
                                class="mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent"
                            >
                                AI 正在创作中...
                            </h3>
                            <p class="mb-6 text-gray-600 dark:text-gray-400">
                                {{ generationProgress }}
                            </p>

                            <!-- 进度条 -->
                            <div
                                class="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                            >
                                <div
                                    class="h-full animate-pulse rounded-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                                    :style="{ width: progressPercentage + '%' }"
                                />
                            </div>

                            <div class="space-y-2 text-xs text-gray-500">
                                <p>
                                    任务 ID: <span class="font-mono">{{ taskId }}</span>
                                </p>
                                <p>预计时间: 10-30秒</p>
                            </div>
                        </div>
                    </div>

                    <!-- 生成完成 -->
                    <div v-else-if="generatedImages.length" class="w-full">
                        <div
                            class="grid gap-6"
                            :class="{
                                'grid-cols-1': generatedImages.length === 1,
                                'grid-cols-2': generatedImages.length >= 2,
                                'xl:grid-cols-3': generatedImages.length >= 3,
                            }"
                        >
                            <div
                                v-for="(imageUrl, index) in generatedImages"
                                :key="index"
                                class="group relative overflow-hidden rounded-xl bg-gray-100 shadow-lg transition-all duration-300 hover:shadow-2xl dark:bg-gray-800"
                            >
                                <img
                                    :src="imageUrl"
                                    :alt="`生成的图片 ${index + 1}`"
                                    class="h-auto w-full object-cover"
                                    loading="lazy"
                                />
                                <!-- 悬浮操作按钮 -->
                                <div
                                    class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                >
                                    <div
                                        class="absolute right-0 bottom-0 left-0 flex items-center justify-between p-4"
                                    >
                                        <div class="flex gap-2">
                                            <UButton
                                                icon="i-lucide-download"
                                                color="primary"
                                                size="sm"
                                                class="!bg-white !text-gray-900 hover:!bg-gray-100"
                                                @click="downloadImage(imageUrl, index)"
                                            >
                                                下载
                                            </UButton>
                                            <UButton
                                                icon="i-lucide-copy"
                                                color="neutral"
                                                variant="soft"
                                                size="sm"
                                                class="!bg-white/20 !text-white backdrop-blur-sm hover:!bg-white/30"
                                                @click="copyImageUrl(imageUrl)"
                                            >
                                                复制链接
                                            </UButton>
                                        </div>
                                        <UBadge
                                            color="neutral"
                                            variant="solid"
                                            size="xs"
                                            class="!bg-white/90 !text-gray-900"
                                        >
                                            {{ index + 1 }} / {{ generatedImages.length }}
                                        </UBadge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 生成成功提示 -->
                        <div
                            class="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
                        >
                            <div class="flex items-start gap-3">
                                <div
                                    class="i-lucide-check-circle mt-0.5 flex-shrink-0 text-xl text-green-600"
                                />
                                <div class="flex-1">
                                    <h4
                                        class="mb-1 font-semibold text-green-900 dark:text-green-100"
                                    >
                                        生成完成！
                                    </h4>
                                    <p class="text-sm text-green-700 dark:text-green-300">
                                        已成功生成
                                        {{ generatedImages.length }}
                                        张图片，鼠标悬停在图片上查看操作按钮
                                    </p>
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
const imageCount = ref(1);
const scale = ref(0.5);
const isGenerating = ref(false);
const taskId = ref("");
const generationProgress = ref("");
const generatedImages = ref<string[]>([]);
const showHelp = ref(false);
const showAdvanced = ref(false);
const selectedRatio = ref("1:1");
const pollAttempt = ref(0);

const message = useMessage();

// 进度百分比
const progressPercentage = computed(() => {
    if (!isGenerating.value) return 0;
    // 根据轮询次数估算进度（最多60次，每次3秒，约3分钟）
    const maxAttempts = 60;
    const percentage = Math.min((pollAttempt.value / maxAttempts) * 100, 95);
    return Math.round(percentage);
});

// 比例预设
const aspectRatios = [
    { label: "1:1", width: 1024, height: 1024 },
    { label: "16:9", width: 1920, height: 1080 },
    { label: "9:16", width: 1080, height: 1920 },
    { label: "4:3", width: 1600, height: 1200 },
    { label: "3:4", width: 1200, height: 1600 },
    { label: "21:9", width: 2560, height: 1080 },
];

// Prompt 示例
const promptExamples = [
    "一只可爱的小猫在花园里玩耍，阳光明媚，油画风格",
    "科幻风格的未来城市，霓虹灯，赛博朋克，夜景，高清",
    "参考图片形象生成一组日漫分镜，画风统一",
    "制作这个产品的电商主图，放在温馨明亮的客厅一角",
    '生成4张海报，标题为"即梦4.0"，分别为春夏秋冬主题',
];

// 选择比例
function selectRatio(ratio: (typeof aspectRatios)[0]) {
    width.value = ratio.width;
    height.value = ratio.height;
    selectedRatio.value = ratio.label;
}

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

// 清空结果
function clearResults() {
    generatedImages.value = [];
    taskId.value = "";
}

// 处理生成
async function handleGenerate() {
    if (!prompt.value.trim()) {
        message.error("请输入描述提示词");
        return;
    }

    try {
        isGenerating.value = true;
        pollAttempt.value = 0;
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
            scale: scale.value,
        });

        taskId.value = submitResult.taskId;
        generationProgress.value = "任务已提交，AI 正在创作...";

        // 轮询查询结果
        const result = await apiPollImageGeneration(taskId.value, {
            interval: 3000,
            maxAttempts: 60,
            onProgress: (status: ImageGenerationStatus, attempt: number) => {
                pollAttempt.value = attempt;
                const statusText = {
                    in_queue: "排队中，请稍候",
                    generating: "AI 正在创作中",
                    done: "生成完成",
                    not_found: "任务未找到",
                    expired: "任务已过期",
                };
                generationProgress.value = statusText[status] || status;
            },
        });

        if (result.imageUrls && result.imageUrls.length > 0) {
            generatedImages.value = result.imageUrls;
            message.success(`成功生成 ${result.imageUrls.length} 张图片！`);
        } else {
            message.error("生成失败，未返回图片");
        }
    } catch (error: any) {
        console.error("生成失败:", error);
        message.error(error.message || "图片生成失败，请重试");
    } finally {
        isGenerating.value = false;
        generationProgress.value = "";
        pollAttempt.value = 0;
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
