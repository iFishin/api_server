<template>
    <div class="tcpudp-view">
      <h1>TCP/UDP API Test</h1>
      <p>
        This page allows you to test internal TCP/UDP services, including sending echo messages to a specified IP and receiving custom replies.
      </p>
      <form @submit.prevent="handleSend">
        <div class="form-row">
          <label>Protocol:</label>
          <select v-model="protocol">
            <option value="tcp">TCP</option>
            <option value="udp">UDP</option>
          </select>
        </div>
        <div class="form-row">
          <label>Target IP:</label>
          <input v-model="targetIp" placeholder="e.g. 127.0.0.1" required />
        </div>
        <div class="form-row">
          <label>Port:</label>
          <input v-model.number="targetPort" type="number" min="1" max="65535" required />
        </div>
        <div class="form-row">
          <label>Message:</label>
          <input v-model="message" placeholder="Message to send" required />
        </div>
        <div class="form-row">
          <button type="submit" :disabled="loading">Send</button>
        </div>
      </form>
      <div v-if="loading" class="loading">Sending...</div>
      <div v-if="response" class="response-block">
        <strong>Response:</strong>
        <pre>{{ response }}</pre>
      </div>
      <div v-if="error" class="error-block">
        <strong>Error:</strong>
        <pre>{{ error }}</pre>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import axios from 'axios'
  
  const protocol = ref<'tcp' | 'udp'>('tcp')
  const targetIp = ref('127.0.0.1')
  const targetPort = ref(9000)
  const message = ref('')
  const loading = ref(false)
  const response = ref('')
  const error = ref('')
  
  async function handleSend() {
    loading.value = true
    response.value = ''
    error.value = ''
    try {
      // 假设后端有 /api/tcpudp/send 统一接口
      const res = await axios.post('/api/tcpudp/send', {
        protocol: protocol.value,
        ip: targetIp.value,
        port: targetPort.value,
        message: message.value,
      })
      response.value = typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : String(res.data)
    } catch (e: any) {
      error.value = e?.response?.data?.message || e.message || String(e)
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style scoped>
  .tcpudp-view {
    max-width: 500px;
    margin: 2.5rem auto;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 4px 24px rgba(30,41,59,0.07);
    padding: 2rem 1.5rem;
    font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans', Arial, sans-serif;
  }
  h1 {
    color: #1976d2;
    font-size: 2rem;
    margin-bottom: 0.7em;
  }
  .form-row {
    margin-bottom: 1.1em;
    display: flex;
    align-items: center;
    gap: 1em;
  }
  label {
    width: 90px;
    font-weight: 500;
    color: #333;
  }
  input, select {
    flex: 1;
    padding: 0.5em 0.8em;
    border: 1.5px solid #90caf9;
    border-radius: 6px;
    font-size: 1em;
    background: #f8fafc;
    transition: border-color 0.2s;
  }
  input:focus, select:focus {
    border-color: #1976d2;
    background: #fff;
  }
  button {
    padding: 0.5em 1.5em;
    background: linear-gradient(90deg, #1976d2 60%, #42a5f5 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1em;
    cursor: pointer;
    transition: background 0.2s;
  }
  button:disabled {
    background: #b3c0d1;
    cursor: not-allowed;
  }
  .loading {
    color: #1976d2;
    margin-top: 1em;
  }
  .response-block {
    margin-top: 1.5em;
    background: #e8f5e9;
    color: #388e3c;
    border-radius: 8px;
    padding: 1em;
    font-size: 1em;
    white-space: pre-wrap;
  }
  .error-block {
    margin-top: 1.5em;
    background: #ffebee;
    color: #d32f2f;
    border-radius: 8px;
    padding: 1em;
    font-size: 1em;
    white-space: pre-wrap;
  }
  </style>