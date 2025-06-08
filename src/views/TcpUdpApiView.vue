<template>
  <div class="tcpudp-view">
    <h1>TCP/UDP Service Testing</h1>
    <section>
      <h2>TCP Server</h2>
      <div>Status: <b>{{ tcpStatus ? 'Running' : 'Stopped' }}</b></div>
      <div class="form-row">
        <label>Echo:</label>
        <input type="checkbox" v-model="tcpEchoEnabled" @change="setTcpEchoEnabled" />
      </div>
      <div class="form-row">
        <label>Echo Content:</label>
        <input v-model="tcpEchoContent" @blur="setTcpEchoContent" placeholder="Empty for raw data" />
      </div>
      <div class="form-row">
        <label>Connected Clients:</label>
        <ul>
          <li v-for="client in tcpClients" :key="client.id">
            {{ client.id }}
            <input v-model="tcpSendMsg[client.id]" placeholder="Message" />
            <button @click="sendToTcpClient(client.id)">Send</button>
          </li>
        </ul>
      </div>
      <div class="form-row">
        <label>Send as Client:</label>
        <input v-model="tcpTargetIp" placeholder="Target IP" />
        <input v-model.number="tcpTargetPort" type="number" placeholder="Port" />
        <input v-model="tcpClientMsg" placeholder="Message" />
        <button @click="sendTcpClientMsg">Send</button>
      </div>
    </section>

    <section>
      <h2>UDP Server</h2>
      <div>Status: <b>{{ udpStatus ? 'Running' : 'Stopped' }}</b></div>
      <div class="form-row">
        <label>Echo:</label>
        <input type="checkbox" v-model="udpEchoEnabled" @change="setUdpEchoEnabled" />
      </div>
      <div class="form-row">
        <label>Echo Content:</label>
        <input v-model="udpEchoContent" @blur="setUdpEchoContent" placeholder="Empty for raw data" />
      </div>
      <div class="form-row">
        <label>Send as Client:</label>
        <input v-model="udpTargetIp" placeholder="Target IP" />
        <input v-model.number="udpTargetPort" type="number" placeholder="Port" />
        <input v-model="udpClientMsg" placeholder="Message" />
        <button @click="sendUdpClientMsg">Send</button>
      </div>
    </section>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

// TCP
const tcpStatus = ref(false)
const tcpEchoEnabled = ref(true)
const tcpEchoContent = ref('')
const tcpClients = ref<{id: string}[]>([])
const tcpSendMsg = ref<Record<string, string>>({})
const tcpTargetIp = ref('')
const tcpTargetPort = ref(9001)
const tcpClientMsg = ref('')

// UDP
const udpStatus = ref(false)
const udpEchoEnabled = ref(true)
const udpEchoContent = ref('')
const udpTargetIp = ref('')
const udpTargetPort = ref(9000)
const udpClientMsg = ref('')

// 初始化加载
onMounted(async () => {
  await fetchTcpStatus()
  await fetchUdpStatus()
  await fetchTcpClients()
  await fetchTcpEcho()
  await fetchUdpEcho()
})

async function fetchTcpStatus() {
  const res = await axios.get('/api/tcp/status')
  tcpStatus.value = res.data.listening
}
async function fetchUdpStatus() {
  const res = await axios.get('/api/udp/status')
  udpStatus.value = res.data.listening
}
async function fetchTcpClients() {
  const res = await axios.get('/api/tcp/clients')
  tcpClients.value = res.data.clients
}
async function fetchTcpEcho() {
  const res = await axios.get('/api/tcp/echo')
  tcpEchoEnabled.value = res.data.enabled
  tcpEchoContent.value = res.data.content || ''
}
async function fetchUdpEcho() {
  const res = await axios.get('/api/udp/echo')
  udpEchoEnabled.value = res.data.enabled
  udpEchoContent.value = res.data.content || ''
}

async function setTcpEchoEnabled() {
  await axios.post('/api/tcp/echo/enabled', { enabled: tcpEchoEnabled.value })
}
async function setTcpEchoContent() {
  await axios.post('/api/tcp/echo/content', { content: tcpEchoContent.value || null })
}
async function setUdpEchoEnabled() {
  await axios.post('/api/udp/echo/enabled', { enabled: udpEchoEnabled.value })
}
async function setUdpEchoContent() {
  await axios.post('/api/udp/echo/content', { content: udpEchoContent.value || null })
}
async function sendToTcpClient(clientId: string) {
  await axios.post('/api/tcp/sendToClient', { clientId, message: tcpSendMsg.value[clientId] })
}
async function sendTcpClientMsg() {
  await axios.post('/api/tcp/send', {
    host: tcpTargetIp.value,
    port: tcpTargetPort.value,
    message: tcpClientMsg.value
  })
}
async function sendUdpClientMsg() {
  await axios.post('/api/udp/send', {
    host: udpTargetIp.value,
    port: udpTargetPort.value,
    message: udpClientMsg.value
  })
}
</script>
  
<style scoped>
.tcpudp-view {
  max-width: 900px;
  margin: 3rem auto;
  background: #f6fafd;
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(30,41,59,0.10);
  padding: 2.5rem 2.5rem;
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans', Arial, sans-serif;
}
h1 {
  color: #1565c0;
  font-size: 2.5rem;
  margin-bottom: 1.2em;
  text-align: center;
  letter-spacing: 1px;
}
section {
  margin-bottom: 2.5em;
  padding-bottom: 1.5em;
  border-bottom: 1px solid #e3e8ee;
}
h2 {
  color: #1976d2;
  font-size: 1.5rem;
  margin-bottom: 1em;
  letter-spacing: 0.5px;
}
.form-row {
  margin-bottom: 1.2em;
  display: flex;
  align-items: center;
  gap: 1em;
}
label {
  width: 140px;
  font-weight: 500;
  color: #222;
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
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
li {
  margin-bottom: 0.5em;
  display: flex;
  align-items: center;
  gap: 0.5em;
}
</style>