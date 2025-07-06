<template>
  <div class="timestamp-converter">
    <div class="converter-layout">
      <!-- 当前时间显示 -->
      <div class="current-time-section">
        <div class="section-header">
          <h3>Current Time</h3>
          <button @click="refreshTime" class="btn btn-secondary">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
        <div class="current-time-grid">
          <div class="time-item">
            <label>Current Timestamp:</label>
            <div class="time-value">{{ currentTimestamp }}</div>
          </div>
          <div class="time-item">
            <label>Current Date:</label>
            <div class="time-value">{{ currentDateTime }}</div>
          </div>
          <div class="time-item">
            <label>UTC Time:</label>
            <div class="time-value">{{ currentUtcTime }}</div>
          </div>
          <div class="time-item">
            <label>ISO 8601:</label>
            <div class="time-value">{{ currentIsoTime }}</div>
          </div>
        </div>
      </div>

      <!-- 时间戳转换 -->
      <div class="conversion-section">
        <div class="timestamp-to-date">
          <div class="section-header">
            <h3>Timestamp to Date</h3>
            <div class="actions">
              <button @click="clearTimestamp" class="btn btn-secondary">Clear</button>
              <button @click="useCurrentTimestamp" class="btn btn-primary">Use Current</button>
            </div>
          </div>
          <div class="input-group">
            <label>Timestamp:</label>
            <input
              v-model="inputTimestamp"
              type="text"
              placeholder="Enter timestamp (seconds or milliseconds)"
              class="input-field"
              @input="convertFromTimestamp"
            />
            <div class="timestamp-type">
              <label>
                <input type="radio" v-model="timestampUnit" value="seconds" @change="convertFromTimestamp">
                Seconds
              </label>
              <label>
                <input type="radio" v-model="timestampUnit" value="milliseconds" @change="convertFromTimestamp">
                Milliseconds
              </label>
            </div>
          </div>
          <div class="output-area">
            <div class="output-grid">
              <div class="output-item">
                <label>Local Date:</label>
                <input v-model="convertedLocalDate" readonly class="output-field" />
              </div>
              <div class="output-item">
                <label>UTC Date:</label>
                <input v-model="convertedUtcDate" readonly class="output-field" />
              </div>
              <div class="output-item">
                <label>ISO 8601:</label>
                <input v-model="convertedIsoDate" readonly class="output-field" />
              </div>
              <div class="output-item">
                <label>Relative Time:</label>
                <input v-model="relativeTime" readonly class="output-field" />
              </div>
            </div>
          </div>
        </div>

        <div class="date-to-timestamp">
          <div class="section-header">
            <h3>Date to Timestamp</h3>
            <div class="actions">
              <button @click="clearDate" class="btn btn-secondary">Clear</button>
              <button @click="useCurrentDate" class="btn btn-primary">Use Current</button>
            </div>
          </div>
          <div class="input-group">
            <label>Date Input:</label>
            <input
              v-model="inputDate"
              type="datetime-local"
              class="input-field"
              @input="convertToTimestamp"
            />
            <div class="date-format-options">
              <label>Timezone:</label>
              <select v-model="selectedTimezone" @change="convertToTimestamp">
                <option value="local">Local Time</option>
                <option value="utc">UTC</option>
              </select>
            </div>
          </div>
          <div class="output-area">
            <div class="output-grid">
              <div class="output-item">
                <label>Timestamp (seconds):</label>
                <input v-model="outputTimestampSeconds" readonly class="output-field" />
              </div>
              <div class="output-item">
                <label>Timestamp (milliseconds):</label>
                <input v-model="outputTimestampMilliseconds" readonly class="output-field" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量转换 -->
    <div class="batch-section">
      <div class="section-header">
        <h3>Batch Conversion</h3>
        <div class="actions">
          <button @click="clearBatch" class="btn btn-secondary">Clear</button>
          <button @click="convertBatch" class="btn btn-primary">Convert All</button>
        </div>
      </div>
      <div class="batch-layout">
        <div class="batch-input">
          <label>Input (one timestamp per line):</label>
          <textarea
            v-model="batchInput"
            placeholder="Enter timestamps, one per line..."
            class="batch-textarea"
          ></textarea>
        </div>
        <div class="batch-output">
          <label>Results:</label>
          <textarea
            v-model="batchOutput"
            readonly
            class="batch-textarea"
            placeholder="Conversion results will appear here..."
          ></textarea>
          <button @click="copyBatchResults" class="copy-btn">
            <i class="fas fa-copy"></i> Copy Results
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const inputTimestamp = ref('');
const inputDate = ref('');
const batchInput = ref('');
const batchOutput = ref('');
const timestampUnit = ref('seconds');
const selectedTimezone = ref('local');
const currentTime = ref(new Date());

let timeInterval: number | undefined;

// 当前时间相关计算属性
const currentTimestamp = computed(() => Math.floor(currentTime.value.getTime() / 1000));
const currentDateTime = computed(() => currentTime.value.toLocaleString());
const currentUtcTime = computed(() => currentTime.value.toUTCString());
const currentIsoTime = computed(() => currentTime.value.toISOString());

// 转换结果
const convertedLocalDate = ref('');
const convertedUtcDate = ref('');
const convertedIsoDate = ref('');
const relativeTime = ref('');
const outputTimestampSeconds = ref('');
const outputTimestampMilliseconds = ref('');

const convertFromTimestamp = () => {
  if (!inputTimestamp.value) {
    convertedLocalDate.value = '';
    convertedUtcDate.value = '';
    convertedIsoDate.value = '';
    relativeTime.value = '';
    return;
  }

  try {
    let timestamp = parseInt(inputTimestamp.value);
    
    if (timestampUnit.value === 'seconds') {
      timestamp *= 1000;
    }

    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp');
    }

    convertedLocalDate.value = date.toLocaleString();
    convertedUtcDate.value = date.toUTCString();
    convertedIsoDate.value = date.toISOString();
    relativeTime.value = getRelativeTime(date);
  } catch (error) {
    convertedLocalDate.value = 'Invalid timestamp';
    convertedUtcDate.value = '';
    convertedIsoDate.value = '';
    relativeTime.value = '';
  }
};

const convertToTimestamp = () => {
  if (!inputDate.value) {
    outputTimestampSeconds.value = '';
    outputTimestampMilliseconds.value = '';
    return;
  }

  try {
    let date: Date;
    
    if (selectedTimezone.value === 'utc') {
      date = new Date(inputDate.value + 'Z');
    } else {
      date = new Date(inputDate.value);
    }

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    const timestamp = date.getTime();
    outputTimestampSeconds.value = Math.floor(timestamp / 1000).toString();
    outputTimestampMilliseconds.value = timestamp.toString();
  } catch (error) {
    outputTimestampSeconds.value = 'Invalid date';
    outputTimestampMilliseconds.value = '';
  }
};

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (Math.abs(diffSeconds) < 60) {
    return `${diffSeconds} seconds ago`;
  } else if (Math.abs(diffMinutes) < 60) {
    return `${diffMinutes} minutes ago`;
  } else if (Math.abs(diffHours) < 24) {
    return `${diffHours} hours ago`;
  } else {
    return `${diffDays} days ago`;
  }
};

const convertBatch = () => {
  if (!batchInput.value.trim()) {
    batchOutput.value = '';
    return;
  }

  const lines = batchInput.value.trim().split('\n');
  const results: string[] = [];

  lines.forEach((line, index) => {
    const timestamp = line.trim();
    if (!timestamp) return;

    try {
      let ts = parseInt(timestamp);
      
      // 自动检测单位
      if (ts.toString().length <= 10) {
        ts *= 1000;
      }

      const date = new Date(ts);
      
      if (isNaN(date.getTime())) {
        results.push(`Line ${index + 1}: Invalid timestamp - ${timestamp}`);
      } else {
        results.push(`${timestamp} -> ${date.toLocaleString()} (${date.toISOString()})`);
      }
    } catch (error) {
      results.push(`Line ${index + 1}: Error - ${timestamp}`);
    }
  });

  batchOutput.value = results.join('\n');
};

const refreshTime = () => {
  currentTime.value = new Date();
};

const useCurrentTimestamp = () => {
  inputTimestamp.value = currentTimestamp.value.toString();
  convertFromTimestamp();
};

const useCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  inputDate.value = `${year}-${month}-${day}T${hours}:${minutes}`;
  convertToTimestamp();
};

const clearTimestamp = () => {
  inputTimestamp.value = '';
  convertedLocalDate.value = '';
  convertedUtcDate.value = '';
  convertedIsoDate.value = '';
  relativeTime.value = '';
};

const clearDate = () => {
  inputDate.value = '';
  outputTimestampSeconds.value = '';
  outputTimestampMilliseconds.value = '';
};

const clearBatch = () => {
  batchInput.value = '';
  batchOutput.value = '';
};

const copyBatchResults = async () => {
  if (batchOutput.value) {
    try {
      await navigator.clipboard.writeText(batchOutput.value);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
};

onMounted(() => {
  // 每秒更新当前时间
  timeInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

