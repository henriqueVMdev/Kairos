<script setup lang="ts">
import { ref } from "vue";
import { UploadCloud, X, CheckCircle2, Trash2 } from "lucide-vue-next";
import { cn } from "@/lib/utils"; // Assumindo o mesmo helper de merge de classes
import { Button } from "@/components/ui/button"; // shadcn-vue
import { Progress } from "@/components/ui/progress"; // shadcn-vue

// Estrutura de um arquivo em upload
export interface UploadedFile {
  id: string;
  file: File;
  progress: number; // 0-100
  status: "uploading" | "completed" | "error";
}

interface Props {
  files?: UploadedFile[];
  closable?: boolean; // substitui o "onClose ? <X/> : null" do React
}

const props = withDefaults(defineProps<Props>(), {
  files: () => [],
  closable: true,
});

const emit = defineEmits<{
  filesChange: [files: File[]];
  fileRemove: [id: string];
  close: [];
}>();

const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

function handleDragEnter(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = true;
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = false;
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = false;
  const droppedFiles = Array.from(e.dataTransfer?.files ?? []);
  if (droppedFiles.length > 0) {
    emit("filesChange", droppedFiles);
  }
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  const selectedFiles = Array.from(target.files ?? []);
  if (selectedFiles.length > 0) {
    emit("filesChange", selectedFiles);
  }
  target.value = ""; // permite selecionar o mesmo arquivo de novo
}

function triggerFileSelect() {
  fileInputRef.value?.click();
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 KB";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
</script>

<template>
  <div class="w-full max-w-lg bg-background rounded-xl border shadow-sm card-enter-animation">
    <div class="p-6">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-muted">
            <UploadCloud class="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-foreground">Upload files</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Select and upload the files of your choice
            </p>
          </div>
        </div>

        <Button
          v-if="closable"
          variant="ghost"
          size="icon"
          class="rounded-full w-8 h-8"
          @click="emit('close')"
        >
          <X class="w-4 h-4" />
        </Button>
      </div>

      <div
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        @dragover="handleDragOver"
        @drop="handleDrop"
        @click="triggerFileSelect"
        :class="cn(
          'mt-6 border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors duration-200 cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-muted-foreground/30 hover:border-primary/50'
        )"
      >
        <input
          ref="fileInputRef"
          type="file"
          multiple
          class="hidden"
          @change="handleFileSelect"
        />
        <UploadCloud class="w-10 h-10 text-muted-foreground mb-4" />
        <p class="font-semibold text-foreground">Choose a file or drag & drop it here.</p>
        <p class="text-xs text-muted-foreground mt-1">
          JPEG, PNG, PDF, and MP4 formats, up to 50 MB.
        </p>
        <Button variant="outline" size="sm" class="mt-4 pointer-events-none">
          Browse File
        </Button>
      </div>
    </div>

    <div v-if="props.files.length > 0" class="p-6 border-t">
      <TransitionGroup tag="ul" name="file-item" class="space-y-4 relative">
        <li
          v-for="file in props.files"
          :key="file.id"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 flex items-center justify-center rounded-md bg-muted text-sm font-bold text-muted-foreground">
              {{ file.file.type.split("/")[1]?.toUpperCase().substring(0, 3) || "FILE" }}
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-foreground truncate max-w-[150px] sm:max-w-xs">
                {{ file.file.name }}
              </p>
              <div class="text-xs text-muted-foreground">
                <span v-if="file.status === 'uploading'">
                  {{ formatFileSize((file.file.size * file.progress) / 100) }} of {{ formatFileSize(file.file.size) }}
                </span>
                <span v-else-if="file.status === 'completed'">
                  {{ formatFileSize(file.file.size) }}
                </span>
                <span class="mx-1">•</span>
                <span
                  :class="{
                    'text-primary': file.status === 'uploading',
                    'text-green-500': file.status === 'completed',
                  }"
                >
                  {{ file.status === "uploading" ? "Uploading..." : "Completed" }}
                </span>
              </div>
              <Progress
                v-if="file.status === 'uploading'"
                :model-value="file.progress"
                class="h-1.5 mt-1"
              />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <CheckCircle2 v-if="file.status === 'completed'" class="w-5 h-5 text-green-500" />
            <Button
              variant="ghost"
              size="icon"
              class="rounded-full w-8 h-8"
              @click="emit('fileRemove', file.id)"
            >
              <Trash2 v-if="file.status === 'completed'" class="w-4 h-4" />
              <X v-else class="w-4 h-4" />
            </Button>
          </div>
        </li>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.card-enter-animation {
  animation: card-enter 0.3s ease-out;
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.file-item-enter-active,
.file-item-leave-active {
  transition: all 0.3s ease;
}

.file-item-enter-from,
.file-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.file-item-leave-active {
  position: absolute;
  width: 100%;
}

.file-item-move {
  transition: transform 0.3s ease;
}
</style>
